-- =============================================================================
-- ARNHEMIA · 007_releases_storage.sql
--
-- 1. Creates a public Storage bucket `releases` for loader binaries.
-- 2. Adds RLS policies so only owner/co-owner/devs can upload/update/delete,
--    while anyone can download (public bucket).
-- 3. Tightens the releases.delete RLS to also cover staff_release deletes
--    that originate from the admin UI.
--
-- Run AFTER 006_account_deletion.sql.
-- =============================================================================

-- 1. Bucket --------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('releases', 'releases', true)
on conflict (id) do update set public = excluded.public;

-- Cap upload size at 200MB to match the system requirement on /downloads.
update storage.buckets
set file_size_limit = 209715200
where id = 'releases';

-- 2. Policies on storage.objects ----------------------------------------------
drop policy if exists "releases_storage_read" on storage.objects;
create policy "releases_storage_read"
  on storage.objects for select
  using (bucket_id = 'releases');

drop policy if exists "releases_storage_insert_staff" on storage.objects;
create policy "releases_storage_insert_staff"
  on storage.objects for insert
  with check (
    bucket_id = 'releases'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner', 'devs')
    )
  );

drop policy if exists "releases_storage_update_staff" on storage.objects;
create policy "releases_storage_update_staff"
  on storage.objects for update
  using (
    bucket_id = 'releases'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner', 'devs')
    )
  )
  with check (
    bucket_id = 'releases'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner', 'devs')
    )
  );

drop policy if exists "releases_storage_delete_staff" on storage.objects;
create policy "releases_storage_delete_staff"
  on storage.objects for delete
  using (
    bucket_id = 'releases'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner', 'devs')
    )
  );

-- 3. Allow staff to delete releases (was owner/co-owner only) -----------------
drop policy if exists "releases_delete_owner" on public.releases;
drop policy if exists "releases_delete_staff" on public.releases;
create policy "releases_delete_staff"
  on public.releases for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'co-owner', 'devs')
    )
  );
