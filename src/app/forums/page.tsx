import { Suspense } from "react";
import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { ShoutboxServer } from "@/components/layout/shoutbox-server";
import { ForumCard, ForumGroupBlock } from "@/components/forum/forum-card";
import { ThreadRow } from "@/components/forum/thread-row";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Flame, PenSquare } from "lucide-react";
import { getSession } from "@/lib/auth";
import type {
  ForumCategoryRow,
  ForumGroupRow,
} from "@/lib/supabase/database.types";

export const metadata = { title: "Forums" };
export const revalidate = 30;

type GroupWithCategories = ForumGroupRow & {
  categories: (ForumCategoryRow & {
    threads: { count: number }[];
    posts_count?: number;
    last_thread?: {
      id: string;
      title: string;
      last_reply_at: string;
      author: { username: string; avatar_url: string | null };
    };
  })[];
};

export default async function ForumsPage() {
  const supabase = await createClient();
  await getSession();

  // Fire all queries in parallel instead of sequentially.
  const [
    { data: rawGroups },
    { data: latestThreads },
    { data: counts },
    { data: trending },
  ] = await Promise.all([
    supabase
      .from("forum_groups")
      .select(
        "id, name, position, created_at, categories:forum_categories(id, group_id, title, description, icon, position, staff_only, created_at)",
      )
      .order("position"),
    supabase
      .from("threads")
      .select(
        "id, title, category_id, last_reply_at, author:profiles!threads_author_id_fkey(username, avatar_url)",
      )
      .order("last_reply_at", { ascending: false })
      .limit(50),
    supabase.from("threads").select("category_id"),
    supabase
      .from("threads")
      .select(
        "id, title, body, reply_count, views, last_reply_at, pinned, locked, category_id, author:profiles!threads_author_id_fkey(id, username, avatar_url, role)",
      )
      .order("last_reply_at", { ascending: false })
      .limit(5),
  ]);

  const groups = (rawGroups ?? []) as unknown as GroupWithCategories[];

  const lastByCategory = new Map<
    string,
    {
      id: string;
      title: string;
      last_reply_at: string;
      author: { username: string; avatar_url: string | null };
    }
  >();
  (latestThreads ?? []).forEach((t) => {
    if (!lastByCategory.has(t.category_id)) {
      lastByCategory.set(t.category_id, {
        id: t.id,
        title: t.title,
        last_reply_at: t.last_reply_at,
        author: Array.isArray(t.author) ? t.author[0] : t.author,
      });
    }
  });

  const countByCat = new Map<string, number>();
  (counts ?? []).forEach((r) => {
    countByCat.set(r.category_id, (countByCat.get(r.category_id) ?? 0) + 1);
  });

  // Map category_id -> category title for trending row label.
  const allCats = groups.flatMap((g) => g.categories ?? []);
  const catTitle = (id: string) =>
    allCats.find((c) => c.id === id)?.title ?? "Forum";

  return (
    <>
      <NavbarServer />
      <main className="container pb-20 pt-10">
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Community
            </span>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
              Forums
            </h1>
            <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
              Read what the community is talking about. Loader builds, ranked
              threads, configs, and the long-running off-topic chatter.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/threads/new">
              <PenSquare /> New thread
            </Link>
          </Button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {groups.map((g: GroupWithCategories) => (
              <ForumGroupBlock key={g.id} title={g.name}>
                {(g.categories ?? [])
                  .sort((a, b) => a.position - b.position)
                  .map((c, i) => {
                    const last = lastByCategory.get(c.id);
                    return (
                      <ForumCard
                        key={c.id}
                        index={i}
                        category={{
                          id: c.id,
                          title: c.title,
                          description: c.description ?? "",
                          icon: c.icon ?? "hash",
                          threads: countByCat.get(c.id) ?? 0,
                          posts: 0,
                          lastPost: last
                            ? {
                                title: last.title,
                                author: last.author?.username ?? "",
                                avatar:
                                  last.author?.avatar_url ??
                                  `https://api.dicebear.com/7.x/identicon/svg?seed=${last.author?.username ?? "anon"}`,
                                at: last.last_reply_at,
                              }
                            : {
                                title: "No threads yet",
                                author: "",
                                avatar:
                                  "https://api.dicebear.com/7.x/identicon/svg?seed=empty",
                                at: c.created_at,
                              },
                        }}
                      />
                    );
                  })}
              </ForumGroupBlock>
            ))}

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Flame className="size-3.5 text-amber-300/80" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Trending threads
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
              </div>
              <div className="space-y-2.5">
                {(trending ?? []).map((t, i) => {
                  const a = Array.isArray(t.author) ? t.author[0] : t.author;
                  return (
                    <ThreadRow
                      key={t.id}
                      index={i}
                      thread={{
                        id: t.id,
                        title: t.title,
                        excerpt: t.body.slice(0, 200),
                        category: catTitle(t.category_id),
                        replies: t.reply_count,
                        views: t.views,
                        lastReplyAt: t.last_reply_at,
                        status: [
                          ...(t.pinned ? (["pinned"] as const) : []),
                          ...(t.locked ? (["locked"] as const) : []),
                        ],
                        author: {
                          id: a?.id ?? "",
                          username: a?.username ?? "",
                          role: a?.role ?? "member",
                          avatar:
                            a?.avatar_url ??
                            `https://api.dicebear.com/7.x/identicon/svg?seed=${a?.username ?? "anon"}`,
                          messages: 0,
                          reactionScore: 0,
                          joinedAt: new Date().toISOString(),
                        },
                      }}
                    />
                  );
                })}
                {(!trending || trending.length === 0) && (
                  <div className="panel p-10 text-center text-[13px] text-muted-foreground">
                    No threads yet. Be the first.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Suspense fallback={<div className="panel h-72 animate-pulse bg-white/[0.02]" />}>
              <ShoutboxServer />
            </Suspense>
            <Suspense fallback={<div className="panel h-64 animate-pulse bg-white/[0.02]" />}>
              <Sidebar />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
