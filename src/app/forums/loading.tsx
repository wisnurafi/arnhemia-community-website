export default function ForumsLoading() {
  return (
    <div className="min-h-screen">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-background/70 backdrop-blur-2xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="h-6 w-28 animate-pulse rounded bg-white/[0.06]" />
            <div className="hidden items-center gap-3 lg:flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-16 animate-pulse rounded bg-white/[0.06]" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-[260px] animate-pulse rounded-md bg-white/[0.06] hidden md:block" />
            <div className="h-9 w-9 animate-pulse rounded-md bg-white/[0.06]" />
            <div className="h-9 w-9 animate-pulse rounded-md bg-white/[0.06]" />
          </div>
        </div>
      </header>

      <main className="container pb-20 pt-10">
        {/* Header skeleton */}
        <header className="mb-10">
          <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-3 h-10 w-48 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-white/[0.06]" />
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Forum cards skeleton */}
          <div className="space-y-10">
            {Array.from({ length: 3 }).map((_, g) => (
              <div key={g} className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded bg-white/[0.06]" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="panel h-20 animate-pulse bg-white/[0.02]" />
                ))}
              </div>
            ))}
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="panel h-48 animate-pulse bg-white/[0.02]" />
            <div className="panel h-36 animate-pulse bg-white/[0.02]" />
          </div>
        </div>
      </main>
    </div>
  );
}
