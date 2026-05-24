import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReleasesAdminView } from "./view";
import type { ReleaseRow } from "@/lib/supabase/database.types";

export const metadata = { title: "Releases · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReleasesPage() {
  await requireRole(["owner", "co-owner", "devs"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select("*")
    .order("released_at", { ascending: false });

  return (
    <>
      <NavbarServer />
      <ReleasesAdminView releases={(data ?? []) as ReleaseRow[]} />
      <Footer />
    </>
  );
}
