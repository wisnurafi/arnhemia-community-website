import Link from "next/link";
import { notFound } from "next/navigation";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/brand/role-badge";
import { TicketReplyForm, TicketStatusButtons } from "./client";
import { getSession } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { ArrowLeft, Calendar, Tag, MessageSquare } from "lucide-react";
import type {
  TicketStatus,
  TicketPriority,
} from "@/lib/supabase/database.types";

export const revalidate = 0;

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("subject, ref")
    .eq("id", ticketId)
    .maybeSingle();
  return { title: data ? `${data.ref} · ${data.subject}` : "Ticket" };
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const session = await getSession();
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("tickets")
    .select(
      `
      id, ref, subject, body, category, priority, status, reply_count,
      created_at, updated_at, last_reply_at, author_id,
      author:profiles!tickets_author_id_fkey(id, username, avatar_url, role, status)
      `,
    )
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) notFound();

  const { data: replies } = await supabase
    .from("ticket_replies")
    .select(
      "id, body, staff_note, created_at, author:profiles!ticket_replies_author_id_fkey(id, username, avatar_url, role)",
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  const author = Array.isArray(ticket.author) ? ticket.author[0] : ticket.author;
  const canStaff = !!session && isStaff(session.profile.role);
  const isAuthor = session?.id === ticket.author_id;

  return (
    <>
      <NavbarServer />
      <main className="container max-w-4xl pb-20 pt-10">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All tickets
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[ticket.status]}>
              {ticket.status}
            </Badge>
            <Badge variant={PRIO_VARIANT[ticket.priority]}>
              {ticket.priority}
            </Badge>
            <Badge variant="muted">{ticket.category}</Badge>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/[0.06] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              <Tag className="size-3" />
              {ticket.ref}
            </span>
          </div>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl text-gradient-silver">
            {ticket.subject}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Opened <RelativeTime date={ticket.created_at} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="size-3.5" />
              {ticket.reply_count} replies
            </span>
          </div>
        </header>

        {/* Original ticket */}
        <article className="panel mt-8 grid gap-5 p-6 md:grid-cols-[160px_1fr]">
          <aside className="md:border-r md:border-white/[0.06] md:pr-5">
            <Avatar className="size-14 ring-2 ring-white/10">
              <AvatarImage
                src={
                  author?.avatar_url ??
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${author?.username ?? "anon"}`
                }
                alt={author?.username ?? ""}
              />
              <AvatarFallback>
                {initials(author?.username ?? "AN")}
              </AvatarFallback>
            </Avatar>
            <div className="mt-3 text-[14px] font-semibold tracking-tight">
              {author?.username}
            </div>
            <div className="mt-1.5">
              {author?.role && <RoleBadge role={author.role} />}
            </div>
          </aside>
          <div>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
              {ticket.body}
            </p>
          </div>
        </article>

        {/* Replies */}
        <div className="mt-8 space-y-3">
          {(replies ?? []).map((p) => {
            const a = Array.isArray(p.author) ? p.author[0] : p.author;
            const aIsStaff = a?.role !== "member";
            return (
              <article
                key={p.id}
                className={`panel grid gap-5 p-6 md:grid-cols-[160px_1fr] ${
                  p.staff_note ? "border-amber-400/20" : ""
                } ${aIsStaff ? "ring-1 ring-white/[0.04]" : ""}`}
              >
                <aside className="md:border-r md:border-white/[0.06] md:pr-5">
                  <Avatar className="size-12 ring-2 ring-white/10">
                    <AvatarImage
                      src={
                        a?.avatar_url ??
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${a?.username ?? "anon"}`
                      }
                      alt={a?.username ?? ""}
                    />
                    <AvatarFallback>
                      {initials(a?.username ?? "AN")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-2 text-[13.5px] font-semibold">
                    {a?.username}
                  </div>
                  <div className="mt-1.5">
                    {a?.role && <RoleBadge role={a.role} />}
                  </div>
                </aside>
                <div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <RelativeTime date={p.created_at} />
                    {p.staff_note && (
                      <Badge variant="warning">Staff note</Badge>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
                    {p.body}
                  </p>
                </div>
              </article>
            );
          })}
          {(!replies || replies.length === 0) && (
            <div className="panel p-8 text-center text-[13px] text-muted-foreground">
              No replies yet.
            </div>
          )}
        </div>

        {/* Status controls + reply form */}
        <div className="mt-10 space-y-4">
          {(canStaff || isAuthor) && (
            <div className="panel flex items-center justify-between gap-3 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Ticket status
              </span>
              <TicketStatusButtons
                ticketId={ticket.id}
                status={ticket.status}
                canStaff={canStaff}
                canCloseAsAuthor={isAuthor}
              />
            </div>
          )}

          {ticket.status === "closed" ? (
            <div className="panel p-6 text-center text-[13.5px] text-muted-foreground">
              This ticket is closed. Open a new one if it&apos;s a different
              issue.
            </div>
          ) : !session ? (
            <div className="panel p-6 text-center text-[13.5px] text-muted-foreground">
              <Link
                href={`/login?redirect=/tickets/${ticketId}`}
                className="font-medium text-foreground hover:underline"
              >
                Sign in
              </Link>{" "}
              to reply.
            </div>
          ) : (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Post a reply
              </h3>
              <TicketReplyForm ticketId={ticket.id} isStaff={canStaff} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
