-- =============================================================================
-- ARNHEMIA · 010_realtime.sql
--
-- Enable Supabase Realtime on the tables that drive live UI surfaces:
--
--   * public.messages   -- direct conversation chat
--   * public.alerts     -- bell/dropdown notifications + DM unread badges
--   * public.posts      -- thread replies
--
-- For each table we:
--   1. Set REPLICA IDENTITY FULL so DELETE / UPDATE payloads carry enough
--      identity for the client to reconcile without a refetch.
--   2. Add the table to the supabase_realtime publication, guarded so the
--      migration is idempotent.
-- =============================================================================

alter table public.messages replica identity full;
alter table public.alerts   replica identity full;
alter table public.posts    replica identity full;

do $$
declare
  t text;
begin
  foreach t in array array['messages', 'alerts', 'posts']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
