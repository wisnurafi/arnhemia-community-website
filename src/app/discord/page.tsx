import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DISCORD_INVITE_URL } from "@/lib/config";
import {
  ArrowRight,
  Link2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Discord",
};

const STEPS = [
  {
    title: "Open Discord",
    detail:
      "Make sure you're logged in to the Discord account that matches your forum profile.",
  },
  {
    title: "Join the server",
    detail:
      "Click the button to accept the invite and land in the Arnhemia community server.",
  },
  {
    title: "Verify your tier",
    detail:
      "Staff will assign your tier role automatically based on your subscription.",
  },
  {
    title: "Get talking",
    detail:
      "Patch chat, ranked groups, support threads, all live. Keep the volume on.",
  },
];

export default function DiscordPage() {
  return (
    <>
      <NavbarServer />
      <main className="container pb-20 pt-10">
        <header>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Community
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Discord
          </h1>
          <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
            Hop into the Arnhemia Discord server. Voice channels, patch chat,
            ranked stacks, and direct line to staff.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="panel p-7">
            <h2 className="font-display text-2xl tracking-tight text-gradient-silver">
              How it works
            </h2>
            <ol className="mt-6 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex items-start gap-4">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] font-mono text-[11.5px] text-foreground/85">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">{s.title}</h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {s.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel glow-border relative overflow-hidden p-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                    <DiscordGlyph />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-tight">
                      Arnhemia server
                    </h3>
                    <p className="text-[12px] text-muted-foreground">
                      discord.gg/gdewckC82
                    </p>
                  </div>
                </div>
                <Badge variant="success">
                  <Users className="size-3" />
                  Open invite
                </Badge>
              </div>

              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full gap-2"
                >
                  <a
                    href={DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Link2 className="size-4" />
                    Join the Discord server
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Opens Discord in a new tab.
                </p>
              </div>

              <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-300" />
                  <span className="text-[12px] font-semibold tracking-wide">
                    What we never do
                  </span>
                </div>
                <ul className="mt-2.5 space-y-1.5 text-[12.5px] text-muted-foreground">
                  <li>· Read your DMs or server messages</li>
                  <li>· Post on your behalf</li>
                  <li>· Share your handle outside the server</li>
                </ul>
              </div>

              <div className="mt-4 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] p-4">
                <div className="flex items-center gap-2 text-amber-200">
                  <Sparkles className="size-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                    Tier sync
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] text-amber-100/80">
                  Operator and Vanguard members get a coloured role inside the
                  server. Mention staff in #general after joining.
                </p>
              </div>
            </div>
          </section>
        </div>

        <p className="mt-8 text-center text-[12px] text-muted-foreground">
          Stuck joining?{" "}
          <Link
            href="/tickets"
            className="font-medium text-foreground hover:underline"
          >
            Open a support ticket
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}

function DiscordGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      className="text-foreground/85"
      aria-hidden
    >
      <path d="M19.27 5.33A18 18 0 0 0 14.86 4l-.2.4a16.83 16.83 0 0 0-5.32 0L9.14 4a18 18 0 0 0-4.41 1.33A18.27 18.27 0 0 0 1.5 17.36 18.13 18.13 0 0 0 6.95 20l1.1-1.51a11.66 11.66 0 0 1-1.83-.88l.45-.36a13 13 0 0 0 10.66 0l.45.36a11.66 11.66 0 0 1-1.83.88L17.05 20a18.13 18.13 0 0 0 5.45-2.64 18.27 18.27 0 0 0-3.23-12.03Zm-9.85 9.04a2.06 2.06 0 0 1-1.92-2.16 2.06 2.06 0 0 1 1.92-2.16 2.06 2.06 0 0 1 1.92 2.16 2.06 2.06 0 0 1-1.92 2.16Zm5.16 0a2.06 2.06 0 0 1-1.92-2.16 2.06 2.06 0 0 1 1.92-2.16 2.06 2.06 0 0 1 1.92 2.16 2.06 2.06 0 0 1-1.92 2.16Z" />
    </svg>
  );
}
