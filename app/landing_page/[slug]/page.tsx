import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicLandingPageContextBySlug } from "@/lib/tenant-context";

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
  const landing = await getPublicLandingPageContextBySlug(slug);

  if (!landing) {
    notFound();
  }

  const whatsappLink = buildWhatsappLink(landing.whatsappNumber, landing.businessName);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_22%),linear-gradient(180deg,_#f8f4ec,_#ffffff)] px-6 py-8 text-stone-900 md:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4 rounded-[1.75rem] border border-stone-200/80 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-4">
            {landing.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={landing.logoUrl}
                alt={landing.businessName}
                className="h-14 w-14 rounded-2xl border border-stone-200 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-950 text-lg font-bold text-amber-300">
                {landing.businessName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-stone-500">Profil Usaha</p>
              <h1 className="mt-1 text-xl font-semibold text-stone-950 md:text-2xl">
                {landing.businessName}
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href={`/b/${landing.slug}`}
              className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-sm"
            >
              Booking Sekarang
            </Link>
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm"
              >
                Chat WhatsApp
              </a>
            ) : null}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[2.25rem] border border-stone-200 bg-stone-950 px-8 py-10 text-white shadow-2xl shadow-stone-900/10">
            <div className="pointer-events-none absolute -right-16 top-0 h-52 w-52 rounded-full bg-amber-400/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

            <p className="relative text-xs uppercase tracking-[0.3em] text-amber-300/70">Tentang Kami</p>
            <h2 className="relative mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              {landing.businessName}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-8 text-white/75">
              {landing.businessDescription}
            </p>

            <div className="relative mt-8 flex flex-wrap gap-3 md:hidden">
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

            <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">Booking Publik</p>
                <p className="mt-2 text-sm leading-7 text-white/75">
                  Pelanggan bisa booking langsung tanpa perlu bikin akun dulu.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">Jumlah Cabang</p>
                <p className="mt-2 text-3xl font-semibold text-amber-200">
                  {landing.branches.length}
                </p>
              </div>
            </div>

            <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
              {landing.websiteUrl ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">Website</p>
                  <a
                    href={landing.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all text-sm font-medium text-amber-200 hover:text-amber-100"
                  >
                    {landing.websiteUrl}
                  </a>
                </div>
              ) : null}
              {landing.whatsappNumber ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">WhatsApp</p>
                  <p className="mt-2 text-sm font-medium text-white">{landing.whatsappNumber}</p>
                </div>
              ) : null}
              {landing.instagram ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">Instagram</p>
                  <p className="mt-2 text-sm font-medium text-white">{landing.instagram}</p>
                </div>
              ) : null}
              {landing.facebook ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">Facebook</p>
                  <p className="mt-2 text-sm font-medium text-white">{landing.facebook}</p>
                </div>
              ) : null}
            </div>
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
          </section>
        </div>
      </div>
    </main>
  );
}
