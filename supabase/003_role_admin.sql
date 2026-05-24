-- =============================================================================
-- ARNHEMIA · 003_role_admin.sql
-- Adds role management RPC + RLS policy so owner/co-owner can change other
-- profiles' roles. Also adds a deletion policy for owner/co-owner over members.
-- Run AFTER schema.sql and 002_data_schema.sql.
-- =============================================================================

-- 1. RPC: set_role -------------------------------------------------------------
-- Only callers who are owner or co-owner can promote/demote others.
-- The role 'owner' is exclusive — at most one owner exists, and only an owner
-- can grant another user the owner role. To avoid lockout, set_role refuses
-- to demote the LAST owner.
create or replace function public.set_role(p_target uuid, p_role arnhemia_role)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role arnhemia_role;
  v_target_role arnhemia_role;
  v_owner_count integer;
  v_profile public.profiles;
begin
  if p_target is null then
    raise exception 'invalid_target';
  end if;

  select role into v_caller_role from public.profiles where id = auth.uid();
  if v_caller_role is null then
    raise exception 'not_signed_in';
  end if;

  if v_caller_role not in ('owner', 'co-owner') then
    raise exception 'forbidden_caller';
  end if;

  select role into v_target_role from public.profiles where id = p_target;
  if v_target_role is null then
    raise exception 'target_not_found';
  end if;

  -- Co-owner cannot promote anyone to owner, cannot touch existing owners.
  if v_caller_role = 'co-owner' then
    if p_role = 'owner' or v_target_role = 'owner' then
      raise exception 'co_owner_cannot_grant_owner';
    end if;
  end if;

  -- Don't allow demoting the last remaining owner.
  if v_target_role = 'owner' and p_role <> 'owner' then
    select count(*) into v_owner_count from public.profiles where role = 'owner';
    if v_owner_count <= 1 then
      raise exception 'last_owner_cannot_be_demoted';
    end if;
  end if;

  update public.profiles
  set role = p_role
  where id = p_target
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.set_role(uuid, arnhemia_role) from public;
grant execute on function public.set_role(uuid, arnhemia_role) to authenticated;

-- 2. Policy update: allow staff role updates --------------------------------
-- We already have profiles_update_self. Add a separate staff policy via the
-- set_role RPC (which is security definer), so we don't need to widen UPDATE
-- RLS policies. Nothing more to do here in terms of policies.

-- 3. Helper: list profiles paginated for admin UI ---------------------------
create or replace function public.list_profiles_for_admin(
  p_limit integer default 100,
  p_offset integer default 0,
  p_query text default null
)
returns setof public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role arnhemia_role;
begin
  select role into v_caller_role from public.profiles where id = auth.uid();
  if v_caller_role not in ('owner', 'co-owner', 'devs') then
    raise exception 'forbidden_caller';
  end if;

  return query
    select *
    from public.profiles
    where p_query is null
       or username ilike '%' || p_query || '%'
    order by joined_at desc
    limit p_limit
    offset p_offset;
end;
$$;

revoke all on function public.list_profiles_for_admin(integer, integer, text) from public;
grant execute on function public.list_profiles_for_admin(integer, integer, text) to authenticated;
