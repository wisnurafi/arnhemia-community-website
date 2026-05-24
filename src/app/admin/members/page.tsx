import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MembersAdminView } from "./view";
import type { Profile } from "@/lib/supabase/database.types";

export const metadata = { title: "Members · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireRole(["owner", "co-owner", "devs"]);
  const params = await searchParams;
  const query = (params.q ?? "").trim();

  const supabase = await createClient();

  // Direct query against profiles. RLS already permits "select all" reads,
  // and this avoids depending on the list_profiles_for_admin RPC being
  // deployed. ilike for case-insensitive partial username matching.
  let q = supabase
    .from("profiles")
    .select("*")
    .order("joined_at", { ascending: false })
    .limit(200);

  if (query.length > 0) {
    q = q.ilike("username", `%${query}%`);
  }

  const { data: profiles } = await q;

  return (
    <>
      <NavbarServer />
      <MembersAdminView
        profiles={(profiles ?? []) as Profile[]}
        myId={session.id}
        myRole={session.profile.role}
        initialQuery={query}
      />
      <Footer />
    </>
  );
}
