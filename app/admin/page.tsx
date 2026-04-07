import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatPrice, getAllBookings, groupBookingsByDate } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const bookings = await getAllBookings();
  const groupedEntries = groupBookingsByDate(bookings);
  const total = bookings.length;
  const confirmed = bookings.filter((booking) => booking.status === "confirmed").length;
  const pending = bookings.filter((booking) => booking.status === "pending").length;
  const omzet = bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((sum, booking) => sum + (booking.harga ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Owner Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Pantau transaksi booking dan alur operasional barber dari satu tempat.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Dashboard ini difokuskan untuk owner. Booking publik, WhatsApp webhook, dan transaksi terbaru semuanya mengalir ke sini agar kontrol operasional tetap rapi.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/settings/webhook"
            className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
          >
            Buka Setting Webhook
          </Link>
          <Link
            href="/admin/profile"
            className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Lihat Profil
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total Booking</p>
          <p className="mt-3 text-4xl font-semibold">{total}</p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Confirmed</p>
          <p className="mt-3 text-4xl font-semibold text-emerald-600">{confirmed}</p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Pending</p>
          <p className="mt-3 text-4xl font-semibold text-amber-600">{pending}</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-stone-200 bg-[#fff8ef] p-5 shadow-sm xl:col-span-2">
          <p className="text-sm text-stone-500">Estimasi Omzet Confirmed</p>
          <p className="mt-3 text-4xl font-semibold">{formatPrice(omzet)}</p>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Nilai ini dihitung dari transaksi dengan status confirmed agar owner bisa melihat ringkasan pendapatan terkonfirmasi.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Sumber Booking</p>
          <p className="mt-3 text-lg font-semibold">Publik Form + WhatsApp</p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Webhook Status</p>
          <p className="mt-3 text-lg font-semibold">Kelola di menu setting</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Transaksi Booking</p>
              <h2 className="mt-3 text-2xl font-semibold">Daftar booking pelanggan</h2>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              {total} transaksi
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {groupedEntries.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-500">
                Belum ada transaksi booking yang masuk.
              </div>
            ) : (
              groupedEntries.map(([date, items]) => (
                <article key={date} className="rounded-[1.75rem] bg-stone-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">{date}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {items.length} booking
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-stone-900">{item.layanan}</p>
                            <p className="mt-1 text-sm text-stone-500">{item.sender}</p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                              item.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
                          <span>{item.jam}</span>
                          <span>{formatPrice(item.harga)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-[#f0dfc7] p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-600">Catatan Owner</p>
          <h2 className="mt-3 text-2xl font-semibold">Hal penting untuk dijaga</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-stone-700">
            <p>Booking publik akan masuk sebagai <strong>pending</strong> agar bisa diverifikasi dulu sebelum dianggap confirmed.</p>
            <p>Nomor WhatsApp pelanggan tersimpan pada field pengirim sehingga mudah dipakai untuk follow up manual atau reminder.</p>
            <p>Webhook Fonnte bisa kamu cek dan rapikan dari menu setting jika domain atau endpoint berubah.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
