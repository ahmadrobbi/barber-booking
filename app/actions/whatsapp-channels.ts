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
import {
  normalizeWhatsappBusinessNumber,
  resolveOfficialPhoneNumberIdByBusinessNumber,
  getOfficialWhatsAppConfig,
} from "@/lib/whatsapp-official";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
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

function getProviderValue(value: string): "fonnte" | "official" {
  return value === "official" ? "official" : "fonnte";
}

function getRedirectTarget(formData: FormData) {
  const raw = normalizeText(formData.get("redirect_to"));
  if (raw.startsWith("/admin/settings/")) {
    return raw;
  }

  return "/admin/settings/webhook";
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

function hasTemplateOverrideFields(formData: FormData) {
  return Object.keys(DEFAULT_CHATBOT_TEMPLATES).some((key) =>
    formData.has(`template_${key}`)
  );
}

function toStatusUrl(kind: "success" | "error", message: string, redirectTo: string) {
  return `${redirectTo}?${kind}=${encodeURIComponent(message)}`;
}

function redirectWithStatus(kind: "success" | "error", message: string, redirectTo = "/admin/settings/webhook"): never {
  redirect(toStatusUrl(kind, message, redirectTo));
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

  if (normalized.includes("whatsapp_channels_official_phone_number_id_key")) {
    return "Phone number ID official sudah terdaftar. Gunakan ID lain atau edit channel yang sudah ada.";
  }

  return message;
}

async function ensureDeviceNumberAvailable(params: {
  supabase: ReturnType<typeof createAdminSupabase>;
  userId: string;
  deviceNumber: string;
  currentId: string;
  redirectTo: string;
}) {
  const { data, error } = await params.supabase
    .from("whatsapp_channels")
    .select("id, user_id, device_number")
    .eq("device_number", params.deviceNumber);

  if (error) {
    redirectWithStatus("error", mapChannelErrorMessage(error.message), params.redirectTo);
  }

  const rows = Array.isArray(data) ? data : [];
  const conflictingRow = rows.find((row) => row.id !== params.currentId);

  if (conflictingRow) {
    redirectWithStatus(
      "error",
      "Nomor device sudah dipakai channel lain. Hapus atau ubah channel lama terlebih dulu.",
      params.redirectTo
    );
  }
}

async function ensureOfficialPhoneNumberAvailable(params: {
  supabase: ReturnType<typeof createAdminSupabase>;
  officialPhoneNumberId: string;
  currentId: string;
  redirectTo: string;
}) {
  const { data, error } = await params.supabase
    .from("whatsapp_channels")
    .select("id, official_phone_number_id")
    .eq("official_phone_number_id", params.officialPhoneNumberId);

  if (error) {
    redirectWithStatus("error", mapChannelErrorMessage(error.message), params.redirectTo);
  }

  const rows = Array.isArray(data) ? data : [];
  const conflictingRow = rows.find((row) => row.id !== params.currentId);

  if (conflictingRow) {
    redirectWithStatus(
      "error",
      "Phone number ID official sudah dipakai channel lain. Hapus atau ubah channel lama terlebih dulu.",
      params.redirectTo
    );
  }
}

export async function saveWhatsappChannel(formData: FormData) {
  try {
    const user = await requireAdmin();
    const supabase = createAdminSupabase();
    const officialConfig = getOfficialWhatsAppConfig();
    const redirectTo = getRedirectTarget(formData);

    const id = normalizeText(formData.get("id"));
    const deviceNumber = normalizeWhatsappBusinessNumber(normalizeText(formData.get("device_number")));
    let deviceName = normalizeText(formData.get("device_name"));
    const fonnteToken = normalizeText(formData.get("fonnte_device_token"));
    const webhookSecret = normalizeText(formData.get("webhook_secret"));
    const hasWebhookSecretField = formData.has("webhook_secret");
    const officialPhoneNumberId = normalizeText(formData.get("official_phone_number_id"));
    const officialAccessToken = normalizeText(formData.get("official_access_token"));
    const officialVerifyToken = normalizeText(formData.get("official_verify_token"));
    const chatbotProvider = getProviderValue(normalizeText(formData.get("chatbot_provider")));
    const industry = getIndustryValue(normalizeText(formData.get("industry")));
    const isActive = getBooleanFlag(formData, "is_active");
    const isDefault = getBooleanFlag(formData, "is_default");
    const templateOverrides = buildTemplateOverrides(formData);
    const templateFieldsPresent = hasTemplateOverrideFields(formData);

    if (!deviceNumber) {
      redirectWithStatus("error", "Nomor device wajib diisi.");
    }

    await ensureDeviceNumberAvailable({
      supabase,
      userId: user.id,
      deviceNumber,
      currentId: id,
      redirectTo,
    });

    let resolvedToken = fonnteToken;
    let resolvedWebhookSecret = webhookSecret;
    let resolvedOfficialAccessToken = officialAccessToken;
    let resolvedOfficialVerifyToken = officialVerifyToken;
    let resolvedOfficialPhoneNumberId = officialPhoneNumberId;
    let existingToken = "";

    if (id) {
      const existing = await supabase
        .from("whatsapp_channels")
        .select(
          "fonnte_device_token, webhook_secret, official_phone_number_id, official_access_token, official_verify_token"
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing.error && existing.error.code !== "PGRST116") {
        redirectWithStatus("error", mapChannelErrorMessage(existing.error.message), redirectTo);
      }

      existingToken = existing.data?.fonnte_device_token ?? "";
      resolvedToken = existingToken;
      if (!resolvedOfficialPhoneNumberId) {
        resolvedOfficialPhoneNumberId = existing.data?.official_phone_number_id ?? "";
      }
      if (!resolvedOfficialAccessToken) {
        resolvedOfficialAccessToken = existing.data?.official_access_token ?? "";
      }
      if (!resolvedOfficialVerifyToken) {
        resolvedOfficialVerifyToken = existing.data?.official_verify_token ?? "";
      }

      if (!hasWebhookSecretField) {
        const existingWebhookSecret = existing.data?.webhook_secret;
        if (typeof existingWebhookSecret === "string" && existingWebhookSecret) {
          resolvedWebhookSecret = existingWebhookSecret;
        }
      }

      if (!templateFieldsPresent) {
        const existingTemplates = await supabase
          .from("whatsapp_channels")
          .select("template_overrides")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

        if (existingTemplates.error && existingTemplates.error.code !== "PGRST116") {
          redirectWithStatus("error", mapChannelErrorMessage(existingTemplates.error.message), redirectTo);
        }

        const storedTemplates = existingTemplates.data?.template_overrides;
        if (storedTemplates && typeof storedTemplates === "object") {
          Object.assign(templateOverrides, storedTemplates as ChatbotTemplateOverrides);
        }
      }
    }

    if (chatbotProvider === "official") {
      if (!officialConfig.accessToken || !officialConfig.wabaId || !officialConfig.verifyToken) {
        redirectWithStatus(
          "error",
          "Backend official belum siap. Isi WHATSAPP_OFFICIAL_ACCESS_TOKEN, WHATSAPP_OFFICIAL_WABA_ID, dan WHATSAPP_OFFICIAL_VERIFY_TOKEN di server.",
          redirectTo
        );
      }

      const officialIdentity = await resolveOfficialPhoneNumberIdByBusinessNumber(deviceNumber);
      resolvedOfficialPhoneNumberId = officialIdentity.phoneNumberId;
      resolvedOfficialAccessToken = officialConfig.accessToken;
      resolvedOfficialVerifyToken = officialConfig.verifyToken;
      if (!deviceName) {
        deviceName = officialIdentity.verifiedName ? `${officialIdentity.verifiedName} Official` : deviceNumber;
      }

      await ensureOfficialPhoneNumberAvailable({
        supabase,
        officialPhoneNumberId: resolvedOfficialPhoneNumberId,
        currentId: id,
        redirectTo,
      });
    } else {
      await ensureDeviceNumberAvailable({
        supabase,
        userId: user.id,
        deviceNumber,
        currentId: id,
        redirectTo,
      });
    }

    resolvedToken = resolvedToken || existingToken || process.env.FONNTE_TOKEN?.trim() || "";

    if (!resolvedToken) {
      redirectWithStatus(
        "error",
        "Backend reminder belum siap. Isi token Fonnte di server atau channel ini.",
        redirectTo
      );
    }

    if (isDefault) {
      const { error: resetDefaultError } = await supabase
        .from("whatsapp_channels")
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (resetDefaultError) {
        redirectWithStatus("error", mapChannelErrorMessage(resetDefaultError.message), redirectTo);
      }
    }

    const payload = {
      user_id: user.id,
      device_number: deviceNumber,
      device_name: deviceName || null,
      fonnte_device_token: resolvedToken,
      webhook_secret: resolvedWebhookSecret || null,
      chatbot_provider: chatbotProvider,
      official_phone_number_id: resolvedOfficialPhoneNumberId || null,
      official_access_token:
        chatbotProvider === "official" ? officialConfig.accessToken || null : resolvedOfficialAccessToken || null,
      official_verify_token: resolvedOfficialVerifyToken || null,
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
      redirectWithStatus("error", mapChannelErrorMessage(error.message), redirectTo);
    }

    if (!data?.id) {
      console.error("saveWhatsappChannel affected no rows", {
        userId: user.id,
        channelId: id || null,
        deviceNumber,
      });
      redirectWithStatus(
        "error",
        "Perubahan channel tidak tersimpan. Coba reload halaman lalu simpan lagi.",
        redirectTo
      );
    }

    revalidatePath("/admin/settings/webhook");
    revalidatePath("/admin/settings/webhook-official");
    redirectWithStatus("success", id ? "Channel berhasil diperbarui." : "Channel berhasil ditambahkan.", redirectTo);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan channel.";
    redirectWithStatus("error", mapChannelErrorMessage(message), getRedirectTarget(formData));
  }
}

export async function deleteWhatsappChannel(formData: FormData) {
  try {
    const user = await requireAdmin();
    const supabase = createAdminSupabase();
    const id = normalizeText(formData.get("id"));
    const redirectTo = getRedirectTarget(formData);

    if (!id) {
      redirectWithStatus("error", "Channel tidak ditemukan.", redirectTo);
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
      redirectWithStatus("error", mapChannelErrorMessage(error.message), redirectTo);
    }

    revalidatePath("/admin/settings/webhook");
    revalidatePath("/admin/settings/webhook-official");
    redirectWithStatus("success", "Channel berhasil dihapus.", redirectTo);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus channel.";
    redirectWithStatus("error", mapChannelErrorMessage(message), getRedirectTarget(formData));
  }
}
