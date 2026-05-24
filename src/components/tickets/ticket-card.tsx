"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Ticket, TicketStatus, TicketPriority } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { MessageSquare, Tag, ArrowUpRight } from "lucide-react";

const STATUS: Record<
  TicketStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  open: { label: "Open", variant: "info" },
  answered: { label: "Answered", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  closed: { label: "Closed", variant: "muted" },
};

const PRIORITY: Record<
  TicketPriority,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  low: { label: "Low", variant: "muted" },
  medium: { label: "Medium", variant: "outline" },
  high: { label: "High", variant: "warning" },
  critical: { label: "Critical", variant: "danger" },
};

export function TicketCard({
  ticket,
  index = 0,
}: {
  ticket: Ticket;
  index?: number;
}) {
  const status = STATUS[ticket.status];
  const priority = PRIORITY[ticket.priority];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        href={`/tickets/${ticket.id}`}
        className={cn(
          "panel panel-hover group flex flex-col gap-3 p-5",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status.variant}>
            <span
              className={cn(
                "size-1.5 rounded-full",
                ticket.status === "open" && "bg-sky-300",
                ticket.status === "answered" && "bg-emerald-300",
                ticket.status === "pending" && "bg-amber-300",
                ticket.status === "closed" && "bg-muted-foreground/70",
              )}
            />
            {status.label}
          </Badge>
          <Badge variant={priority.variant}>{priority.label}</Badge>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/[0.06] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            <Tag className="size-3" />
            {ticket.id}
          </span>
        </div>

        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-white">
            {ticket.subject}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
            {ticket.excerpt}
          </p>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/[0.04] pt-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7">
              <AvatarImage
                src={ticket.author.avatar}
                alt={ticket.author.username}
              />
              <AvatarFallback>
                {initials(ticket.author.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-[12.5px] font-medium">
                {ticket.author.username}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {ticket.category} · <RelativeTime date={ticket.updatedAt} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="size-3.5" />
              {ticket.replies}
            </span>
            <ArrowUpRight className="size-4 opacity-0 transition-all group-hover:opacity-80 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
