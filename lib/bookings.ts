import { createAdminSupabase } from "@/lib/supabase";
import { INDUSTRIES, type IndustryKey } from "./industries";

export type { IndustryKey } from "./industries";
export type BookingService = {
  code: string;
  name: string;
  price: number;
  description: string;
  duration_minutes: number;
};

// Legacy exports for backward compatibility (gunakan barbershop sebagai default)
export const BOOKING_SERVICES: BookingService[] = INDUSTRIES.barbershop.services.map((service) => ({
  code: service.code,
  name: service.name,
  price: service.price,
  description: service.description,
  duration_minutes: 60,
}));
export const ALL_BOOKING_SLOTS = INDUSTRIES.barbershop.slots;

type UserServiceRow = {
  code: string;
  name: string;
  price: number | null;
  duration_minutes: number | null;
  is_active: boolean | null;
};

export function getServicesForIndustry(industry: IndustryKey): BookingService[] {
  return INDUSTRIES[industry].services.map((service) => ({
    code: service.code,
    name: service.name,
    price: service.price,
    description: service.description,
    duration_minutes: 60,
  }));
}

export function getSlotsForIndustry(industry: IndustryKey) {
  return INDUSTRIES[industry].slots;
}

export function getBookingService(code: string, industry: IndustryKey = "barbershop") {
  const services = getServicesForIndustry(industry);
  return services.find((service) => service.code === code) ?? null;
}

export function getServiceBySelection(selection: string, industry: IndustryKey = "barbershop") {
  const services = getServicesForIndustry(industry);
  const index = parseInt(selection) - 1;
  return index >= 0 && index < services.length ? services[index] : null;
}

export function getSlotBySelection(selection: string, availableSlots: string[]) {
  const index = parseInt(selection) - 1;
  return index >= 0 && index < availableSlots.length ? availableSlots[index] : null;
}

export async function getServicesForUser(
  userId: string | null | undefined,
  industry: IndustryKey
): Promise<BookingService[]> {
  if (!userId) {
    return getServicesForIndustry(industry);
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_services")
      .select("code, name, price, duration_minutes, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error && error.code !== "42P01") {
      throw new Error(error.message);
    }

    const services = ((data ?? []) as UserServiceRow[]).map((service) => ({
      code: service.code,
      name: service.name,
      price: Number(service.price ?? 0),
      description: "",
      duration_minutes: Number(service.duration_minutes ?? 60),
    }));

    if (services.length > 0) {
      return services;
    }
  } catch (error) {
    console.warn("Failed to load tenant services from user_services:", error);
  }

  return getServicesForIndustry(industry);
}
