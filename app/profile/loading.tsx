export default function ProfileLoading() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-10 w-40 animate-pulse rounded bg-white/10" />
      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="grid flex-1 gap-2">
            <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-white/8" />
            <div className="h-4 w-full max-w-sm animate-pulse rounded bg-white/8" />
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
    </section>
  );
}
