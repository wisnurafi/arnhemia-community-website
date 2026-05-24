"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Hash,
  Clock,
  GitBranch,
} from "lucide-react";
import type { ReleaseRow } from "@/lib/supabase/database.types";

const SYSTEM = [
  { label: "Windows 10/11", value: "x64 · 22H2 or newer" },
  { label: "RAM", value: "8 GB minimum" },
  { label: "Storage", value: "200 MB free" },
  { label: "Vanguard", value: "Latest stable" },
];

export default function DownloadsView({
  releases,
}: {
  releases: ReleaseRow[];
}) {
  const latest = releases[0];

  return (
    <main className="container pb-20 pt-10">
      <header>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Loader
        </span>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
          Downloads
        </h1>
        <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
          The latest Arnhemia loader for Valorant. Auto-updates handle
          patches; manual download is only here for fresh installs.
        </p>
      </header>

      {!latest ? (
        <div className="panel mt-8 p-12 text-center">
          <h3 className="font-semibold tracking-tight">
            No published builds yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
            Staff hasn&apos;t published a loader release. Check back soon, or
            watch the announcements forum.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 panel glow-border relative overflow-hidden p-7 md:p-9"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="elite">
                  <CheckCircle2 className="size-3" />
                  Latest stable
                </Badge>
                <Badge variant="muted">
                  <GitBranch className="size-3" />
                  {latest.version}
                </Badge>
                <Badge variant="info">
                  <Clock className="size-3" />
                  Released {latest.released_at}
                </Badge>
              </div>
              <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight md:text-4xl text-gradient-silver">
                Arnhemia Loader · Valorant
              </h2>
              <p className="mt-2 max-w-lg text-[14px] text-muted-foreground">
                Sub-second startup, silent auto-updates, and a UI that stays
                out of your way during agent select.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {latest.download_url ? (
                  <Button asChild size="lg" className="min-w-[200px]">
                    <a
                      href={latest.download_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download />
                      Download for Windows
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" className="min-w-[200px]" disabled>
                    <Download />
                    Download unavailable
                  </Button>
                )}
                {latest.checksum && (
                  <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 font-mono text-[11px] text-muted-foreground">
                    <Hash className="size-3.5" />
                    {latest.checksum}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-300/80" />
                Code-signed · Microsoft SmartScreen verified
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-[360px]">
              {SYSTEM.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    <Cpu className="size-3" />
                    {s.label}
                  </div>
                  <div className="mt-1 text-[13px] font-medium">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <section className="mt-12 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Hash className="size-3.5 text-muted-foreground" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Changelog
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
            <Link
              href="/changelog"
              className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              Full history
            </Link>
          </div>

          <div className="space-y-3">
            {releases.length === 0 && (
              <div className="panel p-12 text-center text-[13px] text-muted-foreground">
                No release notes yet.
              </div>
            )}
            {releases.map((entry, i) => (
              <motion.article
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04 }}
                className="panel panel-hover p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      entry.kind === "release"
                        ? "elite"
                        : entry.kind === "hotfix"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {entry.kind}
                  </Badge>
                  <h3 className="font-display text-lg tracking-tight">
                    {entry.version}
                  </h3>
                  <span className="ml-auto text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {entry.released_at}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {(entry.notes ?? []).map((note) => (
                    <li
                      key={note}
                      className="flex items-start gap-2.5 text-[13px] text-foreground/85"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-white/30" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Update history
            </h3>
            {releases.length === 0 ? (
              <p className="mt-3 text-[12.5px] text-muted-foreground">
                No history yet.
              </p>
            ) : (
              <ol className="mt-4 space-y-3">
                {releases.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-3 border-l border-white/[0.06] pl-3"
                  >
                    <div>
                      <div className="text-[12.5px] font-semibold tracking-tight">
                        {c.version}
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {c.released_at} · {c.kind}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="panel relative overflow-hidden p-5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 text-amber-200">
                <ShieldCheck className="size-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  Safety first
                </span>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
                Always verify the SHA-256 from your loader against the value
                posted in #releases. Don&apos;t run binaries from anywhere
                except this page or the in-app updater.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
