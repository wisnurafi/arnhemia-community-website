import { Suspense } from "react";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/roles";
import { NewThreadView } from "./view";

export const metadata = { title: "New thread" };

export default async function NewThreadPage() {
  const session = await requireSession();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("forum_categories")
    .select("*")
    .order("position");

  // Members never see staff-only categories in the picker.
  const visible = (categories ?? []).filter(
    (c) => isStaff(session.profile.role) || !c.staff_only,
  );

  return (
    <>
      <NavbarServer />
      <Suspense fallback={null}>
        <NewThreadView categories={visible} />
      </Suspense>
      <Footer />
    </>
  );
}
