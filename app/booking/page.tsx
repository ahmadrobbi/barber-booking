import Link from "next/link";
import { PublicBookingForm } from "@/components/public-booking-form";
import { getIndustryConfig, getBusinessName } from "@/lib/industry-config";
import { INDUSTRIES, type IndustryKey } from "@/lib/industries";

type BookingPageProps = {
  searchParams?: {
    industry?: string;
  };
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const config = await getIndustryConfig();
  const requestedIndustry = searchParams?.industry;
  const industry =
    requestedIndustry && Object.prototype.hasOwnProperty.call(INDUSTRIES, requestedIndustry)
      ? (requestedIndustry as IndustryKey)
      : config.default;
  const industryData = INDUSTRIES[industry];
  const businessName = await getBusinessName();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_25%),linear-gradient(180deg,_#111111,_#1c1917)] px-6 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-center">
          <Link href="/" className="w-fit text-sm uppercase tracking-[0.28em] text-amber-300/80">
            {businessName}
          </Link>
          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight md:text-6xl">
            Booking {businessName} secara langsung tanpa perlu buat akun.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Pelanggan cukup isi nomor WhatsApp, pilih layanan, tanggal, dan jam untuk {businessName.toLowerCase()}. Pesanan akan langsung masuk ke dashboard admin.
          </p>
          <div className="mt-8 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
            <p>Slot yang dipilih akan dicek dulu agar tidak bentrok dengan booking lain.</p>
            <p>Status awal pesanan adalah <strong className="text-amber-200">pending</strong> supaya admin bisa memproses dengan rapi.</p>
            <p>Untuk akses dashboard owner, gunakan halaman login admin.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white p-8 text-stone-900 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-600">Public Booking</p>
          <h2 className="mt-3 text-3xl font-semibold">Form Pesanan</h2>
          <p className="mt-2 text-sm text-stone-500">
            Booking tanpa akun, cepat untuk pelanggan, tetap mudah dipantau owner.
          </p>
          <div className="mt-8">
            <PublicBookingForm />
          </div>
        </section>
      </div>
    </main>
  );
}
