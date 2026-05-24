import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import {
  ConversationsPanel,
  type ConversationPreviewItem,
} from "./conversations-panel";

export async function ConversationsPanelServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    return <ConversationsPanel items={[]}>{children}</ConversationsPanel>;
  }

  const supabase = await createClient();

  const { data: myParts } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", session.id);

  const ids = (myParts ?? []).map((p) => p.conversation_id);
  if (ids.length === 0) {
    return <ConversationsPanel items={[]}>{children}</ConversationsPanel>;
  }

  const [{ data: convos }, { data: parts }, { data: lastMsgs }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id, last_message_at")
        .in("id", ids)
        .order("last_message_at", { ascending: false })
        .limit(8),
      supabase
        .from("conversation_participants")
        .select(
          "conversation_id, user:profiles!conversation_participants_user_id_fkey(id, username, avatar_url)",
        )
        .in("conversation_id", ids),
      supabase
        .from("messages")
        .select("conversation_id, body, sender_id, created_at")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false }),
    ]);

  const lastByConv = new Map<
    string,
    { body: string; sender_id: string; created_at: string }
  >();
  (lastMsgs ?? []).forEach((m) => {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, {
        body: m.body,
        sender_id: m.sender_id,
        created_at: m.created_at,
      });
    }
  });

  const otherByConv = new Map<
    string,
    { id: string; username: string; avatar_url: string | null }
  >();
  (parts ?? []).forEach((p) => {
    const u = Array.isArray(p.user) ? p.user[0] : p.user;
    if (!u || u.id === session.id) return;
    if (!otherByConv.has(p.conversation_id)) {
      otherByConv.set(p.conversation_id, {
        id: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
      });
    }
  });

  const myReads = new Map(
    (myParts ?? []).map((p) => [p.conversation_id, p.last_read_at]),
  );

  const items: ConversationPreviewItem[] = (convos ?? [])
    .map((c) => {
      const other = otherByConv.get(c.id);
      if (!other) return null;
      const last = lastByConv.get(c.id);
      const lastReadAt = myReads.get(c.id);
      const unread =
        !!last &&
        last.sender_id !== session.id &&
        (!lastReadAt || new Date(last.created_at) > new Date(lastReadAt));
      return {
        id: c.id,
        with: other,
        preview: last?.body ?? "No messages yet",
        at: last?.created_at ?? c.last_message_at,
        unread,
      };
    })
    .filter((x): x is ConversationPreviewItem => x !== null);

  return <ConversationsPanel items={items}>{children}</ConversationsPanel>;
}
