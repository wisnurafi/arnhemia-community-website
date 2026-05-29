export default function SearchLoading() {
  return (
    <div className="min-h-screen">
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
          <div className="h-10 w-56 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-4 h-12 w-full max-w-xl animate-pulse rounded bg-white/[0.06]" />
        </header>

        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel p-4 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
