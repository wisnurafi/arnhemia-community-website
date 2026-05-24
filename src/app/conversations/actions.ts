"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { sendAlertEmail } from "@/lib/email";

type State = { error?: string; success?: boolean } | null;

export async function sendMessageAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in." };

  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!conversationId) return { error: "Missing conversation." };
  if (body.length < 1 || body.length > 4000) {
    return { error: "Message must be 1-4000 chars." };
  }

  const supabase = await createClient();

  const { data: parts } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);

  if (!parts || !parts.some((p) => p.user_id === session.id)) {
    return { error: "You're not part of this conversation." };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: session.id,
    body,
  });
  if (error) return { error: error.message };

  // Notify others
  const recipients = parts.filter((p) => p.user_id !== session.id);
  if (recipients.length > 0) {
    const { error: alertError } = await supabase.from("alerts").insert(
      recipients.map((r) => ({
        recipient_id: r.user_id,
        actor_id: session.id,
        kind: "message" as const,
        text: `${session.profile.username} sent you a message`,
        link: `/conversations/${conversationId}`,
      })),
    );
    if (alertError) {
      // eslint-disable-next-line no-console
      console.error("[alerts] message insert failed", alertError);
    }

    const previewBody = body.length > 200 ? `${body.slice(0, 200)}…` : body;
    await Promise.all(
      recipients.map((r) =>
        sendAlertEmail({
          recipientId: r.user_id,
          kind: "message",
          subject: `${session.profile.username} sent you a message`,
          preview: previewBody,
          link: `/conversations/${conversationId}`,
          actorUsername: session.profile.username,
        }),
      ),
    );
  }

  revalidatePath(`/conversations/${conversationId}`);
  revalidatePath(`/conversations`);
  return { success: true };
}

export async function markReadAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const conversationId = String(formData.get("conversation_id") ?? "");
  if (!conversationId) return;

  const supabase = await createClient();
  await supabase.rpc("mark_conversation_read", {
    p_conversation: conversationId,
  });
  revalidatePath(`/conversations`);
}

export async function leaveConversationAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const conversationId = String(formData.get("conversation_id") ?? "");
  if (!conversationId) return;

  const supabase = await createClient();
  await supabase
    .from("conversation_participants")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", session.id);
  redirect("/conversations");
}
