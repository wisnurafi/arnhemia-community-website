-- =============================================================================
-- ARNHEMIA · 005_conversations_releases.sql
--
-- 1. Replaces the recursive conv_participants_read_self RLS policy with a
--    SECURITY DEFINER membership helper. The old policy referenced the same
--    table inside its USING clause, which is fragile under RLS recursion and
--    caused the "Message" link from a profile to land on a 404 because the
--    other participant's row was filtered out.
-- 2. Adds a `releases` table (versioned changelog) with public read + staff
--    write, plus seed data so /changelog and /downloads have real entries.
--
-- Run AFTER 004_subscriptions_and_stats.sql.
-- =============================================================================

-- 1. Conversation membership helper -------------------------------------------
create or replace function public.is_conversation_member(
  p_conversation uuid,
  p_user uuid
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = p_conversation
      and user_id = p_user
  );
$$;

revoke all on function public.is_conversation_member(uuid, uuid) from public;
grant execute on function public.is_conversation_member(uuid, uuid)
  to authenticated;

-- Replace the recursive policy.
drop policy if exists "conv_participants_read_self"
  on public.conversation_participants;

create policy "conv_participants_read_members"
  on public.conversation_participants for select
  using (
    user_id = auth.uid()
    or public.is_conversation_member(conversation_id, auth.uid())
  );

-- Allow self-insert (needed if/when we ever insert participants from a server
-- action; open_conversation already handles this via security definer).
drop policy if exists "conv_participants_insert_self"
  on public.conversation_participants;
create policy "conv_participants_insert_self"
  on public.conversation_participants for insert
  with check (user_id = auth.uid());

-- Allow self-delete (Leave conversation).
drop policy if exists "conv_participants_delete_self"
  on public.conversation_participants;
create policy "conv_participants_delete_self"
  on public.conversation_participants for delete
  using (user_id = auth.uid());

-- Allow self-update (last_read_at). open_conversation sets it via RPC, but
-- a direct update from the user is also fine.
drop policy if exists "conv_participants_update_self"
  on public.conversation_participants;
create policy "conv_participants_update_self"
  on public.conversation_participants for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2. Releases -----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'release_kind') then
    create type release_kind as enum ('release', 'hotfix', 'patch');
  end if;
end $$;

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  version text unique not null,
  kind release_kind not null default 'release',
  released_at date not null default current_date,
  notes text[] not null default '{}',
  download_url text,
  checksum text,
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists releases_released_at_idx
  on public.releases(released_at desc);

alter table public.releases enable row level security;

drop policy if exists "releases_read_all" on public.releases;
create policy "releases_read_all" on public.releases for select
  using (published = true or exists (
    select 1 from public.profiles
    where id = auth.uid() and role <> 'member'
  ));

drop policy if exists "releases_insert_staff" on public.releases;
create policy "releases_insert_staff" on public.releases for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner', 'devs')
    )
  );

drop policy if exists "releases_update_staff" on public.releases;
create policy "releases_update_staff" on public.releases for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner', 'devs')
    )
  );

drop policy if exists "releases_delete_owner" on public.releases;
create policy "releases_delete_owner" on public.releases for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner')
    )
  );

-- Seed a couple of entries so the UI isn't empty before staff publish their
-- own. Idempotent on version.
insert into public.releases (version, kind, released_at, notes, published) values
  (
    'v3.8.2', 'hotfix', current_date - 1,
    array[
      'Fixed handshake timing with anti-cheat update',
      'Reduced injection latency by ~120ms',
      'Patched memory protection edge case on Win11 24H2'
    ],
    true
  ),
  (
    'v3.8.0', 'release', current_date - 7,
    array[
      'New visual ESP rendering pipeline',
      'Refactored config sync over Discord login',
      'New compact HUD theme'
    ],
    true
  ),
  (
    'v3.7.4', 'patch', current_date - 21,
    array[
      'Stability improvements during agent select',
      'Reduced false positives in process scanner',
      'Minor UI polish in loader window'
    ],
    true
  )
on conflict (version) do nothing;
