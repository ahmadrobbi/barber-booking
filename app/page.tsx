import Link from "next/link";

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
  "https://images.unsplash.com/photo-1512690459411-b0fd1c86b8a8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1593702288056-f8fd3d74c46d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1621605816051-9f0ecf7b2b8f?auto=format&fit=crop&w=900&q=80",
] as const;

const products = [
  {
    title: "Pomade Oil Based",
    description: "Hold kuat dengan karakter classic look yang tahan lama.",
    image:
      "https://images.unsplash.com/photo-1621605816051-9f0ecf7b2b8f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Pomade Water Based",
    description: "Mudah dibersihkan, cocok untuk penggunaan harian.",
    image:
      "https://images.unsplash.com/photo-1621605816202-9699ad9f7cdb?auto=format&fit=crop&w=800&q=80",
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
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
  },
] as const;

const outlets = [
  "DANKE 1.0 - Jl. Klumprik PDAM 30, Wiyung, Surabaya Barat",
  "DANKE 2.0 - Jl. Griya Kebraon Selatan II 24-B, Karang Pilang",
  "DANKE 3.0 - Jl. Raya Tenggilis 133A, Surabaya Timur",
] as const;

export default function Home() {
  const phone = "6287749105273";
  const message = encodeURIComponent("Halo, saya mau booking cukur rambut.");
  const waLink = `https://wa.me/${phone}?text=${message}`;

  return (
    <main className="bg-[#111111] text-white font-sans">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#home" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/60 bg-amber-400/20 font-bold text-amber-200">
              DB
            </span>
            <span>
              <strong className="block text-base leading-tight">DANKE Barbershop</strong>
              <span className="block text-xs text-white/60">Official Style Landing</span>
            </span>
          </a>

          <div className="hidden items-center gap-6 text-sm md:flex">
            <a href="#home" className="text-white/85 hover:text-amber-300">Home</a>
            <a href="#profil" className="text-white/85 hover:text-amber-300">Profil</a>
            <a href="#services" className="text-white/85 hover:text-amber-300">Services</a>
            <a href="#gallery" className="text-white/85 hover:text-amber-300">Gallery</a>
            <a href="#ourproduct" className="text-white/85 hover:text-amber-300">Our Product</a>
            <a href="#franchise" className="text-white/85 hover:text-amber-300">Franchise</a>
          </div>
        </nav>
      </header>

      <section
        id="home"
        className="relative min-h-[82vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(9,9,9,0.65), rgba(9,9,9,0.75)), url('https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="mx-auto flex min-h-[82vh] max-w-6xl items-center justify-center px-6 text-center">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300/90">
              Selamat Datang Di DANKE Barbershop
            </p>
            <h1 className="mt-4 text-4xl font-bold uppercase md:text-6xl">
              Pilihan Terbaik Untuk Merubah Penampilan Anda
            </h1>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={waLink} className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-black hover:bg-amber-400">
                Booking Sekarang
              </a>
              <Link
                href="/admin"
                className="rounded-md border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Login Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="profil" className="scroll-mt-24 bg-[#f8f8f8] py-20 text-center text-[#141414]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto inline-flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#141414] text-3xl font-bold">
            DB
          </div>
          <h2 className="mt-6 text-4xl font-bold uppercase">DANKE BARBERSHOP</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#434343] md:text-base">
            DANKE Barbershop adalah layanan potong rambut dan perawatan rambut khusus pria dewasa, remaja, dan anak-anak.
            Kami berkomitmen menghadirkan pelayanan terbaik, kualitas konsisten, dan pengalaman grooming yang nyaman.
          </p>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 bg-[#141414] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold">Service dan Harga Kami</h2>
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

      <section id="gallery" className="scroll-mt-24 bg-[#f5f5f5] py-20 text-[#111]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold">Our Gallery</h2>
            <p className="mt-3 text-[#444]">Galeri foto dari DANKE Barbershop</p>
          </div>
          <div className="mt-10 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((image, i) => (
              <figure key={image} className="group relative h-56 overflow-hidden">
                <img
                  src={image}
                  alt={`Gallery danke ${i + 1}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-sm text-white">
                  Danke • Gallery
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="ourproduct" className="scroll-mt-24 bg-[#141414] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">List Menu</p>
            <h2 className="mt-2 text-4xl font-bold">Hair and Body Treatment</h2>
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
        className="scroll-mt-24 bg-cover bg-center py-24 text-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,10,10,0.65), rgba(10,10,10,0.75)), url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-bold uppercase">Franchise Opportunity</h2>
          <p className="mt-4 text-white/85">
            Peluang untuk bergabung dan bermitra dengan DANKE Barbershop terbuka lebar.
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
              title="Danke Map"
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
              Telepon: (031) 7675193
              <br />
              Email: dankebarber@gmail.com
            </p>
          </section>
          <section>
            <h3 className="text-lg font-bold">DANKE BARBERSHOP OUTLET</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              {outlets.map((outlet) => (
                <li key={outlet}>• {outlet}</li>
              ))}
            </ul>
          </section>
        </div>
        <p className="mt-12 text-center text-sm text-white/50">
          Copyright © {new Date().getFullYear()} DANKE Barbershop.
        </p>
      </footer>
    </main>
  );
}
