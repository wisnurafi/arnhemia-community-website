"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArnhemiaWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, MessageSquare, Search, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserPanel } from "./user-panel";
import type { Profile } from "@/lib/supabase/database.types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/forums", label: "Forums" },
  { href: "/tickets", label: "Tickets" },
  { href: "/downloads", label: "Downloads" },
  { href: "/discord", label: "Discord" },
];

export function Navbar({
  profile,
  authSlot,
  alertsSlot,
  conversationsSlot,
  unreadAlerts,
  unreadConversations,
}: {
  profile?: Profile | null;
  authSlot?: React.ReactNode;
  alertsSlot?: React.ReactNode;
  conversationsSlot?: React.ReactNode;
  unreadAlerts?: number;
  unreadConversations?: number;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cmd/Ctrl + K focuses the search input.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.06] bg-background/70 backdrop-blur-2xl"
          : "border-b border-transparent bg-background/0",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="group">
            <ArnhemiaWordmark className="transition-opacity group-hover:opacity-90" />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-2 text-[13px] font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <form action="/search" method="get" className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              ref={searchRef}
              name="q"
              placeholder="Search threads, users..."
              className="h-9 w-[260px] pl-9 text-[13px]"
              autoComplete="off"
              minLength={2}
              maxLength={100}
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70 lg:inline-flex">
              ⌘K
            </kbd>
          </form>

          {profile ? (
            <>
              {conversationsSlot ?? (
                <Link href="/conversations" aria-label="Conversations">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="size-[18px]" />
                    {unreadConversations && unreadConversations > 0 ? (
                      <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-400 ring-2 ring-background" />
                    ) : null}
                  </Button>
                </Link>
              )}

              {alertsSlot ?? (
                <Link href="/alerts" aria-label="Alerts">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-[18px]" />
                    {unreadAlerts && unreadAlerts > 0 ? (
                      <span className="absolute right-2 top-2 size-1.5 rounded-full bg-white ring-2 ring-background" />
                    ) : null}
                  </Button>
                </Link>
              )}

              <UserPanel profile={profile} />
            </>
          ) : (
            authSlot
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Menu className="size-[18px]" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden border-t border-white/[0.06] bg-background/85 backdrop-blur-2xl"
        >
          <div className="container py-3 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              >
                {item.label}
                <ChevronRight className="size-3.5 opacity-50" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
}
