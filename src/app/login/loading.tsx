export default function LoginLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent_70%)] blur-2xl" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="container flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto h-6 w-32 animate-pulse rounded bg-white/[0.06]" />
            <div className="mx-auto mt-8 h-8 w-48 animate-pulse rounded bg-white/[0.06]" />
            <div className="mx-auto mt-2 h-4 w-56 animate-pulse rounded bg-white/[0.06]" />
          </div>

          <div className="panel mt-8 p-7 space-y-5">
            <div className="space-y-2">
              <div className="h-4 w-12 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-10 w-full animate-pulse rounded bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-10 w-full animate-pulse rounded bg-white/[0.06]" />
            </div>
            <div className="h-4 w-40 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-11 w-full animate-pulse rounded bg-white/[0.06]" />
          </div>

          <div className="mx-auto mt-6 h-4 w-52 animate-pulse rounded bg-white/[0.06]" />
        </div>
      </div>
    </main>
  );
}
