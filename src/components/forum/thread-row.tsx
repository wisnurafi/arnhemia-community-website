"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Thread } from "@/lib/types";
import { cn, formatNumber, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  Eye,
  MessageSquare,
  Pin,
  Flame,
  CheckCircle2,
  Sparkles,
  Lock,
} from "lucide-react";

const STATUS_BADGE = {
  pinned: { label: "Pinned", icon: Pin, variant: "muted" as const },
  hot: { label: "Hot", icon: Flame, variant: "warning" as const },
  solved: { label: "Solved", icon: CheckCircle2, variant: "success" as const },
  new: { label: "New", icon: Sparkles, variant: "info" as const },
  locked: { label: "Locked", icon: Lock, variant: "outline" as const },
};

export function ThreadRow({
  thread,
  index = 0,
}: {
  thread: Thread;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        href={`/threads/${thread.id}`}
        className={cn(
          "group flex items-start gap-4 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 transition-all",
          "hover:border-white/[0.12] hover:bg-white/[0.04]",
        )}
      >
        <Avatar className="size-10 mt-0.5">
          <AvatarImage src={thread.author.avatar} alt={thread.author.username} />
          <AvatarFallback>{initials(thread.author.username)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {thread.status?.map((s) => {
              const cfg = STATUS_BADGE[s];
              const Icon = cfg.icon;
              return (
                <Badge key={s} variant={cfg.variant}>
                  <Icon className="size-3" />
                  {cfg.label}
                </Badge>
              );
            })}
            <h3 className="text-[14.5px] font-semibold tracking-tight text-foreground/90 transition-colors group-hover:text-white">
              {thread.title}
            </h3>
          </div>
          <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">
            {thread.excerpt}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
            <span>
              by{" "}
              <span className="text-foreground/80">
                {thread.author.username}
              </span>
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="rounded border border-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em]">
              {thread.category}
            </span>
            <span><RelativeTime date={thread.lastReplyAt} /></span>
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
          <div className="flex items-center gap-1.5 text-[12px] text-foreground/80">
            <MessageSquare className="size-3.5 text-muted-foreground" />
            <span>{formatNumber(thread.replies)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Eye className="size-3.5" />
            <span>{formatNumber(thread.views)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
