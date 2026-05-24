import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/brand/role-badge";
import { createClient } from "@/lib/supabase/server";
import { formatNumber, initials } from "@/lib/utils";
import { Award, Crown, MessageCircle } from "lucide-react";

export const metadata = { title: "Leaderboard" };
export const revalidate = 300;

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: top } = await supabase
    .from("profiles")
    .select("id, username, role, avatar_url, messages, reaction_score, joined_at")
    .order("reaction_score", { ascending: false })
    .order("messages", { ascending: false })
    .limit(50);

  return (
    <>
      <NavbarServer />
      <main className="container max-w-4xl pb-20 pt-10">
        <header>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Hall of Fame
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Leaderboard
          </h1>
          <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
            Members ranked by reactions earned. Reset annually.
          </p>
        </header>

        <div className="panel mt-8 divide-y divide-white/[0.04]">
          {(top ?? []).map((u, i) => (
            <Link
              key={u.id}
              href={`/u/${u.username}`}
              className="grid grid-cols-[40px_auto_1fr_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.03]"
            >
              <span
                className={`font-display text-sm tracking-tight ${
                  i < 3 ? "text-gradient-silver" : "text-muted-foreground"
                }`}
              >
                {i === 0 ? <Crown className="size-4 text-amber-200" /> : `#${i + 1}`}
              </span>
              <Avatar className="size-9">
                <AvatarImage
                  src={
                    u.avatar_url ??
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`
                  }
                  alt={u.username}
                />
                <AvatarFallback>{initials(u.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold">
                    {u.username}
                  </span>
                  <RoleBadge role={u.role} />
                </div>
              </div>
              <div className="hidden text-right md:block">
                <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  Posts
                </div>
                <div className="font-display text-sm">
                  <MessageCircle className="mr-1 inline size-3 text-muted-foreground" />
                  {formatNumber(u.messages)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  Reactions
                </div>
                <div className="font-display text-sm text-gradient-silver">
                  <Award className="mr-1 inline size-3 text-amber-300" />
                  {formatNumber(u.reaction_score)}
                </div>
              </div>
            </Link>
          ))}
          {(!top || top.length === 0) && (
            <div className="p-12 text-center text-[13px] text-muted-foreground">
              No members yet.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
