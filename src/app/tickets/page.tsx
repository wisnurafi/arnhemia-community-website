import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { getSession } from "@/lib/auth";
import { canModerate } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import TicketsView from "./view";
import type { Ticket } from "@/lib/supabase/database.types";

export const metadata = { title: "Tickets" };
export const revalidate = 0;

export default async function TicketsPage() {
  const session = await getSession();
  const supabase = await createClient();

  let query = supabase
    .from("tickets")
    .select(
      "id, ref, subject, body, category, priority, status, reply_count, last_reply_at, created_at, updated_at, author:profiles!tickets_author_id_fkey(id, username, avatar_url, role)",
    )
    .order("updated_at", { ascending: false });

  // Members only see their own tickets. Staff see all.
  if (session && !canModerate(session.profile.role) && session.profile.role !== "devs") {
    query = query.eq("author_id", session.id);
  }

  const { data: tickets } = await query;

  return (
    <>
      <NavbarServer />
      <TicketsView
        signedIn={!!session}
        isStaff={
          session
            ? session.profile.role !== "member"
            : false
        }
        tickets={
          (tickets ?? []).map((t) => {
            const a = Array.isArray(t.author) ? t.author[0] : t.author;
            return {
              id: t.id,
              ref: t.ref,
              subject: t.subject,
              body: t.body,
              category: t.category,
              priority: t.priority,
              status: t.status,
              reply_count: t.reply_count,
              created_at: t.created_at,
              updated_at: t.updated_at,
              author: {
                id: a?.id ?? "",
                username: a?.username ?? "",
                avatar_url: a?.avatar_url ?? null,
                role: a?.role ?? "member",
              },
            };
          }) as TicketListItem[]
        }
      />
      <Footer />
    </>
  );
}

export type TicketListItem = Pick<
  Ticket,
  | "id"
  | "ref"
  | "subject"
  | "body"
  | "category"
  | "priority"
  | "status"
  | "reply_count"
  | "created_at"
  | "updated_at"
> & {
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
    role: "owner" | "co-owner" | "devs" | "member";
  };
};
