import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/database.types";

export { canInvite, canModerate, isStaff } from "@/lib/roles";

export type SessionProfile = {
  id: string;
  email: string | null;
  profile: Profile;
};

export async function getSession(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    profile,
  };
}

export async function requireSession(redirectTo = "/login"): Promise<SessionProfile> {
  const session = await getSession();
  if (!session) redirect(redirectTo);
  return session;
}

export async function requireRole(
  roles: Profile["role"][],
  redirectTo = "/",
): Promise<SessionProfile> {
  const session = await requireSession();
  if (!roles.includes(session.profile.role)) redirect(redirectTo);
  return session;
}
