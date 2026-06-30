"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Recruit",
    price: "Free",
    period: "with invite",
    description: "Join the community, read the forum, watch the patches.",
    features: [
      "Forum read access",
      "Public threads",
      "Patch & changelog feed",
      "Standard avatar slot",
    ],
    cta: "Apply with invite",
    href: "/register",
    highlight: false,
  },
  {
    name: "Arnhemia Emulator+Internal",
    price: "$300",
    period: "/ month",
    description: "Full forum, loader access, external methode extremly undetectable.",
    features: [
      "Everything in Recruit",
      "Valorant loader access",
      "VGC Emulator access",
      "Internal Cheat access",
      "Private support tickets",
      "Conversations + DMs",
      "Full feature access",
      "Modern GUI",
      "Run and Play, no need hardware",
      "Powerful driver, undetected",
      "Undetected",
    ],
    cta: "External Access",
    href: "/register",
    highlight: true,
  },
  {
    name: "Arnhemia DMA",
    price: "$2000",
    period: "/ month",
    description: "Priority access, Software for Configurations, DMA hardware.",
    features: [
      "DMA hardware access",
      "Priority ticket SLA (2h)",
      "Early-access loader builds",
      "Private support tickets",
      "Conversations + DMs",
      "Strongly undetected",
      "Full feature access",
      "Easy set up, plug and play",
      "Modern GUI",
      "Easy win and reach Radiant",
    ],
    cta: "DMA Access",
    href: "/register",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Tiers
        </span>
        <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
          Pricing made for serious players.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground">
          Pay only for what you use. Cancel anytime. No hidden tiers, no
          loot-box pricing games.
        </p>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className={cn(
              "panel relative overflow-hidden p-7",
              plan.highlight && "glow-border border-white/15",
            )}
          >
            {plan.highlight && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
                <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  <Sparkles className="size-3 text-amber-200" />
                  Recommended
                </div>
              </>
            )}
            <div className="relative">
              <h3 className="font-display text-xl font-semibold tracking-tight text-gradient-silver">
                {plan.name}
              </h3>
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <Button
                asChild
                variant={plan.highlight ? "default" : "outline"}
                className="mt-6 w-full"
                size="lg"
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
              <ul className="mt-7 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-[13px] text-foreground/80"
                  >
                    <Check className="mt-0.5 size-4 text-emerald-300" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
