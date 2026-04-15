"use server";

import type { BookingFormState } from "@/lib/booking-form-state";
import { INDUSTRIES } from "@/lib/industries";
import { getBookingService, getSlotsForIndustry, type IndustryKey } from "@/lib/bookings";
import { isIndustryEnabled } from "@/lib/industry-config";
import { createAdminSupabase } from "@/lib/supabase";

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

function getIndustryFromFormData(formData: FormData): IndustryKey {
  const industryValue = normalizeText(formData.get("industry")).toLowerCase();
  return Object.keys(INDUSTRIES).includes(industryValue)
    ? (industryValue as IndustryKey)
    : "barbershop";
}

export async function createPublicBooking(
  _prevState: BookingFormState | void,
  formData: FormData
) {
  const industry = getIndustryFromFormData(formData);
  // Validate industry is enabled
  const isEnabled = await isIndustryEnabled(industry);
  if (!isEnabled) {
    return formatBookingError("Industri booking tidak tersedia.");
  }

  const phoneNumber = normalizePhoneNumber(normalizeText(formData.get("no_hp")));
  const serviceCode = normalizeText(formData.get("service"));
  const tanggal = normalizeText(formData.get("tanggal"));
  const jam = normalizeText(formData.get("jam"));
  const service = getBookingService(serviceCode, industry);
  const availableSlots = getSlotsForIndustry(industry);

  if (!isValidPhoneNumber(phoneNumber)) {
    return formatBookingError("Nomor WhatsApp harus 10-20 digit angka.");
  }

  if (!service) {
    return formatBookingError("Pilih layanan booking yang valid.");
  }

  if (!isValidDate(tanggal)) {
    return formatBookingError("Tanggal booking belum valid.");
  }

  if (!availableSlots.includes(jam as (typeof availableSlots)[number])) {
    return formatBookingError("Pilih jam booking yang tersedia.");
  }

  const supabase = createAdminSupabase();

  const { data: existingBooking, error: bookingError } = await supabase
    .from("bookings")
    .select("id")
    .eq("tanggal", tanggal)
    .eq("jam", jam)
    .maybeSingle();

  if (bookingError && bookingError.code !== "PGRST116") {
    return formatBookingError(bookingError.message);
  }

  if (existingBooking) {
    return formatBookingError("Slot tersebut sudah terisi. Silakan pilih jam lain.");
  }

  const { error: insertError } = await supabase.from("bookings").insert({
    sender: phoneNumber,
    layanan: service.name,
    harga: service.price,
    tanggal,
    jam,
    status: "pending",
    industry,  // Tambah kolom industry
  });

  if (insertError) {
    return formatBookingError(insertError.message);
  }

  return {
    message: "Booking berhasil dikirim. Admin akan memproses pesananmu secepatnya.",
    success: true,
  };
}
