"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: boolean } | null;

function avatarFor(username: string) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}&backgroundColor=0b0b0e,131319,1a1a22&backgroundType=gradientLinear`;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/forums");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Check if this account has TOTP 2FA enabled. If so, force them through
  // the /login/mfa challenge before letting them reach the destination.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (
    aal &&
    aal.nextLevel === "aal2" &&
    aal.currentLevel !== "aal2"
  ) {
    revalidatePath(redirectTo);
    redirect(
      `/login/mfa?redirect=${encodeURIComponent(redirectTo)}`,
    );
  }

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const inviteCode = String(formData.get("invite") ?? "").trim().toUpperCase();
  const terms = formData.get("terms") === "on";
  const captcha = formData.get("captcha") === "on";

  if (!username || !email || !password || !inviteCode) {
    return { error: "All fields are required." };
  }
  if (!/^[A-Za-z0-9_]{3,32}$/.test(username)) {
    return {
      error: "Username must be 3-32 chars, letters/numbers/underscore only.",
    };
  }
  if (password.length < 10) {
    return { error: "Password must be at least 10 characters." };
  }
  if (!terms) return { error: "You must accept the terms." };
  if (!captcha) return { error: "Captcha is required." };

  const supabase = await createClient();

  // 1. Pre-validate the invite code so we don't create an auth user for nothing.
  const { data: invite, error: inviteErr } = await supabase
    .from("invite_codes")
    .select("code, used_by, expires_at")
    .eq("code", inviteCode)
    .maybeSingle<{
      code: string;
      used_by: string | null;
      expires_at: string | null;
    }>();

  if (inviteErr || !invite) return { error: "Invite code not found." };
  if (invite.used_by) return { error: "Invite code has already been used." };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { error: "Invite code has expired." };
  }

  // 2. Pre-check username uniqueness for a friendlier error.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existing) return { error: "That username is already taken." };

  // 3. Create the auth user.
  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
  });
  if (signUpErr || !signUp.user) {
    return { error: signUpErr?.message ?? "Sign up failed." };
  }

  // 4. Atomically consume the invite + create the profile.
  const { error: rpcErr } = await supabase.rpc("consume_invite" as never, {
    p_user_id: signUp.user.id,
    p_username: username,
    p_invite_code: inviteCode,
    p_avatar_url: avatarFor(username),
  } as never);

  if (rpcErr) {
    // Best-effort cleanup: the auth user still exists. Surface the error.
    return {
      error:
        rpcErr.message === "invite_already_used"
          ? "That invite was just used. Try another one."
          : rpcErr.message === "invite_expired"
            ? "Invite code has expired."
            : rpcErr.message === "invite_not_found"
              ? "Invite code not found."
              : rpcErr.message === "invalid_username"
                ? "Invalid username."
                : "Could not finish registration. Try again.",
    };
  }

  revalidatePath("/forums");

  // If email confirmation is enabled, the user must confirm before signing in.
  // Otherwise signUp() returned a session and they're already logged in.
  if (signUp.session) {
    redirect("/forums");
  }
  return {
    success: true,
    error:
      "Account created. Check your email to confirm before signing in.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Clear the MFA hint cookie so it doesn't persist across sessions.
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set("aal-verified", "", { maxAge: 0, path: "/" });

  revalidatePath("/", "layout");
  redirect("/");
}
