function SkeletonBox({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-stone-200 ${className}`} />;
}

export function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <SkeletonBox className="h-4 w-36 bg-white/10" />
        <SkeletonBox className="mt-4 h-10 w-3/4 max-w-xl bg-white/10" />
        <SkeletonBox className="mt-3 h-4 w-full max-w-2xl bg-white/10" />
        <SkeletonBox className="mt-6 h-12 w-56 rounded-2xl bg-white/10" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <article
            key={index}
            className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBox className="h-4 w-28" />
            <SkeletonBox className="mt-4 h-10 w-20" />
            <SkeletonBox className="mt-3 h-3 w-16" />
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SkeletonBox className="h-3 w-40" />
              <SkeletonBox className="mt-3 h-8 w-72" />
            </div>
            <SkeletonBox className="h-11 w-44 rounded-2xl" />
          </div>

          <div className="mt-6 grid grid-cols-7 gap-3">
            {Array.from({ length: 35 }).map((_, index) => (
              <SkeletonBox key={index} className="min-h-24 rounded-[1.5rem] bg-stone-100" />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <SkeletonBox className="h-3 w-36" />
          <SkeletonBox className="mt-3 h-8 w-56" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <article key={index} className="rounded-[1.5rem] bg-stone-50 p-4">
                <SkeletonBox className="h-4 w-32" />
                <SkeletonBox className="mt-3 h-4 w-3/4" />
                <SkeletonBox className="mt-2 h-3 w-20" />
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
