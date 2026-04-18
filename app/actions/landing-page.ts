"use server";

import { redirect } from "next/navigation";
import { createOrUpdateUserLandingPage } from "@/lib/user";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function formatError(message: string) {
  return { message };
}

export async function updateLandingPage(
  _prevState: { message: string } | void,
  formData: FormData
) {
  const subdomain = normalizeText(formData.get("subdomain"));
  const custom_domain = normalizeText(formData.get("custom_domain"));
  const template = normalizeText(formData.get("template")) || "default";
  const is_active = formData.get("is_active") === "on";

  // Validation
  if (subdomain && (subdomain.length < 3 || !/^[a-z0-9-]+$/.test(subdomain))) {
    return formatError("Subdomain harus 3-20 karakter, hanya huruf kecil, angka, dan tanda hubung.");
  }

  if (custom_domain && !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(custom_domain)) {
    return formatError("Format domain kustom tidak valid.");
  }

  if (!subdomain && !custom_domain) {
    return formatError("Minimal harus mengisi subdomain atau domain kustom.");
  }

  try {
    const landingPageData: any = {
      subdomain: subdomain || null,
      custom_domain: custom_domain || null,
      template,
      is_active,
    };

    const updatedLandingPage = await createOrUpdateUserLandingPage(landingPageData);

    if (!updatedLandingPage) {
      return formatError("Gagal memperbarui pengaturan landing page.");
    }

    // Success - redirect back to landing page settings
    redirect("/admin/landing?success=1");

  } catch (error) {
    console.error("Landing page update error:", error);
    return formatError("Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.");
  }
}