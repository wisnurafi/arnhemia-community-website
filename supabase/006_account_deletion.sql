-- =============================================================================
-- ARNHEMIA · 006_account_deletion.sql
--
-- 1. Adds an RLS policy so a signed-in user can delete their own profile row.
-- 2. Adds an RPC `delete_self_account` that runs with elevated privileges and
--    purges the profile (cascade clears their content) AND the auth.users row.
--    Without this, a member-initiated "Delete account" leaves the auth user
--    behind and the profiles row sometimes silently survives RLS.
--
-- Run AFTER 005_conversations_releases.sql.
-- =============================================================================

-- 1. RLS policy: delete own profile -------------------------------------------
drop policy if exists "profiles_delete_self" on public.profiles;
create policy "profiles_delete_self"
  on public.profiles for delete
  using (auth.uid() = id);

-- 2. delete_self_account RPC --------------------------------------------------
-- Security definer so we can also drop from auth.users. We re-assert auth.uid()
-- inside the function to make sure no caller can delete a different user.
create or replace function public.delete_self_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  -- Cascades clear threads/posts/tickets/conversations/etc. via FKs.
  delete from public.profiles where id = v_uid;

  -- Drop the auth user too. The profiles cascade has already cleaned content;
  -- this just removes the credential and any stored MFA factors.
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_self_account() from public;
grant execute on function public.delete_self_account() to authenticated;
