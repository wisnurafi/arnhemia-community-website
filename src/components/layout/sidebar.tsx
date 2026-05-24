import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { formatNumber, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  Activity,
  Crown,
  Users,
  Flame,
  Zap,
  Bookmark,
  Award,
} from "lucide-react";
import type { Role } from "@/lib/supabase/database.types";

const QUICK = [
  { href: "/forums", label: "Browse forums", Icon: Activity },
  { href: "/forums?sort=trending", label: "Trending", Icon: Flame },
  { href: "/forums?sort=new", label: "Latest threads", Icon: Zap },
  { href: "/bookmarks", label: "Bookmarks", Icon: Bookmark },
  { href: "/leaderboard", label: "Leaderboard", Icon: Award },
];

type StaffRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  role: Role;
};

export async function Sidebar() {
  const supabase = await createClient();

  const [{ data: stats }, { data: staff }] = await Promise.all([
    supabase.rpc("forum_stats"),
    supabase
      .from("profiles")
      .select("id, username, avatar_url, role")
      .neq("role", "member")
      .order("joined_at", { ascending: true })
      .limit(8) as unknown as Promise<{ data: StaffRow[] | null }>,
  ]);

  const s = Array.isArray(stats) ? stats[0] : null;
  const STATS = [
    { label: "Threads", value: formatNumber(Number(s?.threads ?? 0)) },
    { label: "Posts", value: formatNumber(Number(s?.posts ?? 0)) },
    { label: "Members", value: formatNumber(Number(s?.members ?? 0)) },
    {
      label: "Latest member",
      value: s?.latest_member_username ?? "—",
    },
  ];

  return (
    <aside className="space-y-6">
      <div className="panel p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Forum stats
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-0.5 truncate font-display text-base text-gradient-silver">
                {s.value}
              </div>
            </div>
          ))}
        </div>
        {s?.latest_member_joined_at && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Newest joined <RelativeTime date={s.latest_member_joined_at} />
          </p>
        )}
      </div>

      <div className="panel p-2.5">
        <h3 className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Quick links
        </h3>
        <nav className="mt-1 flex flex-col">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="group flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              <q.Icon className="size-3.5 opacity-70 group-hover:opacity-100" />
              {q.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Staff online
          </h3>
          <Crown className="size-3.5 text-amber-200/80" />
        </div>
        <div className="mt-4 space-y-3">
          {(staff ?? []).length === 0 && (
            <p className="text-[12.5px] text-muted-foreground">
              No staff yet.
            </p>
          )}
          {(staff ?? []).map((u) => {
            const avatar =
              u.avatar_url ??
              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                u.username,
              )}`;
            return (
              <Link
                key={u.id}
                href={`/u/${u.username}`}
                className="group flex items-center gap-3"
              >
                <div className="relative">
                  <Avatar className="size-8">
                    <AvatarImage src={avatar} alt={u.username} />
                    <AvatarFallback>{initials(u.username)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground/90 group-hover:text-foreground">
                    {u.username}
                  </div>
                  <div className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                    {u.role}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="panel relative overflow-hidden p-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Users className="size-3.5 text-muted-foreground" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Invite-only
            </h3>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
            Arnhemia is private registration. New members join via invite codes
            from staff.
          </p>
          <Link
            href="/register"
            className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-foreground hover:text-white"
          >
            Have a code? Apply
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
