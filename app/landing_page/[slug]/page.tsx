import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessLandingCarousel } from "@/components/business-landing-carousel";
import {
  getPublicLandingPageContextBySlug,
  getPublicTenantContextBySlug,
} from "@/lib/tenant-context";

type LandingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

function buildWhatsappLink(phone: string | null, businessName: string) {
  if (!phone) {
    return null;
  }

  const message = encodeURIComponent(`Halo, saya mau booking di ${businessName}.`);
  return `https://wa.me/${phone}?text=${message}`;
}

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
  const carouselSlides = [
    {
      eyebrow: "Profil Usaha",
      title: `Booking ${landing.businessName} lebih cepat dan lebih rapi.`,
      description:
        "Pelanggan bisa langsung lihat profil usaha, pilih cabang aktif, lalu lanjut booking dengan alur yang sederhana.",
      accent: "Siap dibagikan ke WhatsApp, Instagram, dan Google Business",
      stats: [
        `${tenant.services.length} layanan aktif`,
        `${landing.branches.length} cabang ditampilkan`,
        "Booking tanpa akun pelanggan",
      ],
    },
    {
      eyebrow: "Layanan Utama",
      title: "Pilih layanan, tentukan waktu, lalu biarkan sistem yang merapikan prosesnya.",
      description:
        "Slot booking mengikuti jam operasional bisnis dan cabang, jadi pelanggan tidak perlu bolak-balik tanya jadwal yang tersedia.",
      accent: "Cocok untuk barbershop yang ingin tetap rapi walau order masuk dari WhatsApp",
      stats: [
        "Slot branch-aware",
        "Reminder WhatsApp otomatis",
        "Status booking mudah dipantau",
      ],
    },
    {
      eyebrow: "Cabang Aktif",
      title: "Satu link untuk mengenalkan bisnis dan mengarahkan pelanggan ke jalur booking yang benar.",
      description:
        "Halaman publik ini menjadi pintu masuk yang lebih meyakinkan untuk calon pelanggan sebelum mereka lanjut ke booking atau chat WhatsApp.",
      accent: "Profil usaha sederhana, tapi cukup kuat untuk dibagikan sekarang juga",
      stats: [
        landing.websiteUrl ? "Website terhubung" : "Website opsional",
        landing.whatsappNumber ? "WhatsApp siap dihubungi" : "Kontak bisa ditambahkan",
        "Mobile friendly",
      ],
    },
  ];
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_22%),linear-gradient(180deg,_#f8f4ec,_#ffffff)] px-6 py-8 text-stone-900 md:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-[2.25rem] border border-stone-200 bg-white/95 p-8 shadow-2xl backdrop-blur-sm md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {landing.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={landing.logoUrl}
                    alt={landing.businessName}
                    className="h-16 w-16 rounded-3xl border border-stone-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-950 text-xl font-bold text-amber-300">
                    {landing.businessName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Profil Usaha</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950 md:text-5xl">
                    {landing.businessName}
                  </h1>
                </div>
              </div>

              <p className="max-w-3xl text-lg leading-8 text-stone-700 md:text-xl">
                {landing.businessDescription}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/b/${landing.slug}`}
                  className="inline-flex items-center justify-center rounded-3xl bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Booking Sekarang
                </Link>
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-3xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    Chat WhatsApp
                  </a>
                ) : null}
                {landing.websiteUrl ? (
                  <a
                    href={landing.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-3xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    Kunjungi Website
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-white shadow-lg">
                <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">Informasi Cepat</p>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-[1.75rem] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Cabang Aktif</p>
                    <p className="mt-2 text-3xl font-semibold">{landing.branches.length}</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Layanan Tersedia</p>
                    <p className="mt-2 text-3xl font-semibold">{tenant.services.length}</p>
                  </div>
                  {landing.whatsappNumber ? (
                    <div className="rounded-[1.75rem] bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-stone-300">WhatsApp</p>
                      <p className="mt-2 text-3xl font-semibold">Siap Terhubung</p>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Kekuatan Profil</p>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  Halaman ini dirancang untuk menampilkan bisnis Anda sebagai company profile modern yang mudah dibagikan ke pelanggan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <BusinessLandingCarousel
          businessName={landing.businessName}
          bookingHref={`/b/${landing.slug}`}
          whatsappHref={whatsappLink}
          slides={carouselSlides}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Tentang Kami</p>
              <h3 className="mt-4 text-3xl font-semibold text-stone-950">
                Profil {landing.businessName}
              </h3>
              <p className="mt-4 text-base leading-8 text-stone-600">
                {landing.businessDescription}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Booking Publik</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Pelanggan bisa booking langsung tanpa perlu bikin akun dulu.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Jumlah Cabang</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-950">
                    {landing.branches.length}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Layanan</p>
              <h3 className="mt-4 text-3xl font-semibold text-stone-950">Pilihan Layanan Populer</h3>
              <p className="mt-3 text-sm leading-7 text-stone-500">
                Semua layanan ini bisa langsung dipilih saat pelanggan lanjut ke halaman booking.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {tenant.services.slice(0, 6).map((service) => (
                  <article
                    key={service.code}
                    className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-stone-950">{service.name}</h4>
                        <p className="mt-2 text-sm leading-7 text-stone-600">
                          {service.description || "Layanan grooming dan perawatan yang disiapkan untuk hasil lebih rapi dan nyaman."}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                        {service.duration_minutes} menit
                      </span>
                    </div>
                    <p className="mt-4 text-base font-semibold text-stone-900">
                      Rp{service.price.toLocaleString("id-ID")}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Testimoni</p>
              <h3 className="mt-4 text-3xl font-semibold text-stone-950">Cerita Pengunjung</h3>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {testimonials.map((item) => (
                  <article
                    key={item.name}
                    className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-5"
                  >
                    <p className="text-sm leading-7 text-stone-600">“{item.quote}”</p>
                    <p className="mt-4 text-sm font-semibold text-stone-950">{item.name}</p>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="space-y-6">
            <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Cara Booking</p>
              <h3 className="mt-4 text-3xl font-semibold text-stone-950">Pilih Jalur yang Paling Nyaman</h3>
              <div className="mt-6 grid gap-4">
                <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-stone-950">1. Form Booking Publik</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Pilih layanan, tanggal, dan jam yang tersedia lewat form booking publik.
                  </p>
                </article>
                <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-stone-950">2. Chat WhatsApp Bisnis</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Lebih suka lewat chat? Langsung booking via WhatsApp dengan alur chatbot yang sudah disiapkan.
                  </p>
                </article>
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Cabang Aktif</p>
              <h3 className="mt-4 text-3xl font-semibold text-stone-950">Kunjungi Outlet Kami</h3>
              <p className="mt-3 text-sm leading-7 text-stone-500">
                Pilih outlet yang paling dekat atau paling nyaman untuk Anda kunjungi.
              </p>

              <div className="mt-8 space-y-4">
                {landing.branches.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-6 text-sm text-stone-500">
                    Cabang belum ditampilkan. Silakan hubungi bisnis langsung untuk informasi outlet.
                  </div>
                ) : (
                  landing.branches.map((branch) => (
                    <article
                      key={branch.id ?? branch.code ?? branch.name}
                      className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-semibold text-stone-900">{branch.name}</h4>
                          <p className="mt-2 text-sm leading-7 text-stone-600">
                            {branch.address || "Alamat cabang belum diisi."}
                          </p>
                          {branch.phone ? (
                            <p className="mt-2 text-sm font-medium text-stone-700">
                              Telp: {branch.phone}
                            </p>
                          ) : null}
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          Aktif
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-white shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Kontak & Footer</p>
              <h3 className="mt-4 text-3xl font-semibold">{landing.businessName}</h3>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Bagikan halaman ini sebagai profil usaha sederhana dan arahkan pelanggan langsung ke jalur booking yang paling cocok.
              </p>

              <div className="mt-8 space-y-3 text-sm text-white/75">
                {landing.whatsappNumber ? <p>WhatsApp: {landing.whatsappNumber}</p> : null}
                {landing.websiteUrl ? <p>Website: {landing.websiteUrl}</p> : null}
                {landing.instagram ? <p>Instagram: {landing.instagram}</p> : null}
                {landing.facebook ? <p>Facebook: {landing.facebook}</p> : null}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/b/${landing.slug}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-sm"
                >
                  Booking Sekarang
                </Link>
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-sm"
                  >
                    Chat WhatsApp
                  </a>
                ) : null}
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
