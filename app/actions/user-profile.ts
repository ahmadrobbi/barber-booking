"use server";

import { redirect } from "next/navigation";
import { updateCurrentUser, createOrUpdateUserProfile } from "@/lib/user";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function formatError(message: string) {
  return { message };
}

export async function updateUserProfile(
  _prevState: { message: string } | void,
  formData: FormData
) {
  const name = normalizeText(formData.get("name"));
  const email = normalizeText(formData.get("email"));
  const no_hp = normalizeText(formData.get("no_hp"));
  const business_name = normalizeText(formData.get("business_name"));
  const business_description = normalizeText(formData.get("business_description"));
  const website_url = normalizeText(formData.get("website_url"));
  const logo_url = normalizeText(formData.get("logo_url"));
  const instagram = normalizeText(formData.get("instagram"));
  const facebook = normalizeText(formData.get("facebook"));

  // Validation
  if (!name || name.length < 2) {
    return formatError("Nama minimal 2 karakter.");
  }

  if (!email || !email.includes("@")) {
    return formatError("Format email tidak valid.");
  }

  if (!no_hp || no_hp.length < 8) {
    return formatError("No HP minimal 8 digit.");
  }

  try {
    // Update user account info
    const updatedUser = await updateCurrentUser({
      name,
      email,
      no_hp,
    });

    if (!updatedUser) {
      return formatError("Gagal memperbarui informasi akun.");
    }

    // Update user profile
    const social_media: Record<string, string> = {};
    if (instagram) social_media.instagram = instagram;
    if (facebook) social_media.facebook = facebook;

    const profileData: any = {
      business_name: business_name || null,
      business_description: business_description || null,
      website_url: website_url || null,
      logo_url: logo_url || null,
      social_media: Object.keys(social_media).length > 0 ? social_media : null,
    };

    const updatedProfile = await createOrUpdateUserProfile(profileData);

    if (!updatedProfile) {
      return formatError("Gagal memperbarui profil bisnis.");
    }

    // Success - redirect back to profile page
    redirect("/admin/profile?success=1");

  } catch (error) {
    console.error("Profile update error:", error);
    return formatError("Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.");
  }
}