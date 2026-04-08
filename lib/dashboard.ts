import { createAdminSupabase } from "@/lib/supabase";

export type BookingRow = {
  id: number;
  sender: string | null;
  layanan: string | null;
  harga: number | null;
  jam: string | null;
  status: string | null;
  tanggal: string | null;
};

export async function getAllBookings() {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("bookings")
    .select("id, sender, layanan, harga, jam, status, tanggal")
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

  const { data, error } = await supabase
    .from("bookings")
    .select("id, sender, layanan, harga, jam, status, tanggal")
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

export function getAvailableBookingYears(data: BookingRow[]) {
  return [...new Set(
    data
      .map((item) => {
        if (!item.tanggal) {
          return null;
        }

        return new Date(`${item.tanggal}T00:00:00`).getFullYear();
      })
      .filter((value): value is number => value !== null)
  )].sort((a, b) => b - a);
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
