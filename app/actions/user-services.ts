"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { clearAiAssistantCaches } from "@/lib/ai-booking-assistant";
import { createAdminSupabase } from "@/lib/supabase";
import type { UserService } from "@/lib/user-services";

type UserServicesState = {
  message: string;
  success: boolean;
};

type ServicePayload = {
  id?: string;
  code: string;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
};

function formatState(message: string, success: boolean): UserServicesState {
  return { message, success };
}

function slugifyCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseServices(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserService[];
  } catch {
    return null;
  }
}

export async function saveUserServices(
  _prevState: UserServicesState | void,
  formData: FormData
) {
  const user = await requireAdmin();
  const parsedServices = parseServices(formData.get("services_json"));

  if (!parsedServices || parsedServices.length === 0) {
    return formatState("Tambahkan minimal satu layanan aktif atau nonaktif.", false);
  }

  const services: ServicePayload[] = parsedServices.map((service, index) => ({
    id: typeof service.id === "string" && service.id ? service.id : undefined,
    code: slugifyCode(service.code || service.name),
    name: service.name.trim(),
    price: Number(service.price),
    duration_minutes: Number(service.duration_minutes),
    is_active: Boolean(service.is_active),
    sort_order: index,
  }));

  if (services.some((service) => !service.code || !service.name)) {
    return formatState("Setiap layanan wajib punya kode dan nama.", false);
  }

  if (services.some((service) => !Number.isFinite(service.price) || service.price < 0)) {
    return formatState("Harga layanan harus berupa angka 0 atau lebih.", false);
  }

  if (
    services.some(
      (service) =>
        !Number.isFinite(service.duration_minutes) || service.duration_minutes < 15
    )
  ) {
    return formatState("Durasi layanan minimal 15 menit.", false);
  }

  const codes = services.map((service) => service.code);
  if (new Set(codes).size !== codes.length) {
    return formatState("Kode layanan harus unik di dalam akun bisnis yang sama.", false);
  }

  const supabase = createAdminSupabase();
  const { data: existingRows, error: existingError } = await supabase
    .from("user_services")
    .select("id")
    .eq("user_id", user.id);

  if (existingError && existingError.code !== "42P01") {
    return formatState(existingError.message, false);
  }

  const existingIds = new Set(((existingRows ?? []) as Array<{ id: string }>).map((item) => item.id));
  const incomingIds = new Set(services.map((service) => service.id).filter(Boolean) as string[]);
  const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("user_services")
      .delete()
      .eq("user_id", user.id)
      .in("id", idsToDelete);

    if (deleteError) {
      return formatState(deleteError.message, false);
    }
  }

  const payload = services.map((service) => ({
    user_id: user.id,
    code: service.code,
    name: service.name,
    price: service.price,
    duration_minutes: service.duration_minutes,
    is_active: service.is_active,
    sort_order: service.sort_order,
    ...(service.id ? { id: service.id } : {}),
  }));

  const existingPayload = payload.filter((service) => "id" in service);
  const newPayload = payload.filter((service) => !("id" in service));

  if (existingPayload.length > 0) {
    const { error: existingUpsertError } = await supabase
      .from("user_services")
      .upsert(existingPayload, { onConflict: "id" });

    if (existingUpsertError) {
      return formatState(existingUpsertError.message, false);
    }
  }

  if (newPayload.length > 0) {
    const { error: newInsertError } = await supabase
      .from("user_services")
      .insert(newPayload);

    if (newInsertError) {
      return formatState(newInsertError.message, false);
    }
  }

  revalidatePath("/admin/settings/services");
  revalidatePath("/admin/settings/webhook");
  revalidatePath("/admin/bookings");
  clearAiAssistantCaches({ userId: user.id });

  return formatState("Layanan berhasil disimpan.", true);
}
