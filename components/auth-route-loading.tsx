type AuthRouteLoadingProps = {
  mode: "login" | "register";
};

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-stone-200 ${className}`} />;
}

export function AuthRouteLoading({ mode }: AuthRouteLoadingProps) {
  const isLogin = mode === "login";

  return (
    <main
      className={
        isLogin
          ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_32%),linear-gradient(180deg,_#1c1917,_#09090b)] px-6 py-10 text-white"
          : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-6 py-10"
      }
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center gap-4">
          <SkeletonLine className={`h-5 w-36 ${isLogin ? "bg-white/10" : "bg-stone-200"}`} />
          <SkeletonLine className={`h-14 w-full max-w-xl ${isLogin ? "bg-white/10" : "bg-stone-200"}`} />
          <SkeletonLine className={`h-5 w-full max-w-lg ${isLogin ? "bg-white/5" : "bg-stone-200"}`} />
          <SkeletonLine className={`h-5 w-5/6 max-w-md ${isLogin ? "bg-white/5" : "bg-stone-200"}`} />

          {!isLogin ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/20 bg-white/65 p-4 shadow-sm"
                >
                  <SkeletonLine className="h-5 w-10 bg-stone-200" />
                  <SkeletonLine className="mt-3 h-4 w-4/5 bg-stone-200" />
                  <SkeletonLine className="mt-2 h-3 w-full bg-stone-100" />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section
          className={
            isLogin
              ? "rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur"
              : "rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
          }
        >
          <SkeletonLine className={`h-4 w-32 ${isLogin ? "bg-white/10" : "bg-stone-200"}`} />
          <SkeletonLine className={`mt-4 h-9 w-48 ${isLogin ? "bg-white/10" : "bg-stone-200"}`} />
          <SkeletonLine className={`mt-2 h-4 w-3/5 ${isLogin ? "bg-white/5" : "bg-stone-200"}`} />

          <div className="mt-8 space-y-4">
            {Array.from({ length: isLogin ? 2 : 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonLine className={`h-4 w-24 ${isLogin ? "bg-white/5" : "bg-stone-200"}`} />
                <div className={`h-12 rounded-xl ${isLogin ? "bg-white/10" : "bg-stone-100"}`} />
              </div>
            ))}
          </div>

          <SkeletonLine className={`mt-6 h-12 w-full rounded-xl ${isLogin ? "bg-amber-300/20" : "bg-blue-200"}`} />
          <SkeletonLine className={`mt-5 h-4 w-40 ${isLogin ? "bg-white/10" : "bg-stone-200"}`} />
        </section>
      </div>
    </main>
  );
}
