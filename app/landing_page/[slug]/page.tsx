import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicLandingPageContextBySlug,
  getPublicTenantContextBySlug,
} from "@/lib/tenant-context";

function buildWhatsappLink(phone: string | null, businessName: string) {
  if (!phone) {
    return null;
  }

  const message = encodeURIComponent(`Halo, saya mau booking di ${businessName}.`);
  return `https://wa.me/${phone}?text=${message}`;
}

type LandingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const landing = await getPublicLandingPageContextBySlug(slug);

  if (!landing) {
    return {
      title: "Profil Usaha Tidak Ditemukan | AntriFlow",
      description: "Halaman profil usaha yang Anda cari tidak tersedia.",
    };
  }

  const title = `${landing.businessName} | Booking Barbershop`;
  const description = landing.businessDescription;
  const image = landing.logoUrl ? [landing.logoUrl] : undefined;
  const canonicalPath = `/landing_page/${landing.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalPath,
      images: image,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image,
    },
  };
}

export default async function PublicLandingPage({ params }: LandingPageProps) {
  const { slug } = await params;
  const [landing, tenant] = await Promise.all([
    getPublicLandingPageContextBySlug(slug),
    getPublicTenantContextBySlug(slug),
  ]);

  if (!landing || !tenant) {
    notFound();
  }

  const whatsappLink = buildWhatsappLink(landing.whatsappNumber, landing.businessName);

  const testimonials = [
    {
      name: "Pelanggan rutin",
      quote:
        "Enak karena tinggal pilih layanan dan waktu yang tersedia. Nggak perlu chat panjang dulu untuk tanya slot.",
    },
    {
      name: "Pengunjung akhir pekan",
      quote:
        "Halaman profil usahanya jelas, jadi lebih yakin mau booking dan tahu cabang mana yang sedang aktif.",
    },
    {
      name: "Pelanggan baru",
      quote:
        "Link booking dan WhatsApp-nya langsung kelihatan. Praktis buat yang mau booking cepat tanpa ribet.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-20 text-white md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20"></div>
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Barbershop Premium</p>
                <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                  {landing.businessName}
                </h1>
                <p className="text-xl leading-relaxed text-slate-300 md:text-2xl">
                  {landing.businessDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/b/${landing.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-900 transition hover:bg-amber-400 hover:scale-105"
                >
                  Booking Sekarang
                </Link>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:scale-105"
                  >
                    Chat WhatsApp
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">{tenant.services.length}</div>
                  <div className="text-sm text-slate-400">Layanan</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">{landing.branches.length}</div>
                  <div className="text-sm text-slate-400">Cabang</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">24/7</div>
                  <div className="text-sm text-slate-400">Booking</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {landing.logoUrl ? (
                <div className="relative mx-auto w-80 h-80">
                  <img
                    src={landing.logoUrl}
                    alt={landing.businessName}
                    className="w-full h-full rounded-full object-cover shadow-2xl border-8 border-amber-400/20"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                </div>
              ) : (
                <div className="relative mx-auto flex h-80 w-80 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl">
                  <span className="text-8xl font-bold text-slate-900">
                    {landing.businessName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">Tentang Kami</p>
                <h2 className="mt-4 text-4xl font-bold text-slate-900 md:text-5xl">
                  Cerita di Balik {landing.businessName}
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-slate-600">
                {landing.businessDescription}
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-6">
                  <div className="text-3xl font-bold text-amber-600 mb-2">{landing.branches.length}</div>
                  <div className="text-sm font-semibold text-slate-900">Cabang Aktif</div>
                  <div className="text-sm text-slate-600">Siap melayani Anda</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-6">
                  <div className="text-3xl font-bold text-amber-600 mb-2">{tenant.services.length}</div>
                  <div className="text-sm font-semibold text-slate-900">Layanan Professional</div>
                  <div className="text-sm text-slate-600">Hasil maksimal terjamin</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 p-8 shadow-2xl">
                <div className="h-full w-full rounded-2xl bg-slate-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">✂️</div>
                    <div className="text-xl font-semibold">Professional Service</div>
                    <div className="text-sm opacity-80 mt-2">Since 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">Layanan Kami</p>
            <h2 className="mt-4 text-4xl font-bold text-slate-900 md:text-5xl">
              Pilihan Layanan Premium
            </h2>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
              Kami menyediakan berbagai layanan grooming dan perawatan dengan standar profesional tertinggi
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tenant.services.slice(0, 6).map((service, index) => (
              <div key={service.code} className="group relative">
                <div className="rounded-3xl bg-white p-8 shadow-lg transition hover:shadow-2xl hover:-translate-y-2">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                    {index === 0 ? '✂️' : index === 1 ? '💇' : index === 2 ? '🪒' : index === 3 ? '💆' : index === 4 ? '✨' : '🎨'}
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-slate-900">{service.name}</h3>
                  <p className="mb-6 text-slate-600 leading-relaxed">
                    {service.description || "Layanan grooming dan perawatan yang disiapkan untuk hasil lebih rapi dan nyaman."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-amber-600">
                      Rp{service.price.toLocaleString("id-ID")}
                    </div>
                    <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                      {service.duration_minutes} min
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={`/b/${landing.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 hover:scale-105"
            >
              Lihat Semua Layanan
            </Link>
          </div>
        </div>
      </section>

      {/* Work Process Section */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">Proses Kerja</p>
            <h2 className="mt-4 text-4xl font-bold text-slate-900 md:text-5xl">
              Cara Booking di {landing.businessName}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-3xl font-bold text-white shadow-lg">
                  1
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-400"></div>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900">Pilih Layanan</h3>
              <p className="text-slate-600 leading-relaxed">
                Pilih layanan yang Anda inginkan dari berbagai pilihan yang tersedia di platform kami
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-3xl font-bold text-white shadow-lg">
                  2
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-400"></div>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900">Tentukan Waktu</h3>
              <p className="text-slate-600 leading-relaxed">
                Pilih tanggal dan waktu yang sesuai dengan jadwal Anda dari slot yang tersedia
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-3xl font-bold text-white shadow-lg">
                  3
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-400"></div>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900">Konfirmasi Booking</h3>
              <p className="text-slate-600 leading-relaxed">
                Booking Anda akan dikonfirmasi dan Anda akan menerima reminder otomatis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400 font-semibold">Testimoni</p>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Apa Kata Pelanggan Kami
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <div key={index} className="rounded-3xl bg-white/5 p-8 backdrop-blur-sm border border-white/10">
                <div className="mb-6 flex text-amber-400">
                  {'★'.repeat(5)}
                </div>
                <p className="mb-6 text-lg leading-relaxed text-white/90">
                  "{item.quote}"
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-sm text-white/60">Pelanggan</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">Lokasi Kami</p>
            <h2 className="mt-4 text-4xl font-bold text-slate-900 md:text-5xl">
              Cabang {landing.businessName}
            </h2>
            <p className="mt-6 text-lg text-slate-600">
              Kunjungi cabang terdekat Anda untuk pengalaman terbaik
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {landing.branches.map((branch) => (
              <div key={branch.id ?? branch.code ?? branch.name} className="group">
                <div className="rounded-3xl bg-slate-50 p-8 transition hover:shadow-xl hover:-translate-y-1">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                    📍
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-slate-900">{branch.name}</h3>
                  <p className="mb-4 text-slate-600 leading-relaxed">
                    {branch.address || "Alamat cabang belum diisi."}
                  </p>
                  {branch.phone && (
                    <p className="mb-6 text-amber-600 font-semibold">
                      📞 {branch.phone}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                      🟢 Aktif
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-400 font-semibold">Hubungi Kami</p>
                <h2 className="mt-4 text-4xl font-bold md:text-5xl">
                  Siap untuk Pengalaman Terbaik?
                </h2>
                <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                  Booking sekarang dan rasakan pelayanan profesional dari tim kami
                </p>
              </div>

              <div className="space-y-4">
                {landing.whatsappNumber && (
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-900">
                      💬
                    </div>
                    <div>
                      <div className="font-semibold">WhatsApp</div>
                      <div className="text-slate-300">{landing.whatsappNumber}</div>
                    </div>
                  </div>
                )}
                {landing.websiteUrl && (
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-900">
                      🌐
                    </div>
                    <div>
                      <div className="font-semibold">Website</div>
                      <div className="text-slate-300">{landing.websiteUrl}</div>
                    </div>
                  </div>
                )}
                {landing.instagram && (
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-900">
                      📸
                    </div>
                    <div>
                      <div className="font-semibold">Instagram</div>
                      <div className="text-slate-300">@{landing.instagram}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/b/${landing.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-900 transition hover:bg-amber-400 hover:scale-105"
                >
                  Booking Sekarang
                </Link>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:scale-105"
                  >
                    Chat WhatsApp
                  </a>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 p-8 backdrop-blur-sm border border-white/10">
                <div className="h-full w-full rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <div className="text-xl font-semibold text-white">Ready to Serve</div>
                    <div className="text-sm text-slate-300 mt-2">Your satisfaction is our priority</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{landing.businessName}</h3>
              <p className="text-slate-400 leading-relaxed">
                Barbershop premium dengan pelayanan profesional dan hasil maksimal.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Layanan</h4>
              <div className="space-y-2 text-slate-400">
                {tenant.services.slice(0, 4).map((service) => (
                  <div key={service.code}>{service.name}</div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Cabang</h4>
              <div className="space-y-2 text-slate-400">
                {landing.branches.slice(0, 4).map((branch) => (
                  <div key={branch.id ?? branch.code ?? branch.name}>{branch.name}</div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Kontak</h4>
              <div className="space-y-2 text-slate-400">
                {landing.whatsappNumber && <div>WhatsApp: {landing.whatsappNumber}</div>}
                {landing.websiteUrl && <div>Website: {landing.websiteUrl}</div>}
                {landing.instagram && <div>Instagram: @{landing.instagram}</div>}
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 {landing.businessName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}