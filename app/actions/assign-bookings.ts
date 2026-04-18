"use server";

import { redirect } from "next/navigation";
import { createAdminSupabase } from "@/lib/supabase";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function formatError(message: string) {
  return { message };
}

export async function assignBookingsToUser(
  _prevState: { message: string } | void,
  formData: FormData
) {
  const userEmail = normalizeText(formData.get("user_email"));
  const bookingIds = formData.getAll("booking_ids");

  // Validation
  if (!userEmail || !userEmail.includes("@")) {
    return formatError("Email user tidak valid.");
  }

  if (!bookingIds || bookingIds.length === 0) {
    return formatError("Pilih minimal satu booking untuk di-assign.");
  }

  try {
    const supabase = createAdminSupabase();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("dashboard_users")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError || !user) {
      return formatError("User dengan email tersebut tidak ditemukan.");
    }

    // Update bookings with user_id
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ user_id: user.id })
      .in("id", bookingIds.map(id => parseInt(id.toString())));

    if (updateError) {
      console.error("Error assigning bookings:", updateError);
      return formatError("Gagal meng-assign booking. Silakan coba lagi.");
    }

    // Success - redirect back to assign page
    redirect("/admin/bookings/assign?success=1");

  } catch (error) {
    console.error("Assign bookings error:", error);
    return formatError("Terjadi kesalahan saat meng-assign booking. Silakan coba lagi.");
  }
}