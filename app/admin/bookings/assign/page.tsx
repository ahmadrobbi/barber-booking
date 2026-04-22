import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AssignBookingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Legacy Tool</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Assign Booking Manual
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Halaman ini dipertahankan hanya sebagai alat migrasi untuk data lama. Flow booking tenant-aware yang baru
          seharusnya langsung menyimpan booking ke owner dan channel yang benar tanpa proses assign manual.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <p>Tool assign manual sudah dikeluarkan dari menu utama agar tidak dipakai sebagai alur operasional normal.</p>
          <p>Jika Anda masih memiliki booking lama yang belum punya `user_id` atau `channel_id`, sebaiknya migrasikan datanya lewat SQL atau skrip satu kali, bukan dari dashboard harian.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/bookings"
            className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Kembali ke daftar booking
          </Link>
          <Link
            href="/admin/settings/webhook"
            className="rounded-2xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Periksa channel WhatsApp
          </Link>
        </div>
      </section>
    </div>
  );
}
