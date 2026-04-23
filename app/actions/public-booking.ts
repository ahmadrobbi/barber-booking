"use server";

import type { BookingFormState } from "@/lib/booking-form-state";
import { isBookingSlotConflict } from "@/lib/booking-conflicts";
import { getServicesByCodes, summarizeServices } from "@/lib/bookings";
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
  const customerName = normalizeText(formData.get("customer_name"));
  const phoneNumber = normalizePhoneNumber(normalizeText(formData.get("no_hp")));
  const selectedServiceCodes = normalizeText(formData.get("services"))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const tanggal = normalizeText(formData.get("tanggal"));
  const jam = normalizeText(formData.get("jam"));

  if (!customerName || customerName.length < 2) {
    return formatBookingError("Nama pemesan minimal 2 karakter.");
  }

  if (!tenant) {
    return formatBookingError("Halaman booking bisnis tidak ditemukan atau sudah tidak aktif.");
  }

  if (!tenant.channelId) {
    return formatBookingError("Bisnis ini belum menghubungkan nomor WhatsApp bot yang aktif.");
  }

  const selectedServices = getServicesByCodes(tenant.services, selectedServiceCodes);
  const summary = summarizeServices(selectedServices);

  if (!isValidPhoneNumber(phoneNumber)) {
    return formatBookingError("Nomor WhatsApp harus 10-20 digit angka.");
  }

  if (selectedServiceCodes.length === 0 || selectedServices.length !== selectedServiceCodes.length) {
    return formatBookingError("Pilih minimal satu layanan booking yang valid.");
  }

  if (!isValidDate(tanggal)) {
    return formatBookingError("Tanggal booking belum valid.");
  }

  const slotStillAvailable = await isSlotAvailable({
    date: tanggal,
    time: jam,
    industry: tenant.industry,
    durationMinutes: summary.totalDurationMinutes,
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
      customer_name: customerName,
      layanan: summary.names.join(", "),
      service_codes: selectedServices.map((service) => service.code),
      harga: summary.totalPrice,
      tanggal,
      jam,
      duration_minutes: summary.totalDurationMinutes,
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
    amount: summary.totalPrice,
    currency: "IDR",
    status: "pending",
    payment_method: "whatsapp",
    description: `Booking ${summary.names.join(", ")} pada ${tanggal} ${jam}`,
    reference_id: `booking-${bookingRecord.id}`,
    metadata: {
      booking_id: bookingRecord.id,
      slug: tenant.slug,
      industry: tenant.industry,
      customer_name: customerName,
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
