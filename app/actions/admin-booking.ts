"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase";

async function revalidateBookingViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
}

export async function confirmPendingBooking(bookingId: number) {
  const user = await requireAdmin();

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

  await revalidateBookingViews();
}

export async function cancelBooking(bookingId: number) {
  const user = await requireAdmin();

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
