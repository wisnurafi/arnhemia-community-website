-- =============================================================================
-- ARNHEMIA · 008_invites_single_use.sql
--
-- Aligns the database with the new "single-use, no calendar expiry" invite
-- policy. The old consume_invite RPC already burns the code on first use, so
-- nothing structural needs to change. We only:
--
--   1. Drop expires_at on every existing row so the UI doesn't show stale
--      "Expires …" labels for codes that were issued under the old policy.
--   2. Re-create consume_invite without the expires_at branch so the column
--      can be ignored entirely going forward (and the error surface stays
--      tight).
--
-- Run AFTER 007_releases_storage.sql.
-- =============================================================================

-- 1. Wipe expires_at on existing invites --------------------------------------
update public.invite_codes set expires_at = null;

-- 2. Re-create consume_invite without the expiry branch -----------------------
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
  if p_username is null
     or length(p_username) < 3
     or length(p_username) > 32
     or p_username !~ '^[A-Za-z0-9_]+$' then
    raise exception 'invalid_username' using errcode = '22023';
  end if;

  -- Lock the row so two concurrent registers can't both consume it.
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

  -- Create profile (member by default).
  insert into public.profiles (id, username, role, avatar_url, invited_by)
  values (p_user_id, p_username, 'member', p_avatar_url, v_invite.created_by)
  returning * into v_profile;

  -- Burn the invite. From this point on no one else can register with it.
  update public.invite_codes
  set used_by = p_user_id, used_at = now()
  where code = p_invite_code;

  return v_profile;
end;
$$;

revoke all on function public.consume_invite(uuid, text, text, text) from public;
grant execute on function public.consume_invite(uuid, text, text, text) to authenticated;
grant execute on function public.consume_invite(uuid, text, text, text) to anon;
