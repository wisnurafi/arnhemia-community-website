"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { sendMessageAction } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";

export type ChatMessage = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
};

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} aria-label="Send">
      {pending ? <Loader2 className="animate-spin size-3.5" /> : <Send className="size-3.5" />}
    </Button>
  );
}

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [state, formAction] = useActionState(sendMessageAction, null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success && ref.current) {
      ref.current.value = "";
      ref.current.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className="border-t border-white/[0.06] p-3">
      <input type="hidden" name="conversation_id" value={conversationId} />
      {state?.error && (
        <div className="mb-2 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-1.5 text-[12px] text-red-200">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          ref={ref}
          name="body"
          placeholder="Type a message..."
          autoComplete="off"
          required
          maxLength={4000}
        />
        <SendButton />
      </div>
    </form>
  );
}

/**
 * Live message list. Renders the initial messages from the server payload
 * and subscribes to INSERT/DELETE events on the conversation so new messages
 * appear instantly for every participant without a page refresh.
 */
export function MessageList({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Reconcile with server payload on RSC re-render. We dedupe by id to
  // avoid clobbering optimistic / realtime entries.
  React.useEffect(() => {
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m] as const));
      for (const m of initialMessages) byId.set(m.id, m);
      return [...byId.values()].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    });
  }, [initialMessages]);

  // Auto-scroll to the bottom whenever the list grows.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Realtime subscription scoped to this conversation.
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
            );
          });

          // If the incoming message is from someone else, mark the
          // conversation as read so the unread badge clears.
          if (row.sender_id !== currentUserId) {
            fetch("/api/conversations/mark-read", {
              method: "POST",
              body: JSON.stringify({ id: conversationId }),
              headers: { "content-type": "application/json" },
              credentials: "include",
            }).catch(() => {});
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const old = payload.old as { id?: string };
          if (!old?.id) return;
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  return (
    <div
      ref={scrollRef}
      className="max-h-[60vh] min-h-[320px] flex-1 overflow-y-auto px-4 py-5 space-y-3"
    >
      {messages.map((m) => {
        const mine = m.sender_id === currentUserId;
        return (
          <div
            key={m.id}
            className={cn("flex", mine ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug",
                mine
                  ? "bg-white text-black rounded-br-md"
                  : "bg-white/[0.05] text-foreground border border-white/[0.06] rounded-bl-md",
              )}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <div
                className={cn(
                  "mt-1 text-[10px]",
                  mine ? "text-black/50" : "text-muted-foreground/70",
                )}
              >
                <RelativeTime date={m.created_at} />
              </div>
            </div>
          </div>
        );
      })}
      {messages.length === 0 && (
        <div className="py-12 text-center text-[13px] text-muted-foreground">
          No messages yet. Say something.
        </div>
      )}
    </div>
  );
}

export function AutoMarkRead({
  conversationId,
}: {
  conversationId: string;
}) {
  // Mark read on mount; the realtime listener handles subsequent incoming
  // messages, so we no longer need an interval poll.
  useEffect(() => {
    fetch("/api/conversations/mark-read", {
      method: "POST",
      body: JSON.stringify({ id: conversationId }),
      headers: { "content-type": "application/json" },
      credentials: "include",
    }).catch(() => {});
  }, [conversationId]);
  return null;
}
