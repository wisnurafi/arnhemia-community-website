import Link from "next/link";
import { notFound } from "next/navigation";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/brand/role-badge";
import { ReplyForm } from "./reply-form";
import { ThreadActions } from "./thread-actions";
import { RealtimeRefresh } from "@/components/layout/realtime-refresh";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { canModerate } from "@/lib/roles";
import { initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Pin,
  Lock,
  Calendar,
} from "lucide-react";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("threads")
    .select("title")
    .eq("id", threadId)
    .maybeSingle();
  return { title: data?.title ?? "Thread" };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const supabase = await createClient();

  const { data: thread } = await supabase
    .from("threads")
    .select(
      `
      id, title, body, pinned, locked, views, reply_count, last_reply_at, created_at, category_id,
      author:profiles!threads_author_id_fkey(id, username, avatar_url, role, joined_at, status),
      category:forum_categories!threads_category_id_fkey(id, title)
      `,
    )
    .eq("id", threadId)
    .maybeSingle();

  if (!thread) notFound();

  await supabase.rpc("increment_thread_views", { p_thread_id: threadId });

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, body, created_at, edited_at, author:profiles!posts_author_id_fkey(id, username, avatar_url, role)",
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  const session = await getSession();

  const author = Array.isArray(thread.author) ? thread.author[0] : thread.author;
  const category = Array.isArray(thread.category)
    ? thread.category[0]
    : thread.category;

  let bookmarked = false;
  if (session) {
    const { data: bm } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", session.id)
      .eq("thread_id", threadId)
      .maybeSingle();
    bookmarked = !!bm;
  }

  const isAuthor = session?.id === author?.id;
  const isStaff = session ? canModerate(session.profile.role) : false;
  const canEdit = isAuthor || isStaff;

  return (
    <>
      <NavbarServer />
      <main className="container max-w-4xl pb-20 pt-10">
        <Link
          href={`/forums/${thread.category_id}`}
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {category?.title ?? "Back"}
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            {thread.pinned && (
              <Badge variant="muted">
                <Pin className="size-3" /> Pinned
              </Badge>
            )}
            {thread.locked && (
              <Badge variant="outline">
                <Lock className="size-3" /> Locked
              </Badge>
            )}
            <Badge variant="muted">{category?.title}</Badge>
          </div>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl text-gradient-silver">
            {thread.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <RelativeTime date={thread.created_at} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {thread.views} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="size-3.5" />
              {thread.reply_count} replies
            </span>
          </div>
        </header>

        {/* Original post */}
        <article className="panel mt-8 grid gap-5 p-6 md:grid-cols-[160px_1fr]">
          <aside className="md:border-r md:border-white/[0.06] md:pr-5">
            <Link href={`/u/${author?.username ?? ""}`} className="block">
              <Avatar className="size-14 ring-2 ring-white/10">
                <AvatarImage
                  src={
                    author?.avatar_url ??
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${author?.username ?? "anon"}`
                  }
                  alt={author?.username ?? ""}
                />
                <AvatarFallback>
                  {initials(author?.username ?? "AN")}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 text-[14px] font-semibold tracking-tight">
                {author?.username}
              </div>
            </Link>
            <div className="mt-1.5">
              {author?.role && <RoleBadge role={author.role} />}
            </div>
            {author?.status && (
              <p className="mt-3 text-[11.5px] italic text-muted-foreground">
                {author.status}
              </p>
            )}
          </aside>
          <div>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
              {thread.body}
            </p>
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <ThreadActions
                threadId={thread.id}
                bookmarked={bookmarked}
                pinned={thread.pinned}
                locked={thread.locked}
                canEdit={canEdit}
                canMod={isStaff}
              />
            </div>
          </div>
        </article>

        {/* Replies */}
        <div className="mt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}
          </h2>
          <div className="mt-4 space-y-3">
            {(posts ?? []).map((p) => {
              const a = Array.isArray(p.author) ? p.author[0] : p.author;
              return (
                <article
                  key={p.id}
                  className="panel grid gap-5 p-6 md:grid-cols-[160px_1fr]"
                >
                  <aside className="md:border-r md:border-white/[0.06] md:pr-5">
                    <Link href={`/u/${a?.username ?? ""}`} className="block">
                      <Avatar className="size-12 ring-2 ring-white/10">
                        <AvatarImage
                          src={
                            a?.avatar_url ??
                            `https://api.dicebear.com/7.x/identicon/svg?seed=${a?.username ?? "anon"}`
                          }
                          alt={a?.username ?? ""}
                        />
                        <AvatarFallback>
                          {initials(a?.username ?? "AN")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-2 text-[13.5px] font-semibold">
                        {a?.username}
                      </div>
                    </Link>
                    <div className="mt-1.5">
                      {a?.role && <RoleBadge role={a.role} />}
                    </div>
                  </aside>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <RelativeTime date={p.created_at} />
                      {p.edited_at && " · edited"}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
                      {p.body}
                    </p>
                  </div>
                </article>
              );
            })}
            {(!posts || posts.length === 0) && (
              <div className="panel p-8 text-center text-[13px] text-muted-foreground">
                No replies yet. Be first to chime in.
              </div>
            )}
          </div>
        </div>

        {/* Reply form */}
        <div className="mt-10">
          {thread.locked ? (
            <div className="panel p-6 text-center">
              <Lock className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                This thread is locked. Replies disabled.
              </p>
            </div>
          ) : !session ? (
            <div className="panel p-6 text-center">
              <p className="text-[13.5px] text-muted-foreground">
                <Link
                  href={`/login?redirect=/threads/${threadId}`}
                  className="font-medium text-foreground hover:underline"
                >
                  Sign in
                </Link>{" "}
                to reply.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Post a reply
              </h3>
              <ReplyForm threadId={thread.id} />
            </div>
          )}
        </div>
      </main>
      <Footer />
      {/*
        Refresh the thread RSC whenever a post is created, edited, or
        deleted for this thread so replies appear without a manual refresh.
      */}
      <RealtimeRefresh
        channel={`thread:${threadId}`}
        subscriptions={[
          {
            table: "posts",
            event: "*",
            filter: `thread_id=eq.${threadId}`,
          },
        ]}
      />
    </>
  );
}
