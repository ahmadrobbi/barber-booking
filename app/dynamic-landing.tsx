"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Barlow_Condensed, Cinzel_Decorative } from "next/font/google";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { fetchLandingPageConfig } from "@/app/actions/landing-page-config";
import { getAvailableIndustries, INDUSTRIES, type IndustryKey } from "@/lib/industries";
import type { IndustryConfig } from "@/lib/industry-config";

const menuFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const logoFont = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["700"],
});

export default function DynamicLandingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey>("barbershop");
  const [config, setConfig] = useState<IndustryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string>("");

  const availableIndustries = getAvailableIndustries();

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { config: cfg, businessName: bizName } = await fetchLandingPageConfig();
        setSelectedIndustry(cfg.default);
        setConfig(cfg);
        setBusinessName(bizName);
      } catch (err) {
        console.error("Failed to load config:", err);
        setConfig({ enabled: ["barbershop", "clinic"], default: "barbershop" });
        setBusinessName("Booking Platform");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111111] text-white">
        <p>Loading...</p>
      </div>
    );
  }

  const industryData = INDUSTRIES[selectedIndustry];
  const phone = "6287749105273";
  const message = encodeURIComponent("Halo, saya mau booking.");
  const waLink = `https://wa.me/${phone}?text=${message}`;

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#platform", label: "Platform" },
    { href: "#industries", label: "Industries" },
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
                  {businessName || "AntrianPro"}
                </strong>
                <span className="block text-xs text-slate-600 md:text-sm">
                  Universal Booking Platform
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

            <div className="hidden shrink-0 items-center gap-2 lg:flex relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-indigo-700 cursor-pointer shadow-lg"
              >
                Start Booking
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-56 rounded-lg bg-white border border-slate-200 shadow-xl z-10">
                  <Link
                    href={`/booking?industry=${selectedIndustry}`}
                    className="block px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition rounded-t-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    📱 Book Online
                  </Link>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition rounded-b-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    💬 Book via WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3 lg:hidden">
            <div className="flex items-center gap-2 relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:from-blue-600 hover:to-indigo-700 cursor-pointer shadow-lg"
              >
                Start Booking
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-full rounded-lg bg-white border border-slate-200 shadow-xl z-10">
                  <Link
                    href={`/booking?industry=${selectedIndustry}`}
                    className="block px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition rounded-t-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    📱 Book Online
                  </Link>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition rounded-b-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    💬 Book via WhatsApp
                  </a>
                </div>
              )}
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
            eyebrow: "🚀 Platform Booking Universal",
            title: "Mudahkan Booking untuk Semua Bisnis",
            description: "Dari barbershop hingga klinik, restoran, spa, dan workshop. Satu platform untuk semua kebutuhan booking antrian dengan integrasi WhatsApp seamless.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=80",
            accent: "AntrianPro",
            stats: ["95% Pengguna WhatsApp", "Multi-Industri Support", "Dashboard Real-Time"],
          },
          {
            eyebrow: "💼 Untuk Semua Jenis Bisnis",
            title: "Template Customizable Siap Pakai",
            description: "Pilih industri Anda, sesuaikan template, dan mulai terima booking dalam hitungan menit. Tidak perlu coding atau setup rumit.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=80",
            accent: "Mudah Digunakan",
            stats: ["Setup 5 Menit", "Template Ready", "Support 24/7"],
          },
          {
            eyebrow: "📊 Analytics & Insights",
            title: "Pantau Performa Bisnis Anda",
            description: "Dashboard real-time untuk tracking booking, revenue, dan customer behavior. Optimalkan bisnis dengan data-driven insights.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80",
            accent: "Smart Analytics",
            stats: ["Real-Time Data", "Revenue Tracking", "Customer Insights"],
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
            Platform Booking Universal
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Kami menyediakan solusi booking antrian terdepan untuk berbagai jenis bisnis di Indonesia. Dari barbershop hingga klinik kesehatan, restoran, spa, dan workshop—semua terintegrasi dengan WhatsApp untuk pengalaman booking yang effortless.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-lg border border-blue-200">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Integration</h3>
              <p className="text-slate-600 leading-relaxed">95% pengguna Indonesia aktif di WhatsApp. Booking jadi lebih mudah, familiar, dan tanpa friction dengan chatbot otomatis.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-8 shadow-lg border border-green-200">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Industri Support</h3>
              <p className="text-slate-600 leading-relaxed">Template yang dapat disesuaikan untuk barbershop, klinik, F&B, terapi, workshop, dan industri lainnya. Tambah industri baru dalam hitungan menit.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-8 shadow-lg border border-purple-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dashboard Analytics</h3>
              <p className="text-slate-600 leading-relaxed">Monitor booking, revenue, customer behavior, dan performa bisnis secara real-time dengan analytics yang powerful.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="scroll-mt-24 bg-gradient-to-br from-slate-50 to-slate-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className={`${menuFont.className} text-4xl font-bold md:text-5xl text-slate-900 uppercase`}>
              Industri yang Didukung
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              Platform kami dirancang untuk berbagai jenis bisnis di Indonesia. Pilih industri Anda dan mulai terima booking hari ini.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {[
              {
                name: "Barbershop & Salon",
                icon: "✂️",
                description: "Potong rambut, styling, dan perawatan pria/wanita",
                color: "from-blue-500 to-blue-600",
              },
              {
                name: "Klinik & Kesehatan",
                icon: "🏥",
                description: "Pendaftaran pasien, konsultasi dokter, tes lab",
                color: "from-green-500 to-green-600",
              },
              {
                name: "Restoran & F&B",
                icon: "🍽️",
                description: "Reservasi meja, pesan makanan, event catering",
                color: "from-orange-500 to-orange-600",
              },
              {
                name: "Spa & Terapi",
                icon: "🧘",
                description: "Booking treatment, massage, wellness services",
                color: "from-purple-500 to-purple-600",
              },
              {
                name: "Workshop & Kursus",
                icon: "🎓",
                description: "Pendaftaran peserta, jadwal kelas, sertifikasi",
                color: "from-indigo-500 to-indigo-600",
              },
              {
                name: "Lainnya",
                icon: "🏢",
                description: "Konsultasi bisnis, servis kendaraan, dll.",
                color: "from-gray-500 to-gray-600",
              },
            ].map((industry, index) => (
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
                <button
                  onClick={() => setSelectedIndustry(industry.name.toLowerCase().includes('barber') ? 'barbershop' : industry.name.toLowerCase().includes('klinik') ? 'clinic' : 'barbershop')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Coba Sekarang
                </button>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-slate-600 mb-6">Belum menemukan industri Anda? Template custom tersedia!</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              Daftar Gratis
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
              Mengapa Pilih AntrianPro?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Platform booking terdepan dengan fitur lengkap untuk bisnis modern
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Integration</h3>
              <p className="text-slate-600 leading-relaxed">
                95% pengguna Indonesia aktif di WhatsApp. Booking jadi lebih mudah dan familiar dengan chatbot otomatis 24/7.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Setup Cepat</h3>
              <p className="text-slate-600 leading-relaxed">
                Mulai dalam 5 menit. Pilih template industri, sesuaikan, dan langsung terima booking tanpa coding.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dashboard Analytics</h3>
              <p className="text-slate-600 leading-relaxed">
                Pantau performa bisnis dengan real-time analytics. Track booking, revenue, dan customer insights.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔧</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Customizable</h3>
              <p className="text-slate-600 leading-relaxed">
                Sesuaikan template dengan branding bisnis Anda. Tambah layanan, ubah harga, dan personalize pesan.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔔</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reminder Otomatis</h3>
              <p className="text-slate-600 leading-relaxed">
                Kirim reminder otomatis via WhatsApp untuk mengurangi no-show dan tingkatkan kepuasan pelanggan.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Harga Terjangkau</h3>
              <p className="text-slate-600 leading-relaxed">
                Mulai dari Rp 50.000/bulan per outlet. Freemium untuk bisnis kecil, enterprise untuk skala besar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              AntrianPro
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Platform booking antrian universal untuk bisnis modern di Indonesia. Mudahkan pelanggan dengan integrasi WhatsApp seamless.
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
              <li><a href="#platform" className="hover:text-white transition">Tentang Kami</a></li>
              <li><a href="#industries" className="hover:text-white transition">Industri</a></li>
              <li><a href="#features" className="hover:text-white transition">Fitur</a></li>
              <li><a href="/pricing" className="hover:text-white transition">Harga</a></li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Dukungan</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="/help" className="hover:text-white transition">Bantuan</a></li>
              <li><a href="/docs" className="hover:text-white transition">Dokumentasi</a></li>
              <li><a href="/contact" className="hover:text-white transition">Kontak</a></li>
              <li><a href="/status" className="hover:text-white transition">Status Sistem</a></li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Bisnis</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="/login" className="hover:text-white transition">Login Admin</a></li>
              <li><a href="/register" className="hover:text-white transition">Daftar Gratis</a></li>
              <li><a href="/enterprise" className="hover:text-white transition">Enterprise</a></li>
              <li><a href="/partners" className="hover:text-white transition">Partnership</a></li>
            </ul>
          </section>
        </div>
        <div className="mt-12 border-t border-slate-700 pt-8 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} AntrianPro. Platform Booking Universal untuk Bisnis Indonesia.
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
