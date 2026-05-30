export type BookingRow = {
  id: number;
  created_at?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
  customer_name: string | null;
  sender: string | null;
  layanan: string | null;
  harga: number | null;
  jam: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string | null;
  tanggal: string | null;
  user_id?: string;
};

export function formatCalendarMonthYear(month: number, year: number) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function formatPrice(value: number | null) {
  if (typeof value !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getMonthlyCalendarDays(month: number, year: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const days: Array<string | null> = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(formatDateKey(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function formatDateKey(year: number, month: number, day: number) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function groupBookingsByDateMap(bookings: readonly BookingRow[]) {
  const map: Record<string, BookingRow[]> = {};

  for (const booking of bookings) {
    if (!booking.tanggal) continue;
    if (!map[booking.tanggal]) {
      map[booking.tanggal] = [];
    }
    map[booking.tanggal].push(booking);
  }

  return map;
}

export function sortBookingsLatest(bookings: readonly BookingRow[]) {
  return [...bookings].sort((a, b) => {
    const dateA = `${a.tanggal ?? ""}T${a.jam ?? "00:00"}:00`;
    const dateB = `${b.tanggal ?? ""}T${b.jam ?? "00:00"}:00`;

    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}
