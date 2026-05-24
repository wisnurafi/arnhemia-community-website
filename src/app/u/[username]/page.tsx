import { notFound } from "next/navigation";
import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/brand/role-badge";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { formatNumber, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  Calendar,
  MessageCircle,
  Heart,
  MessageSquare,
  Settings as Cog,
} from "lucide-react";
import type {
  Profile,
  ShoutRow,
} from "@/lib/supabase/database.types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `${username} · Profile` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle<Profile>();

  if (!profile) notFound();

  const session = await getSession();
  const isSelf = session?.id === profile.id;

  const [{ data: threads }, { data: shouts }, { count: postCount }] =
    await Promise.all([
      supabase
        .from("threads")
        .select("id, title, reply_count, views, last_reply_at, created_at")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("shouts")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("author_id", profile.id),
    ]);

  const avatar =
    profile.avatar_url ??
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.username)}`;

  return (
    <>
      <NavbarServer />
      <main className="container max-w-5xl pb-20 pt-10">
        <div className="panel relative overflow-hidden p-7 md:p-9">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="size-24 ring-2 ring-white/10">
                <AvatarImage src={avatar} alt={profile.username} />
                <AvatarFallback>{initials(profile.username)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-3xl font-semibold tracking-tight text-gradient-silver">
                    {profile.username}
                  </h1>
                  <RoleBadge role={profile.role} />
                </div>
                {profile.status && (
                  <p className="mt-2 max-w-md text-[13.5px] italic text-muted-foreground">
                    “{profile.status}”
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Joined <RelativeTime date={profile.joined_at} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isSelf ? (
                <Button asChild variant="outline">
                  <Link href="/settings">
                    <Cog /> Edit profile
                  </Link>
                </Button>
              ) : (
                session && (
                  <form action="/api/conversations/open" method="post">
                    <input type="hidden" name="with" value={profile.id} />
                    <Button type="submit">
                      <MessageCircle /> Message
                    </Button>
                  </form>
                )
              )}
            </div>
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Threads" value={threads?.length ?? 0} icon={MessageSquare} />
            <Stat
              label="Posts"
              value={postCount ?? 0}
              icon={MessageCircle}
            />
            <Stat
              label="Reactions"
              value={profile.reaction_score}
              icon={Heart}
            />
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Latest threads
            </h2>
            <div className="mt-4 space-y-2.5">
              {threads && threads.length > 0 ? (
                threads.map((t) => (
                  <Link
                    key={t.id}
                    href={`/threads/${t.id}`}
                    className="panel panel-hover flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] font-medium">
                        {t.title}
                      </h3>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                        <RelativeTime date={t.created_at} />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-[12px] text-muted-foreground">
                      <span>{formatNumber(t.reply_count)} replies</span>
                      <span>·</span>
                      <span>{formatNumber(t.views)} views</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="panel p-8 text-center text-[13px] text-muted-foreground">
                  No threads yet.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="panel p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Shoutbox history
              </h3>
              {shouts && shouts.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {shouts.map((s: ShoutRow) => (
                    <li key={s.id}>
                      <p className="text-[13px] text-foreground/85">{s.body}</p>
                      <span className="text-[11px] text-muted-foreground">
                        <RelativeTime date={s.created_at} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[12.5px] text-muted-foreground">
                  Hasn&apos;t shouted yet.
                </p>
              )}
            </div>

            <div className="panel p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Stats
              </h3>
              <ul className="mt-4 space-y-2 text-[13px]">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {new Date(profile.joined_at).toLocaleDateString()}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{profile.role}</span>
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-1 font-display text-2xl text-gradient-silver">
        {formatNumber(value)}
      </div>
    </div>
  );
}
