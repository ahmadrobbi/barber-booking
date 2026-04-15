"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Barlow_Condensed, Cinzel_Decorative } from "next/font/google";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { getIndustryConfig, getAvailableIndustries, getBusinessName } from "@/lib/industry-config";
import { INDUSTRIES, type IndustryKey } from "@/lib/industries";

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
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string>("");

  const availableIndustries = getAvailableIndustries();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [cfg, bizName] = await Promise.all([
          getIndustryConfig(),
          getBusinessName()
        ]);
        setSelectedIndustry(cfg.default);
        setConfig(cfg);
        setBusinessName(bizName);
      } catch (err) {
        console.error("Failed to load config:", err);
        setConfig({ enabled: ["barbershop"], default: "barbershop" });
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
    { href: "#profil", label: "Profil" },
    { href: "#services", label: "Services" },
    { href: "#gallery", label: "Gallery" },
    { href: "#ourproduct", label: "Our Product" },
    { href: "#franchise", label: "Franchise" },
  ] as const;

  return (
    <main className="bg-[#111111] text-white font-sans">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            <a href="#home" className="flex shrink-0 items-center gap-3 pr-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/60 bg-amber-400/20 text-sm font-bold text-amber-200">
                {industryData.ui.logo}
              </span>
              <span>
                <strong
                  className={`${logoFont.className} block text-lg leading-tight tracking-[0.04em] md:text-[1.7rem]`}
                >
                  {businessName || industryData.name}
                </strong>
                <span className="block text-[11px] text-white/60 md:text-sm">
                  Official Booking Portal
                </span>
              </span>
            </a>

            <div
              className={`${menuFont.className} hidden flex-1 items-center justify-end gap-7 text-[1.15rem] tracking-wide lg:flex xl:gap-9`}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-white/85 transition hover:text-amber-300"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-2 lg:flex relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 cursor-pointer"
              >
                Booking
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-48 rounded-md bg-black border border-white/10 shadow-lg z-10">
                  <Link
                    href={`/booking?industry=${selectedIndustry}`}
                    className="block px-4 py-2 text-sm text-white hover:bg-amber-500 hover:text-black transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Booking Sekarang
                  </Link>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-white hover:bg-amber-500 hover:text-black transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Booking via WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3 lg:hidden">
            <div className="flex items-center gap-2 relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full rounded-md bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black transition hover:bg-amber-400 cursor-pointer"
              >
                Booking
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-full rounded-md bg-black border border-white/10 shadow-lg z-10">
                  <Link
                    href={`/booking?industry=${selectedIndustry}`}
                    className="block px-4 py-2 text-sm text-white hover:bg-amber-500 hover:text-black transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Booking Sekarang
                  </Link>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-white hover:bg-amber-500 hover:text-black transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Booking via WhatsApp
                  </a>
                </div>
              )}
            </div>

            <div
              className={`${menuFont.className} flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-base tracking-wide`}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-white/80 transition hover:text-amber-300"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Industry Selector */}
      <div className="bg-black/40 border-b border-white/10 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs text-white/60 mb-2">Select Industry:</p>
          <div className="flex gap-2 flex-wrap">
            {availableIndustries.map((ind) => (
              <button
                key={ind.key}
                onClick={() => setSelectedIndustry(ind.key)}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedIndustry === ind.key
                    ? "bg-amber-500 text-black font-semibold"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {ind.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <HomeHeroCarousel
        slides={industryData.ui.heroImages.map((img: string, i: number) => ({
          eyebrow: "Selamat Datang",
          title: `${industryData.name} - Booking Mudah via WhatsApp`,
          description: industryData.description,
          image: img,
          accent: industryData.name,
          stats: ["Booking cepat", "Minim antre", "Layanan terpercaya"],
        }))}
        menuFontClassName={menuFont.className}
        waLink={waLink}
      />

      {/* Profile Section */}
      <section id="profil" className="scroll-mt-24 bg-[#f8f8f8] py-24 text-center text-[#141414]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto inline-flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#141414] text-3xl font-bold">
            {industryData.ui.logo}
          </div>
          <h2 className={`${menuFont.className} mt-6 text-5xl font-bold uppercase md:text-6xl`}>
            {industryData.name}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#434343] md:text-base">
            {industryData.description}
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="scroll-mt-24 bg-[#141414] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className={`${menuFont.className} text-5xl font-bold md:text-6xl`}>
              Layanan Kami
            </h2>
            <p className="mt-3 text-white/70">
              Pilihan layanan terbaik dengan harga kompetitif
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {industryData.services.map((service: any, index: number) => (
              <article
                key={service.code}
                className={`rounded-xl border p-6 ${
                  index === Math.floor(industryData.services.length / 2)
                    ? "border-amber-300/60 bg-amber-300/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <h3 className="text-2xl font-semibold">{service.name}</h3>
                <p className="mt-2 text-amber-300">
                  Rp {service.price.toLocaleString("id-ID")}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {service.points.map((point: string) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="scroll-mt-24 bg-[#f5f5f5] py-24 text-[#111]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className={`${menuFont.className} text-5xl font-bold md:text-6xl`}>
              Galeri
            </h2>
            <p className="mt-3 text-[#444]">Koleksi foto dari {industryData.name}</p>
          </div>
          <GalleryLightbox images={industryData.ui.gallery} />
        </div>
      </section>

      <footer className="bg-[#0d0d0d] py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <section>
            <h3 className="text-lg font-bold text-white">Lokasi</h3>
            <p className="mt-4 text-sm text-white/75">
              Kunjungi kami untuk pengalaman booking yang lebih personal.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-bold text-white">Informasi</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>Jam Operasional</li>
              <li>Ketentuan Privasi</li>
              <li>Syarat & Ketentuan</li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold text-white">Hubungi Kami</h3>
            <p className="mt-4 text-sm text-white/75">
              WhatsApp: {phone}
              <br />
              Email: info@{selectedIndustry}.com
            </p>
          </section>
        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 px-6 text-center sm:flex-row sm:gap-5">
          <p className="text-sm text-white/50">
            Copyright © {new Date().getFullYear()} {industryData.name}.
          </p>
          <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden="true" />
          <Link
            href="/login"
            className="text-sm font-medium text-amber-200/80 transition hover:text-amber-300"
          >
            Admin Login
          </Link>
        </div>
      </footer>
    </main>
  );
}
