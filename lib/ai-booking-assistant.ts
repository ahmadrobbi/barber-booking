import { createAdminSupabase } from "@/lib/supabase";
import { getBlackoutDatesForScope } from "@/lib/user-blackout-dates";
import { getBusinessHoursForScope, type BusinessHours, WEEKDAY_KEYS } from "@/lib/scheduling";
import { type BookingService, getServicesForUser } from "@/lib/bookings";
import { type UserBranch, getBranchesForUser } from "@/lib/user-branches";
import { z } from "zod";
import type { IndustryKey } from "@/lib/industries";

type MerchantProfileRow = {
  business_name: string | null;
  business_description: string | null;
  website_url: string | null;
  contact_info: unknown;
  social_media: unknown;
};

type LandingPageRow = {
  subdomain: string | null;
  is_active: boolean | null;
};

export type AiAssistantIntent = "faq" | "booking_start" | "handoff" | "unknown";

export type AiBookingAssistantDecision = {
  intent: AiAssistantIntent;
  reply: string;
  confidence: number;
  extractedTopic?: string | null;
  shouldStartBooking?: boolean;
  needsHuman?: boolean;
};

export type AiFaqToolName =
  | "merchant_profile"
  | "branches"
  | "services"
  | "business_hours"
  | "blackout_dates"
  | "booking_state";

export type AiAssistantContext = {
  userId: string;
  industry: IndustryKey;
  businessName: string;
  businessDescription: string;
  websiteUrl: string | null;
  landingSlug: string | null;
  contactInfo: unknown;
  socialMedia: unknown;
  branches: UserBranch[];
  services: BookingService[];
  businessHours: BusinessHours;
  blackoutDates: Array<{ date: string; title: string | null; branchId: string | null }>;
};

const DEFAULT_AI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const DEFAULT_AI_MODEL = "gemma-4-26b-a4b-it";

const AssistantResponseSchema = z.object({
  intent: z.enum(["faq", "booking_start", "handoff", "unknown"]),
  reply: z.string().default(""),
  confidence: z.number().min(0).max(1).default(0.5),
  extractedTopic: z.string().nullable().optional(),
  shouldStartBooking: z.boolean().optional(),
  needsHuman: z.boolean().optional(),
});

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDayLabel(day: (typeof WEEKDAY_KEYS)[number]) {
  const labels: Record<(typeof WEEKDAY_KEYS)[number], string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
  };

  return labels[day];
}

function formatBusinessHoursSummary(businessHours: BusinessHours) {
  return WEEKDAY_KEYS.map((day) => {
    const item = businessHours[day];

    if (!item.enabled) {
      return `${formatDayLabel(day)}: libur`;
    }

    const base = `${formatDayLabel(day)}: ${item.open}-${item.close}`;
    if (!item.break_enabled) {
      return base;
    }

    return `${base} (istirahat ${item.break_open}-${item.break_close})`;
  }).join("\n");
}

function formatBranchesSummary(branches: UserBranch[]) {
  if (branches.length === 0) {
    return "-";
  }

  return branches
    .map((branch, index) => {
      const hours = branch.business_hours
        ? formatBusinessHoursSummary(branch.business_hours)
        : "mengikuti jam default merchant";

      return [
        `${index + 1}. ${branch.name}`,
        branch.code ? `   kode: ${branch.code}` : null,
        branch.address ? `   alamat: ${branch.address}` : null,
        branch.phone ? `   telepon: ${branch.phone}` : null,
        `   jam: ${hours.replace(/\n/g, " | ")}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function formatServicesSummary(services: BookingService[]) {
  if (services.length === 0) {
    return "-";
  }

  return services
    .map((service, index) =>
      [
        `${index + 1}. ${service.name}`,
        `   harga: ${formatCurrency(service.price)}`,
        `   durasi: ${service.duration_minutes} menit`,
      ].join("\n")
    )
    .join("\n\n");
}

function formatBlackoutSummary(
  blackoutDates: Array<{ date: string; title: string | null; branchId: string | null }>
) {
  if (blackoutDates.length === 0) {
    return "Tidak ada blackout date yang aktif.";
  }

  return blackoutDates
    .map((item) => {
      const label = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${item.date}T00:00:00`));

      return `- ${label}${item.title ? ` (${item.title})` : ""}${item.branchId ? ` [branch:${item.branchId}]` : ""}`;
    })
    .join("\n");
}

