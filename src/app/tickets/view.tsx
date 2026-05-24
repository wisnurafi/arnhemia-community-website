"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/supabase/database.types";
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  LifeBuoy,
  Tag,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import type { TicketListItem } from "./page";

const CATEGORIES: { id: "all" | TicketCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Valorant Support", label: "Valorant Support" },
  { id: "Loader Issues", label: "Loader Issues" },
  { id: "Purchase Help", label: "Purchase Help" },
  { id: "Technical Support", label: "Technical Support" },
  { id: "Account Support", label: "Account Support" },
];

const STATUSES: { id: "all" | TicketStatus; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: "open", label: "Open" },
  { id: "answered", label: "Answered" },
  { id: "pending", label: "Pending" },
  { id: "closed", label: "Closed" },
];

const STATUS_VARIANT: Record<TicketStatus, "info" | "success" | "warning" | "muted"> = {
  open: "info",
  answered: "success",
  pending: "warning",
  closed: "muted",
};

const PRIO_VARIANT: Record<
  TicketPriority,
  "muted" | "outline" | "warning" | "danger"
> = {
  low: "muted",
  medium: "outline",
  high: "warning",
  critical: "danger",
};

export default function TicketsView({
  tickets,
  signedIn,
}: {
  tickets: TicketListItem[];
  signedIn: boolean;
  isStaff: boolean;
}) {
  const [category, setCategory] = React.useState<"all" | TicketCategory>("all");
  const [status, setStatus] = React.useState<"all" | TicketStatus>("all");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState("newest");

  const filtered = React.useMemo(() => {
    let list = [...tickets];
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (status !== "all") list = list.filter((t) => t.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.ref.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const at = new Date(a.updated_at).getTime();
      const bt = new Date(b.updated_at).getTime();
      return sort === "oldest" ? at - bt : bt - at;
    });
    return list;
  }, [tickets, category, status, query, sort]);

  const counts = React.useMemo(() => ({
    open: tickets.filter((t) => t.status === "open").length,
    answered: tickets.filter((t) => t.status === "answered").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  }), [tickets]);

  return (
    <main className="container pb-20 pt-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Support
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Tickets
          </h1>
          <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
            Open a private ticket for Valorant support, loader issues,
            purchase help, technical questions, or account problems. Average
            first response under 4 hours.
          </p>
        </div>
        {signedIn ? (
          <Button asChild size="lg">
            <Link href="/tickets/new">
              <PlusCircle /> Open ticket
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" variant="outline">
            <Link href="/login?redirect=/tickets">Sign in to open a ticket</Link>
          </Button>
        )}
      </header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Stat label="Open" value={counts.open} variant="info" />
        <Stat label="Answered" value={counts.answered} variant="success" />
        <Stat label="Pending" value={counts.pending} variant="warning" />
        <Stat label="Closed" value={counts.closed} variant="muted" />
      </motion.div>

      <div className="mt-8 panel p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, ticket ID..."
              className="h-10 pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as typeof category)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as typeof status)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[150px]">
                <SlidersHorizontal className="size-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/[0.04] pt-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                category === c.id
                  ? "border-white/20 bg-white/[0.08] text-foreground"
                  : "border-white/[0.06] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {filtered.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
        {filtered.length === 0 && (
          <div className="panel col-span-full p-10 text-center">
            <LifeBuoy className="mx-auto size-7 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">
              {tickets.length === 0
                ? "No tickets yet"
                : "No tickets match those filters"}
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {tickets.length === 0
                ? "Open one if you need help with Valorant, your loader, or your account."
                : "Try clearing the search."}
            </p>
            {signedIn && tickets.length === 0 && (
              <Button asChild className="mt-4">
                <Link href="/tickets/new">
                  <PlusCircle /> Open ticket
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: React.ComponentProps<typeof Badge>["variant"];
}) {
  return (
    <div className="panel flex items-center justify-between p-4">
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 font-display text-2xl text-gradient-silver">
          {value}
        </div>
      </div>
      <Badge variant={variant}>{label}</Badge>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketListItem }) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className={cn(
        "panel panel-hover group flex flex-col gap-3 p-5",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={STATUS_VARIANT[ticket.status]}>{ticket.status}</Badge>
        <Badge variant={PRIO_VARIANT[ticket.priority]}>{ticket.priority}</Badge>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/[0.06] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          <Tag className="size-3" />
          {ticket.ref}
        </span>
      </div>

      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-white">
          {ticket.subject}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
          {ticket.body}
        </p>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/[0.04] pt-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarImage
              src={
                ticket.author.avatar_url ??
                `https://api.dicebear.com/7.x/identicon/svg?seed=${ticket.author.username}`
              }
              alt={ticket.author.username}
            />
            <AvatarFallback>{initials(ticket.author.username)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[12.5px] font-medium">
              {ticket.author.username}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {ticket.category} · <RelativeTime date={ticket.updated_at} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="size-3.5" />
            {ticket.reply_count}
          </span>
          <ArrowUpRight className="size-4 opacity-0 transition-all group-hover:opacity-80 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
