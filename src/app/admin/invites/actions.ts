"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canInvite } from "@/lib/roles";
import { getSession } from "@/lib/auth";
import type { Database } from "@/lib/supabase/database.types";

type InviteInsert = Database["public"]["Tables"]["invite_codes"]["Insert"];

function generateCode(): string {
  // ARN-XXXX-XXXX format
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[bytes[i] % alphabet.length];
  return `ARN-${s.slice(0, 4)}-${s.slice(4)}`;
}

export async function createInviteAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string; code?: string } | null> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  if (!canInvite(session.profile.role)) {
    return { error: "You don't have permission to issue invites." };
  }

  const note = String(formData.get("note") ?? "").slice(0, 200) || null;

  const supabase = await createClient();
  const code = generateCode();

  // Single-use: no expiry, the code is burned the moment someone registers
  // with it (consume_invite RPC sets used_by + used_at).
  const { error } = await supabase.from("invite_codes").insert({
    code,
    created_by: session.id,
    note,
    expires_at: null,
  } as InviteInsert);

  if (error) return { error: error.message };

  revalidatePath("/admin/invites");
  return { code };
}

export async function revokeInviteAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean } | null> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const code = String(formData.get("code") ?? "");
  if (!code) return { error: "Missing code." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("invite_codes")
    .delete()
    .eq("code", code)
    .is("used_by", null);

  if (error) return { error: error.message };

  revalidatePath("/admin/invites");
  return { success: true };
}
