"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type FilterEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

type Subscription = {
  /** Postgres table name (e.g. "alerts"). */
  table: string;
  /** Postgres event to listen to. Defaults to "*". */
  event?: FilterEvent;
  /** Optional realtime filter, e.g. "recipient_id=eq.<uuid>". */
  filter?: string;
};

/**
 * Generic helper that subscribes to one or more Supabase Realtime channels
 * and triggers a router refresh on every change. Useful for surfaces that
 * are rendered by RSCs and need to repull data when the underlying tables
 * change without a hard page reload.
 *
 * Renders nothing.
 */
export function RealtimeRefresh({
  channel,
  subscriptions,
  /** Coalesce bursts of events into a single refresh. */
  debounceMs = 250,
}: {
  channel: string;
  subscriptions: Subscription[];
  debounceMs?: number;
}) {
  const router = useRouter();

  // Hold the latest subscription list in a ref so the effect can stay
  // dependency-free w.r.t. array identity.
  const subsRef = React.useRef(subscriptions);
  subsRef.current = subscriptions;

  React.useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        router.refresh();
      }, debounceMs);
    };

    let ch = supabase.channel(channel);
    for (const sub of subsRef.current) {
      ch = ch.on(
        // The supabase-js types are loose here; "postgres_changes" is the
        // documented event name.
        "postgres_changes" as never,
        {
          event: sub.event ?? "*",
          schema: "public",
          table: sub.table,
          ...(sub.filter ? { filter: sub.filter } : {}),
        } as never,
        () => scheduleRefresh(),
      );
    }
    ch.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(ch);
    };
  }, [channel, debounceMs, router]);

  return null;
}
