import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { TwoFactorClient } from "./client";

export const metadata = { title: "Two-factor authentication" };
export const dynamic = "force-dynamic";

export default async function TwoFactorPage() {
  await requireSession();
  const supabase = await createClient();

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const enabled = (factors?.totp ?? []).some((f) => f.status === "verified");

  return (
    <>
      <NavbarServer />
      <main className="container max-w-2xl pb-20 pt-10">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to preferences
        </Link>

        <header className="mt-4 flex items-start gap-4">
          <div className="grid size-11 place-items-center rounded-lg border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02]">
            <ShieldCheck className="size-5 text-foreground/85" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Account security
            </span>
            <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight md:text-4xl text-gradient-silver">
              Two-factor authentication
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Add a second step at sign-in using a one-time code from your
              authenticator app.
            </p>
          </div>
        </header>

        <section className="panel mt-8 p-7">
          <TwoFactorClient enabled={enabled} />
        </section>
      </main>
      <Footer />
    </>
  );
}
