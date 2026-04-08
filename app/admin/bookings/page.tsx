import { AdminBookingFilters } from "@/components/admin-booking-filters";
import { AdminBookingTable } from "@/components/admin-booking-table";
import { requireAdmin } from "@/lib/auth";
import {
  filterBookingsByMonthYear,
  formatCalendarMonthYear,
  getAllBookings,
  getAvailableBookingYears,
  getFilterState,
  sortBookingsLatest,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  await requireAdmin();

  const bookings = await getAllBookings();
  const params = await searchParams;
  const { selectedMonth, selectedYear } = getFilterState(params, new Date());
  const availableYears = getAvailableBookingYears(bookings, selectedYear);
  const filteredBookings = sortBookingsLatest(
    filterBookingsByMonthYear(bookings, selectedMonth, selectedYear)
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Daftar Booking</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Transaksi booking {formatCalendarMonthYear(selectedMonth, selectedYear)}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Semua transaksi pelanggan terkumpul di satu tempat agar owner bisa memfilter bulan,
          memantau status booking, dan mengonfirmasi pesanan pending dengan cepat.
        </p>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Transaksi Booking</p>
            <h2 className="mt-3 text-2xl font-semibold">Daftar booking pelanggan</h2>
          </div>

          <AdminBookingFilters
            availableYears={availableYears}
            path="/admin/bookings"
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
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
          <AdminBookingTable bookings={filteredBookings} />
        </div>
      </section>
    </div>
  );
}
