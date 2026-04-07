import Link from "next/link";

const services = [
  {
    name: "Fade Signature",
    price: "Rp35K",
    desc: "Gradasi bersih dengan detail garis tajam.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    name: "Undercut Modern",
    price: "Rp30K",
    desc: "Style clean untuk look rapi seharian.",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    name: "Color + Styling",
    price: "Rp85K",
    desc: "Warna trend + styling by request.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    name: "Kids Cut",
    price: "Rp25K",
    desc: "Potong santai, cepat, dan ramah anak.",
    accent: "from-lime-400 to-emerald-500",
  },
] as const;

const testimonials = [
  "Booking online bikin hemat waktu, datang langsung dicukur.",
  "Tempat nyaman, hasil fade rapih banget dan tahan lama.",
  "Barber-nya komunikatif, style sesuai referensi yang diminta.",
] as const;

const styleSlides = [
  {
    title: "Classic Pompadour",
    detail: "Volume atas yang tegas dengan sisi rapi untuk tampilan formal-casual.",
    image:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Textured Crop",
    detail: "Potongan modern low maintenance dengan tekstur natural di bagian atas.",
    image:
      "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Low Fade + Beard Blend",
    detail: "Transisi halus dari rambut ke janggut untuk look bersih dan maskulin.",
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1400&q=80",
  },
] as const;

const galleryPhotos = [
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1593702288056-f8fd3d74c46d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
] as const;

const galleryVideos = [
  {
    title: "Proses Fade Cut",
    src: "https://www.youtube.com/embed/0Q9-jM4N9k4",
  },
  {
    title: "Hair Styling Finish",
    src: "https://www.youtube.com/embed/-FC4G5M-tH8",
  },
] as const;

export default function Home() {
  const phone = "6287749105273";
  const message = encodeURIComponent("Halo, saya mau booking cukur rambut.");
  const waLink = `https://wa.me/${phone}?text=${message}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f0f1b] text-white font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28">
        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.08] px-4 py-1 text-xs tracking-wide text-white/[0.85] backdrop-blur">
          BARBERBOOKING • FAST SLOT
        </div>
        <div className="mt-6 grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div>
            <h1 className="text-4xl leading-tight font-bold md:text-6xl">
              Style Lebih
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Fresh
              </span>
              , Booking Lebih Cepat
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/[0.75] md:text-lg">
              Barbershop modern dengan sistem booking WhatsApp. Pilih jam, datang, dan langsung dilayani tanpa antri panjang.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={waLink}
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-6 py-3 font-semibold text-black transition hover:scale-[1.02]"
              >
                Booking via WhatsApp
              </a>
              <Link
                href="/admin"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/[0.18]"
              >
                Login Admin
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-lg bg-white/[0.12] px-3 py-2 text-white/[0.85]">
                120+ booking / minggu
              </span>
              <span className="rounded-lg bg-white/[0.12] px-3 py-2 text-white/[0.85]">
                Rating 4.9/5
              </span>
              <span className="rounded-lg bg-white/[0.12] px-3 py-2 text-white/[0.85]">
                Open 10:00 - 22:00
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur">
            <p className="mb-4 text-sm text-white/70">Pilihan Populer Minggu Ini</p>
            <div className="space-y-3">
              {services.slice(0, 3).map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-white/10 bg-[#121226] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-amber-300">{item.price}</p>
                  </div>
                  <p className="mt-1 text-sm text-white/[0.65]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold md:text-3xl">Layanan Kami</h2>
        <p className="mt-2 text-white/70">Pilih style yang paling cocok dengan karakter kamu.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((item) => (
            <div
              key={item.name}
              className="group rounded-2xl border border-white/[0.12] bg-[#141429]/90 p-4 transition hover:-translate-y-1"
            >
              <div
                className={`mb-4 h-2 w-24 rounded-full bg-gradient-to-r ${item.accent}`}
              />
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-1 text-sm text-white/[0.65]">{item.desc}</p>
              <p className="mt-4 text-lg font-bold text-amber-300">{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-white/[0.14] bg-gradient-to-br from-[#1a1d37] via-[#202042] to-[#2a1836] p-7 md:p-10">
          <h2 className="text-2xl font-bold md:text-3xl">Apa Kata Pelanggan</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((text, i) => (
              <article
                key={text}
                className="rounded-2xl bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-xs text-amber-300">★★★★★</p>
                <p className="mt-2 text-sm text-white/[0.88]">{text}</p>
                <p className="mt-3 text-xs text-white/50">Pelanggan #{i + 1}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Slideshow Style Rambut</h2>
            <p className="mt-2 text-white/70">
              Geser ke samping untuk lihat inspirasi style dan rekomendasi layanan.
            </p>
          </div>
          <p className="rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2 text-xs text-white/80">
            Swipe • Snap • Pilih Style
          </p>
        </div>

        <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {styleSlides.map((slide) => (
            <article
              key={slide.title}
              className="group min-w-[280px] snap-center overflow-hidden rounded-2xl border border-white/15 bg-[#141429] md:min-w-[430px]"
            >
              <div className="relative h-64 overflow-hidden md:h-72">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{slide.title}</h3>
                <p className="mt-2 text-sm text-white/[0.72]">{slide.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-bold md:text-3xl">Gallery Foto & Video</h2>
        <p className="mt-2 text-white/70">
          Dokumentasi hasil cukur dan suasana kerja barber kami.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryPhotos.map((image, i) => (
            <figure
              key={image}
              className="overflow-hidden rounded-2xl border border-white/15 bg-[#141429]"
            >
              <img
                src={image}
                alt={`Gallery hasil cukur ${i + 1}`}
                className="h-52 w-full object-cover transition duration-500 hover:scale-105"
              />
            </figure>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {galleryVideos.map((video) => (
            <article
              key={video.title}
              className="overflow-hidden rounded-2xl border border-white/15 bg-[#121226]"
            >
              <div className="aspect-video w-full">
                <iframe
                  src={video.src}
                  title={video.title}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p className="px-4 py-3 text-sm text-white/80">{video.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-12 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Siap Upgrade Penampilan Hari Ini?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/[0.75]">
          Klik tombol booking, pilih waktu yang kamu mau, dan nikmati service cepat tanpa antre.
        </p>
        <a
          href={waLink}
          className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 px-8 py-4 text-lg font-bold text-black transition hover:scale-[1.02]"
        >
          Booking Sekarang
        </a>
      </section>
    </main>
  );
}
