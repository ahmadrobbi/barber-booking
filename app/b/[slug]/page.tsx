import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBookingForm } from "@/components/public-booking-form";
import { getPublicTenantContextBySlug } from "@/lib/tenant-context";

type TenantBookingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function TenantBookingPage({ params }: TenantBookingPageProps) {
  const { slug } = await params;
  const tenant = await getPublicTenantContextBySlug(slug);

  if (!tenant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_25%),linear-gradient(180deg,_#111111,_#1c1917)] px-6 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-center">
          <Link href="/" className="w-fit text-sm uppercase tracking-[0.28em] text-amber-300/80">
            {tenant.businessName}
          </Link>
          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight md:text-6xl">
            Booking {tenant.businessName} dengan alur yang sudah menyesuaikan cabang dan layanan aktif.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Pilih cabang, layanan, tanggal, dan jam yang tersedia. Booking Anda akan langsung masuk ke dashboard owner yang terhubung dengan nomor WhatsApp bisnis ini.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
              <p>Slot akan dicek khusus untuk bisnis ini dan cabang yang dipilih, jadi tidak bentrok dengan tenant lain.</p>
            </article>
            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
              <p>Anda bisa isi nama pemesan langsung dari form, lalu owner menerima booking dengan status <strong className="text-amber-200">pending</strong>.</p>
            </article>
            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
              <p>Kalau bisnis ini punya banyak cabang, jadwal dan jam operasional akan mengikuti cabang yang dipilih.</p>
            </article>
            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
              <p>Anda juga bisa memilih beberapa layanan sekaligus, dan sistem akan menghitung total durasi serta total harga secara otomatis.</p>
            </article>
          </div>
          <div className="mt-6 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
            <p>Konfirmasi dan reminder berikutnya akan mengikuti channel WhatsApp yang terhubung ke akun bisnis ini.</p>
            {tenant.branches.length > 0 ? (
              <p>
                Tersedia <strong className="text-amber-200">{tenant.branches.length} cabang aktif</strong> yang bisa dipilih langsung dari form booking.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white p-8 text-stone-900 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-600">Public Booking</p>
          <h2 className="mt-3 text-3xl font-semibold">Form Pesanan</h2>
          <p className="mt-2 text-sm text-stone-500">
            Booking untuk {tenant.businessName}, tanpa akun pelanggan.
          </p>
          <div className="mt-8">
            <PublicBookingForm
              slug={tenant.slug}
              industry={tenant.industry}
              services={tenant.services}
              branches={tenant.branches}
              hasActiveChannel={Boolean(tenant.channelId)}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
