import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";

export function LegalShell({
  title,
  effective,
  children,
  className,
}: {
  title: string;
  effective: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <NavbarServer />
      <main className="container max-w-3xl pb-20 pt-10">
        <header>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Legal
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            {title}
          </h1>
          <p className="mt-3 text-[12.5px] uppercase tracking-[0.18em] text-muted-foreground">
            Effective {effective}
          </p>
        </header>
        <article
          className={cn(
            "panel mt-8 p-7 md:p-9",
            "prose prose-invert max-w-none",
            "prose-headings:font-display prose-headings:tracking-tight prose-headings:text-foreground",
            "prose-p:text-[14px] prose-p:leading-relaxed prose-p:text-foreground/85",
            "prose-li:text-[14px] prose-li:text-foreground/85",
            "prose-strong:text-foreground prose-a:text-foreground prose-a:underline-offset-4",
            className,
          )}
        >
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
