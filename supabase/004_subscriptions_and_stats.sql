-- =============================================================================
-- ARNHEMIA · 004_subscriptions_and_stats.sql
--
-- Adds:
--   1. profiles.subscribed flag (gates loader downloads).
--   2. set_subscription RPC for owner/co-owner.
--   3. forum_stats() helper for the sidebar.
--   4. Marks the announcements + loader/release categories staff_only so only
--      owner / co-owner / devs can create threads in them.
--   5. Tightens the threads_insert_self policy so members cannot post into
--      staff_only categories at the database level.
--
-- Run AFTER schema.sql, 002_data_schema.sql, and 003_role_admin.sql.
-- =============================================================================

-- 1. profiles.subscribed -------------------------------------------------------
alter table public.profiles
  add column if not exists subscribed boolean not null default false;

create index if not exists profiles_subscribed_idx
  on public.profiles(subscribed)
  where subscribed = true;

-- 2. set_subscription RPC ------------------------------------------------------
create or replace function public.set_subscription(
  p_target uuid,
  p_subscribed boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role arnhemia_role;
  v_profile public.profiles;
begin
  select role into v_caller_role from public.profiles where id = auth.uid();
  if v_caller_role is null then
    raise exception 'not_signed_in';
  end if;
  if v_caller_role not in ('owner', 'co-owner') then
    raise exception 'forbidden_caller';
  end if;

  update public.profiles
  set subscribed = p_subscribed
  where id = p_target
  returning * into v_profile;

  if v_profile is null then
    raise exception 'target_not_found';
  end if;

  return v_profile;
end;
$$;

revoke all on function public.set_subscription(uuid, boolean) from public;
grant execute on function public.set_subscription(uuid, boolean) to authenticated;

-- 3. forum_stats helper --------------------------------------------------------
create or replace function public.forum_stats()
returns table (
  threads bigint,
  posts bigint,
  members bigint,
  latest_member_username text,
  latest_member_joined_at timestamptz
)
language sql
stable
as $$
  select
    (select count(*) from public.threads)                                  as threads,
    (select count(*) from public.posts) +
      (select count(*) from public.threads)                                as posts,
    (select count(*) from public.profiles)                                 as members,
    (select username   from public.profiles order by joined_at desc limit 1) as latest_member_username,
    (select joined_at  from public.profiles order by joined_at desc limit 1) as latest_member_joined_at;
$$;

grant execute on function public.forum_stats() to anon, authenticated;

-- 4. Mark staff-only categories ------------------------------------------------
-- Announcements and Loader & Releases are owner/co-owner/devs write-only.
update public.forum_categories
set staff_only = true
where id in ('c-announcements', 'c-val-loader');

-- 5. Tighten threads insert policy ---------------------------------------------
drop policy if exists "threads_insert_self" on public.threads;
create policy "threads_insert_self" on public.threads for insert
  with check (
    auth.uid() = author_id
    and not exists (
      select 1
      from public.forum_categories c
      where c.id = threads.category_id
        and c.staff_only = true
        and not exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role in ('owner', 'co-owner', 'devs')
        )
    )
  );
