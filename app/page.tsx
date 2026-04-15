import Link from "next/link";
import { Barlow_Condensed, Cinzel_Decorative } from "next/font/google";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";

const menuFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const logoFont = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["700"],
});

const services = [
  {
    name: "Cut & Wash",
    price: "START IDR 30.000 / session",
    points: [
      "Haircut sesuai keinginan",
      "Rekomendasi model sesuai bentuk wajah",
      "Shampoo + vitamin rambut",
      "Styling akhir dengan pomade",
    ],
  },
  {
    name: "Cut & Wash (KIDS)",
    price: "START IDR 25.000 / session",
    points: [
      "Untuk anak sampai usia 10 tahun",
      "Haircut sesuai keinginan",
      "Shampoo + vitamin rambut",
      "Styling rapi dan nyaman",
    ],
  },
  {
    name: "Hair Color For Men",
    price: "START IDR 100.000 / session",
    points: [
      "Konsultasi pilihan warna",
      "Coloring & grading sesuai request",
      "Shampoo setelah proses",
      "Vitamin rambut setelah coloring",
    ],
  },
] as const;

const gallery = [
  "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80",
] as const;

const products = [
  {
    title: "Pomade Oil Based",
    description: "Hold kuat dengan karakter classic look yang tahan lama.",
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Pomade Water Based",
    description: "Mudah dibersihkan, cocok untuk penggunaan harian.",
    image:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Merchandise",
    description: "Produk official barbershop dengan desain casual.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Perfume",
    description: "Wangi maskulin untuk melengkapi tampilan fresh.",
    image:
      "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=800&q=80",
  },
] as const;

const outlets = [
  "Jl. Ahmad Yani, Santren, Rengel, Tuban",
  "Kapas, Bojonegoro",
] as const;

const heroSlides = [
  {
    eyebrow: "Selamat Datang Di Barokah Barbershop",
    title: "Style Rapi Untuk Pria Yang Mau Tampil Lebih Berkelas",
    description:
      "Kami hadirkan pengalaman cukur modern dengan barber berpengalaman, suasana nyaman, dan hasil akhir yang presisi untuk aktivitas harian maupun momen spesial.",
    image:
      "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1800&q=80",
    accent: "Precision Cut",
    stats: ["Haircut modern & classic", "Ruang nyaman dan bersih", "Styling akhir lebih rapi"],
  },
  {
    eyebrow: "Perawatan Rambut Pria",
    title: "Lebih Dari Potong Rambut Ini Tentang Pengalaman Grooming Lengkap",
    description:
      "Dari konsultasi model sampai finishing pomade, setiap sesi dirancang supaya pelanggan merasa fresh, percaya diri, dan tetap cocok dengan karakter wajahnya.",
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1800&q=80",
    accent: "Premium Care",
    stats: ["Konsultasi style personal", "Shampoo dan vitamin rambut", "Cocok untuk dewasa dan kids"],
  },
  {
    eyebrow: "Booking Lebih Mudah",
    title: "Masuk Dengan Tampilan Baru Keluar Dengan Kepercayaan Diri Baru",
    description:
      "Atur jadwal cukur tanpa ribet lewat booking online atau WhatsApp. Datang sesuai waktu, duduk santai, dan biarkan tim kami merapikan penampilan Anda.",
    image:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1800&q=80",
    accent: "Easy Booking",
    stats: ["Reservasi cepat", "Minim antre", "Siap untuk agenda penting"],
  },
] as const;

const navItems = [
  { href: "#home", label: "Home" },
  { href: "#profil", label: "Profil" },
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#ourproduct", label: "Our Product" },
  { href: "#franchise", label: "Franchise" },
] as const;

function BookingDropdown({
  bookingLinks,
  className,
  panelClassName,
  summaryClassName,
}: {
  bookingLinks: readonly {
    href: string;
    label: string;
    isExternal: boolean;
  }[];
  className: string;
  panelClassName: string;
  summaryClassName: string;
}) {
  return (
    <details className={`group relative ${className}`}>
      <summary
        className={`inline-flex list-none items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 cursor-pointer ${summaryClassName}`}
      >
        <span>Booking</span>
      </summary>

      <div
        role="menu"
        className={`absolute top-full mt-3 overflow-hidden rounded-2xl border border-amber-200/15 bg-[#17120d]/98 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur ${panelClassName}`}
      >
        {bookingLinks.map((item) =>
          item.isExternal ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 text-left text-sm font-semibold text-white/90 transition hover:bg-amber-500 hover:text-black"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="block w-full px-4 py-3 text-left text-sm font-semibold text-white/90 transition hover:bg-amber-500 hover:text-black"
            >
              {item.label}
            </Link>
          )
        )}
      </div>
    </details>
  );
}

