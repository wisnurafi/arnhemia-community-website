"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="panel glow-border relative overflow-hidden p-10 text-center md:p-16"
      >
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Earn your seat
          </span>
          <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight md:text-6xl text-gradient-silver">
            Cross the gate.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted-foreground">
            If a member trusts you with an invite, that's the only door we have.
            Make it count.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/register">
                Enter invite code
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[200px]"
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
