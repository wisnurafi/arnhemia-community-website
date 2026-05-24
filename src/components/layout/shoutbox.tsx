"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { Send, Radio, AlertCircle } from "lucide-react";
import { postShoutAction } from "@/app/forums/shout-actions";
import { createClient } from "@/lib/supabase/client";

export type ShoutItem = {
  id: string;
  body: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    role: "owner" | "co-owner" | "devs" | "member";
  };
};

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      className="h-9 w-9 shrink-0"
      aria-label="Send"
      disabled={pending}
    >
      <Send className="size-3.5" />
    </Button>
  );
}

export function Shoutbox({
  initialShouts,
  signedIn,
}: {
  initialShouts: ShoutItem[];
  signedIn: boolean;
}) {
  const [state, formAction] = useActionState(postShoutAction, null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [shouts, setShouts] = React.useState<ShoutItem[]>(initialShouts);

  // Keep local state in sync if the server component re-renders with fresh data
  // (e.g. after revalidatePath kicks in for the poster).
  React.useEffect(() => {
    setShouts((prev) => {
      const seen = new Set(prev.map((s) => s.id));
      const merged = [...prev];
      for (const s of initialShouts) {
        if (!seen.has(s.id)) merged.push(s);
      }
      merged.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      return merged.slice(0, 20);
    });
  }, [initialShouts]);

  React.useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  // Realtime: subscribe to shout INSERTs and DELETEs.
  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("shouts-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "shouts" },
        async (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            body: string;
            created_at: string;
          };

          // Skip duplicates — the poster's own shout may already be in state
          // from the server action's revalidation.
          let already = false;
          setShouts((prev) => {
            already = prev.some((s) => s.id === row.id);
            return prev;
          });
          if (already) return;

          // The realtime payload has no joined profile, so fetch it.
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, role")
            .eq("id", row.user_id)
            .maybeSingle();

          const item: ShoutItem = {
            id: row.id,
            body: row.body,
            created_at: row.created_at,
            user: {
              id: profile?.id ?? row.user_id,
              username: profile?.username ?? "anon",
              avatar_url: profile?.avatar_url ?? null,
              role: (profile?.role ?? "member") as ShoutItem["user"]["role"],
            },
          };

          setShouts((prev) => {
            if (prev.some((s) => s.id === item.id)) return prev;
            return [item, ...prev].slice(0, 20);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "shouts" },
        (payload) => {
          const old = payload.old as { id?: string };
          if (!old?.id) return;
          setShouts((prev) => prev.filter((s) => s.id !== old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="panel rounded-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative size-2 rounded-full bg-emerald-400" />
          </span>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground">
            Shoutbox
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Radio className="size-3" />
          <span>Live</span>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto px-4 py-3 flex flex-col-reverse gap-3">
        <AnimatePresence initial={false}>
          {shouts.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2.5"
            >
              <Avatar className="size-7 mt-0.5">
                <AvatarImage
                  src={
                    m.user.avatar_url ??
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${m.user.username}`
                  }
                  alt={m.user.username}
                />
                <AvatarFallback>{initials(m.user.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-[12.5px] font-semibold",
                      m.user.role === "owner" && "text-amber-200",
                      m.user.role === "co-owner" && "text-zinc-200",
                      m.user.role === "devs" && "text-sky-300",
                      m.user.role === "member" && "text-foreground/85",
                    )}
                  >
                    {m.user.username}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground/70">
                    <RelativeTime date={m.created_at} />
                  </span>
                </div>
                <p className="text-[13px] text-foreground/85 leading-snug">
                  {m.body}
                </p>
              </div>
            </motion.div>
          ))}
          {shouts.length === 0 && (
            <p className="py-6 text-center text-[12.5px] text-muted-foreground">
              No shouts yet. Be the first to drop one.
            </p>
          )}
        </AnimatePresence>
      </div>

      {signedIn ? (
        <form ref={formRef} action={formAction} className="border-t border-white/[0.06] p-2.5">
          {state?.error && (
            <div className="mb-2 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-1.5 text-[11.5px] text-red-200">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              name="body"
              placeholder="Drop a shout..."
              className="h-9 text-[13px]"
              maxLength={240}
              required
              autoComplete="off"
            />
            <SendButton />
          </div>
        </form>
      ) : (
        <div className="border-t border-white/[0.06] p-3 text-center text-[12px] text-muted-foreground">
          <a href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </a>{" "}
          to shout.
        </div>
      )}
    </div>
  );
}
