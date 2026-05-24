"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-160px] h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),transparent_70%)] opacity-70 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-[600px] grid-bg opacity-30" />
      </div>

      <div className="container pt-20 pb-24 md:pt-28 md:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur"
        >
          <Sparkles className="size-3 text-amber-200" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/85">
            Invite-only · Spring 2026
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display mt-6 text-5xl font-semibold tracking-tight md:text-7xl"
        >
          <span className="text-gradient-silver">Where the dedicated</span>
          <br />
          <span className="text-gradient-silver">for our products.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
        >
          Arnhemia is a private gaming chair A.K.A Cheat for Valorant players who want
          easy ranked wins and effortless progression. We operate an invite-only forum where verified
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="min-w-[180px]">
            <Link href="/register">
              Apply with invite
              <ArrowRight className="ml-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[180px]">
            <Link href="/forums">Browse forums</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-center gap-3 text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground sm:flex-row sm:gap-8"
        >
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-emerald-300/80" />
            Private Registration
          </span>
          <span className="hidden sm:inline">·</span>
          <span>Operated since 2023</span>
          <span className="hidden sm:inline">·</span>
          <span>more than 1k verified members</span>
        </motion.div>
      </div>

      <Marquee />
    </section>
  );
}

function Marquee() {
  const items = [
    "VALORANT",
    "EPISODE 9 ACT II",
    "RANKED",
    "PREMIER",
    "SPIKE RUSH",
    "ESL",
    "VCT",
    "PRIVATE LOBBY",
  ];
  return (
    <div className="border-y border-white/[0.05] bg-white/[0.01] py-4 ticker-mask">
      <div className="flex gap-12 overflow-hidden">
        <div className="flex shrink-0 animate-[grid_30s_linear_infinite] gap-12 whitespace-nowrap">
          {[...items, ...items, ...items].map((label, i) => (
            <span
              key={i}
              className="text-[11px] uppercase tracking-[0.36em] text-muted-foreground/70"
            >
              · {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