function formatContactInfoSummary(contactInfo: unknown) {
  if (!isRecord(contactInfo)) {
    return "-";
  }

  const lines = Object.entries(contactInfo)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .map(([key, value]) => `${key}: ${String(value)}`);

  return lines.length > 0 ? lines.join("\n") : "-";
}

function formatSocialMediaSummary(socialMedia: unknown) {
  if (!isRecord(socialMedia)) {
    return "-";
  }

  const lines = Object.entries(socialMedia)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .map(([key, value]) => `${key}: ${String(value)}`);

  return lines.length > 0 ? lines.join("\n") : "-";
}

async function loadMerchantProfile(userId: string) {
  const supabase = createAdminSupabase();
  const [{ data: profile }, { data: landingPage }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("business_name, business_description, website_url, contact_info, social_media")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_landing_pages")
      .select("subdomain, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  return {
    profile: (profile as MerchantProfileRow | null) ?? null,
    landingPage: (landingPage as LandingPageRow | null) ?? null,
  };
}

export async function buildAiAssistantContext(params: {
  userId: string;
  industry: IndustryKey;
}): Promise<AiAssistantContext> {
  const [profileResult, branches, services, businessHours, blackoutDates] = await Promise.all([
    loadMerchantProfile(params.userId),
    getBranchesForUser(params.userId, { activeOnly: true }),
    getServicesForUser(params.userId, params.industry),
    getBusinessHoursForScope({ userId: params.userId }),
    getBlackoutDatesForScope({ userId: params.userId }),
  ]);

  const businessName = normalizeText(profileResult.profile?.business_name) || "Booking Barbershop";
  const businessDescription =
    normalizeText(profileResult.profile?.business_description) ||
    "Booking mudah langsung dari WhatsApp bisnis.";
  const websiteUrl = normalizeText(profileResult.profile?.website_url) || null;
  const landingSlug = normalizeText(profileResult.landingPage?.subdomain) || null;

  return {
    userId: params.userId,
    industry: params.industry,
    businessName,
    businessDescription,
    websiteUrl,
    landingSlug,
    contactInfo: profileResult.profile?.contact_info ?? null,
    socialMedia: profileResult.profile?.social_media ?? null,
    branches,
    services,
    businessHours,
    blackoutDates: blackoutDates.map((item) => ({
      date: item.blackout_date,
      title: item.title,
      branchId: item.branch_id,
    })),
  };
}

function getAiConfig() {
  const apiKey = normalizeText(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY);
  const baseUrl = normalizeText(process.env.GEMINI_OPENAI_BASE_URL) || DEFAULT_AI_BASE_URL;
  const model = normalizeText(process.env.AI_BOOKING_MODEL) || DEFAULT_AI_MODEL;
  const enabled =
    (process.env.AI_BOOKING_ENABLED?.trim().toLowerCase() ?? "true") !== "false" &&
    Boolean(apiKey);

  return {
    apiKey,
    baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
    model,
    enabled,
  };
}

function extractJsonObject(content: string) {
  const trimmed = content.trim();

  if (!trimmed) {
    return null;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

  let startIndex = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < candidate.length; index += 1) {
    const char = candidate[index];

    if (startIndex === -1) {
      if (char === "{") {
        startIndex = index;
        depth = 1;
      }

      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\" && inString) {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return candidate.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

async function callAiChatCompletion(params: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}) {
  const config = getAiConfig();

  if (!config.enabled) {
    return null;
  }

  const response = await fetch(`${config.baseUrl}chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model ?? config.model,
      temperature: params.temperature ?? 0,
      max_tokens: params.max_tokens ?? 512,
      messages: params.messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed with ${response.status}: ${errorText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };

  return payload.choices?.[0]?.message?.content ?? "";
}

export function buildAiAssistantPrompt(params: {
  context: AiAssistantContext;
  message: string;
}) {
  const { context, message } = params;
  const system = [
    "Kamu adalah BookLink AI booking assistant untuk bisnis jasa.",
    "Gunakan bahasa Indonesia yang singkat, jelas, dan ramah.",
    "Jawab hanya berdasarkan konteks merchant yang diberikan.",
    "Jika data tidak ada, bilang tidak tersedia dan sarankan langkah aman.",
    "Jika user jelas ingin booking, set intent booking_start.",
    "Jika user bertanya informasi bisnis, jadikan intent faq.",
    "Jika konteks membingungkan atau perlu admin manusia, set intent handoff.",
    "Balas hanya JSON valid tanpa markdown, tanpa code fence, tanpa komentar.",
    "Schema JSON:",
    `{
      "intent": "faq | booking_start | handoff | unknown",
      "reply": "string",
      "confidence": 0.0,
      "extractedTopic": "string|null",
      "shouldStartBooking": true,
      "needsHuman": false
    }`,
  ].join("\n");

  const user = {
    merchant: {
      name: context.businessName,
      description: context.businessDescription,
      websiteUrl: context.websiteUrl,
      landingSlug: context.landingSlug,
      industry: context.industry,
      contactInfo: formatContactInfoSummary(context.contactInfo),
      socialMedia: formatSocialMediaSummary(context.socialMedia),
    },
    businessHours: formatBusinessHoursSummary(context.businessHours),
    branches: formatBranchesSummary(context.branches),
    services: formatServicesSummary(context.services),
    blackoutDates: formatBlackoutSummary(context.blackoutDates),
    customerMessage: message,
    operatingRules: [
      "Booking harus divalidasi oleh sistem, bukan dikhayalkan AI.",
      "Jika ditanya layanan, harga, cabang, jam buka, atau libur, gunakan data merchant.",
      "Jika customer ingin booking, arahkan ke flow booking awal.",
      "Jika informasi tidak tersedia, jangan menebak.",
    ],
  };

  return { system, user };
}

export async function generateAiAssistantDecision(params: {
  context: AiAssistantContext;
  message: string;
}): Promise<AiBookingAssistantDecision | null> {
  const { system, user } = buildAiAssistantPrompt(params);

  try {
    const content = await callAiChatCompletion({
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) },
      ],
    });

    if (!content) {
      return null;
    }

    const jsonString = extractJsonObject(content);

    if (!jsonString) {
      throw new Error("AI response did not contain valid JSON.");
    }

    const parsed = AssistantResponseSchema.parse(JSON.parse(jsonString));

    return {
      intent: parsed.intent,
      reply: parsed.reply.trim(),
      confidence: parsed.confidence,
      extractedTopic: parsed.extractedTopic ?? null,
      shouldStartBooking: parsed.shouldStartBooking ?? parsed.intent === "booking_start",
      needsHuman: parsed.needsHuman ?? parsed.intent === "handoff",
    };
  } catch (error) {
    console.warn("AI assistant decision failed:", error);
    return null;
  }
}

function pickFaqToolFromMessage(message: string, bookingStateSummary?: string | null): AiFaqToolName {
  const normalized = message.toLowerCase();
  const bookingState = bookingStateSummary?.toLowerCase() ?? "";

  if (/(status booking|booking status|status|riwayat booking|booking saya|konfirmasi)/i.test(normalized) || bookingState.includes("step: konfirmasi")) {
    return "booking_state";
  }

  if (/(jam buka|buka hari ini|hari ini buka|jadwal buka|jam operasional|operasional)/i.test(normalized)) {
    return "business_hours";
  }

  if (/(libur|cuti|tutup|blackout|tanggal merah|hari libur)/i.test(normalized)) {
    return "blackout_dates";
  }

  if (/(cabang|alamat|lokasi|di mana|dimana|peta|telepon|no wa cabang)/i.test(normalized)) {
    return "branches";
  }

  if (/(harga|biaya|durasi|lama|layanan|service|menu)/i.test(normalized)) {
    return "services";
  }

  return "merchant_profile";
}

function summarizeFaqTool(
  context: AiAssistantContext,
  toolName: AiFaqToolName,
  bookingStateSummary?: string | null
) {
  switch (toolName) {
    case "merchant_profile":
      return [
        `Nama bisnis: ${context.businessName}`,
        `Deskripsi: ${context.businessDescription}`,
        `Website: ${context.websiteUrl ?? "-"}`,
        `Landing slug: ${context.landingSlug ?? "-"}`,
        `Kontak: ${formatContactInfoSummary(context.contactInfo)}`,
        `Sosial media: ${formatSocialMediaSummary(context.socialMedia)}`,
      ].join("\n");
    case "branches":
      return formatBranchesSummary(context.branches);
    case "services":
      return formatServicesSummary(context.services);
    case "business_hours":
      return formatBusinessHoursSummary(context.businessHours);
    case "blackout_dates":
      return formatBlackoutSummary(context.blackoutDates);
    case "booking_state":
      return bookingStateSummary?.trim() || "Booking state belum tersedia.";
    default:
      return "-";
  }
}

function buildFaqToolAnswerPrompt(params: {
  context: AiAssistantContext;
  message: string;
  toolName: AiFaqToolName;
  toolResult: string;
  bookingStateSummary?: string | null;
}) {
  const system = [
    "Kamu adalah BookLink AI assistant.",
    "Gunakan hanya data tool result dan konteks merchant.",
    "Jawab singkat, akurat, dan membantu dalam bahasa Indonesia.",
    "Balas hanya teks biasa tanpa markdown, tanpa JSON, tanpa code fence.",
  ].join("\n");

  const user = {
    merchant: {
      name: params.context.businessName,
      description: params.context.businessDescription,
      landingSlug: params.context.landingSlug,
      industry: params.context.industry,
    },
    question: params.message,
    selectedTool: params.toolName,
    toolResult: params.toolResult,
    bookingStateSummary: params.bookingStateSummary ?? null,
  };

  return { system, user };
}

export async function generateAiFaqReply(params: {
  context: AiAssistantContext;
  message: string;
  bookingStateSummary?: string | null;
}): Promise<AiBookingAssistantDecision | null> {
  try {
    const toolName = pickFaqToolFromMessage(params.message, params.bookingStateSummary);
    const toolResult = summarizeFaqTool(params.context, toolName, params.bookingStateSummary);
    const answerPrompt = buildFaqToolAnswerPrompt({
      context: params.context,
      message: params.message,
      toolName,
      toolResult,
      bookingStateSummary: params.bookingStateSummary,
    });

    const answerContent = await callAiChatCompletion({
      messages: [
        { role: "system", content: answerPrompt.system },
        { role: "user", content: JSON.stringify(answerPrompt.user) },
      ],
    });

    console.log("[whatsapp-webhook][ai-faq] selection", {
      toolName,
      messagePreview: params.message.slice(0, 120),
      bookingStatePreview: params.bookingStateSummary?.slice(0, 120) ?? null,
    });

    if (!answerContent) {
      console.log("[whatsapp-webhook][ai-faq] answer", {
        toolName,
        answerPreview: toolResult.slice(0, 200),
        confidence: 0.5,
      });

      return {
        intent: "faq",
        reply: toolResult,
        confidence: 0.5,
        extractedTopic: toolName,
        shouldStartBooking: false,
        needsHuman: false,
      };
    }

    console.log("[whatsapp-webhook][ai-faq] answer", {
      toolName,
      answerPreview: answerContent.trim().slice(0, 200),
      confidence: 0.8,
    });

    return {
      intent: "faq",
      reply: answerContent.trim(),
      confidence: 0.8,
      extractedTopic: toolName,
      shouldStartBooking: false,
      needsHuman: false,
    };
  } catch (error) {
    console.warn("AI FAQ reply failed:", error);
    const toolName = pickFaqToolFromMessage(params.message, params.bookingStateSummary);
    const fallbackReply = summarizeFaqTool(params.context, toolName, params.bookingStateSummary);

    console.log("[whatsapp-webhook][ai-faq] answer", {
      toolName,
      answerPreview: fallbackReply.slice(0, 200),
      confidence: 0.5,
    });

    return {
      intent: "faq",
      reply: fallbackReply,
      confidence: 0.5,
      extractedTopic: toolName,
      shouldStartBooking: false,
      needsHuman: false,
    };
  }
}
