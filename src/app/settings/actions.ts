"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/supabase/verify-password";

type State = { error?: string; success?: string } | null;

export async function updateProfileAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const status = String(formData.get("status") ?? "").slice(0, 140) || null;
  const username = String(formData.get("username") ?? "").trim();

  if (!/^[A-Za-z0-9_]{3,32}$/.test(username)) {
    return { error: "Username must be 3-32 chars, letters/numbers/underscore." };
  }

  const supabase = await createClient();

  // Check uniqueness if changed
  if (username !== session.profile.username) {
    const { data: clash } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (clash && clash.id !== session.id) {
      return { error: "That username is already taken." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status, username })
    .eq("id", session.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  if (!session.email) return { error: "Account has no email on file." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 10) return { error: "New password must be 10+ chars." };
  if (next !== confirm) return { error: "Passwords do not match." };

  // Re-verify current password using a cookie-less client. This avoids
  // mutating the session cookie mid-server-action (which causes the
  // "Response.clone: Body has already been consumed" error in Next 15).
  const ok = await verifyPassword(session.email, current);
  if (!ok) return { error: "Current password is incorrect." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return { success: "Password changed." };
}

export async function deleteAccountAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) redirect("/login");

  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== session.profile.username) {
    return {
      error: `Type "${session.profile.username}" exactly to confirm.`,
    };
  }

  const supabase = await createClient();

  // Run a SECURITY DEFINER RPC that purges profile + auth user atomically.
  // RLS-only DELETE on profiles is unreliable here because (a) we also need
  // to drop auth.users and (b) if the RLS policy is missing the request
  // silently affects 0 rows.
  const { error } = await supabase.rpc("delete_self_account");
  if (error) {
    return {
      error: `Could not delete account: ${error.message}`,
    };
  }

  await supabase.auth.signOut().catch(() => {});
  revalidatePath("/", "layout");
  redirect("/");
}
