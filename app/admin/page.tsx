import Link from "next/link";
import { confirmPendingBooking } from "@/app/actions/admin-booking";
import { ConfirmBookingButton } from "@/components/confirm-booking-button";
import { requireAdmin } from "@/lib/auth";
import {
  filterBookingsByMonthYear,
  formatBookingDate,
  formatPrice,
  getAllBookings,
  getAvailableBookingYears,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";

const monthOptions = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
] as const;

function parseNumberFilter(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  await requireAdmin();
  const bookings = await getAllBookings();
  const params = await searchParams;
  const selectedMonth = parseNumberFilter(params.month);
  const selectedYear = parseNumberFilter(params.year);
  const filteredBookings = filterBookingsByMonthYear(
    bookings,
    selectedMonth,
    selectedYear
  );
  const availableYears = getAvailableBookingYears(bookings);
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

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Transaksi Booking</p>
            <h2 className="mt-3 text-2xl font-semibold">Daftar booking pelanggan</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
              Booking dari website akan masuk dengan status <strong>pending</strong> dan bisa langsung dikonfirmasi dari tabel di bawah.
            </p>
          </div>

          <form className="grid gap-3 rounded-[1.5rem] bg-stone-50 p-4 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-sm">
              <span className="mb-2 block text-stone-500">Bulan</span>
              <select
                name="month"
                defaultValue={selectedMonth?.toString() ?? ""}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400"
              >
                <option value="">Semua bulan</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-2 block text-stone-500">Tahun</span>
              <select
                name="year"
                defaultValue={selectedYear?.toString() ?? ""}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400"
              >
                <option value="">Semua tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2 sm:items-end">
              <button
                type="submit"
                className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Terapkan
              </button>
              <Link
                href="/admin"
                className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-600 transition hover:border-amber-300 hover:bg-amber-50"
              >
                Reset
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            {filteredBookings.length} transaksi tampil
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {filteredBookings.filter((item) => item.status === "pending").length} pending
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {filteredBookings.filter((item) => item.status === "confirmed").length} confirmed
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-stone-200">
          {filteredBookings.length === 0 ? (
            <div className="bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
              Belum ada transaksi pada filter bulan dan tahun yang dipilih.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-950 text-white">
                  <tr>
                    <th className="px-5 py-4 font-medium">Tanggal</th>
                    <th className="px-5 py-4 font-medium">Jam</th>
                    <th className="px-5 py-4 font-medium">Layanan</th>
                    <th className="px-5 py-4 font-medium">Pengirim</th>
                    <th className="px-5 py-4 font-medium">Harga</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {filteredBookings.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-5 py-4 text-stone-700">{formatBookingDate(item.tanggal)}</td>
                      <td className="px-5 py-4 text-stone-700">{item.jam ?? "-"}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-900">{item.layanan ?? "-"}</p>
                      </td>
                      <td className="px-5 py-4 text-stone-600">{item.sender ?? "-"}</td>
                      <td className="px-5 py-4 text-stone-700">{formatPrice(item.harga)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                            item.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status ?? "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {item.status === "pending" ? (
                          <form action={confirmPendingBooking.bind(null, item.id)}>
                            <ConfirmBookingButton />
                          </form>
                        ) : (
                          <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                            Sudah diproses
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
