import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import DownloadsView from "./view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { Lock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import type { ReleaseRow } from "@/lib/supabase/database.types";

export const metadata = {
  title: "Downloads",
};

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const session = await getSession();
  const subscribed =
    !!session && (session.profile.subscribed || isStaff(session.profile.role));

  if (!subscribed) {
    return (
      <>
        <NavbarServer />
        <DownloadsGate signedIn={!!session} />
        <Footer />
      </>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select("*")
    .eq("published", true)
    .order("released_at", { ascending: false });

  return (
    <>
      <NavbarServer />
      <DownloadsView releases={(data ?? []) as ReleaseRow[]} />
      <Footer />
    </>
  );
}

function DownloadsGate({ signedIn }: { signedIn: boolean }) {
  return (
    <main className="container max-w-3xl pb-20 pt-10">
      <header>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Loader
        </span>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
          Downloads
        </h1>
        <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
          Loader builds are gated to subscribed members. Upgrade your plan to
          unlock the latest stable release and all archived versions.
        </p>
      </header>

      <div className="panel glow-border relative mt-10 overflow-hidden p-8">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <Badge variant="warning">
              <Lock className="size-3" />
              Subscribers only
            </Badge>
            <Badge variant="info">
              <ShieldCheck className="size-3" />
              Verified builds
            </Badge>
          </div>

          <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight text-gradient-silver">
            Unlock the loader
          </h2>
          <p className="mt-3 max-w-lg text-[14px] text-muted-foreground">
            The Arnhemia loader, changelog, and update history are part of the
            Operator and Vanguard subscriptions. Pick a tier, get instant
            access, cancel anytime.
          </p>

          <ul className="mt-6 space-y-2 text-[13px] text-foreground/85">
            <li className="flex items-center gap-2.5">
              <Sparkles className="size-3.5 text-amber-200" />
              Latest stable build with auto-updates
            </li>
            <li className="flex items-center gap-2.5">
              <Sparkles className="size-3.5 text-amber-200" />
              Full changelog history
            </li>
            <li className="flex items-center gap-2.5">
              <Sparkles className="size-3.5 text-amber-200" />
              Priority support tickets
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/pricing">
                <Sparkles /> View plans
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            {!signedIn && (
              <Button asChild size="lg" variant="outline">
                <Link href="/login">I already have a plan — sign in</Link>
              </Button>
            )}
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Already subscribed but still seeing this? Reach out in #support.
          </p>
        </div>
      </div>
    </main>
  );
}
