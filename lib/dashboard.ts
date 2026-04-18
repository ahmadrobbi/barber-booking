import { createAdminSupabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export type BookingRow = {
  id: number;
  sender: string | null;
  layanan: string | null;
  harga: number | null;
  jam: string | null;
  status: string | null;
  tanggal: string | null;
  user_id?: string;
};

export async function getAllBookings() {
  const supabase = createAdminSupabase();
  const session = await getSession();

  if (!session) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("id, sender, layanan, harga, jam, status, tanggal, user_id")
    .eq("user_id", session.userId)
    .not("tanggal", "is", null)
    .order("tanggal", { ascending: false })
    .order("jam", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BookingRow[];
}

export async function getBookingsBySender(sender: string) {
  const supabase = createAdminSupabase();
  const session = await getSession();

  if (!session) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("id, sender, layanan, harga, jam, status, tanggal, user_id")
    .eq("user_id", session.userId)
    .eq("sender", sender)
    .order("tanggal", { ascending: false })
    .order("jam", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BookingRow[];
}

export function groupBookingsByDate(data: BookingRow[]) {
  const map: Record<string, BookingRow[]> = {};

  for (const item of data) {
    if (!item.tanggal) {
      continue;
    }

    if (!map[item.tanggal]) {
      map[item.tanggal] = [];
    }

    map[item.tanggal].push(item);
  }

  return Object.entries(map).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
  );
}

export function groupBookingsByDateMap(data: BookingRow[]) {
  const map: Record<string, BookingRow[]> = {};

  for (const item of data) {
    if (!item.tanggal) {
      continue;
    }

    if (!map[item.tanggal]) {
      map[item.tanggal] = [];
    }

    map[item.tanggal].push(item);
  }

  return map;
}

export function filterBookingsByMonthYear(
  data: BookingRow[],
  month: number | null,
  year: number | null
) {
  return data.filter((item) => {
    if (!item.tanggal) {
      return false;
    }

    const bookingDate = new Date(`${item.tanggal}T00:00:00`);
    const matchesMonth = month === null || bookingDate.getMonth() + 1 === month;
    const matchesYear = year === null || bookingDate.getFullYear() === year;

    return matchesMonth && matchesYear;
  });
}

export function getAvailableBookingYears(
  data: BookingRow[],
  fallbackYear?: number
) {
  const years = new Set<number>();

  for (const item of data) {
    if (!item.tanggal) {
      continue;
    }

    years.add(new Date(`${item.tanggal}T00:00:00`).getFullYear());
  }

  if (fallbackYear) {
    years.add(fallbackYear);
  }

  return [...years].sort((a, b) => b - a);
}

export function sortBookingsLatest(data: BookingRow[]) {
  return [...data].sort((a, b) => {
    const dateA = `${a.tanggal ?? ""}T${a.jam ?? "00:00"}:00`;
    const dateB = `${b.tanggal ?? ""}T${b.jam ?? "00:00"}:00`;

    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

export function getFilterState(
  params: { month?: string; year?: string },
  now = new Date()
) {
  const selectedMonth = parsePositiveInteger(params.month) ?? now.getMonth() + 1;
  const selectedYear = parsePositiveInteger(params.year) ?? now.getFullYear();

  return { selectedMonth, selectedYear };
}

function parsePositiveInteger(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function formatCalendarMonthYear(month: number, year: number) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function getMonthlyCalendarDays(month: number, year: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const days: Array<string | null> = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month - 1, day);
    days.push(date.toISOString().slice(0, 10));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function formatBookingDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
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
