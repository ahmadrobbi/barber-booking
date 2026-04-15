"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";

type Slide = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  accent: string;
  stats: readonly string[];
};

type HomeHeroCarouselProps = {
  slides: readonly Slide[];
  menuFontClassName: string;
  waLink: string;
};

export function HomeHeroCarousel({
  slides,
  menuFontClassName,
  waLink,
}: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const nextSlide = useEffectEvent(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      nextSlide();
    }, 5500);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <section id="home" className="relative isolate min-h-[88vh] overflow-hidden bg-[#120e09]">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={`${slide.title}-${index}`}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out ${
              index === activeIndex
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-105 opacity-0"
            }`}
            style={{
              backgroundImage: `linear-gradient(115deg, rgba(8, 8, 8, 0.82), rgba(8, 8, 8, 0.45)), url('${slide.image}')`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_34%),linear-gradient(to_bottom,_rgba(18,14,9,0.1),_rgba(18,14,9,0.45))]" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl items-center px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-end">
          <div className="max-w-3xl">
            <div
              className={`inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.32em] text-amber-200/90 backdrop-blur ${menuFontClassName}`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              {slides[activeIndex].eyebrow}
            </div>

            <h1
              className={`${menuFontClassName} mt-6 text-5xl font-bold uppercase leading-none text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:text-6xl md:text-7xl`}
            >
              {slides[activeIndex].title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
              {slides[activeIndex].description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
              >
                Booking Sekarang
              </Link>
              <a
                href={waLink}
                className="rounded-full border border-white/25 bg-black/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Booking via WhatsApp
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {slides[activeIndex].stats.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/75 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="justify-self-end rounded-[28px] border border-white/10 bg-black/30 p-5 text-white/88 shadow-[0_18px_80px_rgba(0,0,0,0.28)] backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">
              Highlight Slide
            </p>
            <div
              className="mt-4 h-72 rounded-[24px] bg-cover bg-center"
              style={{ backgroundImage: `url('${slides[activeIndex].image}')` }}
            />
            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className={`text-xl uppercase ${menuFontClassName}`}>
                  {slides[activeIndex].accent}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Konsep grooming yang lebih modern, rapi, dan nyaman.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goToSlide(activeIndex - 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg transition hover:bg-white/12"
                  aria-label="Slide sebelumnya"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => goToSlide(activeIndex + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/40 bg-amber-400/15 text-lg text-amber-100 transition hover:bg-amber-400/25"
                  aria-label="Slide berikutnya"
                >
                  →
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex ? "w-10 bg-amber-300" : "w-2.5 bg-white/25"
                  }`}
                  aria-label={`Buka slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
