import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { AlertsPanel, type AlertPreviewItem } from "./alerts-panel";
import type { AlertKind } from "@/lib/supabase/database.types";

export async function AlertsPanelServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    return <AlertsPanel items={[]}>{children}</AlertsPanel>;
  }

  const supabase = await createClient();

  // Fetch alerts and actor profiles separately. The previous version used a
  // PostgREST embed (`actor:profiles!alerts_actor_id_fkey(...)`) which can
  // silently drop rows when the embed fails (e.g. when an actor profile is
  // missing or RLS evaluates the join unexpectedly). Two flat queries are
  // small enough to be cheaper than the join and never lose rows.
  const { data: rows } = await supabase
    .from("alerts")
    .select("id, kind, text, link, read_at, created_at, actor_id")
    .eq("recipient_id", session.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const actorIds = Array.from(
    new Set(
      (rows ?? [])
        .map((r) => r.actor_id)
        .filter((id): id is string => !!id),
    ),
  );

  const actorMap = new Map<
    string,
    { username: string; avatar_url: string | null }
  >();
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", actorIds);
    for (const a of actors ?? []) {
      actorMap.set(a.id, { username: a.username, avatar_url: a.avatar_url });
    }
  }

  const items: AlertPreviewItem[] = (rows ?? []).map((a) => ({
    id: a.id,
    kind: a.kind as AlertKind,
    text: a.text,
    link: a.link,
    unread: !a.read_at,
    at: a.created_at,
    actor: a.actor_id ? actorMap.get(a.actor_id) ?? null : null,
  }));

  return <AlertsPanel items={items}>{children}</AlertsPanel>;
}
