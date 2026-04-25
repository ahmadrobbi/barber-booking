import { createAdminSupabase } from "@/lib/supabase";
import type { IndustryKey } from "@/lib/bookings";
import { getSlotsForIndustry } from "@/lib/bookings";

export const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export type DayBusinessHours = {
  enabled: boolean;
  open: string;
  close: string;
  break_enabled: boolean;
  break_open: string;
  break_close: string;
};

export type BusinessHours = Record<WeekdayKey, DayBusinessHours>;

type BookingSlotRow = {
  jam: string | null;
  duration_minutes: number | null;
};

type UserProfileRow = {
  business_hours: unknown;
};

type UserBranchRow = {
  business_hours: unknown;
};

type BookingScope = {
  userId: string | null;
  channelId: string | null;
  branchId?: string | null;
};

function createDefaultDayBusinessHours(overrides?: Partial<DayBusinessHours>): DayBusinessHours {
  return {
    enabled: true,
    open: "09:00",
    close: "18:00",
    break_enabled: false,
    break_open: "12:00",
    break_close: "13:00",
    ...overrides,
  };
}

export function createDefaultBusinessHours(): BusinessHours {
  return {
    monday: createDefaultDayBusinessHours(),
    tuesday: createDefaultDayBusinessHours(),
    wednesday: createDefaultDayBusinessHours(),
    thursday: createDefaultDayBusinessHours(),
    friday: createDefaultDayBusinessHours(),
    saturday: createDefaultDayBusinessHours(),
    sunday: createDefaultDayBusinessHours({ enabled: false }),
  };
}

const DEFAULT_BUSINESS_HOURS: BusinessHours = createDefaultBusinessHours();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeBusinessHours(value: unknown): BusinessHours {
  if (!isRecord(value)) {
    return createDefaultBusinessHours();
  }

  return WEEKDAY_KEYS.reduce<BusinessHours>((acc, key) => {
    const item = value[key];
    const defaultValue = createDefaultDayBusinessHours(
      key === "sunday" ? { enabled: false } : undefined
    );

    if (isRecord(item)) {
      acc[key] = {
        enabled: typeof item.enabled === "boolean" ? item.enabled : defaultValue.enabled,
        open: typeof item.open === "string" ? item.open : defaultValue.open,
        close: typeof item.close === "string" ? item.close : defaultValue.close,
        break_enabled:
          typeof item.break_enabled === "boolean"
            ? item.break_enabled
            : defaultValue.break_enabled,
        break_open:
          typeof item.break_open === "string"
            ? item.break_open
            : defaultValue.break_open,
        break_close:
          typeof item.break_close === "string"
            ? item.break_close
            : defaultValue.break_close,
      };
      return acc;
    }

    acc[key] = defaultValue;
    return acc;
  }, createDefaultBusinessHours());
}

export async function getBusinessHoursForUser(userId: string | null | undefined) {
  if (!userId) {
    return DEFAULT_BUSINESS_HOURS;
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("business_hours")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return normalizeBusinessHours((data as UserProfileRow | null)?.business_hours);
  } catch (error) {
    console.warn("Failed to load business hours:", error);
    return DEFAULT_BUSINESS_HOURS;
  }
}

export async function getBusinessHoursForScope(params: {
  userId: string | null | undefined;
  branchId?: string | null;
}) {
  if (params.branchId) {
    try {
      const supabase = createAdminSupabase();
      const { data, error } = await supabase
        .from("user_branches")
        .select("business_hours")
        .eq("id", params.branchId)
        .maybeSingle();

      if (error && error.code !== "PGRST116" && error.code !== "42P01") {
        throw new Error(error.message);
      }

      if (
        data &&
        isRecord((data as UserBranchRow | null)?.business_hours) &&
        Object.keys((data as UserBranchRow | null)?.business_hours as Record<string, unknown>).length > 0
      ) {
        return normalizeBusinessHours((data as UserBranchRow | null)?.business_hours);
      }
    } catch (error) {
      console.warn("Failed to load branch business hours:", error);
    }
  }

  return getBusinessHoursForUser(params.userId);
}

