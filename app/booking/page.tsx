import Link from "next/link";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_25%),linear-gradient(180deg,_#111111,_#1c1917)] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.28em] text-amber-300/80">Public Booking</p>
        <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl">
          Halaman booking umum sudah dipindahkan ke link bisnis masing-masing.
        </h1>
        <p className="mt-5 text-base leading-7 text-white/70">
          Sekarang setiap bisnis memiliki halaman booking tenant-aware sendiri, misalnya <span className="font-mono text-amber-200">/b/namabisnis</span>, supaya slot, dashboard, dan nomor WhatsApp bot tidak tercampur dengan tenant lain.
        </p>
        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-left text-sm leading-7 text-white/75">
          <p>Jika Anda owner bisnis, buka dashboard lalu atur slug landing page di menu pengaturan landing page.</p>
          <p>Jika Anda pelanggan, minta link booking resmi langsung dari bisnis yang ingin Anda booking.</p>
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300"
        >
          Kembali ke halaman utama
        </Link>
      </div>
    </main>
  );
}
