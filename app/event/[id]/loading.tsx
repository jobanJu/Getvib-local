export default function EventLoading() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.7fr] lg:px-8">
      <div className="grid gap-5">
        <div className="aspect-[16/10] animate-pulse rounded-3xl border border-border bg-foreground/8" />
        <div className="grid gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="h-6 w-40 animate-pulse rounded bg-foreground/10" />
          <div className="h-4 w-full animate-pulse rounded bg-foreground/8" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-foreground/8" />
        </div>
      </div>
      <div className="grid gap-4 self-start">
        <div className="grid gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-foreground/8" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-foreground/8" />
          <div className="h-16 w-full animate-pulse rounded-2xl bg-foreground/8" />
        </div>
        <div className="grid gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="h-6 w-48 animate-pulse rounded bg-foreground/10" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-foreground/8" />
        </div>
      </div>
    </section>
  );
}
