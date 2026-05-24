"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import type { Role } from "@/lib/supabase/database.types";

type State = { error?: string; success?: string } | null;

const VALID_ROLES: Role[] = ["owner", "co-owner", "devs", "member"];

const ERROR_MESSAGES: Record<string, string> = {
  not_signed_in: "Sign in first.",
  forbidden_caller: "You don't have permission to change roles.",
  target_not_found: "User not found.",
  invalid_target: "Invalid target user.",
  co_owner_cannot_grant_owner:
    "Only an owner can promote someone to or demote an existing owner.",
  last_owner_cannot_be_demoted:
    "There must be at least one owner. Promote someone else first.",
};

function describeError(err: { message?: string; details?: string | null; hint?: string | null; code?: string | null }) {
  const friendly = ERROR_MESSAGES[err.message ?? ""];
  if (friendly) return friendly;

  // Surface anything useful so we don't get a silent "Could not update".
  const parts = [err.message, err.details, err.hint].filter(Boolean);
  if (parts.length === 0) return "Database error.";
  return parts.join(" — ");
}

export async function setRoleAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in first." };
  if (
    session.profile.role !== "owner" &&
    session.profile.role !== "co-owner"
  ) {
    return { error: "You don't have permission to change roles." };
  }

  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!userId) return { error: "Missing user." };
  if (!VALID_ROLES.includes(role)) return { error: "Invalid role." };
  if (userId === session.id && role !== "owner") {
    return { error: "Use a different account to demote yourself." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_role", {
    p_target: userId,
    p_role: role,
  });

  if (error) {
    return { error: `Could not update role: ${describeError(error)}` };
  }

  revalidatePath("/admin/members");
  revalidatePath("/", "layout");
  return { success: "Role updated." };
}

export async function setSubscriptionAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in first." };
  if (
    session.profile.role !== "owner" &&
    session.profile.role !== "co-owner"
  ) {
    return { error: "You don't have permission." };
  }

  const userId = String(formData.get("user_id") ?? "");
  const subscribed = formData.get("subscribed") === "1";

  if (!userId) return { error: "Missing user." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_subscription", {
    p_target: userId,
    p_subscribed: subscribed,
  });

  if (error) {
    return {
      error: `Could not update subscription: ${describeError(error)}`,
    };
  }

  revalidatePath("/admin/members");
  return {
    success: subscribed ? "Subscription enabled." : "Subscription disabled.",
  };
}
