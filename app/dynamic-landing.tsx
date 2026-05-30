"use client";

import Link from "next/link";
import Image from "next/image";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";

export default function DynamicLandingPage() {
  const platformBrand = "BookLink";
  const platformTagline = "AI Booking Assistant untuk Bisnis Booking";
  const phone = "15551926817";
  const message = encodeURIComponent("Halo, saya mau booking.");
  const waLink = `https://wa.me/${phone}?text=${message}`;

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#platform", label: "Produk" },
    { href: "#pricing", label: "Harga" },
    { href: "#industries", label: "Use Case" },
    { href: "#features", label: "Fitur" },
    { href: "#contact", label: "Contact" },
  ] as const;

  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-[15px] font-sans text-slate-800 min-h-screen sm:text-base">
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/90 backdrop-blur-md shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            <a href="#home" className="flex shrink-0 items-center gap-3 pr-4">
              <Image
                src="/logo.svg"
                alt="BookLink Logo"
                width={48}
                height={48}
                priority
                className="rounded-full shadow-lg"
              />
              <span>
                <strong className="block text-base font-semibold leading-tight tracking-tight text-slate-900 md:text-lg">
                  {platformBrand}
                </strong>
                <span className="block text-[10px] text-slate-600 md:text-[11px]">
                  {platformTagline}
                </span>
              </span>
            </a>

            <div className="font-nav hidden flex-1 items-center justify-end gap-7 text-xs tracking-[0.12em] lg:flex xl:gap-9">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="font-medium text-slate-700 transition hover:text-blue-600"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-indigo-700 shadow-lg"
              >
                Register
              </Link>
            </div>
          </div>

          <div className="mt-4 space-y-3 lg:hidden">
            <div className="grid gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:from-blue-600 hover:to-indigo-700"
              >
                Register
              </Link>
            </div>

            <div className="font-nav flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-200 pt-3 text-xs tracking-[0.12em]">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="font-medium text-slate-600 transition hover:text-blue-600"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <HomeHeroCarousel
        slides={[
          {
            eyebrow: "Untuk bisnis yang hidup dari booking",
            title: "Balas chat lebih cepat, booking lebih rapi, dan pelanggan tidak nunggu lama",
            description:
              "BookLink membantu bisnis yang menerima reservasi atau jadwal untuk menjawab pertanyaan berulang, mengarahkan booking, dan menjaga data operasional tetap rapi. Pelanggan tetap chat lewat WhatsApp bisnis, sementara AI membaca konteks dari database dan membantu dengan cepat.",
            image: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1800&q=80",
            accent: "Booking First",
            stats: ["Balas Lebih Cepat", "Reminder Otomatis", "No-Show Turun"],
          },
          {
            eyebrow: "Cocok untuk barbershop & klinik",
            title: "Setup singkat, langsung bisa dipakai, tanpa ribet teknis",
            description:
              "Isi profil bisnis, cabang, layanan, jam buka, dan knowledge dasar. Setelah itu bot langsung siap menjawab FAQ, membantu booking, dan menjaga data tetap teratur.",
            image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1800&q=80",
            accent: "Data-Aware",
            stats: ["Setup Cepat", "FAQ Siap", "Booking Aman"],
          },
          {
            eyebrow: "Satu alur dari chat ke booking",
            title: "Pelanggan tanya, pilih jadwal, lalu tinggal datang",
            description:
              "Pelanggan bisa tanya layanan, cek cabang, lihat jam buka, lalu booking. Sistem tetap memvalidasi slot dan status booking supaya operasional tetap rapi dan owner tidak perlu cek manual terus-menerus.",
            image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1800&q=80",
            accent: "Guardrailed AI",
            stats: ["FAQ Fleksibel", "Slot Aman", "Reminder Otomatis"],
          },
        ]}
        menuFontClassName="font-nav"
        waLink={waLink}
      />

      {/* Platform Section */}
      <section id="platform" className="scroll-mt-24 bg-white py-24 text-center">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-4xl shadow-lg">
            🚀
          </div>
          <h2 className="font-nav mt-8 text-2xl font-bold uppercase tracking-[0.1em] text-slate-900 md:text-3xl">
            Dibangun Untuk Bisnis yang Hidup dari Booking
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Fokus MVP sekarang adalah membantu owner mengurangi chat berulang, mempercepat booking, dan menjaga jadwal tetap rapi. AI membaca data bisnis dari database sebelum menjawab pelanggan, jadi owner tidak perlu membalas pertanyaan yang sama berkali-kali.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-lg border border-blue-200">
              <div className="mb-4 text-2xl">📱</div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Pelanggan Tetap Pakai WhatsApp</h3>
              <p className="text-slate-600 leading-relaxed">Tidak perlu pindah ke aplikasi lain. Pelanggan cukup chat ke nomor bisnis yang sudah mereka kenal.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-8 shadow-lg border border-green-200">
              <div className="mb-4 text-2xl">🔗</div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Data Bisnis Tetap Rapi</h3>
              <p className="text-slate-600 leading-relaxed">Profil, cabang, layanan, jam buka, dan hari libur dipisah per bisnis supaya jawaban AI tetap relevan.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-8 shadow-lg border border-purple-200">
              <div className="mb-4 text-2xl">🔔</div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Booking Tetap Aman</h3>
              <p className="text-slate-600 leading-relaxed">AI boleh membantu menjawab, tapi slot, status, dan aturan booking tetap divalidasi sistem supaya tidak ada jadwal ngaco.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="scroll-mt-24 bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="font-nav text-2xl font-bold uppercase tracking-[0.1em] text-slate-900 md:text-3xl">
              Paket Awal yang Mudah Dijual
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-600 md:text-base">
              Paket di bawah ini dibuat sederhana supaya mudah dipahami merchant awam. Fokusnya tetap per bisnis, karena AI membaca data tiap bisnis dari database terpisah.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                Trial
              </div>
              <div className="mt-8 text-3xl font-bold text-slate-900">Rp 0</div>
              <p className="mt-4 text-slate-600">Untuk bisnis baru yang ingin mencoba alur booking, FAQ AI, dan reminder sebelum masuk paket berbayar.</p>
              <ul className="mt-8 space-y-3 text-slate-600">
                <li>1 bisnis</li>
                <li>1 cabang</li>
                <li>FAQ AI dasar</li>
                <li>Booking sandbox</li>
              </ul>
              <Link
                href="/pricing"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Lihat Struktur Lengkap
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-600 p-8 shadow-xl text-white">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Starter
              </div>
              <div className="mt-8 text-3xl font-bold">Rp 299.000</div>
              <p className="mt-4 text-slate-100">Paket awal untuk bisnis aktif yang ingin AI menjawab FAQ, cabang, jam buka, dan booking dasar dari satu nomor official.</p>
              <ul className="mt-8 space-y-3 text-slate-100/90">
                <li>1 bisnis aktif</li>
                <li>1-2 cabang</li>
                <li>AI FAQ + booking flow</li>
                <li>Reminder otomatis</li>
              </ul>
              <Link
                href="/pricing"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Detail Starter
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm opacity-80">
              <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
                Growth / Pro
              </div>
              <div className="mt-8 text-3xl font-bold text-slate-900">Custom</div>
              <p className="mt-4 text-slate-600">Untuk bisnis yang butuh banyak cabang, knowledge khusus, handoff ke admin, dan SLA yang lebih serius.</p>
              <ul className="mt-8 space-y-3 text-slate-600">
                <li>Multi cabang</li>
                <li>Custom knowledge</li>
                <li>Human handoff</li>
              </ul>
              <Link
                href="/pricing"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Buka Detail Pro
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <p className="max-w-2xl text-sm leading-7 text-slate-500">
              Kalau kamu mau pricing yang lebih tegas untuk market awal, kita bisa mulai dari satu paket berbayar saja, lalu sisanya jadi add-on. Itu biasanya lebih mudah dijual di fase MVP.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Lihat Paket Lengkap
            </Link>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="scroll-mt-24 bg-gradient-to-br from-slate-50 to-slate-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="font-nav text-2xl font-bold uppercase tracking-[0.1em] text-slate-900 md:text-3xl">
              Cocok untuk Bisnis yang Butuh Booking
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-600 md:text-base">
              Halaman ini fokus pada masalah paling umum di bisnis yang pakai booking: pertanyaan berulang, jadwal yang berantakan, dan data operasional yang tersebar.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {[
              {
                name: "Chat Masuk Tetap Rapi",
                icon: "✂️",
                description: "Pelanggan tetap chat lewat WhatsApp, tetapi AI membaca konteks bisnis lalu memandu ke cabang, layanan, dan jadwal yang tepat.",
                color: "from-blue-500 to-blue-600",
              },
              {
                name: "Slot Mengikuti Jam Operasional",
                icon: "🕒",
                description: "Pilihan jam otomatis menyesuaikan business hours, hari libur, dan durasi layanan yang tersimpan di database.",
                color: "from-green-500 to-green-600",
              },
              {
                name: "Layanan Bisa Diatur Owner",
                icon: "🧾",
                description: "Owner dapat mengubah nama layanan, harga, durasi, cabang, dan knowledge tanpa sentuh kode manual.",
                color: "from-orange-500 to-orange-600",
              },
              {
                name: "Status Booking Lebih Jelas",
                icon: "✅",
                description: "Booking tetap punya status yang jelas agar AI tidak melompati aturan operasional atau mengubah data sembarangan.",
                color: "from-purple-500 to-purple-600",
              },
              {
                name: "Nomor Bisnis Tetap Dipakai",
                icon: "📲",
                description: "Kalau nanti dibutuhkan, dedicated number tetap bisa jadi add-on untuk bisnis yang ingin brand dan nomor sendiri.",
                color: "from-indigo-500 to-indigo-600",
              },
              {
                name: "Siap Divalidasi ke Pasar",
                icon: "🚀",
                description: "Scope MVP dijaga tetap sempit supaya cepat diuji ke bisnis sungguhan sebelum menambah kompleksitas lain.",
                color: "from-gray-500 to-gray-600",
              },
            ].map((industry) => (
              <div
                key={industry.name}
                className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-blue-300 hover:shadow-xl"
              >
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${industry.color} text-xl text-white shadow-lg`}>
                  {industry.icon}
                </div>
                <h3 className="mb-3 text-base font-semibold text-slate-900 transition group-hover:text-blue-600">
                  {industry.name}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {industry.description}
                </p>
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                >
                  Mulai Setup
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="mb-6 text-slate-600">Jika alur ini cocok dengan operasional bisnis Anda, MVP sudah siap diuji ke pelanggan pertama.</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              Daftar dan Sambungkan Nomor WA Bisnis
              <span className="text-lg">🚀</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-24 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-nav text-2xl font-bold uppercase tracking-[0.1em] text-slate-900 md:text-3xl">
              Mengapa Owner Akan Suka BookLink?
            </h2>
            <p className="mt-4 text-sm text-slate-600 md:text-base">
              Fitur inti yang memang dibutuhkan untuk bikin booking lebih laku dan lebih rapi
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Tetap di WhatsApp</h3>
              <p className="text-slate-600 leading-relaxed">
                Pelanggan tetap memakai WhatsApp yang sudah familiar, sementara owner tidak perlu memindahkan mereka ke aplikasi baru.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-green-200">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Setup Cepat</h3>
              <p className="text-slate-600 leading-relaxed">
                Owner tinggal mengisi profil bisnis, slug landing page, layanan, dan channel WhatsApp untuk mulai menerima booking.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-purple-200">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Slot Lebih Akurat</h3>
              <p className="text-slate-600 leading-relaxed">
                Slot publik dan chatbot sekarang menghitung durasi layanan dan jam operasional agar booking tidak mudah bentrok.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-orange-100 to-orange-200">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Layanan Fleksibel</h3>
              <p className="text-slate-600 leading-relaxed">
                Owner bisa menambah, mengubah, atau menonaktifkan layanan sendiri beserta harga dan durasinya dari dashboard.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-red-100 to-red-200">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Reminder Otomatis</h3>
              <p className="text-slate-600 leading-relaxed">
                Reminder dan notifikasi status dasar membantu owner menjaga pelanggan tetap mendapat kepastian sebelum jadwal.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-teal-200">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Tenant-Aware dari Dasar</h3>
              <p className="text-slate-600 leading-relaxed">
                Booking publik, channel WhatsApp, layanan, dan reminder sudah dipisahkan per owner agar flow MVP lebih aman untuk production.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              BookLink
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              AI booking assistant untuk bisnis booking yang membantu owner menjawab FAQ, mengelola booking, dan menjaga data operasional tetap rapi.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition">📘 Facebook</a>
              <a href="#" className="text-slate-400 hover:text-white transition">📷 Instagram</a>
              <a href="#" className="text-slate-400 hover:text-white transition">💼 LinkedIn</a>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#platform" className="hover:text-white transition">Produk</a></li>
              <li><a href="#industries" className="hover:text-white transition">Use Case</a></li>
              <li><a href="#features" className="hover:text-white transition">Fitur</a></li>
              <li><a href="/register" className="hover:text-white transition">Mulai</a></li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Dukungan</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href={waLink} className="hover:text-white transition">Hubungi WhatsApp</a></li>
              <li><a href="/register" className="hover:text-white transition">Buat Akun</a></li>
              <li><a href="/login" className="hover:text-white transition">Login Owner</a></li>
              <li><a href="#contact" className="hover:text-white transition">Kontak</a></li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Bisnis</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="/login" className="hover:text-white transition">Login Admin</a></li>
              <li><a href="/register" className="hover:text-white transition">Daftar Gratis</a></li>
              <li><a href="#platform" className="hover:text-white transition">Cara Kerja</a></li>
              <li><a href="#features" className="hover:text-white transition">Fitur Inti</a></li>
            </ul>
          </section>
        </div>
        <div className="mt-12 border-t border-slate-700 pt-8 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} BookLink. Platform booking berbasis WhatsApp untuk bisnis yang menerima reservasi dan jadwal.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition">Terms of Service</a>
              <a href="/cookies" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