export default function Home() {
  const phone = "6287749105273";
  const message = encodeURIComponent("Halo, saya mau booking cukur rambut.");
  const waLink = `https://wa.me/${phone}?text=${message}`;
  const bookingLinks = [
    { href: "/booking", label: "Booking Sekarang", isExternal: false },
    { href: waLink, label: "Booking via WhatsApp", isExternal: true },
  ] as const;

  return (
    <main className="bg-[#111111] text-white font-sans">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            <a href="#home" className="flex shrink-0 items-center gap-3 pr-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/60 bg-amber-400/20 text-sm font-bold text-amber-200">
                BB
              </span>
              <span>
                <strong className={`${logoFont.className} block text-lg leading-tight tracking-[0.04em] md:text-[1.7rem]`}>
                  Barokah Barbershop
                </strong>
                <span className="block text-[11px] text-white/60 md:text-sm">Official Style Landing</span>
              </span>
            </a>

            <div className={`${menuFont.className} hidden flex-1 items-center justify-end gap-7 text-[1.15rem] tracking-wide lg:flex xl:gap-9`}>
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-white/85 transition hover:text-amber-300">
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <BookingDropdown
                bookingLinks={bookingLinks}
                className=""
                panelClassName="right-0 z-[60] w-60"
                summaryClassName=""
              />
            </div>
          </div>

          <div className="mt-4 space-y-3 lg:hidden">
            <BookingDropdown
              bookingLinks={bookingLinks}
              className="block w-full"
              panelClassName="left-0 z-[60] w-full"
              summaryClassName="flex w-full"
            />

            <div className={`${menuFont.className} flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-base tracking-wide`}>
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-white/80 transition hover:text-amber-300">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <HomeHeroCarousel
        slides={heroSlides}
        menuFontClassName={menuFont.className}
        waLink={waLink}
      />

      <section id="profil" className="scroll-mt-24 bg-[#f8f8f8] py-24 text-center text-[#141414]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto inline-flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#141414] text-3xl font-bold">
            BB
          </div>
          <h2 className={`${menuFont.className} mt-6 text-5xl font-bold uppercase md:text-6xl`}>
            BAROKAH BARBERSHOP
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#434343] md:text-base">
            Barokah Barbershop adalah layanan potong rambut dan perawatan rambut khusus pria dewasa, remaja, dan anak-anak.
            Kami berkomitmen menghadirkan pelayanan terbaik, kualitas konsisten, dan pengalaman grooming yang nyaman.
          </p>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 bg-[#141414] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className={`${menuFont.className} text-5xl font-bold md:text-6xl`}>Service dan Harga Kami</h2>
            <p className="mt-3 text-white/70">
              Beragam service dengan kualitas dan harga terbaik untuk anda
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.name}
                className={`rounded-xl border p-6 ${
                  index === 2
                    ? "border-amber-300/60 bg-amber-300/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <h3 className="text-2xl font-semibold">{service.name}</h3>
                <p className="mt-2 text-amber-300">{service.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {service.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-24 bg-[#f5f5f5] py-24 text-[#111]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className={`${menuFont.className} text-5xl font-bold md:text-6xl`}>Our Gallery</h2>
            <p className="mt-3 text-[#444]">Galeri foto dari Barokah Barbershop</p>
          </div>
          <GalleryLightbox images={gallery} />
        </div>
      </section>

      <section id="ourproduct" className="scroll-mt-24 bg-[#141414] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">List Menu</p>
            <h2 className={`${menuFont.className} mt-2 text-5xl font-bold md:text-6xl`}>Hair and Body Treatment</h2>
            <p className="mt-3 text-white/70">
              Produk pendukung untuk menjaga rambut tetap dalam tampilan terbaik.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.title} className="text-center">
                <img
                  src={product.image}
                  alt={product.title}
                  className="mx-auto h-44 w-44 rounded-full border border-white/20 object-cover"
                />
                <h3 className="mt-5 text-lg font-semibold">{product.title}</h3>
                <p className="mt-2 text-sm text-white/75">{product.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="franchise"
        className="scroll-mt-24 bg-cover bg-center py-28 text-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,10,10,0.65), rgba(10,10,10,0.75)), url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <h2 className={`${menuFont.className} text-5xl font-bold uppercase md:text-6xl`}>Franchise Opportunity</h2>
          <p className="mt-4 text-white/85">
            Peluang untuk bergabung dan bermitra dengan Barokah Barbershop terbuka lebar.
          </p>
        </div>
      </section>

      <footer className="bg-[#0d0d0d] py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <section>
            <iframe
              src="https://www.google.com/maps?q=-7.330272194709938,112.68222121477523&z=15&output=embed"
              className="h-72 w-full rounded-lg border border-white/10"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Barokah Map"
            />
          </section>
          <section>
            <h3 className="text-lg font-bold">Information</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>FAQs</li>
              <li>Privacy</li>
              <li>Terms Condition</li>
            </ul>
            <p className="mt-6 text-sm text-white/75">
              Telepon: +62 857-3177-5939
              <br />
              Email: munir@gmail.com
            </p>
          </section>
          <section>
            <h3 className="text-lg font-bold">BAROKAH BARBERSHOP OUTLET</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              {outlets.map((outlet) => (
                <li key={outlet}>• {outlet}</li>
              ))}
            </ul>
          </section>
        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 px-6 text-center sm:flex-row sm:gap-5">
          <p className="text-sm text-white/50">
            Copyright © {new Date().getFullYear()} Barokah Barbershop.
          </p>
          <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden="true" />
          <Link
            href="/login"
            className="text-sm font-medium text-amber-200/80 transition hover:text-amber-300"
          >
            Owner Login
          </Link>
        </div>
      </footer>
    </main>
  );
}
