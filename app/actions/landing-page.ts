"use server";

import { redirect } from "next/navigation";
import { createAdminSupabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { createOrUpdateUserLandingPage, type UserLandingPage } from "@/lib/user";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function formatError(message: string) {
  return { message };
}

export async function updateLandingPage(
  _prevState: { message: string } | void,
  formData: FormData
) {
  const subdomain = normalizeSlug(normalizeText(formData.get("subdomain")));
  const custom_domain = normalizeText(formData.get("custom_domain")).toLowerCase();
  const template = normalizeText(formData.get("template")) || "default";
  const is_active = formData.get("is_active") === "on";

  // Validation
  if (subdomain && (subdomain.length < 3 || !/^[a-z0-9-]+$/.test(subdomain))) {
    return formatError("Slug publik harus 3-20 karakter, hanya huruf kecil, angka, dan tanda hubung.");
  }

  if (custom_domain && !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(custom_domain)) {
    return formatError("Format domain kustom tidak valid.");
  }

  if (!subdomain && !custom_domain) {
    return formatError("Minimal isi slug publik atau domain kustom.");
  }

  const session = await getSession();
  if (!session) {
    return formatError("Session tidak ditemukan. Silakan login kembali.");
  }

  if (subdomain) {
    const supabase = createAdminSupabase();
    const { data: existing, error: existingError } = await supabase
      .from("user_landing_pages")
      .select("user_id")
      .eq("subdomain", subdomain)
      .not("user_id", "eq", session.userId)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Slug validation error:", existingError);
      return formatError("Terjadi kesalahan saat memeriksa slug. Silakan coba lagi.");
    }

    if (existing) {
      return formatError("Slug sudah digunakan. Silakan pilih slug lain yang unik.");
    }
  }

  try {
    const landingPageData: Partial<UserLandingPage> = {
      subdomain: subdomain || undefined,
      custom_domain: custom_domain || undefined,
      template,
      is_active,
    };

    const updatedLandingPage = await createOrUpdateUserLandingPage(landingPageData);

    if (!updatedLandingPage) {
      return formatError("Gagal memperbarui pengaturan landing page.");
    }
  } catch (error) {
    console.error("Landing page update error:", error);
    return formatError("Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.");
  }

  redirect("/admin/landing?success=1");
}
