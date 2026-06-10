import Link from "next/link";

const painPoints = [
  "Admin capek balas pertanyaan yang sama terus.",
  "Booking sering berantakan karena dicatat manual.",
  "Reminder terlambat atau lupa, no-show naik.",
  "Owner ingin solusi yang tetap pakai WhatsApp.",
];

const outcomes = [
  "Chat lebih cepat dibalas",
  "Booking lebih rapi dan terstruktur",
  "Reminder otomatis sebelum jadwal",
  "Data layanan, cabang, dan jam buka tetap terpisah",
];

const whoFits = [
  "Barbershop",
  "Klinik",
  "Salon / spa / pijat",
  "Bengkel servis",
  "Laundry premium",
  "Lapangan olahraga / reservasi kelas",
];

const packageRows = [
  { plan: "Trial", price: "Rp 0", note: "Validasi alur", bestFor: "Owner yang mau coba cepat" },
  { plan: "Starter", price: "Rp 299.000 / bulan", note: "Paket utama", bestFor: "UMKM yang sudah siap pakai" },
  { plan: "Growth", price: "Rp 699.000 / bulan", note: "Scale", bestFor: "Bisnis multi cabang" },
];

export default function PitchDeckPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_26%),linear-gradient(180deg,_#f8fbff,_#eef4ff)] text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-sky-700"
          >
            <span aria-hidden="true">←</span>
            Kembali ke landing
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              Pricing
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Coba Sekarang
            </Link>
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-700">1-Page Pitch Deck</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
              BookLink membantu UMKM mengubah chat WhatsApp menjadi booking yang rapi dan mudah dioperasikan.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Ini adalah sales deck ringkas yang bisa kamu pakai saat pitching ke owner. Fokusnya bukan ke
              AI sebagai jargon, tapi ke hasil bisnis yang paling mudah dipahami.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                Mulai Trial
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                Lihat Pricing
              </Link>
            </div>
          </div>

          <article className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-xl shadow-sky-950/5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">One-liner</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              WhatsApp booking assistant untuk UMKM: balas chat lebih cepat, booking lebih rapi, dan reminder otomatis, tanpa pelanggan perlu install aplikasi baru.
            </h2>
            <div className="mt-6 grid gap-3">
              {outcomes.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Problem</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Masalah yang terjadi di lapangan</h2>
            <div className="mt-6 space-y-3">
              {painPoints.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Solution</p>
            <h2 className="mt-3 text-2xl font-semibold">BookLink menyelesaikan alur dari chat ke booking</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Pelanggan tetap chat di WhatsApp, AI menjawab FAQ dari data bisnis, dan booking final tetap
              divalidasi sistem supaya jadwal tidak bentrok.
            </p>
            <div className="mt-6 grid gap-3">
              {outcomes.map((item) => (
                <div key={item} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Who it fits</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Segmen yang paling cocok</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {whoFits.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">How it works</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Alur kerja singkat</h2>
            <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">1. Merchant daftar dan isi profil, cabang, layanan, dan knowledge.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">2. Pelanggan chat di WhatsApp atau buka halaman booking publik.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">3. Sistem bantu jawab FAQ, pilih slot, dan simpan booking secara rapi.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">4. Reminder otomatis membantu pelanggan datang tepat waktu.</li>
            </ol>
          </article>
        </section>

        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pricing</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Struktur harga yang mudah dijelaskan ke owner</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {packageRows.map((item) => (
              <article key={item.plan} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{item.plan}</p>
                <p className="mt-3 text-2xl font-bold text-slate-950">{item.price}</p>
                <p className="mt-2 text-sm text-slate-600">{item.note}</p>
                <p className="mt-4 text-sm font-medium text-slate-800">{item.bestFor}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-600">
            Prinsipnya: jual hasil utama di Starter, lalu naikkan ke Growth kalau bisnis mulai multi cabang
            atau butuh handoff yang lebih serius.
          </p>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-sky-100 bg-sky-50 p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-700">Why now</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Kenapa ini relevan sekarang</h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-700">
              <li>UMKM sudah terbiasa jualan dan menerima order di WhatsApp.</li>
              <li>Owner butuh solusi yang cepat dipakai, bukan software rumit.</li>
              <li>Chat booking makin tinggi, tapi admin belum tentu bertambah.</li>
              <li>Reminder dan booking rapi punya dampak langsung ke revenue.</li>
            </ul>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Close</p>
            <h2 className="mt-3 text-2xl font-semibold">Kalau bisnis Anda hidup dari jadwal, BookLink layak dicoba sekarang.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Mulai dari Trial, buktikan alurnya di satu outlet, lalu jadikan BookLink layer operasional
              yang membantu owner dan admin bekerja lebih ringan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Mulai Trial
              </Link>
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Kembali ke landing
              </Link>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
