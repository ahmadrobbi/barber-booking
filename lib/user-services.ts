import { getSession } from "@/lib/auth";
import { getServicesForUser, type BookingService } from "@/lib/bookings";
import { createAdminSupabase } from "@/lib/supabase";

export type UserService = BookingService & {
  id?: string;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
};

type UserServiceRow = {
  id: string;
  code: string;
  name: string;
  price: number | null;
  duration_minutes: number | null;
  is_active: boolean | null;
  sort_order: number | null;
};

export async function getCurrentUserServices() {
  const session = await getSession();

  if (!session) {
    return [] as UserService[];
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_services")
      .select("id, code, name, price, duration_minutes, is_active, sort_order")
      .eq("user_id", session.userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error && error.code !== "42P01") {
      throw new Error(error.message);
    }

    const services = ((data ?? []) as UserServiceRow[]).map((service, index) => ({
      id: service.id,
      code: service.code,
      name: service.name,
      price: Number(service.price ?? 0),
      description: "",
      duration_minutes: Number(service.duration_minutes ?? 60),
      is_active: Boolean(service.is_active ?? true),
      sort_order: Number(service.sort_order ?? index),
    }));

    if (services.length > 0) {
      return services;
    }

    const fallback = await getServicesForUser(session.userId, "barbershop");
    return fallback.map((service, index) => ({
      ...service,
      duration_minutes: 60,
      is_active: true,
      sort_order: index,
    }));
  } catch (error) {
    console.warn("Failed to load current user services:", error);
    return [] as UserService[];
  }
}
