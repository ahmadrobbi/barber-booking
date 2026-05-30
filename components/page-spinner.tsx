type PageSpinnerProps = {
  label?: string;
  fullScreen?: boolean;
};

export function PageSpinner({
  label = "Memuat halaman...",
  fullScreen = true,
}: PageSpinnerProps) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50 px-6 py-10 backdrop-blur-[1px]"
          : "flex min-h-[240px] items-center justify-center px-6 py-10"
      }
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-stone-200 bg-white/90 px-8 py-8 shadow-xl shadow-stone-900/5 backdrop-blur-sm text-center">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-amber-500 border-r-stone-400" />
        </div>
        <p className="text-sm font-semibold text-stone-700">{label}</p>
      </div>
    </div>
  );
}
