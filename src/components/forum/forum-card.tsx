"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Megaphone,
  Users,
  MessageSquare,
  Swords,
  Download,
  Sliders,
  LifeBuoy,
  BookOpen,
  Hash,
  type LucideIcon,
} from "lucide-react";
import type { ForumCategory } from "@/lib/types";
import { cn, formatNumber, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";

const ICONS: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  users: Users,
  "message-square": MessageSquare,
  swords: Swords,
  download: Download,
  sliders: Sliders,
  "life-buoy": LifeBuoy,
  "book-open": BookOpen,
};

export function ForumCard({
  category,
  index = 0,
}: {
  category: ForumCategory;
  index?: number;
}) {
  const Icon = ICONS[category.icon] ?? Hash;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Link
        href={`/forums/${category.id}`}
        className="group block panel panel-hover p-5"
      >
        <div className="flex items-start gap-4">
          <div className="relative grid size-11 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02]">
            <Icon className="size-[18px] text-foreground/85" />
            <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold tracking-tight text-foreground transition-colors group-hover:text-white">
                  {category.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <div className="hidden shrink-0 gap-6 md:flex">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                    Threads
                  </div>
                  <div className="font-display text-sm text-gradient-silver">
                    {formatNumber(category.threads)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                    Posts
                  </div>
                  <div className="font-display text-sm text-gradient-silver">
                    {formatNumber(category.posts)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.04] pt-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarImage
                    src={category.lastPost.avatar}
                    alt={category.lastPost.author}
                  />
                  <AvatarFallback>
                    {initials(category.lastPost.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] text-foreground/80 transition-colors group-hover:text-foreground">
                    {category.lastPost.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground/80">
                    by{" "}
                    <span className="text-foreground/80">
                      {category.lastPost.author}
                    </span>
                    {" · "}
                    <RelativeTime date={category.lastPost.at} />
                  </div>
                </div>
              </div>
              <div className="hidden gap-4 sm:flex md:hidden">
                <span className="text-[11px] text-muted-foreground">
                  {formatNumber(category.threads)} threads
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ForumGroupBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
      </div>
      <div className={cn("space-y-3")}>{children}</div>
    </section>
  );
}
