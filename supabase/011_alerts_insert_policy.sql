-- =============================================================================
-- ARNHEMIA · 011_alerts_insert_policy.sql
--
-- The original schema enabled RLS on public.alerts but only created policies
-- for SELECT / UPDATE / DELETE — the INSERT path was missing entirely, so
-- every "fan-out" insert from a server action (reply alerts, DM alerts,
-- mention alerts) was being silently rejected by RLS. The result was an
-- empty bell dropdown even when the underlying triggers fired correctly.
--
-- We add an INSERT policy that:
--   1. Lets any authenticated user create an alert where they are the actor.
--      This covers reply / mention / message notifications that are fanned
--      out from server actions running under the calling user's session.
--   2. Lets the service role bypass via the absence of `auth.uid()` (service
--      role isn't restricted by RLS anyway, but we keep the policy explicit).
--
-- Idempotent: drop-then-create.
-- =============================================================================

drop policy if exists "alerts_insert_actor" on public.alerts;
create policy "alerts_insert_actor"
  on public.alerts
  for insert
  with check (
    -- Authenticated user inserting an alert they triggered.
    auth.uid() is not null
    and (
      actor_id is null            -- system alert with no actor (rare)
      or actor_id = auth.uid()    -- the caller is the actor
    )
  );
