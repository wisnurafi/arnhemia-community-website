import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InviteAdminView } from "./view";

export const metadata = {
  title: "Invite codes · Admin",
};

export default async function AdminInvitesPage() {
  const session = await requireRole(["owner", "co-owner", "devs"]);
  const supabase = await createClient();

  const { data: invites } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("created_by", session.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <NavbarServer />
      <InviteAdminView
        role={session.profile.role}
        invites={invites ?? []}
      />
      <Footer />
    </>
  );
}
