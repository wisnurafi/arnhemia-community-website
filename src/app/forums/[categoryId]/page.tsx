import Link from "next/link";
import { notFound } from "next/navigation";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { ThreadRow } from "@/components/forum/thread-row";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { ArrowLeft, Lock, PenSquare } from "lucide-react";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("forum_categories")
    .select("title")
    .eq("id", categoryId)
    .maybeSingle();
  return { title: cat?.title ?? "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const supabase = await createClient();
  const session = await getSession();

  const { data: category } = await supabase
    .from("forum_categories")
    .select("id, title, description, staff_only")
    .eq("id", categoryId)
    .maybeSingle<{
      id: string;
      title: string;
      description: string | null;
      staff_only: boolean;
    }>();

  if (!category) notFound();

  const canPost =
    !!session && (!category.staff_only || isStaff(session.profile.role));

  const { data: threads } = await supabase
    .from("threads")
    .select(
      "id, title, body, reply_count, views, last_reply_at, pinned, locked, author:profiles!threads_author_id_fkey(id, username, avatar_url, role)",
    )
    .eq("category_id", categoryId)
    .order("pinned", { ascending: false })
    .order("last_reply_at", { ascending: false });

  return (
    <>
      <NavbarServer />
      <main className="container pb-20 pt-10">
        <Link
          href="/forums"
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All forums
        </Link>

        <header className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Forum
              </span>
              {category.staff_only && (
                <Badge variant="warning">
                  <Lock className="size-3" />
                  Staff posts only
                </Badge>
              )}
            </div>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
              {category.title}
            </h1>
            {category.description && (
              <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
          {canPost ? (
            <Button asChild>
              <Link href={`/threads/new?category=${categoryId}`}>
                <PenSquare /> New thread
              </Link>
            </Button>
          ) : (
            category.staff_only && (
              <span className="inline-flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                <Lock className="size-3.5" />
                Read-only for members
              </span>
            )
          )}
        </header>

        <div className="mt-8 space-y-2.5">
          {(threads ?? []).map((t, i) => {
            const a = Array.isArray(t.author) ? t.author[0] : t.author;
            return (
              <ThreadRow
                key={t.id}
                index={i}
                thread={{
                  id: t.id,
                  title: t.title,
                  excerpt: t.body.slice(0, 200),
                  category: category.title,
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
          {(!threads || threads.length === 0) && (
            <div className="panel p-12 text-center">
              <h3 className="font-semibold tracking-tight">
                No threads here yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
                {canPost
                  ? "Start the conversation. The first thread sets the tone for the category."
                  : "Only staff can post in this category. Watch this space."}
              </p>
              {canPost && (
                <Button asChild className="mt-5">
                  <Link href={`/threads/new?category=${categoryId}`}>
                    <PenSquare /> Start a thread
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
