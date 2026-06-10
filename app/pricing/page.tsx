import Link from "next/link";

const plans = [
  {
    name: "Trial",
    price: "Rp 0",
    billing: "7-14 hari",
    description:
      "Cocok untuk validasi cepat. Merchant bisa lihat alur booking, FAQ AI, dan reminder tanpa komitmen awal.",
    accent: "bg-sky-50 text-sky-700",
    features: [
      "1 bisnis",
      "1 cabang",
      "FAQ AI dasar",
      "Booking sandbox",
      "Public booking page",
    ],
  },
  {
    name: "Starter",
    price: "Rp 299.000",
    billing: "per bulan",
    description:
      "Paket utama untuk UMKM yang ingin WhatsApp jadi kanal booking rapi, cepat, dan mudah dijual ke owner awam.",
    accent: "bg-slate-900 text-white",
    features: [
      "1 bisnis aktif",
      "1-2 cabang",
      "AI FAQ + booking flow",
      "Reminder otomatis",
      "Dashboard owner",
      "Public booking page",
    ],
    featured: true,
  },
  {
    name: "Growth",
    price: "Rp 699.000",
    billing: "per bulan",
    description:
      "Untuk bisnis yang mulai serius scale, punya lebih banyak cabang, dan butuh handoff ke admin yang lebih rapi.",
    accent: "bg-emerald-50 text-emerald-700",
    features: [
      "2-3 cabang",
      "Custom knowledge lebih banyak",
      "Human handoff",
      "Reporting lebih lengkap",
      "Support prioritas",
    ],
  },
];

const addOns = [
  "Cabang tambahan",
  "Dedicated WhatsApp number",
  "Setup dan onboarding done-for-you",
  "Custom knowledge tuning per bisnis",
  "Integrasi CRM, export data, atau workflow lanjutan",
];

const buyingTriggers = [
  "Chat booking sering masuk di WhatsApp dan admin kewalahan balas satu-satu.",
  "Pelanggan sering tanya jam buka, harga, layanan, dan lokasi berulang-ulang.",
  "No-show masih tinggi karena reminder manual atau sering lupa follow-up.",
  "Owner ingin booking lebih rapi tanpa pindah ke aplikasi baru.",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_#f8fbff,_#eef4ff)] text-[15px] text-slate-800 sm:text-base">
      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-sky-700"
          >
            <span aria-hidden="true">←</span>
            Kembali ke landing
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pitch-deck"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              Lihat pitch deck
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Coba Sekarang
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-nav text-xs uppercase tracking-[0.24em] text-sky-700">
              Pricing yang gampang dijual
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-slate-950 sm:text-4xl md:text-5xl">
              Satu produk, satu manfaat utama: bantu UMKM menerima booking lewat WhatsApp dengan lebih rapi.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              BookLink diposisikan per bisnis, bukan per fitur. Merchant membayar untuk hasil yang jelas:
              chat lebih cepat dibalas, booking lebih teratur, dan reminder otomatis yang membantu menekan no-show.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                Mulai Trial
              </Link>
              <Link
                href="/pitch-deck"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                Lihat versi sales
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-200 bg-white p-6 shadow-xl shadow-sky-950/5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Kenapa dibeli</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Bukan chatbot generik, tapi sistem booking yang langsung terasa manfaatnya.
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
              {buyingTriggers.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-12 grid gap-4 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Positioning</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Per bisnis, bukan per fitur
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              UMKM tidak membeli “AI”. Mereka membeli hasil: admin lebih ringan, jadwal lebih rapi, dan
              pelanggan tidak perlu menunggu balasan lama.
            </p>
          </div>
          <div className="grid gap-3 text-sm leading-7 text-slate-600">
            <div className="rounded-2xl bg-sky-50 px-4 py-3">
              AI menjawab FAQ dari knowledge bisnis
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              Slot booking divalidasi oleh rules engine
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              Reminder otomatis membantu mengurangi no-show
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              Data bisnis tetap terpisah per merchant
            </div>
          </div>
        </section>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[2rem] border p-8 shadow-lg ${
                plan.featured
                  ? "border-sky-300 bg-slate-950 text-white shadow-slate-950/20"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <div
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                  plan.featured ? "bg-white/10 text-white" : plan.accent
                }`}
              >
                {plan.name}
              </div>

              <div className="mt-8">
                <div className={`text-3xl font-bold ${plan.featured ? "text-white" : "text-slate-950"}`}>
                  {plan.price}
                </div>
                <div className={`mt-1 text-sm uppercase tracking-[0.18em] ${plan.featured ? "text-slate-300" : "text-slate-500"}`}>
                  {plan.billing}
                </div>
              </div>

              <p className={`mt-4 text-sm leading-7 ${plan.featured ? "text-slate-200" : "text-slate-600"}`}>
                {plan.description}
              </p>

              <ul className={`mt-8 space-y-3 text-sm leading-6 ${plan.featured ? "text-slate-100/90" : "text-slate-600"}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className={`mt-1 h-2 w-2 rounded-full ${plan.featured ? "bg-sky-300" : "bg-sky-500"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-white text-slate-950 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {plan.name === "Trial" ? "Mulai Trial" : plan.name === "Starter" ? "Pilih Starter" : "Minta Demo"}
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="font-nav text-xs uppercase tracking-[0.24em] text-slate-500">Add-ons</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Kalau bisnis sudah siap scale
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
              {addOns.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
            <p className="font-nav text-xs uppercase tracking-[0.24em] text-amber-300/80">Saran MVP</p>
            <h2 className="mt-3 text-2xl font-semibold">Sederhanakan dulu, baru scale</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Untuk pasar UMKM Indonesia, paket yang terlalu banyak justru membuat owner bingung. Paling
              aman adalah membuat satu paket inti yang gampang dipahami, lalu add-on untuk kebutuhan khusus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Mulai Trial
              </Link>
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lihat landing
              </Link>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
