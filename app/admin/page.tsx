import Link from "next/link";
import { AdminBookingCalendar } from "@/components/admin-booking-calendar";
import { AdminBookingFilters } from "@/components/admin-booking-filters";
import { requireAdmin } from "@/lib/auth";
import {
  filterBookingsByMonthYear,
  formatCalendarMonthYear,
  formatBookingDate,
  formatPrice,
  getAllBookings,
  getAvailableBookingYears,
  getFilterState,
  sortBookingsLatest,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  await requireAdmin();
  const bookings = await getAllBookings();
  const params = await searchParams;
  const { selectedMonth, selectedYear } = getFilterState(params, new Date());
  const filteredBookings = filterBookingsByMonthYear(
    bookings,
    selectedMonth,
    selectedYear
  );
  const sortedFilteredBookings = sortBookingsLatest(filteredBookings);
  const availableYears = getAvailableBookingYears(bookings, selectedYear);
  const total = filteredBookings.length;
  const confirmed = filteredBookings.filter((booking) => booking.status === "confirmed").length;
  const pending = filteredBookings.filter((booking) => booking.status === "pending").length;
  const omzet = filteredBookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((sum, booking) => sum + (booking.harga ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Owner Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Ringkasan booking {formatCalendarMonthYear(selectedMonth, selectedYear)}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Pantau performa bulanan, lihat persebaran booking per tanggal, dan cek transaksi terbaru dari satu dashboard yang lebih rapi.
        </p>
        <div className="mt-6">
          <AdminBookingFilters
            availableYears={availableYears}
            path="/admin"
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total Booking Bulan Ini</p>
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
        <article className="rounded-[1.75rem] border border-stone-200 bg-[#fff8ef] p-5 shadow-sm">
          <p className="text-sm text-stone-500">Omzet Confirmed</p>
          <p className="mt-3 text-4xl font-semibold">{formatPrice(omzet)}</p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <AdminBookingCalendar
          bookings={sortedFilteredBookings}
          month={selectedMonth}
          year={selectedYear}
        />

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Aktivitas Terbaru</p>
            <h2 className="mt-3 text-2xl font-semibold">List transaksi terbaru</h2>
          </div>

          <div className="mt-6 space-y-3">
            {sortedFilteredBookings.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
                Belum ada transaksi pada periode ini.
              </div>
            ) : (
              sortedFilteredBookings.slice(0, 8).map((item) => (
                <article key={item.id} className="rounded-[1.5rem] bg-stone-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">{item.layanan ?? "-"}</p>
                      <p className="mt-1 text-sm text-stone-500">{item.sender ?? "-"}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        item.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status ?? "-"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm text-stone-600">
                    <span>
                      {formatBookingDate(item.tanggal)} • {item.jam ?? "-"}
                    </span>
                    <span className="font-medium text-stone-900">{formatPrice(item.harga)}</span>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-6">
            <Link
              href={`/admin/bookings?month=${selectedMonth}&year=${selectedYear}`}
              className="inline-flex rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              Buka daftar booking lengkap
            </Link>
          </div>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Sumber Booking</p>
          <p className="mt-3 text-lg font-semibold">Publik Form + WhatsApp</p>
          <p className="mt-2 text-sm leading-7 text-stone-500">
            Semua angka pada dashboard mengikuti filter bulan dan tahun yang dipilih di atas.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Akses Cepat</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/admin/settings/webhook"
              className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Setting Webhook
            </Link>
            <Link
              href="/admin/profile"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              Profil Owner
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
