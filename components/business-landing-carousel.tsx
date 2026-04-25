"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";

type CarouselSlide = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  stats: string[];
};

type BusinessLandingCarouselProps = {
  businessName: string;
  bookingHref: string;
  whatsappHref: string | null;
  slides: CarouselSlide[];
};

const slideThemes = [
  "from-stone-950 via-stone-900 to-amber-950",
  "from-[#18110b] via-[#2b1706] to-[#6b3f0a]",
  "from-[#101010] via-[#1a1815] to-[#3f2f14]",
] as const;

export function BusinessLandingCarousel({
  businessName,
  bookingHref,
  whatsappHref,
  slides,
}: BusinessLandingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = useEffectEvent(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      nextSlide();
    }, 5200);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-2xl shadow-stone-900/10">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${slideThemes[activeIndex % slideThemes.length]} px-7 py-8 text-white md:px-10 md:py-12`}
        >
          <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

          <p className="relative text-xs uppercase tracking-[0.3em] text-amber-200/75">
            {activeSlide.eyebrow}
          </p>
          <h2 className="relative mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            {activeSlide.title}
          </h2>
          <p className="relative mt-5 max-w-2xl text-base leading-8 text-white/75">
            {activeSlide.description}
          </p>

          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link
              href={bookingHref}
              className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-sm"
            >
              Booking Sekarang
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-sm"
              >
                Chat WhatsApp
              </a>
            ) : null}
          </div>

          <div className="relative mt-10 flex flex-wrap gap-3">
            {activeSlide.stats.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between bg-white px-7 py-8 md:px-10 md:py-12">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Profil Singkat</p>
            <div className="mt-5 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5">
              <p className="text-sm font-semibold text-stone-950">{businessName}</p>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                Halaman ini dibuat untuk membantu pelanggan mengenal bisnis Anda lebih cepat,
                melihat layanan utama, lalu lanjut booking tanpa harus melewati alur yang rumit.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex ? "w-10 bg-amber-400" : "w-2.5 bg-stone-300"
                  }`}
                  aria-label={`Buka slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-stone-200 bg-white text-lg text-stone-700 transition hover:bg-stone-100"
                aria-label="Slide sebelumnya"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-stone-900 bg-stone-900 text-lg text-white transition hover:bg-stone-800"
                aria-label="Slide berikutnya"
              >
                →
              </button>
            </div>

            <p className="mt-6 text-sm font-medium text-stone-700">{activeSlide.accent}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
