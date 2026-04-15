"use server";

import type { BusinessSettingsState } from "@/lib/business-settings-state";
import { saveIndustryConfig, getIndustryConfig } from "@/lib/industry-config";
import { createAdminSupabase } from "@/lib/supabase";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function formatSettingsError(message: string): BusinessSettingsState {
  return {
    message,
    success: false,
  };
}

function formatSettingsSuccess(message: string): BusinessSettingsState {
  return {
    message,
    success: true,
  };
}

export async function updateBusinessSettings(
  _prevState: BusinessSettingsState | void,
  formData: FormData
) {
  const businessName = normalizeText(formData.get("businessName"));
  const defaultIndustry = normalizeText(formData.get("defaultIndustry"));

  if (!businessName) {
    return formatSettingsError("Nama bisnis tidak boleh kosong.");
  }

  if (!defaultIndustry) {
    return formatSettingsError("Industri default harus dipilih.");
  }

  try {
    const supabase = createAdminSupabase();

    // Save business name
    await supabase.from("app_settings").upsert(
      {
        key: "business_name",
        value_json: businessName,
      },
      { onConflict: "key" }
    );

    // Update industry config with new default
    const currentConfig = await getIndustryConfig();
    const updatedConfig = {
      ...currentConfig,
      default: defaultIndustry as any, // Type assertion for simplicity
    };

    await saveIndustryConfig(updatedConfig);

    return formatSettingsSuccess("Pengaturan bisnis berhasil disimpan.");
  } catch (error) {
    console.error("Failed to update business settings:", error);
    return formatSettingsError("Gagal menyimpan pengaturan. Silakan coba lagi.");
  }
}