import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { ReleaseRow } from "@/lib/supabase/database.types";

export const metadata = { title: "Changelog" };
export const revalidate = 30;

export default async function ChangelogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select("*")
    .eq("published", true)
    .order("released_at", { ascending: false });

  const releases = (data ?? []) as ReleaseRow[];

  return (
    <>
      <NavbarServer />
      <main className="container max-w-3xl pb-20 pt-10">
        <header>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Releases
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Changelog
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Every release, hotfix, and patch we&apos;ve shipped. Newest first.
          </p>
        </header>

        <div className="mt-8 space-y-3">
          {releases.length === 0 && (
            <div className="panel p-12 text-center text-[13px] text-muted-foreground">
              No releases published yet.
            </div>
          )}
          {releases.map((entry) => (
            <article key={entry.id} className="panel p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    entry.kind === "release"
                      ? "elite"
                      : entry.kind === "hotfix"
                        ? "warning"
                        : "muted"
                  }
                >
                  {entry.kind}
                </Badge>
                <h3 className="font-display text-lg tracking-tight">
                  {entry.version}
                </h3>
                <span className="ml-auto text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {entry.released_at}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {(entry.notes ?? []).map((note) => (
                  <li
                    key={note}
                    className="flex items-start gap-2.5 text-[13.5px] text-foreground/85"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-white/30" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
