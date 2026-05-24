-- =============================================================================
-- ARNHEMIA · 009_shouts_realtime.sql
--
-- Enable Supabase Realtime on the public.shouts table so the shoutbox in the
-- forum sidebar updates live for every connected client when a new shout is
-- posted (or deleted), without needing a page refresh.
--
-- Idempotent: safe to run multiple times.
-- =============================================================================

-- 1. Make sure each row carries enough info for REPLICA IDENTITY so DELETE
--    events come through with the row payload (used to drop the shout from
--    every client when staff removes it).
alter table public.shouts replica identity full;

-- 2. Add the table to the supabase_realtime publication. We guard with a DO
--    block so re-running the migration is a no-op when the table is already
--    part of the publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shouts'
  ) then
    execute 'alter publication supabase_realtime add table public.shouts';
  end if;
end $$;
