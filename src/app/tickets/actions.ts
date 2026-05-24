"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/supabase/database.types";

type State = { error?: string; success?: string } | null;

const VALID_CATS: TicketCategory[] = [
  "Valorant Support",
  "Loader Issues",
  "Purchase Help",
  "Technical Support",
  "Account Support",
];
const VALID_PRIO: TicketPriority[] = ["low", "medium", "high", "critical"];

export async function createTicketAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in to open a ticket." };

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "") as TicketCategory;
  const priority =
    (String(formData.get("priority") ?? "medium") as TicketPriority) || "medium";

  if (subject.length < 6 || subject.length > 200) {
    return { error: "Subject must be 6-200 chars." };
  }
  if (body.length < 10 || body.length > 20000) {
    return { error: "Describe your issue (10+ chars)." };
  }
  if (!VALID_CATS.includes(category)) {
    return { error: "Pick a valid category." };
  }
  if (!VALID_PRIO.includes(priority)) {
    return { error: "Pick a valid priority." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      author_id: session.id,
      subject,
      body,
      category,
      priority,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create." };

  revalidatePath("/tickets");
  redirect(`/tickets/${data.id}`);
}

export async function replyTicketAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in." };

  const ticketId = String(formData.get("ticket_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const staffNote = formData.get("staff_note") === "on";

  if (!ticketId) return { error: "Missing ticket." };
  if (body.length < 1 || body.length > 10000) {
    return { error: "Reply must be 1-10000 chars." };
  }

  const supabase = await createClient();

  // Sanity check: ticket exists and we can read it.
  const { data: ticket } = await supabase
    .from("tickets")
    .select("status, author_id")
    .eq("id", ticketId)
    .maybeSingle<{ status: TicketStatus; author_id: string }>();
  if (!ticket) return { error: "Ticket not found." };

  if (ticket.status === "closed") {
    return { error: "Ticket is closed." };
  }

  const { error } = await supabase.from("ticket_replies").insert({
    ticket_id: ticketId,
    author_id: session.id,
    body,
    staff_note: staffNote && session.profile.role !== "member",
  });
  if (error) return { error: error.message };

  // If the author replied, flip status to pending so staff knows to look.
  if (
    ticket.author_id === session.id &&
    (ticket.status === "answered" || ticket.status === "open")
  ) {
    await supabase
      .from("tickets")
      .update({ status: "pending" })
      .eq("id", ticketId);
  }

  // Notify the other party.
  if (ticket.author_id !== session.id) {
    await supabase.from("alerts").insert({
      recipient_id: ticket.author_id,
      actor_id: session.id,
      kind: "reply",
      text: `Staff replied to your ticket`,
      link: `/tickets/${ticketId}`,
    });
  }

  revalidatePath(`/tickets/${ticketId}`);
  return { success: "Reply posted." };
}

export async function setTicketStatusAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const ticketId = String(formData.get("ticket_id") ?? "");
  const status = String(formData.get("status") ?? "") as TicketStatus;

  if (!["open", "answered", "pending", "closed"].includes(status)) return;

  const supabase = await createClient();

  // Members can only close their own tickets. Staff can do anything.
  const { data: ticket } = await supabase
    .from("tickets")
    .select("author_id")
    .eq("id", ticketId)
    .maybeSingle<{ author_id: string }>();
  if (!ticket) return;

  if (
    session.profile.role === "member" &&
    (ticket.author_id !== session.id || status !== "closed")
  ) {
    return;
  }

  await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId);

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath(`/tickets`);
}
