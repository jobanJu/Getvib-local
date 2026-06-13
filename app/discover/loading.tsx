export default function DiscoverLoading() {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4">
        <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-80 max-w-full animate-pulse rounded bg-white/10" />
        <div className="h-12 w-full animate-pulse rounded-2xl bg-white/8" />
      </div>
      <div className="h-6 w-28 animate-pulse rounded bg-white/10" />
      <div className="-mx-4 flex gap-4 overflow-hidden px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-[16/11] animate-pulse bg-white/8" />
            <div className="grid gap-3 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/8" />
              <div className="mt-2 h-11 w-full animate-pulse rounded-xl bg-white/8" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
