"use client";

import { useEffect, useState } from "react";

type GalleryLightboxProps = {
  images: readonly string[];
};

export function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex]);

  const activeImage = activeIndex === null ? null : images[activeIndex];

  return (
    <>
      <div className="mt-10 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative h-56 overflow-hidden text-left focus:outline-none"
          >
            <img
              src={image}
              alt={`Gallery Barokah ${index + 1}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-3 py-2 text-sm text-white">
              <span>Barokah • Gallery</span>
              <span className="text-xs uppercase tracking-[0.18em] text-white/80">
                Click to zoom
              </span>
            </figcaption>
          </button>
        ))}
      </div>

      {activeImage && activeIndex !== null ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 px-4 py-8"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery preview"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Close
          </button>
          <div
            className="max-h-full w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#111]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={`Gallery preview ${activeIndex + 1}`}
              className="max-h-[82vh] w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
