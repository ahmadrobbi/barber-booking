"use server";

import type { BookingFormState } from "@/lib/booking-form-state";
import { isBookingSlotConflict } from "@/lib/booking-conflicts";
import { isSlotAvailable } from "@/lib/scheduling";
import { createAdminSupabase } from "@/lib/supabase";
import { createTransaction } from "@/lib/transactions";
import { getPublicTenantContextBySlug } from "@/lib/tenant-context";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhoneNumber(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function formatBookingError(message: string): BookingFormState {
  return {
    message,
    success: false,
  };
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidPhoneNumber(value: string) {
  return /^[+]?\d{10,20}$/.test(value);
}

export async function createPublicBooking(
  _prevState: BookingFormState | void,
  formData: FormData
) {
  const slug = normalizeText(formData.get("slug"));
  const tenant = await getPublicTenantContextBySlug(slug);
  const phoneNumber = normalizePhoneNumber(normalizeText(formData.get("no_hp")));
  const serviceCode = normalizeText(formData.get("service"));
  const tanggal = normalizeText(formData.get("tanggal"));
  const jam = normalizeText(formData.get("jam"));

  if (!tenant) {
    return formatBookingError("Halaman booking bisnis tidak ditemukan atau sudah tidak aktif.");
  }

  if (!tenant.channelId) {
    return formatBookingError("Bisnis ini belum menghubungkan nomor WhatsApp bot yang aktif.");
  }

  const service = tenant.services.find((item) => item.code === serviceCode) ?? null;

  if (!isValidPhoneNumber(phoneNumber)) {
    return formatBookingError("Nomor WhatsApp harus 10-20 digit angka.");
  }

  if (!service) {
    return formatBookingError("Pilih layanan booking yang valid.");
  }

  if (!isValidDate(tanggal)) {
    return formatBookingError("Tanggal booking belum valid.");
  }

  const slotStillAvailable = await isSlotAvailable({
    date: tanggal,
    time: jam,
    industry: tenant.industry,
    durationMinutes: service.duration_minutes,
    userId: tenant.userId,
    channelId: tenant.channelId,
  });

  if (!slotStillAvailable) {
    return formatBookingError("Pilih jam booking yang tersedia.");
  }

  const supabase = createAdminSupabase();

  const { data: existingBooking, error: bookingError } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", tenant.userId)
    .eq("tanggal", tanggal)
    .eq("jam", jam)
    .in("status", ["pending", "confirmed"])
    .limit(1)
    .maybeSingle();

  if (bookingError && bookingError.code !== "PGRST116") {
    return formatBookingError(bookingError.message);
  }

  if (existingBooking) {
    return formatBookingError("Slot tersebut sudah terisi. Silakan pilih jam lain.");
  }

  const { data: bookingRecord, error: insertError } = await supabase
    .from("bookings")
    .insert({
      sender: phoneNumber,
      layanan: service.name,
      harga: service.price,
      tanggal,
      jam,
      duration_minutes: service.duration_minutes,
      status: "pending",
      industry: tenant.industry,
      user_id: tenant.userId,
      channel_id: tenant.channelId,
      source: "public_form",
    })
    .select("id")
    .single();

  if (insertError || !bookingRecord) {
    if (isBookingSlotConflict(insertError)) {
      return formatBookingError("Slot tersebut baru saja terisi. Silakan pilih jam lain.");
    }

    return formatBookingError(insertError?.message || "Gagal membuat booking.");
  }

  const transaction = await createTransaction({
    user_id: tenant.userId,
    type: "payment",
    amount: service.price,
    currency: "IDR",
    status: "pending",
    payment_method: "whatsapp",
    description: `Booking ${service.name} pada ${tanggal} ${jam}`,
    reference_id: `booking-${bookingRecord.id}`,
    metadata: {
      booking_id: bookingRecord.id,
      slug: tenant.slug,
      industry: tenant.industry,
      sender: phoneNumber,
      channel_id: tenant.channelId,
    },
  });

  if (!transaction) {
    console.error("Booking was created but transaction record failed for booking", bookingRecord.id);
  }

  return {
    message: "Booking berhasil dikirim. Admin akan memproses pesananmu secepatnya.",
    success: true,
  };
}
