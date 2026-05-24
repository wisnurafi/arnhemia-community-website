import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/brand/role-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { Search as SearchIcon, MessageSquare, User2 } from "lucide-react";

export const metadata = { title: "Search" };
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ q?: string }>;
};

type ThreadHit = {
  id: string;
  title: string;
  body: string;
  reply_count: number;
  created_at: string;
  category_id: string;
  author_id: string;
};

type ProfileHit = {
  id: string;
  username: string;
  avatar_url: string | null;
  role: "owner" | "co-owner" | "devs" | "member";
  joined_at: string;
};

function snippet(body: string, query: string, max = 180) {
  if (!body) return "";
  const idx = body.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return body.slice(0, max) + (body.length > max ? "…" : "");
  const start = Math.max(0, idx - 60);
  const end = Math.min(body.length, idx + query.length + 120);
  const slice = body.slice(start, end);
  return (start > 0 ? "…" : "") + slice + (end < body.length ? "…" : "");
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = (sp.q ?? "").trim();
  const q = raw.slice(0, 100);
  const supabase = await createClient();

  let threads: ThreadHit[] = [];
  let profiles: ProfileHit[] = [];
  const authorMap = new Map<string, { username: string; avatar_url: string | null }>();
  const categoryMap = new Map<string, { title: string }>();

  if (q.length >= 2) {
    // Postgres `ilike` with escaped special characters. We also avoid leaking
    // the user-supplied pattern operators by escaping % and _ ourselves.
    const safe = q.replace(/[\\%_]/g, (m) => `\\${m}`);
    const pattern = `%${safe}%`;

    const [threadRes, profileRes] = await Promise.all([
      supabase
        .from("threads")
        .select(
          "id, title, body, reply_count, created_at, category_id, author_id",
        )
        .or(`title.ilike.${pattern},body.ilike.${pattern}`)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("profiles")
        .select("id, username, avatar_url, role, joined_at")
        .ilike("username", pattern)
        .order("username", { ascending: true })
        .limit(15),
    ]);

    threads = (threadRes.data ?? []) as ThreadHit[];
    profiles = (profileRes.data ?? []) as ProfileHit[];

    const authorIds = Array.from(new Set(threads.map((t) => t.author_id)));
    const categoryIds = Array.from(new Set(threads.map((t) => t.category_id)));

    if (authorIds.length > 0) {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", authorIds);
      for (const p of data ?? []) {
        authorMap.set(p.id, { username: p.username, avatar_url: p.avatar_url });
      }
    }
    if (categoryIds.length > 0) {
      const { data } = await supabase
        .from("forum_categories")
        .select("id, title")
        .in("id", categoryIds);
      for (const c of data ?? []) {
        categoryMap.set(c.id, { title: c.title });
      }
    }
  }

  const totalHits = threads.length + profiles.length;

  return (
    <>
      <NavbarServer />
      <main className="container max-w-4xl pb-20 pt-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Find anything
        </span>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
          Search
        </h1>

        <form action="/search" method="get" className="mt-6">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search threads, users..."
              autoFocus
              minLength={2}
              maxLength={100}
              className="h-12 pl-11 pr-28 text-[14px]"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Search
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Searches thread titles, thread bodies, and usernames. Type at least
            2 characters.
          </p>
        </form>

        {q.length >= 2 ? (
          <div className="mt-8 space-y-10">
            <p className="text-[12px] text-muted-foreground">
              {totalHits} result{totalHits === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{q}&rdquo;
              </span>
            </p>

            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Threads
              </h2>
              <div className="panel mt-3 divide-y divide-white/[0.04]">
                {threads.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                    No threads matched.
                  </div>
                ) : (
                  threads.map((t) => {
                    const author = authorMap.get(t.author_id);
                    const category = categoryMap.get(t.category_id);
                    return (
                      <Link
                        key={t.id}
                        href={`/threads/${t.id}`}
                        className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-white/[0.02]"
                      >
                        <Avatar className="size-9 mt-0.5">
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
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            {category && <span>{category.title}</span>}
                            <span>·</span>
                            <span>by {author?.username ?? "anon"}</span>
                            <span>·</span>
                            <RelativeTime date={t.created_at} />
                          </div>
                          <h3 className="mt-1 truncate text-[14.5px] font-semibold tracking-tight text-foreground">
                            {t.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[12.5px] text-muted-foreground">
                            {snippet(t.body, q)}
                          </p>
                        </div>
                        <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground/80">
                          <MessageSquare className="size-3" />
                          {t.reply_count}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Users
              </h2>
              <div className="panel mt-3 divide-y divide-white/[0.04]">
                {profiles.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                    No users matched.
                  </div>
                ) : (
                  profiles.map((p) => (
                    <Link
                      key={p.id}
                      href={`/u/${p.username}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                    >
                      <Avatar className="size-9">
                        <AvatarImage
                          src={
                            p.avatar_url ??
                            `https://api.dicebear.com/7.x/identicon/svg?seed=${p.username}`
                          }
                          alt={p.username}
                        />
                        <AvatarFallback>{initials(p.username)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13.5px] font-semibold">
                            {p.username}
                          </span>
                          <RoleBadge role={p.role} />
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                          Joined <RelativeTime date={p.joined_at} />
                        </p>
                      </div>
                      <User2 className="ml-auto size-3.5 text-muted-foreground/70" />
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="panel mt-8 p-12 text-center">
            <SearchIcon className="mx-auto size-7 text-muted-foreground" />
            <h3 className="mt-3 font-semibold tracking-tight">
              {raw.length === 1 ? "Type at least 2 characters" : "Search the forum"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
              Threads, replies, and users — find them fast.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
