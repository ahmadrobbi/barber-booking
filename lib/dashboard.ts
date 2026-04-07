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
