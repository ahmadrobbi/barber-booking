import { createAdminSupabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import {
  BookingRow,
  formatCalendarMonthYear,
  formatPrice,
  getMonthlyCalendarDays,
  groupBookingsByDateMap,
  sortBookingsLatest,
} from "@/lib/calendar-utils";

export type { BookingRow };

export async function getAllBookings() {
  const supabase = createAdminSupabase();
  const session = await getSession();

  if (!session) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("id, created_at, branch_id, customer_name, sender, layanan, harga, jam, status, tanggal, user_id")
    .eq("user_id", session.userId)
    .not("tanggal", "is", null)
    .order("tanggal", { ascending: false })
    .order("jam", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const branchMap = await getBranchNameMap(session.userId);

  return ((data ?? []) as BookingRow[]).map((booking) => ({
    ...booking,
    branch_name: booking.branch_id ? branchMap.get(booking.branch_id) ?? null : null,
  }));
}

export async function getBookingsBySender(sender: string) {
  const supabase = createAdminSupabase();
  const session = await getSession();

  if (!session) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("id, created_at, branch_id, customer_name, sender, layanan, harga, jam, status, tanggal, user_id")
    .eq("user_id", session.userId)
    .eq("sender", sender)
    .order("tanggal", { ascending: false })
    .order("jam", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const branchMap = await getBranchNameMap(session.userId);

  return ((data ?? []) as BookingRow[]).map((booking) => ({
    ...booking,
    branch_name: booking.branch_id ? branchMap.get(booking.branch_id) ?? null : null,
  }));
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

export function filterBookingsByBranchId(
  data: BookingRow[],
  branchId: string | null
) {
  if (!branchId) {
    return data;
  }

  return data.filter((item) => item.branch_id === branchId);
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

export function sortBookingsByCreatedAtDesc(data: BookingRow[]) {
  return [...data].sort((a, b) => {
    const createdAtA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const createdAtB = b.created_at ? new Date(b.created_at).getTime() : 0;

    return createdAtB - createdAtA;
  });
}

export function getFilterState(
  params: { month?: string; year?: string; branch?: string },
  now = new Date()
) {
  const selectedMonth = parsePositiveInteger(params.month) ?? now.getMonth() + 1;
  const selectedYear = parsePositiveInteger(params.year) ?? now.getFullYear();
  const selectedBranchId = typeof params.branch === "string" && params.branch.trim()
    ? params.branch.trim()
    : null;

  return { selectedMonth, selectedYear, selectedBranchId };
}

async function getBranchNameMap(userId: string) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("user_branches")
    .select("id, name")
    .eq("user_id", userId);

  if (error && error.code !== "42P01") {
    throw new Error(error.message);
  }

  return new Map(
    ((data ?? []) as Array<{ id: string; name: string | null }>).map((branch) => [
      branch.id,
      branch.name ?? "Cabang tanpa nama",
    ])
  );
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

export function formatBookingDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}
