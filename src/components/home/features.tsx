"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  ShieldCheck,
  Sparkles,
  Users,
  GitBranch,
  Crosshair,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Cpu,
    title: "Optimized loader",
    desc: "Lightweight injector tuned for bypassing Vanguard, with sub-second startup and silent updates.",
  },
  {
    Icon: ShieldCheck,
    title: "Operational discipline",
    desc: "Strict invite vetting and zero-tolerance moderation keep the community signal high.",
  },
  {
    Icon: Crosshair,
    title: "Curated configs",
    desc: "Settings that can be adjusted according to user reference.",
  },
  {
    Icon: Users,
    title: "Tight community",
    desc: "Private forum for members who want to easy wins and a quieter place to talk about them. No noise, no spam, no theater.",
  },
  {
    Icon: GitBranch,
    title: "Transparent changelog",
    desc: "Every release, hotfix, and patch is logged with full notes. No silent rollouts.",
  },
  {
    Icon: Sparkles,
    title: "Premium aesthetic",
    desc: "Distraction-free dark UI built for long sessions and tired eyes.",
  },
];

export function Features() {
  return (
    <section id="features" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Why Arnhemia
        </span>
        <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
          A quieter place to take the best gaming chair.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground">
          We optimize for fewer interruptions, sharper tools, and members who
          actually show up. No noise, no spam, no theater.
        </p>
      </div>

      <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="panel panel-hover group p-6"
          >
            <div className="grid size-11 place-items-center rounded-lg border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02]">
              <f.Icon className="size-[18px] text-foreground/85" />
            </div>
            <h3 className="mt-5 font-semibold tracking-tight text-foreground">
              {f.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
