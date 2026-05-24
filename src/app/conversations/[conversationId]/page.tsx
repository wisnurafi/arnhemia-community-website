import Link from "next/link";
import { notFound } from "next/navigation";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/brand/role-badge";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
import { ArrowLeft, LogOut } from "lucide-react";
import { MessageComposer, MessageList, AutoMarkRead } from "./client";
import { leaveConversationAction } from "../actions";

export const revalidate = 0;

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const session = await requireSession();
  const supabase = await createClient();

  // Verify membership
  const { data: parts } = await supabase
    .from("conversation_participants")
    .select(
      "user_id, user:profiles!conversation_participants_user_id_fkey(id, username, avatar_url, role)",
    )
    .eq("conversation_id", conversationId);

  if (!parts || !parts.some((p) => p.user_id === session.id)) notFound();

  const others = parts
    .filter((p) => p.user_id !== session.id)
    .map((p) => (Array.isArray(p.user) ? p.user[0] : p.user))
    .filter(Boolean);
  const other = others[0];
  if (!other) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, sender_id, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  // Mark read on first paint.
  await supabase.rpc("mark_conversation_read", {
    p_conversation: conversationId,
  });

  return (
    <>
      <NavbarServer />
      <main className="container max-w-3xl pb-20 pt-10">
        <Link
          href="/conversations"
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All conversations
        </Link>

        <div className="panel mt-4 flex flex-col">
          <header className="flex items-center gap-3 border-b border-white/[0.06] p-4">
            <Link
              href={`/u/${other.username}`}
              className="flex items-center gap-3 hover:opacity-90"
            >
              <Avatar className="size-10 ring-2 ring-white/10">
                <AvatarImage
                  src={
                    other.avatar_url ??
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${other.username}`
                  }
                  alt={other.username}
                />
                <AvatarFallback>{initials(other.username)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-tight">
                    {other.username}
                  </span>
                  <RoleBadge role={other.role} />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Direct message
                </span>
              </div>
            </Link>
            <form action={leaveConversationAction} className="ml-auto">
              <input
                type="hidden"
                name="conversation_id"
                value={conversationId}
              />
              <Button type="submit" size="sm" variant="ghost">
                <LogOut className="size-3.5" /> Leave
              </Button>
            </form>
          </header>

          <MessageList
            conversationId={conversationId}
            currentUserId={session.id}
            initialMessages={(messages ?? []).map((m) => ({
              id: m.id,
              body: m.body,
              sender_id: m.sender_id,
              created_at: m.created_at,
            }))}
          />

          <MessageComposer conversationId={conversationId} />
          <AutoMarkRead conversationId={conversationId} />
        </div>
      </main>
      <Footer />
    </>
  );
}
