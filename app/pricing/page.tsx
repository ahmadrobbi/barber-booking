import Link from "next/link";

const plans = [
  {
    name: "Trial",
    price: "Rp 0",
    description:
      "Untuk bisnis booking baru yang ingin mencoba alur booking, FAQ AI, dan reminder sebelum masuk paket berbayar.",
    accent: "bg-blue-50 text-blue-700",
    features: ["1 bisnis", "1 cabang", "FAQ AI dasar", "Booking sandbox"],
  },
  {
    name: "Starter",
    price: "Rp 299.000",
    description:
      "Paket awal untuk bisnis aktif yang ingin AI menjawab FAQ, cabang, jam buka, dan booking dasar dari satu nomor official.",
    accent: "bg-indigo-600 text-white",
    features: [
      "1 bisnis aktif",
      "1-2 cabang",
      "AI FAQ + booking flow",
      "Reminder otomatis",
    ],
    featured: true,
  },
  {
    name: "Growth / Pro",
    price: "Custom",
    description:
      "Untuk bisnis yang butuh banyak cabang, knowledge khusus, handoff ke admin, dan SLA yang lebih serius.",
    accent: "bg-slate-100 text-slate-900",
    features: ["Multi cabang", "Custom knowledge", "Human handoff", "Support prioritas"],
  },
];

const addOns = [
  "Dedicated WhatsApp number untuk bisnis tertentu",
  "Cabang tambahan di luar kuota paket",
  "Custom prompt / knowledge tuning per bisnis",
  "Integrasi CRM, export data, atau dashboard lanjutan",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-[15px] text-slate-800 sm:text-base">
      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-blue-600"
          >
            <span aria-hidden="true">←</span>
            Kembali ke landing
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Coba Sekarang
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-nav text-xs uppercase tracking-[0.24em] text-blue-600">
              Paket Awal
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Paket yang sederhana, jelas, dan mudah dijual ke merchant awam.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Fokus pricing di fase awal adalah validasi pasar: satu nomor WhatsApp Official, satu bisnis di belakangnya, dan AI yang membaca data dari database sebelum menjawab pelanggan.
            </p>
          </div>

          <div className="rounded-[2rem] border border-blue-200 bg-white p-6 shadow-xl shadow-blue-950/5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Positioning</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Per bisnis, bukan per fitur</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li>AI jawab FAQ dari data bisnis</li>
              <li>Booking divalidasi oleh rules engine</li>
              <li>Cabang, jam buka, libur, dan layanan tetap terpisah</li>
              <li>Dedicated number jadi add-on premium</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[2rem] border p-8 shadow-lg ${
                plan.featured
                  ? "border-indigo-300 bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-indigo-950/20"
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

              <div className="mt-8 text-3xl font-bold">{plan.price}</div>
              <p className={`mt-4 text-sm leading-7 ${plan.featured ? "text-slate-100" : "text-slate-600"}`}>
                {plan.description}
              </p>

              <ul className={`mt-8 space-y-3 text-sm leading-6 ${plan.featured ? "text-slate-100/90" : "text-slate-600"}`}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Mulai dari {plan.name}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="font-nav text-xs uppercase tracking-[0.24em] text-slate-500">
              Add-ons
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Kalau bisnis butuh lebih jauh</h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
              {addOns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
            <p className="font-nav text-xs uppercase tracking-[0.24em] text-amber-300/80">
              Catatan MVP
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Jangan terlalu banyak paket di awal</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Untuk fase awal, saya sarankan fokus pada satu paket utama yang paling gampang dibeli.
              Paket lain bisa menyusul setelah pilot bisnis pertama terbukti jalan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                Coba gratis
              </Link>
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lihat landing
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
