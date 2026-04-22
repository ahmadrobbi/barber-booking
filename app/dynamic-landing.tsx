"use client";

import Link from "next/link";
import { Barlow_Condensed, Cinzel_Decorative } from "next/font/google";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";

const menuFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const logoFont = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["700"],
});

export default function DynamicLandingPage() {
  const platformBrand = "AntriFlow";
  const platformTagline = "WhatsApp Booking untuk Barbershop";
  const phone = "6287749105273";
  const message = encodeURIComponent("Halo, saya mau booking.");
  const waLink = `https://wa.me/${phone}?text=${message}`;

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#platform", label: "Produk" },
    { href: "#industries", label: "Use Case" },
    { href: "#features", label: "Features" },
    { href: "#contact", label: "Contact" },
  ] as const;

  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-slate-800 font-sans min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/90 backdrop-blur-md shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            <a href="#home" className="flex shrink-0 items-center gap-3 pr-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-bold shadow-lg">
                📅
              </span>
              <span>
                <strong
                  className={`${logoFont.className} block text-xl leading-tight tracking-wide md:text-2xl text-slate-900`}
                >
                  {platformBrand}
                </strong>
                <span className="block text-xs text-slate-600 md:text-sm">
                  {platformTagline}
                </span>
              </span>
            </a>

            <div
              className={`${menuFont.className} hidden flex-1 items-center justify-end gap-7 text-lg tracking-wide lg:flex xl:gap-9`}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-slate-700 transition hover:text-blue-600 font-medium"
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

            <div
              className={`${menuFont.className} flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-200 pt-3 text-base tracking-wide`}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 transition hover:text-blue-600 font-medium"
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
            eyebrow: "Nomor WA Anda Sendiri",
            title: "Terima Booking Barbershop Tanpa Ganti Channel",
            description: "AntriFlow membantu owner barbershop menerima booking dari nomor WhatsApp bisnis yang sudah dipakai sehari-hari, lengkap dengan landing page publik dan reminder otomatis.",
            image: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1800&q=80",
            accent: "AntriFlow",
            stats: ["Nomor WA Sendiri", "Landing Page Publik", "Reminder Otomatis"],
          },
          {
            eyebrow: "Setup Ringkas",
            title: "Owner Bisa Go-Live dalam Beberapa Langkah",
            description: "Daftar akun, isi profil bisnis, atur layanan dan durasi, sambungkan device WhatsApp, lalu bagikan link booking `/b/[slug]` ke pelanggan Anda.",
            image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1800&q=80",
            accent: "Cepat Jalan",
            stats: ["Onboarding Ringkas", "Durasi Layanan", "Jam Operasional"],
          },
          {
            eyebrow: "Flow Harian yang Rapi",
            title: "Booking Masuk, Dikonfirmasi, Diingatkan",
            description: "Pelanggan bisa booking dari form publik atau chat WhatsApp. Owner mengelola status booking dari dashboard, lalu sistem mengirim notifikasi dan reminder dasar secara otomatis.",
            image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1800&q=80",
            accent: "Siap Dipakai",
            stats: ["Status Booking", "Konfirmasi WA", "Anti Bentrok Slot"],
          },
        ]}
        menuFontClassName={menuFont.className}
        waLink={waLink}
      />

      {/* Platform Section */}
      <section id="platform" className="scroll-mt-24 bg-white py-24 text-center">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto inline-flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-5xl shadow-lg">
            🚀
          </div>
          <h2 className={`${menuFont.className} mt-8 text-4xl font-bold uppercase md:text-5xl text-slate-900`}>
            Booking Barbershop yang Lebih Ringkas
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Fokus MVP ini sederhana: owner barbershop tidak perlu pindah channel atau mengajari pelanggan pakai aplikasi baru. Semua tetap berjalan lewat WhatsApp bisnis mereka sendiri dan link booking publik yang mudah dibagikan.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-lg border border-blue-200">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Nomor WA Milik Sendiri</h3>
              <p className="text-slate-600 leading-relaxed">Setiap owner bisa mendaftarkan nomor bisnisnya sendiri sebagai bot, jadi relasi dengan pelanggan tetap melekat ke brand mereka.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-8 shadow-lg border border-green-200">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Link Booking per Tenant</h3>
              <p className="text-slate-600 leading-relaxed">Setiap bisnis punya slug publik sendiri sehingga halaman booking, layanan, jadwal, dan reminder tidak tercampur dengan tenant lain.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-8 shadow-lg border border-purple-200">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reminder dan Status Dasar</h3>
              <p className="text-slate-600 leading-relaxed">Owner bisa mengonfirmasi atau membatalkan booking dari dashboard, lalu pelanggan mendapat pesan WhatsApp yang jelas dan tepat waktu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="scroll-mt-24 bg-gradient-to-br from-slate-50 to-slate-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className={`${menuFont.className} text-4xl font-bold md:text-5xl text-slate-900 uppercase`}>
              Cocok untuk Operasional Barbershop
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              Halaman depan ini tidak lagi menjanjikan semua industri. Kita fokus pada masalah yang paling sering dirasakan owner barbershop saat mengatur booking manual lewat chat.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {[
              {
                name: "Chat Masuk Tidak Berantakan",
                icon: "✂️",
                description: "Pelanggan tetap chat lewat WhatsApp, tetapi alurnya diarahkan ke pilihan layanan, tanggal, dan jam yang terstruktur.",
                color: "from-blue-500 to-blue-600",
              },
              {
                name: "Slot Mengikuti Jam Operasional",
                icon: "🕒",
                description: "Pilihan jam otomatis menyesuaikan business hours dan durasi layanan, bukan sekadar slot statis tanpa aturan.",
                color: "from-green-500 to-green-600",
              },
              {
                name: "Layanan Bisa Diatur Owner",
                icon: "🧾",
                description: "Owner dapat mengubah nama layanan, harga, dan durasi dari dashboard tanpa sentuh database manual.",
                color: "from-orange-500 to-orange-600",
              },
              {
                name: "Status Booking Lebih Jelas",
                icon: "✅",
                description: "Booking punya status `pending`, `confirmed`, `completed`, dan `cancelled` agar operasional harian lebih mudah dipantau.",
                color: "from-purple-500 to-purple-600",
              },
              {
                name: "Owner Tetap Pegang Nomor Sendiri",
                icon: "📲",
                description: "Bot berjalan di nomor bisnis owner, jadi pelanggan tetap menghubungi channel yang memang sudah mereka kenal.",
                color: "from-indigo-500 to-indigo-600",
              },
              {
                name: "Siap Divalidasi ke Pasar",
                icon: "🚀",
                description: "Scope MVP dijaga tetap sempit supaya cepat diuji ke owner barbershop sungguhan sebelum menambah kompleksitas lain.",
                color: "from-gray-500 to-gray-600",
              },
            ].map((industry) => (
              <div
                key={industry.name}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${industry.color} flex items-center justify-center text-white text-3xl mb-6 shadow-lg`}>
                  {industry.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition">
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
            <p className="text-slate-600 mb-6">Jika alur ini cocok dengan operasional barbershop Anda, MVP sudah siap diuji ke pelanggan pertama.</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              Daftar dan Sambungkan Nomor WA
              <span className="text-lg">🚀</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-24 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className={`${menuFont.className} text-4xl font-bold md:text-5xl text-slate-900 uppercase`}>
              Mengapa Pilih AntriFlow?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Fitur inti yang memang dibutuhkan untuk validasi MVP harian
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Integration</h3>
              <p className="text-slate-600 leading-relaxed">
                Pelanggan tetap memakai WhatsApp yang sudah familiar, sementara owner tidak perlu memindahkan mereka ke aplikasi baru.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Setup Cepat</h3>
              <p className="text-slate-600 leading-relaxed">
                Owner tinggal mengisi profil bisnis, slug landing page, layanan, dan channel WhatsApp untuk mulai menerima booking.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Slot Lebih Akurat</h3>
              <p className="text-slate-600 leading-relaxed">
                Slot publik dan chatbot sekarang menghitung durasi layanan dan jam operasional agar booking tidak mudah bentrok.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔧</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Layanan Fleksibel</h3>
              <p className="text-slate-600 leading-relaxed">
                Owner bisa menambah, mengubah, atau menonaktifkan layanan sendiri beserta harga dan durasinya dari dashboard.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔔</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reminder Otomatis</h3>
              <p className="text-slate-600 leading-relaxed">
                Reminder dan notifikasi status dasar membantu owner menjaga pelanggan tetap mendapat kepastian sebelum jadwal.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tenant-Aware dari Dasar</h3>
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
              AntriFlow
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              MVP booking barbershop yang membantu owner memakai nomor WhatsApp bisnis sendiri untuk menerima booking dan mengirim reminder otomatis.
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
              © {new Date().getFullYear()} AntriFlow. MVP booking barbershop berbasis WhatsApp.
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
