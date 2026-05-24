import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { LifeBuoy, MessageSquare } from "lucide-react";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <NavbarServer />
      <main className="container max-w-3xl pb-20 pt-10">
        <header>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Get in touch
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Contact
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Pick the channel that fits your question. Direct DMs to staff are
            ignored — we triage everything through tickets so nothing falls
            through.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/tickets/new"
            className="panel panel-hover p-7"
          >
            <div className="grid size-10 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
              <LifeBuoy className="size-4 text-foreground/85" />
            </div>
            <h3 className="mt-5 font-semibold tracking-tight">
              Open a support ticket
            </h3>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Account issues, loader issues, billing, technical problems.
              Average first response under 4 hours.
            </p>
          </Link>

          <Link href="/discord" className="panel panel-hover p-7">
            <div className="grid size-10 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
              <MessageSquare className="size-4 text-foreground/85" />
            </div>
            <h3 className="mt-5 font-semibold tracking-tight">
              Community Discord
            </h3>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Casual chat, ranked groups, patch notes, community discussion.
              Linked accounts only.
            </p>
          </Link>
        </section>

        <section className="panel mt-6 p-7">
          <h3 className="font-semibold tracking-tight">Press & partnerships</h3>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            Use the support tickets channel and tag the subject{" "}
            <code className="font-mono">[press]</code> or{" "}
            <code className="font-mono">[partnership]</code>. We respond within
            two business days.
          </p>
          <Button asChild className="mt-4">
            <Link href="/tickets/new">Open a ticket</Link>
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
