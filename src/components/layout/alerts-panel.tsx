"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  AtSign,
  Bell,
  Heart,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { AlertKind } from "@/lib/supabase/database.types";

const ICONS: Record<AlertKind, React.ComponentType<{ className?: string }>> = {
  reply: MessageSquare,
  reaction: Heart,
  mention: AtSign,
  message: MessageSquare,
  system: Sparkles,
};

export type AlertPreviewItem = {
  id: string;
  kind: AlertKind;
  text: string;
  link: string | null;
  unread: boolean;
  at: string;
  actor: { username: string; avatar_url: string | null } | null;
};

export function AlertsPanel({
  children,
  items,
}: {
  children: React.ReactNode;
  items: AlertPreviewItem[];
}) {
  const unread = items.filter((a) => a.unread).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold tracking-wide">Alerts</span>
            {unread > 0 && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                {unread} new
              </span>
            )}
          </div>
          <Link
            href="/alerts"
            className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              No alerts yet.
            </div>
          ) : (
            items.map((alert) => {
              const Icon = ICONS[alert.kind] ?? Bell;
              const Body = (
                <>
                  {alert.actor ? (
                    <Avatar className="size-9">
                      <AvatarImage
                        src={
                          alert.actor.avatar_url ??
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                            alert.actor.username,
                          )}`
                        }
                        alt={alert.actor.username}
                      />
                      <AvatarFallback>
                        {initials(alert.actor.username)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-white/[0.06]">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] leading-snug">
                      {alert.actor && (
                        <>
                          <span className="font-semibold">
                            {alert.actor.username}
                          </span>{" "}
                        </>
                      )}
                      <span className="text-muted-foreground">
                        {alert.text}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                      <Icon className="size-3" />
                      <span><RelativeTime date={alert.at} /></span>
                    </div>
                  </div>
                  {alert.unread && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-white" />
                  )}
                </>
              );

              const className = cn(
                "group flex items-start gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03]",
                alert.unread && "bg-white/[0.02]",
              );

              return alert.link ? (
                <Link
                  key={alert.id}
                  href={alert.link}
                  className={className}
                >
                  {Body}
                </Link>
              ) : (
                <div key={alert.id} className={className}>
                  {Body}
                </div>
              );
            })
          )}
        </div>
        <div className="border-t border-white/[0.06] px-4 py-2.5 text-center">
          <Link
            href="/alerts/preferences"
            className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            Alert preferences
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
