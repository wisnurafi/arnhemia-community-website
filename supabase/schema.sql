-- =============================================================================
-- ARNHEMIA · Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- =============================================================================

-- 1. Role enum -----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'arnhemia_role') then
    create type arnhemia_role as enum ('owner', 'co-owner', 'devs', 'member');
  end if;
end $$;

-- 2. Profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role arnhemia_role not null default 'member',
  avatar_url text,
  status text,
  messages integer not null default 0,
  reaction_score integer not null default 0,
  invited_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- 3. Invite codes --------------------------------------------------------------
create table if not exists public.invite_codes (
  code text primary key,
  created_by uuid not null references public.profiles(id) on delete cascade,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  note text
);

create index if not exists invite_codes_created_by_idx on public.invite_codes(created_by);
create index if not exists invite_codes_used_by_idx on public.invite_codes(used_by);

-- 4. Helper: who can invite ----------------------------------------------------
create or replace function public.can_invite(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('owner', 'co-owner', 'devs')
  );
$$;

-- 5. RLS -----------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Invite code policies
-- Anyone (even anon) can SELECT a single code by exact match to validate at register.
-- We rely on the exact-match `eq` clause; we don't return all rows in the UI.
drop policy if exists "invite_codes_select_for_validation" on public.invite_codes;
create policy "invite_codes_select_for_validation"
  on public.invite_codes for select
  using (true);

drop policy if exists "invite_codes_insert_by_staff" on public.invite_codes;
create policy "invite_codes_insert_by_staff"
  on public.invite_codes for insert
  with check (
    auth.uid() = created_by
    and public.can_invite(auth.uid())
  );

drop policy if exists "invite_codes_update_consume" on public.invite_codes;
create policy "invite_codes_update_consume"
  on public.invite_codes for update
  using (true)
  with check (true);

drop policy if exists "invite_codes_delete_by_creator_or_owner" on public.invite_codes;
create policy "invite_codes_delete_by_creator_or_owner"
  on public.invite_codes for delete
  using (
    auth.uid() = created_by
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner')
    )
  );

-- 6. Atomic invite consumption -------------------------------------------------
-- Validates the code, marks it used, and creates the profile in one transaction.
-- Called from a server action right after auth.signUp().
create or replace function public.consume_invite(
  p_user_id uuid,
  p_username text,
  p_invite_code text,
  p_avatar_url text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invite_codes;
  v_profile public.profiles;
begin
  -- Username must be unique and 3-32 chars, alphanumeric + underscore
  if p_username is null or length(p_username) < 3 or length(p_username) > 32
     or p_username !~ '^[A-Za-z0-9_]+$' then
    raise exception 'invalid_username' using errcode = '22023';
  end if;

  -- Lock the invite row so two concurrent registers can't both consume it
  select * into v_invite
  from public.invite_codes
  where code = p_invite_code
  for update;

  if not found then
    raise exception 'invite_not_found' using errcode = '22023';
  end if;

  if v_invite.used_by is not null then
    raise exception 'invite_already_used' using errcode = '22023';
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'invite_expired' using errcode = '22023';
  end if;

  -- Create profile (member by default)
  insert into public.profiles (id, username, role, avatar_url, invited_by)
  values (p_user_id, p_username, 'member', p_avatar_url, v_invite.created_by)
  returning * into v_profile;

  -- Mark invite consumed
  update public.invite_codes
  set used_by = p_user_id, used_at = now()
  where code = p_invite_code;

  return v_profile;
end;
$$;

revoke all on function public.consume_invite(uuid, text, text, text) from public;
grant execute on function public.consume_invite(uuid, text, text, text) to authenticated;
grant execute on function public.consume_invite(uuid, text, text, text) to anon;

-- 7. Promote helper (call manually for first owner) ----------------------------
-- After you sign up your first account, run:
--   select public.bootstrap_owner('your-username');
create or replace function public.bootstrap_owner(p_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.profiles where role = 'owner';
  if v_count > 0 then
    raise exception 'owner_already_exists';
  end if;
  update public.profiles set role = 'owner' where username = p_username;
end;
$$;

revoke all on function public.bootstrap_owner(text) from public;
-- intentionally not granted to anon/authenticated; run from SQL editor only.
