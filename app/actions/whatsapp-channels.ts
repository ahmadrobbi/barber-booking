"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  DEFAULT_CHATBOT_TEMPLATES,
  type ChatbotTemplateOverrides,
} from "@/lib/chatbot";
import { getAvailableIndustries, type IndustryKey } from "@/lib/industries";
import { createAdminSupabase } from "@/lib/supabase";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDeviceNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function getBooleanFlag(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getIndustryValue(value: string): IndustryKey {
  const available = getAvailableIndustries();
  return available.some((item) => item.key === value)
    ? (value as IndustryKey)
    : "barbershop";
}

function buildTemplateOverrides(formData: FormData): ChatbotTemplateOverrides {
  const entries = Object.entries(DEFAULT_CHATBOT_TEMPLATES);

  return entries.reduce<ChatbotTemplateOverrides>((acc, [key, defaultValue]) => {
    const value = normalizeText(formData.get(`template_${key}`));
    if (value && value !== defaultValue) {
      acc[key as keyof ChatbotTemplateOverrides] = value;
    }
    return acc;
  }, {});
}

export async function saveWhatsappChannel(formData: FormData) {
  const user = await requireAdmin();
  const supabase = createAdminSupabase();

  const id = normalizeText(formData.get("id"));
  const deviceNumber = normalizeDeviceNumber(normalizeText(formData.get("device_number")));
  const deviceName = normalizeText(formData.get("device_name"));
  const fonnteToken = normalizeText(formData.get("fonnte_device_token"));
  const webhookSecret = normalizeText(formData.get("webhook_secret"));
  const industry = getIndustryValue(normalizeText(formData.get("industry")));
  const isActive = getBooleanFlag(formData, "is_active");
  const isDefault = getBooleanFlag(formData, "is_default");
  const templateOverrides = buildTemplateOverrides(formData);

  if (!deviceNumber) {
    throw new Error("Nomor device wajib diisi.");
  }

  let resolvedToken = fonnteToken;

  if (id && !resolvedToken) {
    const existing = await supabase
      .from("whatsapp_channels")
      .select("fonnte_device_token")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    resolvedToken = existing.data?.fonnte_device_token ?? "";
  }

  if (!resolvedToken) {
    throw new Error("Token Fonnte wajib diisi.");
  }

  if (isDefault) {
    await supabase
      .from("whatsapp_channels")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const payload = {
    user_id: user.id,
    device_number: deviceNumber,
    device_name: deviceName || null,
    fonnte_device_token: resolvedToken,
    webhook_secret: webhookSecret || null,
    industry,
    is_active: isActive,
    is_default: isDefault,
    template_overrides: templateOverrides,
  };

  const query = id
    ? supabase.from("whatsapp_channels").update(payload).eq("id", id).eq("user_id", user.id)
    : supabase.from("whatsapp_channels").insert(payload);

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/settings/webhook");
}

export async function deleteWhatsappChannel(formData: FormData) {
  const user = await requireAdmin();
  const supabase = createAdminSupabase();
  const id = normalizeText(formData.get("id"));

  if (!id) {
    throw new Error("Channel tidak ditemukan.");
  }

  const { error } = await supabase
    .from("whatsapp_channels")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/settings/webhook");
}
