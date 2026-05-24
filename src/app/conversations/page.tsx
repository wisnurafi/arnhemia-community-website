import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { MessageSquare } from "lucide-react";

export const metadata = { title: "Conversations" };
export const revalidate = 0;

type ParticipantPreview = {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  last_read_at: string | null;
};

type ConversationItem = {
  id: string;
  last_message_at: string;
  participants: ParticipantPreview[];
  last_message: { body: string; sender_id: string; created_at: string } | null;
  unread: boolean;
};

export default async function ConversationsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: myParts } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", session.id);

  const ids = (myParts ?? []).map((p) => p.conversation_id);
  if (ids.length === 0) {
    return (
      <>
        <NavbarServer />
        <Empty />
        <Footer />
      </>
    );
  }

  const [{ data: convos }, { data: parts }, { data: lastMsgs }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id, last_message_at")
        .in("id", ids)
        .order("last_message_at", { ascending: false }),
      supabase
        .from("conversation_participants")
        .select(
          "conversation_id, last_read_at, user:profiles!conversation_participants_user_id_fkey(id, username, avatar_url)",
        )
        .in("conversation_id", ids),
      supabase
        .from("messages")
        .select("conversation_id, body, sender_id, created_at")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false }),
    ]);

  const lastMap = new Map<
    string,
    { body: string; sender_id: string; created_at: string }
  >();
  (lastMsgs ?? []).forEach((m) => {
    if (!lastMap.has(m.conversation_id)) {
      lastMap.set(m.conversation_id, {
        body: m.body,
        sender_id: m.sender_id,
        created_at: m.created_at,
      });
    }
  });

  const partsByConv = new Map<string, ParticipantPreview[]>();
  (parts ?? []).forEach((p) => {
    const u = Array.isArray(p.user) ? p.user[0] : p.user;
    if (!u) return;
    const list = partsByConv.get(p.conversation_id) ?? [];
    list.push({
      user: { id: u.id, username: u.username, avatar_url: u.avatar_url },
      last_read_at: p.last_read_at,
    });
    partsByConv.set(p.conversation_id, list);
  });

  const myReads = new Map(
    (myParts ?? []).map((p) => [p.conversation_id, p.last_read_at]),
  );

  const items: ConversationItem[] = (convos ?? []).map((c) => {
    const lastReadAt = myReads.get(c.id);
    const last = lastMap.get(c.id) ?? null;
    const unread =
      !!last &&
      last.sender_id !== session.id &&
      (!lastReadAt || new Date(last.created_at) > new Date(lastReadAt));
    return {
      id: c.id,
      last_message_at: c.last_message_at,
      participants: (partsByConv.get(c.id) ?? []).filter(
        (p) => p.user.id !== session.id,
      ),
      last_message: last,
      unread,
    };
  });

  return (
    <>
      <NavbarServer />
      <main className="container max-w-3xl pb-20 pt-10">
        <header>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Direct messages
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Conversations
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Your private chats. Open a profile and click Message to start one.
          </p>
        </header>

        <div className="mt-8 panel divide-y divide-white/[0.04]">
          {items.length === 0 ? (
            <Empty />
          ) : (
            items.map((c) => {
              const other = c.participants[0];
              if (!other) return null;
              return (
                <Link
                  key={c.id}
                  href={`/conversations/${c.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]",
                    c.unread && "bg-white/[0.02]",
                  )}
                >
                  <Avatar className="size-10">
                    <AvatarImage
                      src={
                        other.user.avatar_url ??
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${other.user.username}`
                      }
                      alt={other.user.username}
                    />
                    <AvatarFallback>
                      {initials(other.user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[14px]">
                        {other.user.username}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        <RelativeTime date={c.last_message_at} />
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                      {c.last_message?.body ?? "No messages yet"}
                    </p>
                  </div>
                  {c.unread && (
                    <span className="size-2 shrink-0 rounded-full bg-emerald-400" />
                  )}
                </Link>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Empty() {
  return (
    <main className="container max-w-3xl pb-20 pt-10">
      <header>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Direct messages
        </span>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
          Conversations
        </h1>
      </header>
      <div className="panel mt-8 p-12 text-center">
        <MessageSquare className="mx-auto size-7 text-muted-foreground" />
        <h3 className="mt-3 font-semibold tracking-tight">No conversations</h3>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
          Open a member&apos;s profile and click Message to start a private
          chat.
        </p>
        <Button asChild className="mt-5">
          <Link href="/forums">Browse community</Link>
        </Button>
      </div>
    </main>
  );
}
