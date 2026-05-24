"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { MessageSquare, PenSquare } from "lucide-react";

export type ConversationPreviewItem = {
  id: string;
  with: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  preview: string;
  at: string;
  unread: boolean;
};

export function ConversationsPanel({
  children,
  items,
}: {
  children: React.ReactNode;
  items: ConversationPreviewItem[];
}) {
  const unread = items.filter((c) => c.unread).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold tracking-wide">
              Conversations
            </span>
            {unread > 0 && (
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                {unread} unread
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-[11px] uppercase tracking-[0.16em]"
            asChild
          >
            <Link href="/conversations">
              <PenSquare className="size-3" />
              All
            </Link>
          </Button>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              No conversations yet. Open a profile and click Message.
            </div>
          ) : (
            items.map((c) => {
              const avatar =
                c.with.avatar_url ??
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                  c.with.username,
                )}`;
              return (
                <Link
                  key={c.id}
                  href={`/conversations/${c.id}`}
                  className={cn(
                    "flex items-start gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03]",
                    c.unread && "bg-white/[0.02]",
                  )}
                >
                  <Avatar className="size-9">
                    <AvatarImage src={avatar} alt={c.with.username} />
                    <AvatarFallback>{initials(c.with.username)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold">
                        {c.with.username}
                      </span>
                      <span className="text-[11px] text-muted-foreground/80">
                        <RelativeTime date={c.at} />
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                      {c.preview}
                    </p>
                  </div>
                  {c.unread && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                  )}
                </Link>
              );
            })
          )}
        </div>
        <div className="border-t border-white/[0.06] px-4 py-2.5 text-center">
          <Link
            href="/conversations"
            className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            Show all conversations
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
