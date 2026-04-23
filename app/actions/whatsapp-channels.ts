"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function toStatusUrl(kind: "success" | "error", message: string) {
  return `/admin/settings/webhook?${kind}=${encodeURIComponent(message)}`;
}

function redirectWithStatus(kind: "success" | "error", message: string): never {
  redirect(toStatusUrl(kind, message));
}

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}

function mapChannelErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("whatsapp_channels_device_number_key")) {
    return "Nomor device sudah terdaftar. Gunakan nomor lain atau edit channel yang sudah ada.";
  }

  if (normalized.includes("whatsapp_channels_default_per_user_idx")) {
    return "Hanya satu channel yang boleh menjadi default untuk setiap akun.";
  }

  return message;
}

async function ensureDeviceNumberAvailable(params: {
  supabase: ReturnType<typeof createAdminSupabase>;
  userId: string;
  deviceNumber: string;
  currentId: string;
}) {
  const { data, error } = await params.supabase
    .from("whatsapp_channels")
    .select("id, user_id, device_number")
    .eq("device_number", params.deviceNumber);

  if (error) {
    redirectWithStatus("error", mapChannelErrorMessage(error.message));
  }

  const rows = Array.isArray(data) ? data : [];
  const conflictingRow = rows.find((row) => row.id !== params.currentId);

  if (conflictingRow) {
    redirectWithStatus(
      "error",
      "Nomor device sudah dipakai channel lain. Hapus atau ubah channel lama terlebih dulu."
    );
  }
}

export async function saveWhatsappChannel(formData: FormData) {
  try {
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
      redirectWithStatus("error", "Nomor device wajib diisi.");
    }

    await ensureDeviceNumberAvailable({
      supabase,
      userId: user.id,
      deviceNumber,
      currentId: id,
    });

    let resolvedToken = fonnteToken;

    if (id && !resolvedToken) {
      const existing = await supabase
        .from("whatsapp_channels")
        .select("fonnte_device_token")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing.error && existing.error.code !== "PGRST116") {
        redirectWithStatus("error", mapChannelErrorMessage(existing.error.message));
      }

      resolvedToken = existing.data?.fonnte_device_token ?? "";
    }

    if (!resolvedToken) {
      redirectWithStatus("error", "Token Fonnte wajib diisi.");
    }

    if (isDefault) {
      const { error: resetDefaultError } = await supabase
        .from("whatsapp_channels")
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (resetDefaultError) {
        redirectWithStatus("error", mapChannelErrorMessage(resetDefaultError.message));
      }
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
      ? supabase
          .from("whatsapp_channels")
          .update(payload)
          .eq("id", id)
          .eq("user_id", user.id)
          .select("id, device_number")
          .maybeSingle()
      : supabase
          .from("whatsapp_channels")
          .insert(payload)
          .select("id, device_number")
          .maybeSingle();

    const { data, error } = await query;

    if (error) {
      console.error("saveWhatsappChannel failed", {
        userId: user.id,
        channelId: id || null,
        deviceNumber,
        error: error.message,
      });
      redirectWithStatus("error", mapChannelErrorMessage(error.message));
    }

    if (!data?.id) {
      console.error("saveWhatsappChannel affected no rows", {
        userId: user.id,
        channelId: id || null,
        deviceNumber,
      });
      redirectWithStatus(
        "error",
        "Perubahan channel tidak tersimpan. Coba reload halaman lalu simpan lagi."
      );
    }

    revalidatePath("/admin/settings/webhook");
    redirectWithStatus("success", id ? "Channel berhasil diperbarui." : "Channel berhasil ditambahkan.");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan channel.";
    redirectWithStatus("error", mapChannelErrorMessage(message));
  }
}

export async function deleteWhatsappChannel(formData: FormData) {
  try {
    const user = await requireAdmin();
    const supabase = createAdminSupabase();
    const id = normalizeText(formData.get("id"));

    if (!id) {
      redirectWithStatus("error", "Channel tidak ditemukan.");
    }

    const { error } = await supabase
      .from("whatsapp_channels")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("deleteWhatsappChannel failed", {
        userId: user.id,
        channelId: id,
        error: error.message,
      });
      redirectWithStatus("error", mapChannelErrorMessage(error.message));
    }

    revalidatePath("/admin/settings/webhook");
    redirectWithStatus("success", "Channel berhasil dihapus.");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus channel.";
    redirectWithStatus("error", mapChannelErrorMessage(message));
  }
}
