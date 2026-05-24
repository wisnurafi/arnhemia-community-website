"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

type State = { error?: string; success?: boolean } | null;

export async function postShoutAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in to shout." };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1 || body.length > 240) {
    return { error: "Shouts are 1-240 chars." };
  }

  // Anti-spam: max 1 shout per 3 seconds.
  const supabase = await createClient();
  const { data: recent } = await supabase
    .from("shouts")
    .select("created_at")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ created_at: string }>();

  if (
    recent &&
    Date.now() - new Date(recent.created_at).getTime() < 3000
  ) {
    return { error: "Slow down — 3s cooldown between shouts." };
  }

  const { error } = await supabase
    .from("shouts")
    .insert({ user_id: session.id, body });
  if (error) return { error: error.message };

  revalidatePath("/forums");
  return { success: true };
}
