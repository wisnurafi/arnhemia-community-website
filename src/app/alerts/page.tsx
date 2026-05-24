import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  AtSign,
  Bell,
  Heart,
  MessageSquare,
  Sparkles,
  Trash2,
  Check,
  Settings as Cog,
} from "lucide-react";
import {
  deleteAlertAction,
  markAlertReadAction,
  markAllReadAction,
} from "./actions";
import type { AlertKind } from "@/lib/supabase/database.types";

export const metadata = { title: "Alerts" };
export const revalidate = 0;

const ICONS: Record<AlertKind, React.ComponentType<{ className?: string }>> = {
  reply: MessageSquare,
  reaction: Heart,
  mention: AtSign,
  message: MessageSquare,
  system: Sparkles,
};

export default async function AlertsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, kind, text, link, read_at, created_at, actor_id")
    .eq("recipient_id", session.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const actorIds = Array.from(
    new Set(
      (alerts ?? [])
        .map((a) => a.actor_id)
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

  const unread = (alerts ?? []).filter((a) => !a.read_at).length;

  return (
    <>
      <NavbarServer />
      <main className="container max-w-3xl pb-20 pt-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Inbox
            </span>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
              Alerts
            </h1>
            <p className="mt-3 text-[14px] text-muted-foreground">
              Replies, reactions, mentions, and DMs land here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/alerts/preferences">
                <Cog /> Preferences
              </Link>
            </Button>
            {unread > 0 && (
              <form action={markAllReadAction}>
                <Button type="submit">
                  <Check /> Mark all read
                </Button>
              </form>
            )}
          </div>
        </header>

        <div className="panel mt-8 divide-y divide-white/[0.04]">
          {alerts && alerts.length > 0 ? (
            alerts.map((a) => {
              const Icon = ICONS[a.kind] ?? Bell;
              const actor = a.actor_id ? actorMap.get(a.actor_id) ?? null : null;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]",
                    !a.read_at && "bg-white/[0.02]",
                  )}
                >
                  {actor ? (
                    <Avatar className="size-9">
                      <AvatarImage
                        src={
                          actor.avatar_url ??
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${actor.username}`
                        }
                        alt={actor.username}
                      />
                      <AvatarFallback>
                        {initials(actor.username)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="grid size-9 place-items-center rounded-full bg-white/[0.06]">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] leading-snug">
                      {a.link ? (
                        <Link href={a.link} className="hover:underline">
                          {a.text}
                        </Link>
                      ) : (
                        <span>{a.text}</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                      <Icon className="size-3" />
                      <span><RelativeTime date={a.created_at} /></span>
                      {!a.read_at && (
                        <span className="ml-1 size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!a.read_at && (
                      <form action={markAlertReadAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          aria-label="Mark read"
                        >
                          <Check className="size-3.5" />
                        </Button>
                      </form>
                    )}
                    <form action={deleteAlertAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Bell className="mx-auto size-7 text-muted-foreground" />
              <h3 className="mt-3 font-semibold tracking-tight">No alerts</h3>
              <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
                You&apos;ll see replies, reactions, mentions, and DMs here.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
