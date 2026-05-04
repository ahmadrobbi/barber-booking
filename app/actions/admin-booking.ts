"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { resolveWhatsappContextFromBooking, sendWhatsappMessage } from "@/lib/whatsapp-channels";
import { formatBookingDateLabel } from "@/lib/chatbot";

async function revalidateBookingViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
}

type BookingNotificationRow = {
  id: number;
  sender: string | null;
  layanan: string | null;
  tanggal: string | null;
  jam: string | null;
  industry: string | null;
  user_id: string | null;
  channel_id: string | null;
};

async function getBookingForStatusChange(bookingId: number, userId: string) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, sender, layanan, tanggal, jam, industry, user_id, channel_id")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as BookingNotificationRow | null;
}

function buildStatusMessage(status: "confirmed" | "cancelled", booking: BookingNotificationRow) {
  const tanggalLabel = booking.tanggal ? formatBookingDateLabel(booking.tanggal) : "-";
  const layanan = booking.layanan ?? "Booking";
  const jam = booking.jam ?? "-";

  if (status === "confirmed") {
    return `✅ *Booking dikonfirmasi*\n\n✂️ ${layanan}\n📅 ${tanggalLabel}\n⏰ ${jam}\n\nTerima kasih, booking kamu sudah kami konfirmasi. Sampai ketemu ya 🙌`;
  }

  return `❌ *Booking dibatalkan*\n\n✂️ ${layanan}\n📅 ${tanggalLabel}\n⏰ ${jam}\n\nMaaf, booking kamu belum bisa kami lanjutkan. Silakan chat lagi untuk pilih jadwal lain ya 🙏`;
}

async function notifyBookingStatus(status: "confirmed" | "cancelled", booking: BookingNotificationRow) {
  if (!booking.sender) {
    return;
  }

  const context = await resolveWhatsappContextFromBooking(booking);

  if (!context.token) {
    return;
  }

  await sendWhatsappMessage({
    target: booking.sender,
    message: buildStatusMessage(status, booking),
    token: context.token,
    provider: context.chatbotProvider,
    officialAccessToken: context.officialAccessToken,
    officialPhoneNumberId: context.officialPhoneNumberId,
  });
}

export async function confirmPendingBooking(bookingId: number) {
  const user = await requireAdmin();
  const booking = await getBookingForStatusChange(bookingId, user.id);

  if (!booking) {
    throw new Error("Booking tidak ditemukan.");
  }

  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) {
    throw new Error(error.message);
  }

  await notifyBookingStatus("confirmed", booking);
  await revalidateBookingViews();
}

export async function cancelBooking(bookingId: number) {
  const user = await requireAdmin();
  const booking = await getBookingForStatusChange(bookingId, user.id);

  if (!booking) {
    throw new Error("Booking tidak ditemukan.");
  }

  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", reminder_sent: true })
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .in("status", ["pending", "confirmed"]);

  if (error) {
    throw new Error(error.message);
  }

  await notifyBookingStatus("cancelled", booking);
  await revalidateBookingViews();
}

export async function completeBooking(bookingId: number) {
  const user = await requireAdmin();

  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "completed", reminder_sent: true })
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .eq("status", "confirmed");

  if (error) {
    throw new Error(error.message);
  }

  await revalidateBookingViews();
}
