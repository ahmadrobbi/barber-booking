import {
  BookingRow,
  formatCalendarMonthYear,
  formatPrice,
  getMonthlyCalendarDays,
  groupBookingsByDateMap,
  sortBookingsLatest,
} from "@/lib/dashboard";

type AdminBookingCalendarProps = {
  bookings: readonly BookingRow[];
  month: number;
  year: number;
};

const weekdayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

export function AdminBookingCalendar({
  bookings,
  month,
  year,
}: AdminBookingCalendarProps) {
  const calendarDays = getMonthlyCalendarDays(month, year);
  const bookingMap = groupBookingsByDateMap(sortBookingsLatest([...bookings]));

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Kalender Booking</p>
          <h2 className="mt-3 text-2xl font-semibold">
            Jadwal {formatCalendarMonthYear(month, year)}
          </h2>
        </div>
        <p className="text-sm text-stone-500">
          Setiap tanggal menampilkan booking terbaru lebih dulu.
        </p>
      </div>

      <div className="mt-6 hidden grid-cols-7 gap-3 lg:grid">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="rounded-2xl bg-stone-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-stone-500"
          >
            {label}
          </div>
        ))}

        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-40 rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50/60"
              />
            );
          }

          const dayBookings = bookingMap[date] ?? [];
          const pendingCount = dayBookings.filter((item) => item.status === "pending").length;

          return (
            <article
              key={date}
              className="min-h-40 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-stone-900">
                    {new Date(`${date}T00:00:00`).getDate()}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    {dayBookings.length} booking
                  </p>
                </div>
                {pendingCount > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                    {pendingCount} pending
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    clear
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {dayBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-white/70 px-3 py-4 text-xs text-stone-400">
                    Belum ada booking.
                  </div>
                ) : (
                  dayBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                          {booking.jam ?? "-"}
                        </p>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            booking.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {booking.status ?? "-"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-stone-900">
                        {booking.layanan ?? "-"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">{booking.sender ?? "-"}</p>
                      <p className="mt-2 text-xs font-medium text-stone-600">
                        {formatPrice(booking.harga)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {dayBookings.length > 3 ? (
                <p className="mt-3 text-xs font-medium text-stone-400">
                  +{dayBookings.length - 3} booking lainnya
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 lg:hidden">
        {calendarDays
          .filter((date): date is string => Boolean(date))
          .map((date) => {
            const dayBookings = bookingMap[date] ?? [];

            return (
              <article key={date} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(`${date}T00:00:00`))}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      {dayBookings.length} booking
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {dayBookings.length === 0 ? (
                    <div className="rounded-2xl bg-white px-3 py-4 text-xs text-stone-400">
                      Belum ada booking.
                    </div>
                  ) : (
                    dayBookings.map((booking) => (
                      <div key={booking.id} className="rounded-2xl bg-white px-3 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                            {booking.jam ?? "-"}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                              booking.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {booking.status ?? "-"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-stone-900">
                          {booking.layanan ?? "-"}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">{booking.sender ?? "-"}</p>
                      </div>
                    ))
                  )}
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}
