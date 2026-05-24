"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/supabase/verify-password";

type State = { error?: string; success?: string } | null;

/**
 * Start enrolling a TOTP factor. Returns the QR code (base64 SVG) and
 * the factor id which the client uses to verify the first 6-digit code.
 */
export async function enrollTotpAction(): Promise<
  | { error: string }
  | {
      factorId: string;
      qrCode: string;
      secret: string;
      uri: string;
    }
> {
  const session = await getSession();
  if (!session) return { error: "Sign in first." };

  const supabase = await createClient();

  // If they already have a verified TOTP factor, refuse to enroll a second.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const existingTotp = factors?.totp ?? [];
  if (existingTotp.some((f) => f.status === "verified")) {
    return { error: "TOTP is already enabled. Disable it first." };
  }

  // Clean up any half-enrolled factors so we don't run into "max factors".
  for (const f of existingTotp) {
    if (f.status !== "verified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "ARNHEMIA",
    friendlyName: `Arnhemia · ${session.profile.username}`,
  });
  if (error || !data) return { error: error?.message ?? "Could not enroll." };

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  };
}

export async function verifyEnrollmentAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in first." };

  const factorId = String(formData.get("factor_id") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!factorId) return { error: "Missing factor." };
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code from your authenticator." };
  }

  const supabase = await createClient();

  const { data: challenge, error: challErr } =
    await supabase.auth.mfa.challenge({ factorId });
  if (challErr || !challenge) {
    return { error: challErr?.message ?? "Could not start challenge." };
  }

  const { error: verifyErr } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
  if (verifyErr) {
    return { error: "Invalid code. Check your clock and try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/settings/2fa");
  return { success: "Two-factor authentication is now enabled." };
}

export async function disableTotpAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in first." };
  if (!session.email) return { error: "Account has no email on file." };

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter your current password." };

  // Re-verify password through a cookie-less client so we don't churn the
  // user's session mid-action.
  const ok = await verifyPassword(session.email, password);
  if (!ok) return { error: "Password is incorrect." };

  const supabase = await createClient();

  const { data: factors, error: listErr } =
    await supabase.auth.mfa.listFactors();
  if (listErr) return { error: listErr.message };

  const all = [...(factors?.totp ?? []), ...(factors?.phone ?? [])];
  if (all.length === 0) {
    return { error: "No 2FA factors found on this account." };
  }

  for (const f of all) {
    const { error: unErr } = await supabase.auth.mfa.unenroll({
      factorId: f.id,
    });
    if (unErr) {
      return { error: `Could not disable 2FA: ${unErr.message}` };
    }
  }

  revalidatePath("/settings");
  revalidatePath("/settings/2fa");
  return { success: "Two-factor authentication disabled." };
}

/**
 * Used on /login/mfa: the user already passed step 1 (password) and now
 * submits their 6-digit code. Supabase elevates the session to AAL2.
 */
export async function verifyLoginMfaAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const code = String(formData.get("code") ?? "").trim();
  const redirectTo = String(formData.get("redirect") ?? "/forums");

  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code from your authenticator." };
  }

  const supabase = await createClient();
  const { data: factors, error: listErr } =
    await supabase.auth.mfa.listFactors();
  if (listErr || !factors) return { error: "Could not load 2FA factors." };

  const verified = (factors.totp ?? []).find((f) => f.status === "verified");
  if (!verified) {
    return { error: "No verified 2FA factor on this account." };
  }

  const { data: challenge, error: challErr } =
    await supabase.auth.mfa.challenge({ factorId: verified.id });
  if (challErr || !challenge) {
    return { error: challErr?.message ?? "Could not start challenge." };
  }

  const { error: verifyErr } = await supabase.auth.mfa.verify({
    factorId: verified.id,
    challengeId: challenge.id,
    code,
  });
  if (verifyErr) {
    return { error: "Invalid code. Check your clock and try again." };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}
