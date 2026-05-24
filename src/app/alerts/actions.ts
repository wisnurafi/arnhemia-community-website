"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export async function markAlertReadAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("alerts")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", session.id);

  revalidatePath("/alerts");
  revalidatePath("/", "layout");
}

export async function markAllReadAction() {
  const session = await getSession();
  if (!session) return;
  const supabase = await createClient();
  await supabase
    .from("alerts")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", session.id)
    .is("read_at", null);

  revalidatePath("/alerts");
  revalidatePath("/", "layout");
}

export async function deleteAlertAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("alerts")
    .delete()
    .eq("id", id)
    .eq("recipient_id", session.id);
  revalidatePath("/alerts");
}

export async function updateAlertPrefsAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const supabase = await createClient();

  const prefs = {
    user_id: session.id,
    email_replies: formData.get("email_replies") === "on",
    email_mentions: formData.get("email_mentions") === "on",
    email_messages: formData.get("email_messages") === "on",
    push_replies: formData.get("push_replies") === "on",
    push_reactions: formData.get("push_reactions") === "on",
    push_mentions: formData.get("push_mentions") === "on",
    push_messages: formData.get("push_messages") === "on",
  };

  await supabase
    .from("alert_preferences")
    .upsert(prefs, { onConflict: "user_id" });

  revalidatePath("/alerts/preferences");
}
