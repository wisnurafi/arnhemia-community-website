import Link from "next/link";
import { ArnhemiaWordmark } from "@/components/brand/logo";

const SECTIONS = [
  {
    title: "Community",
    links: [
      { href: "/forums", label: "Forums" },
      { href: "/forums/trending", label: "Trending" },
      { href: "/leaderboard", label: "Leaderboard" },
      { href: "/discord", label: "Discord" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/downloads", label: "Downloads" },
      { href: "/changelog", label: "Changelog" },
      { href: "/status", label: "Status" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/tickets", label: "Tickets" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/legal/tos", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.05]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <ArnhemiaWordmark />
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Invite-only premium gaming chair/chaets. Built for the dedicated.
              Loaders, configs, and a brotherhood that takes the game easily.
            </p>
          </div>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {s.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
            © 2026 ARNHEMIA. All rights reserved.
          </p>
          <p className="text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
            Crafted for the elite · Invite-only
          </p>
        </div>
      </div>
    </footer>
  );
}
