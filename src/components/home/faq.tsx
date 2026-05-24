"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "How do I get an invite to Arnhemia?",
    a: "Invites are issued by Owner, Co-owner, and Developer accounts. Most members come in through someone they already know in the community. We don't sell invites — they're earned or vouched for.",
  },
  {
    q: "Is the loader detection-safe for Valorant?",
    a: "We track every Vanguard release and ship hotfixes within hours when needed. Stability is the priority over feature volume. The full release history is public on the changelog page.",
  },
  {
    q: "What happens if I share my invite code?",
    a: "Invite codes are single-use and tied to your account. Sharing one publicly will burn it. Repeatedly leaking codes will cost you your account and your inviter's reputation.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. Cancellation is one click in your account settings, and you keep access until the end of the current billing period. No retention dark patterns.",
  },
  {
    q: "Do you store my Riot or Valorant credentials?",
    a: "No. We never ask for your Riot login. Account linking is handled via Discord OAuth, and the loader runs locally with no game credentials transmitted to us.",
  },
  {
    q: "What roles exist in the community?",
    a: "Owner and Co-owner have full access. Developers can invite and manage technical infrastructure. Members get standard forum and loader access based on their tier.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Frequently asked
        </span>
        <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
          Questions, answered straight.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground">
          Still curious? Open a public ticket — staff answers in under 24 hours.
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-12 max-w-3xl space-y-3"
      >
        <Accordion type="single" collapsible className="space-y-3">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
