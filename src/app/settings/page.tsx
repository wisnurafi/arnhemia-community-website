import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "./view";

export const metadata = { title: "Preferences" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireSession();
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const twoFactorEnabled = (factors?.totp ?? []).some(
    (f) => f.status === "verified",
  );

  return (
    <>
      <NavbarServer />
      <SettingsView
        profile={session.profile}
        email={session.email}
        twoFactorEnabled={twoFactorEnabled}
      />
      <Footer />
    </>
  );
}
