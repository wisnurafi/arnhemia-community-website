import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArnhemiaWordmark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent_70%)] blur-2xl" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="container flex min-h-screen flex-col items-center justify-center text-center">
        <ArnhemiaWordmark />
        <div className="mt-12">
          <span className="font-display text-[120px] font-semibold leading-none tracking-tight text-gradient-silver md:text-[180px]">
            404
          </span>
        </div>
        <h1 className="font-display mt-2 text-2xl tracking-tight text-foreground md:text-3xl">
          This room is locked.
        </h1>
        <p className="mt-3 max-w-md text-[14px] text-muted-foreground">
          The page you're trying to reach doesn't exist, or you don't have the
          access for it. Check the URL or head back to the lobby.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/forums">Browse forums</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
