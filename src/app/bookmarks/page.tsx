import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { ThreadRow } from "@/components/forum/thread-row";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Bookmark, ArrowLeft } from "lucide-react";

export const metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(
      `
      id, created_at,
      thread:threads!bookmarks_thread_id_fkey(
        id, title, body, reply_count, views, last_reply_at, pinned, locked, category_id,
        category:forum_categories!threads_category_id_fkey(title),
        author:profiles!threads_author_id_fkey(id, username, avatar_url, role)
      )
      `,
    )
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <NavbarServer />
      <main className="container max-w-4xl pb-20 pt-10">
        <Link
          href="/forums"
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to forums
        </Link>
        <header className="mt-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Saved
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Bookmarks
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Threads you've saved for later.
          </p>
        </header>

        <div className="mt-8 space-y-2.5">
          {bookmarks && bookmarks.length > 0 ? (
            bookmarks.map((bm, i) => {
              const t = Array.isArray(bm.thread) ? bm.thread[0] : bm.thread;
              if (!t) return null;
              const a = Array.isArray(t.author) ? t.author[0] : t.author;
              const c = Array.isArray(t.category) ? t.category[0] : t.category;
              return (
                <ThreadRow
                  key={bm.id}
                  index={i}
                  thread={{
                    id: t.id,
                    title: t.title,
                    excerpt: t.body.slice(0, 200),
                    category: c?.title ?? "Forum",
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
            })
          ) : (
            <div className="panel p-12 text-center">
              <Bookmark className="mx-auto size-7 text-muted-foreground" />
              <h3 className="mt-3 font-semibold tracking-tight">
                No bookmarks yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
                Hit the bookmark icon on any thread to save it here for later.
              </p>
              <Button asChild className="mt-5">
                <Link href="/forums">Browse forums</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
