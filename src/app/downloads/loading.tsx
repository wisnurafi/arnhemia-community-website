export default function DownloadsLoading() {
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
        <header className="mb-10">
          <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-3 h-10 w-44 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-white/[0.06]" />
        </header>

        {/* Downloads grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel p-5 space-y-3">
              <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
              <div className="mt-4 h-9 w-full animate-pulse rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
