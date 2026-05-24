import { createClient as createPlainClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Re-verifies a user's password without touching the session cookies bound to
 * the request. We construct a fresh, cookie-less Supabase client and just call
 * signInWithPassword(). If it succeeds the credentials are correct; the
 * resulting session is dropped on the floor (signOut()) so it can never leak
 * into the browser.
 *
 * Why: calling signInWithPassword() on the SSR-bound server client mid-action
 * mutates the auth cookie while the response is still streaming. With
 * supabase-ssr + Next 15 streaming server actions that triggers
 * "Response.clone: Body has already been consumed" and the action errors out.
 * It also wipes the user's MFA elevation, so 2FA disable would silently fail.
 */
export async function verifyPassword(
  email: string,
  password: string,
): Promise<boolean> {
  if (!email || !password) return false;

  const supabase = createPlainClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return false;

  // Best-effort cleanup. Even without it the in-memory session evaporates.
  await supabase.auth.signOut().catch(() => {});
  return true;
}