export function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function toTimeString(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getWeekdayKey(date: string): WeekdayKey {
  const jsDay = new Date(`${date}T00:00:00`).getDay();
  return WEEKDAY_KEYS[(jsDay + 6) % 7];
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function getSlotStepMinutes(industry: IndustryKey, durationMinutes: number) {
  const baseSlots = getSlotsForIndustry(industry);
  const intervals = baseSlots
    .slice(1)
    .map((slot, index) => toMinutes(slot) - toMinutes(baseSlots[index]));
  const baseStep = intervals.length > 0 ? intervals.reduce((acc, item) => gcd(acc, item)) : 30;

  return gcd(baseStep, durationMinutes) || baseStep || 30;
}

export function buildCandidateSlots(params: {
  date: string;
  industry: IndustryKey;
  durationMinutes: number;
  businessHours: BusinessHours;
}) {
  const weekdayKey = getWeekdayKey(params.date);
  const hours = params.businessHours[weekdayKey];

  if (!hours?.enabled) {
    return [] as string[];
  }

  const openMinutes = toMinutes(hours.open);
  const closeMinutes = toMinutes(hours.close);
  const breakEnabled = hours.break_enabled;
  const breakOpenMinutes = breakEnabled ? toMinutes(hours.break_open) : null;
  const breakCloseMinutes = breakEnabled ? toMinutes(hours.break_close) : null;
  const stepMinutes = getSlotStepMinutes(params.industry, params.durationMinutes);
  const result: string[] = [];

  for (
    let current = openMinutes;
    current + params.durationMinutes <= closeMinutes;
    current += stepMinutes
  ) {
    if (
      breakEnabled &&
      breakOpenMinutes !== null &&
      breakCloseMinutes !== null &&
      overlaps(current, params.durationMinutes, breakOpenMinutes, breakCloseMinutes - breakOpenMinutes)
    ) {
      continue;
    }

    result.push(toTimeString(current));
  }

  return result;
}

function overlaps(
  candidateStart: number,
  candidateDuration: number,
  bookedStart: number,
  bookedDuration: number
) {
  const candidateEnd = candidateStart + candidateDuration;
  const bookedEnd = bookedStart + bookedDuration;

  return candidateStart < bookedEnd && bookedStart < candidateEnd;
}

export async function getBookedSlotsForDate(date: string, scope: BookingScope) {
  const supabase = createAdminSupabase();
  let query = supabase
    .from("bookings")
    .select("jam, duration_minutes")
    .eq("tanggal", date)
    .in("status", ["pending", "confirmed"]);

  if (scope.userId) {
    query = query.eq("user_id", scope.userId);
    if (scope.branchId) {
      query = query.eq("branch_id", scope.branchId);
    }
  } else if (scope.channelId) {
    query = query.eq("channel_id", scope.channelId);
  } else {
    query = query.is("user_id", null).is("channel_id", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as BookingSlotRow[]).filter((item) => item.jam);
}

export async function getAvailableSlotsForDate(params: {
  date: string;
  industry: IndustryKey;
  durationMinutes: number;
  userId: string | null;
  channelId: string | null;
  branchId?: string | null;
}) {
  const businessHours = await getBusinessHoursForScope({
    userId: params.userId,
    branchId: params.branchId,
  });
  const candidateSlots = buildCandidateSlots({
    date: params.date,
    industry: params.industry,
    durationMinutes: params.durationMinutes,
    businessHours,
  });
  const bookings = await getBookedSlotsForDate(params.date, {
    userId: params.userId,
    channelId: params.channelId,
    branchId: params.branchId,
  });

  return candidateSlots.filter((slot) => {
    const candidateStart = toMinutes(slot);

    return !bookings.some((booking) =>
      overlaps(
        candidateStart,
        params.durationMinutes,
        toMinutes(booking.jam ?? "00:00"),
        Number(booking.duration_minutes ?? 60)
      )
    );
  });
}

export async function isSlotAvailable(params: {
  date: string;
  time: string;
  industry: IndustryKey;
  durationMinutes: number;
  userId: string | null;
  channelId: string | null;
  branchId?: string | null;
}) {
  const availableSlots = await getAvailableSlotsForDate({
    date: params.date,
    industry: params.industry,
    durationMinutes: params.durationMinutes,
    userId: params.userId,
    channelId: params.channelId,
    branchId: params.branchId,
  });

  return availableSlots.includes(params.time);
}
