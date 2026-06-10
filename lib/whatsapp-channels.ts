import { createAdminSupabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import {
  getGlobalChatbotTemplates,
  mergeChatbotTemplates,
  normalizeChatbotChannelOverrides,
  type ChatbotChannelOverrides,
  type ChatbotReplyStyle,
} from "@/lib/chatbot";
import { INDUSTRIES, type IndustryKey } from "@/lib/industries";
import { getIndustryConfig } from "@/lib/industry-config";
import { getOfficialWhatsAppConfig } from "@/lib/whatsapp-official";

export type WhatsappChannel = {
  id: string;
  user_id: string | null;
  device_number: string;
  device_name: string | null;
  fonnte_device_token: string | null;
  webhook_secret: string | null;
  chatbot_provider: "fonnte" | "official" | null;
  official_phone_number_id: string | null;
  official_access_token: string | null;
  official_verify_token: string | null;
  official_message_template_name: string | null;
  official_message_template_language: string | null;
  industry: IndustryKey | null;
  is_active: boolean | null;
  is_default: boolean | null;
  template_overrides: ChatbotChannelOverrides | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type WhatsappRuntimeContext = {
  channel: WhatsappChannel | null;
  channelId: string | null;
  userId: string | null;
  deviceNumber: string | null;
  businessName: string;
  industry: IndustryKey;
  chatbotProvider: "fonnte" | "official";
  token: string | null;
  officialAccessToken: string | null;
  officialPhoneNumberId: string | null;
  officialVerifyToken: string | null;
  officialMessageTemplateName: string | null;
  officialMessageTemplateLanguage: string | null;
  templates: ReturnType<typeof mergeChatbotTemplates>;
  replyStyle: ChatbotReplyStyle;
  isLegacyFallback: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeDeviceNumber(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^\d]/g, "");
  return normalized || null;
}

function mapChannelRow(row: unknown): WhatsappChannel | null {
  if (!isRecord(row) || typeof row.id !== "string" || typeof row.device_number !== "string") {
    return null;
  }

  return {
    id: row.id,
    user_id: typeof row.user_id === "string" ? row.user_id : null,
    device_number: row.device_number,
    device_name: typeof row.device_name === "string" ? row.device_name : null,
    fonnte_device_token:
      typeof row.fonnte_device_token === "string" ? row.fonnte_device_token : null,
    webhook_secret: typeof row.webhook_secret === "string" ? row.webhook_secret : null,
    chatbot_provider:
      row.chatbot_provider === "official" || row.chatbot_provider === "fonnte"
        ? row.chatbot_provider
        : null,
    official_phone_number_id:
      typeof row.official_phone_number_id === "string" ? row.official_phone_number_id : null,
    official_access_token:
      typeof row.official_access_token === "string" ? row.official_access_token : null,
    official_verify_token:
      typeof row.official_verify_token === "string" ? row.official_verify_token : null,
    official_message_template_name:
      typeof row.official_message_template_name === "string"
        ? row.official_message_template_name
        : null,
    official_message_template_language:
      typeof row.official_message_template_language === "string"
        ? row.official_message_template_language
        : null,
    industry: typeof row.industry === "string" ? (row.industry as IndustryKey) : null,
    is_active: typeof row.is_active === "boolean" ? row.is_active : null,
    is_default: typeof row.is_default === "boolean" ? row.is_default : null,
    template_overrides: isRecord(row.template_overrides)
      ? (row.template_overrides as ChatbotChannelOverrides)
      : null,
    created_at: typeof row.created_at === "string" ? row.created_at : null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

async function getChannelByQuery(column: "id" | "device_number", value: string) {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("whatsapp_channels")
      .select(
        "id, user_id, device_number, device_name, fonnte_device_token, webhook_secret, chatbot_provider, official_phone_number_id, official_access_token, official_verify_token, official_message_template_name, official_message_template_language, industry, is_active, is_default, template_overrides"
      )
      .eq(column, value)
      .eq("is_active", true)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return mapChannelRow(data);
  } catch (error) {
    console.warn(`Failed to load WhatsApp channel by ${column}:`, error);
    return null;
  }
}

async function getBusinessNameByUserId(userId: string | null | undefined) {
  if (!userId) {
    return "Barbershop Kami";
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("business_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return typeof data?.business_name === "string" && data.business_name.trim()
      ? data.business_name.trim()
      : "Barbershop Kami";
  } catch (error) {
    console.warn("Failed to load business name by user:", error);
    return "Barbershop Kami";
  }
}

export async function getDefaultWhatsappChannelByUserId(userId: string | null | undefined) {
  if (!userId) {
    return null;
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("whatsapp_channels")
      .select(
        "id, user_id, device_number, device_name, fonnte_device_token, webhook_secret, chatbot_provider, official_phone_number_id, official_access_token, official_verify_token, official_message_template_name, official_message_template_language, industry, is_active, is_default, template_overrides, created_at, updated_at"
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1);

    if (error && error.code !== "42P01") {
      throw new Error(error.message);
    }

    const row = Array.isArray(data) ? data[0] : null;
    return mapChannelRow(row);
  } catch (error) {
    console.warn("Failed to load default WhatsApp channel by user:", error);
    return null;
  }
}

export async function getWhatsappChannelByDevice(deviceNumber: string | null | undefined) {
  const sanitized = sanitizeDeviceNumber(deviceNumber);

  if (!sanitized) {
    return null;
  }

  return getChannelByQuery("device_number", sanitized);
}

export async function getWhatsappChannelByOfficialPhoneNumberId(
  phoneNumberId: string | null | undefined
) {
  const sanitized = typeof phoneNumberId === "string" ? phoneNumberId.trim() : "";

  if (!sanitized) {
    return null;
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("whatsapp_channels")
      .select(
        "id, user_id, device_number, device_name, fonnte_device_token, webhook_secret, chatbot_provider, official_phone_number_id, official_access_token, official_verify_token, official_message_template_name, official_message_template_language, industry, is_active, is_default, template_overrides"
      )
      .eq("official_phone_number_id", sanitized)
      .eq("is_active", true)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return mapChannelRow(data);
  } catch (error) {
    console.warn("Failed to load WhatsApp channel by official phone number id:", error);
    return null;
  }
}

export async function getWhatsappChannelById(channelId: string | null | undefined) {
  if (!channelId) {
    return null;
  }

  return getChannelByQuery("id", channelId);
}

export async function getCurrentUserWhatsappChannels() {
  const session = await getSession();

  if (!session) {
    return [];
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("whatsapp_channels")
      .select(
        "id, user_id, device_number, device_name, fonnte_device_token, webhook_secret, chatbot_provider, official_phone_number_id, official_access_token, official_verify_token, official_message_template_name, official_message_template_language, industry, is_active, is_default, template_overrides, created_at, updated_at"
      )
      .eq("user_id", session.userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    if (error && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return (data ?? []).map((item) => mapChannelRow(item)).filter(Boolean) as WhatsappChannel[];
  } catch (error) {
    console.warn("Failed to load current user WhatsApp channels:", error);
    return [];
  }
}

export async function resolveWhatsappRuntimeContext(
  identity: { deviceNumber?: string | null; officialPhoneNumberId?: string | null }
): Promise<WhatsappRuntimeContext> {
  const officialConfig = getOfficialWhatsAppConfig();
  const globalTemplates = await getGlobalChatbotTemplates();
  const config = await getIndustryConfig();
  const channel = identity.officialPhoneNumberId
    ? await getWhatsappChannelByOfficialPhoneNumberId(identity.officialPhoneNumberId)
    : await getWhatsappChannelByDevice(identity.deviceNumber ?? null);
  const industry = channel?.industry ?? config.default;
  const industryTemplates = INDUSTRIES[industry]?.templates;
  const normalizedOverrides = normalizeChatbotChannelOverrides(channel?.template_overrides);
  const businessName = await getBusinessNameByUserId(channel?.user_id);
  const chatbotProvider = channel?.chatbot_provider ?? (identity.officialPhoneNumberId ? "official" : "fonnte");

  return {
    channel,
    channelId: channel?.id ?? null,
    userId: channel?.user_id ?? null,
    deviceNumber: sanitizeDeviceNumber(identity.deviceNumber ?? channel?.device_number ?? null),
    businessName,
    industry,
    chatbotProvider,
    token: channel?.fonnte_device_token ?? process.env.FONNTE_TOKEN?.trim() ?? null,
    officialAccessToken: channel?.official_access_token ?? officialConfig.accessToken ?? null,
    officialPhoneNumberId: channel?.official_phone_number_id ?? identity.officialPhoneNumberId ?? null,
    officialVerifyToken: channel?.official_verify_token ?? officialConfig.verifyToken,
    officialMessageTemplateName: channel?.official_message_template_name ?? null,
    officialMessageTemplateLanguage: channel?.official_message_template_language ?? "en_US",
    templates: mergeChatbotTemplates(
      globalTemplates,
      industryTemplates,
      normalizedOverrides.fallbackTemplates
    ),
    replyStyle: normalizedOverrides.replyStyle,
    isLegacyFallback: !channel,
  };
}

export async function resolveWhatsappContextFromBooking(booking: {
  channel_id?: string | null;
  industry?: string | null;
  user_id?: string | null;
}) {
  const officialConfig = getOfficialWhatsAppConfig();
  const globalTemplates = await getGlobalChatbotTemplates();
  const channel =
    (await getWhatsappChannelById(booking.channel_id ?? null)) ??
    (await getDefaultWhatsappChannelByUserId(booking.user_id ?? null));
  const config = await getIndustryConfig();
  const industry =
    (channel?.industry as IndustryKey | null) ??
    (typeof booking.industry === "string" ? (booking.industry as IndustryKey) : null) ??
    config.default;
  const industryTemplates = INDUSTRIES[industry]?.templates;
  const normalizedOverrides = normalizeChatbotChannelOverrides(channel?.template_overrides);
  const resolvedUserId = channel?.user_id ?? booking.user_id ?? null;
  const businessName = await getBusinessNameByUserId(resolvedUserId);

  return {
    channel,
    channelId: channel?.id ?? booking.channel_id ?? null,
    userId: resolvedUserId,
    deviceNumber: channel?.device_number ?? null,
    businessName,
    industry,
    chatbotProvider: channel?.chatbot_provider ?? "fonnte",
    token: channel?.fonnte_device_token ?? process.env.FONNTE_TOKEN?.trim() ?? null,
    officialAccessToken: channel?.official_access_token ?? officialConfig.accessToken ?? null,
    officialPhoneNumberId: channel?.official_phone_number_id ?? null,
    officialVerifyToken: channel?.official_verify_token ?? officialConfig.verifyToken,
    officialMessageTemplateName: channel?.official_message_template_name ?? null,
    officialMessageTemplateLanguage: channel?.official_message_template_language ?? "en_US",
    templates: mergeChatbotTemplates(
      globalTemplates,
      industryTemplates,
      normalizedOverrides.fallbackTemplates
    ),
    replyStyle: normalizedOverrides.replyStyle,
    isLegacyFallback: !channel,
  } satisfies WhatsappRuntimeContext;
}

export async function sendWhatsappMessage(params: {
  target: string;
  message: string;
  token: string | null;
  provider?: "fonnte" | "official";
  officialAccessToken?: string | null;
  officialPhoneNumberId?: string | null;
  officialTemplate?: {
    name: string;
    languageCode?: string;
    bodyParameters?: Array<string | number | null | undefined>;
  } | null;
}) {
  if ((params.provider ?? "fonnte") === "official") {
    const officialConfig = getOfficialWhatsAppConfig();
    const accessToken = params.officialAccessToken || officialConfig.accessToken;
    const phoneNumberId = params.officialPhoneNumberId;

    if (!accessToken || !phoneNumberId) {
      throw new Error("Missing official WhatsApp credentials for outbound message.");
    }

    const graphVersion = officialConfig.graphVersion;
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          params.officialTemplate
            ? {
                messaging_product: "whatsapp",
                to: params.target,
                type: "template",
                template: {
                  name: params.officialTemplate.name,
                  language: {
                    code: params.officialTemplate.languageCode || "en_US",
                  },
                  ...(params.officialTemplate.bodyParameters?.length
                    ? {
                        components: [
                          {
                            type: "body",
                            parameters: params.officialTemplate.bodyParameters.map((value) => ({
                              type: "text",
                              text: value === null || value === undefined ? "" : String(value),
                            })),
                          },
                        ],
                      }
                    : {}),
                },
              }
            : {
                messaging_product: "whatsapp",
                to: params.target,
                type: "text",
                text: { body: params.message },
              }
        ),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Official WhatsApp send failed with ${response.status}: ${errorText}`);
    }

    return response;
  }

  const fonnteToken = params.token || process.env.FONNTE_TOKEN?.trim() || "";

  if (!fonnteToken) {
    throw new Error("Missing Fonnte token for outbound WhatsApp message.");
  }

  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: fonnteToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: params.target,
      message: params.message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fonnte send failed with ${response.status}: ${errorText}`);
  }

  return response;
}
