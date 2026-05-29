export default function ThreadLoading() {
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
            <div className="h-9 w-9 animate-pulse rounded-md bg-white/[0.06]" />
            <div className="h-9 w-9 animate-pulse rounded-md bg-white/[0.06]" />
          </div>
        </div>
      </header>

      <main className="container pb-20 pt-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-3 w-3 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
        </div>

        {/* Thread title */}
        <div className="h-8 w-2/3 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-white/[0.06]" />

        {/* Posts skeleton */}
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="panel p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
