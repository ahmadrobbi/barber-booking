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
          ? "flex min-h-screen items-center justify-center bg-white/80 px-6 py-10"
          : "flex min-h-[240px] items-center justify-center px-6 py-10"
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-amber-400 border-r-stone-900" />
        </div>
        <p className="text-sm font-medium text-stone-600">{label}</p>
      </div>
    </div>
  );
}
