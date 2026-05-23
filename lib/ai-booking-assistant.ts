import { createAdminSupabase } from "@/lib/supabase";
import { getBlackoutDatesForScope } from "@/lib/user-blackout-dates";
import { getBusinessHoursForScope, type BusinessHours, WEEKDAY_KEYS } from "@/lib/scheduling";
import { type BookingService, getServicesForUser } from "@/lib/bookings";
import { type UserBranch, getBranchesForUser } from "@/lib/user-branches";
import { z } from "zod";
import type { IndustryKey } from "@/lib/industries";
import { recordChatbotAiEvent } from "@/lib/chatbot-observability";

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
  channelId: string | null;
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

type MerchantKnowledgeRow = {
  id: string;
  title: string;
  question: string;
  answer: string;
  tags: string[] | null;
  category: string | null;
  priority: number | null;
  source: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

type KnowledgeMatch = {
  row: MerchantKnowledgeRow;
  score: number;
  reason: string;
};

const DEFAULT_AI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const DEFAULT_AI_MODEL = "gemma-4-26b-a4b-it";
const ASSISTANT_CONTEXT_CACHE_TTL_MS = 5 * 60 * 1000;
const AI_ROUTER_TIMEOUT_MS = 1800;
const AI_FAQ_TIMEOUT_MS = 2500;

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

type CacheEntry<T> = {
  expiresAt: number;
  value?: T;
  promise?: Promise<T>;
};

const assistantContextCache = new Map<string, CacheEntry<AiAssistantContext>>();
const merchantKnowledgeCache = new Map<string, CacheEntry<MerchantKnowledgeRow[]>>();

export function clearAiAssistantCaches(params?: { userId?: string; channelId?: string }) {
  if (!params?.userId && !params?.channelId) {
    assistantContextCache.clear();
    merchantKnowledgeCache.clear();
    return;
  }

  if (params.userId) {
    for (const key of assistantContextCache.keys()) {
      if (key.includes(`:${params.userId}:`) || key.includes(`:${params.userId}`)) {
        assistantContextCache.delete(key);
      }
    }

    merchantKnowledgeCache.delete(params.userId);
  }

  if (params.channelId) {
    for (const key of assistantContextCache.keys()) {
      if (key.startsWith(`${params.channelId}:`)) {
        assistantContextCache.delete(key);
      }
    }
  }
}

async function getCachedAsync<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
) {
  const now = Date.now();
  const existing = cache.get(key);

  if (existing?.value !== undefined && existing.expiresAt > now) {
    return existing.value;
  }

  if (existing?.promise) {
    return existing.promise;
  }

  const promise = loader().then((value) => {
    cache.set(key, {
      expiresAt: Date.now() + ttlMs,
      value,
    });

    return value;
  });

  cache.set(key, {
    expiresAt: now + ttlMs,
    promise,
  });

  try {
    return await promise;
  } finally {
    const current = cache.get(key);
    if (current?.promise === promise && current.value === undefined) {
      cache.delete(key);
    }
  }
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

function formatBranchesSummary(branches: UserBranch[], maxItems?: number) {
  const items = typeof maxItems === "number" ? branches.slice(0, maxItems) : branches;

  if (items.length === 0) {
    return "-";
  }

  const body = items
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

  return typeof maxItems === "number" && branches.length > maxItems
    ? `${body}\n\n...dan ${branches.length - maxItems} cabang lain`
    : body;
}

function formatServicesSummary(services: BookingService[], maxItems?: number) {
  const items = typeof maxItems === "number" ? services.slice(0, maxItems) : services;

  if (items.length === 0) {
    return "-";
  }

  const body = items
    .map((service, index) =>
      [
        `${index + 1}. ${service.name}`,
        `   harga: ${formatCurrency(service.price)}`,
        `   durasi: ${service.duration_minutes} menit`,
      ].join("\n")
    )
    .join("\n\n");

  return typeof maxItems === "number" && services.length > maxItems
    ? `${body}\n\n...dan ${services.length - maxItems} layanan lain`
    : body;
}

function formatBlackoutSummary(
  blackoutDates: Array<{ date: string; title: string | null; branchId: string | null }>,
  maxItems?: number
) {
  const items = typeof maxItems === "number" ? blackoutDates.slice(0, maxItems) : blackoutDates;

  if (items.length === 0) {
    return "Tidak ada blackout date yang aktif.";
  }

  const body = items
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

  return typeof maxItems === "number" && blackoutDates.length > maxItems
    ? `${body}\n...dan ${blackoutDates.length - maxItems} blackout lain`
    : body;
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

async function loadMerchantKnowledge(userId: string) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("user_knowledge_entries")
    .select("id, title, question, answer, tags, category, priority, source, is_active, updated_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error && error.code !== "42P01") {
    throw new Error(error.message);
  }

  return (data ?? []) as MerchantKnowledgeRow[];
}

export async function buildAiAssistantContext(params: {
  channelId?: string | null;
  userId: string;
  industry: IndustryKey;
  branches?: UserBranch[];
  services?: BookingService[];
  businessHours?: BusinessHours;
  blackoutDates?: Array<{ date: string; title: string | null; branchId: string | null }>;
}): Promise<AiAssistantContext> {
  const cacheKey = [params.channelId ?? "global", params.userId, params.industry].join(":");

  return getCachedAsync(
    assistantContextCache,
    cacheKey,
    ASSISTANT_CONTEXT_CACHE_TTL_MS,
    async () => {
      const [profileResult, branches, services, businessHours, blackoutDates] = await Promise.all([
        loadMerchantProfile(params.userId),
        Promise.resolve(params.branches ?? getBranchesForUser(params.userId, { activeOnly: true })),
        Promise.resolve(params.services ?? getServicesForUser(params.userId, params.industry)),
        Promise.resolve(params.businessHours ?? getBusinessHoursForScope({ userId: params.userId })),
        Promise.resolve(
          params.blackoutDates ?? getBlackoutDatesForScope({ userId: params.userId })
        ),
      ]);

      const businessName = normalizeText(profileResult.profile?.business_name) || "Booking Barbershop";
      const businessDescription =
        normalizeText(profileResult.profile?.business_description) ||
        "Booking mudah langsung dari WhatsApp bisnis.";
      const websiteUrl = normalizeText(profileResult.profile?.website_url) || null;
      const landingSlug = normalizeText(profileResult.landingPage?.subdomain) || null;
      const normalizedBlackoutDates = blackoutDates.map((item) => {
        if ("blackout_date" in item) {
          return {
            date: item.blackout_date,
            title: item.title,
            branchId: item.branch_id,
          };
        }

        return {
          date: item.date,
          title: item.title,
          branchId: item.branchId,
        };
      });

      return {
        channelId: params.channelId ?? null,
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
        blackoutDates: normalizedBlackoutDates,
      };
    }
  );
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeSearchText(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function buildKnowledgeCorpus(row: MerchantKnowledgeRow) {
  const tags = Array.isArray(row.tags) ? row.tags.join(" ") : "";
  return normalizeSearchText(
    [row.title, row.question, row.answer, row.category ?? "", tags].join(" ")
  );
}

function scoreKnowledgeEntry(row: MerchantKnowledgeRow, message: string): KnowledgeMatch {
  const normalizedMessage = normalizeSearchText(message);
  const messageTokens = new Set(tokenizeSearchText(message));
  const corpus = buildKnowledgeCorpus(row);
  const corpusTokens = new Set(tokenizeSearchText(corpus));

  let score = 0;
  const reasons: string[] = [];

  if (!normalizedMessage) {
    return { row, score: 0, reason: "empty_query" };
  }

  if (corpus.includes(normalizedMessage) || normalizedMessage.includes(corpus)) {
    score += 0.45;
    reasons.push("substring");
  }

  const title = normalizeSearchText(row.title);
  const question = normalizeSearchText(row.question);
  const answer = normalizeSearchText(row.answer);
  const category = normalizeSearchText(row.category ?? "");
  const tags = Array.isArray(row.tags) ? row.tags.map((item) => normalizeSearchText(item)) : [];

  if (title && (normalizedMessage === title || normalizedMessage.includes(title) || title.includes(normalizedMessage))) {
    score += 0.35;
    reasons.push("title");
  }

  if (
    question &&
    (normalizedMessage === question || normalizedMessage.includes(question) || question.includes(normalizedMessage))
  ) {
    score += 0.35;
    reasons.push("question");
  }

  if (answer && answer.includes(normalizedMessage)) {
    score += 0.12;
    reasons.push("answer");
  }

  if (category && normalizedMessage.includes(category)) {
    score += 0.08;
    reasons.push("category");
  }

  if (tags.some((tag) => tag && normalizedMessage.includes(tag))) {
    score += 0.1;
    reasons.push("tag");
  }

  let overlapCount = 0;
  for (const token of messageTokens) {
    if (corpusTokens.has(token)) {
      overlapCount += 1;
    }
  }

  if (messageTokens.size > 0) {
    const overlapRatio = overlapCount / messageTokens.size;
    score += overlapRatio * 0.35;
    if (overlapRatio > 0) {
      reasons.push(`overlap:${overlapRatio.toFixed(2)}`);
    }
  }

  score += Math.min((row.priority ?? 0) / 50, 0.1);

  return {
    row,
    score: Math.max(0, Math.min(1, score)),
    reason: reasons.join(",") || "token_overlap",
  };
}

async function searchMerchantKnowledge(params: {
  userId: string;
  message: string;
  limit?: number;
}) {
  const startedAt = Date.now();
  const rows = await loadMerchantKnowledge(params.userId);
  const ranked = rows
    .map((row) => scoreKnowledgeEntry(row, params.message))
    .filter((item) => item.score > 0.18)
    .sort((left, right) => right.score - left.score)
    .slice(0, params.limit ?? 3);

  return {
    matches: ranked,
    retrievalMs: Date.now() - startedAt,
  };
}

function isStrongKnowledgeMatch(message: string, match: KnowledgeMatch) {
  const normalizedMessage = normalizeSearchText(message);
  const normalizedTitle = normalizeSearchText(match.row.title);
  const normalizedQuestion = normalizeSearchText(match.row.question);

  return (
    match.score >= 0.3 ||
    normalizedMessage === normalizedTitle ||
    normalizedMessage === normalizedQuestion ||
    normalizedMessage.includes(normalizedQuestion) ||
    normalizedQuestion.includes(normalizedMessage)
  );
}

export async function generateKnowledgePriorityFaqReply(params: {
  context: AiAssistantContext;
  message: string;
  bookingStateSummary?: string | null;
  sender?: string | null;
  messageId?: string | null;
}): Promise<AiBookingAssistantDecision | null> {
  const startedAt = Date.now();

  try {
    const retrieval = await searchMerchantKnowledge({
      userId: params.context.userId,
      message: params.message,
      limit: 3,
    });
    const topKnowledgeMatch = retrieval.matches[0] ?? null;

    console.log("[whatsapp-webhook][ai-faq][knowledge-first]", {
      messagePreview: params.message.slice(0, 120),
      knowledgeHitCount: retrieval.matches.length,
      topKnowledgeScore: topKnowledgeMatch?.score ?? null,
    });

    if (!topKnowledgeMatch || !isStrongKnowledgeMatch(params.message, topKnowledgeMatch)) {
      return null;
    }

    const reply = topKnowledgeMatch.row.answer.trim();

    await recordChatbotAiEvent({
      userId: params.context.userId,
      channelId: params.context.channelId,
      sender: params.sender ?? null,
      messageId: params.messageId ?? null,
      route: "faq",
      intent: "faq",
      confidence: topKnowledgeMatch.score,
      model: null,
      knowledgeHitCount: retrieval.matches.length,
      retrievalMs: retrieval.retrievalMs,
      aiMs: 0,
      totalMs: Date.now() - startedAt,
      fallbackUsed: false,
      error: null,
      metadata: {
        messagePreview: params.message.slice(0, 120),
        selectedReplySource: "knowledge",
        knowledgeReasons: retrieval.matches.map((match) => match.reason),
      },
    });

    return {
      intent: "faq",
      reply,
      confidence: topKnowledgeMatch.score,
      extractedTopic: null,
      shouldStartBooking: false,
      needsHuman: false,
    };
  } catch (error) {
    console.warn("Knowledge-first FAQ reply failed:", error);

    await recordChatbotAiEvent({
      userId: params.context.userId,
      channelId: params.context.channelId,
      sender: params.sender ?? null,
      messageId: params.messageId ?? null,
      route: "faq",
      intent: "faq",
      confidence: 0.5,
      model: null,
      knowledgeHitCount: 0,
      retrievalMs: 0,
      aiMs: 0,
      totalMs: Date.now() - startedAt,
      fallbackUsed: true,
      error: error instanceof Error ? error.message : "Unknown knowledge reply error",
      metadata: {
        messagePreview: params.message.slice(0, 120),
        selectedReplySource: "knowledge-first-error",
      },
    });

    return null;
  }
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
  timeoutMs?: number;
}) {
  const config = getAiConfig();

  if (!config.enabled) {
    return null;
  }

  const controller = new AbortController();
  const timeoutMs = params.timeoutMs ?? 2500;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetch(`${config.baseUrl}chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: params.model ?? config.model,
      temperature: params.temperature ?? 0,
      max_tokens: params.max_tokens ?? 256,
      messages: params.messages,
    }),
  }).finally(() => clearTimeout(timeout));

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
      branchCount: context.branches.length,
      serviceCount: context.services.length,
    },
    stateHint: {
      hasBranches: context.branches.length > 0,
      hasServices: context.services.length > 0,
      hasBlackoutDates: context.blackoutDates.length > 0,
    },
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
  sender?: string | null;
  messageId?: string | null;
}): Promise<AiBookingAssistantDecision | null> {
  const { system, user } = buildAiAssistantPrompt(params);
  const startedAt = Date.now();
  let aiMs = 0;

  try {
    const aiStartedAt = Date.now();
    const content = await callAiChatCompletion({
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) },
      ],
      max_tokens: 220,
      timeoutMs: AI_ROUTER_TIMEOUT_MS,
    });
    aiMs = Date.now() - aiStartedAt;

    if (!content) {
      await recordChatbotAiEvent({
        userId: params.context.userId,
        channelId: params.context.channelId,
        sender: params.sender ?? null,
        messageId: params.messageId ?? null,
        route: "router",
        intent: null,
        confidence: null,
        model: getAiConfig().model,
        knowledgeHitCount: 0,
        retrievalMs: 0,
        aiMs,
        totalMs: Date.now() - startedAt,
        fallbackUsed: true,
        error: null,
        metadata: {
          reason: "empty_ai_response",
          messagePreview: params.message.slice(0, 120),
        },
      });
      return null;
    }

    const jsonString = extractJsonObject(content);

    if (!jsonString) {
      throw new Error("AI response did not contain valid JSON.");
    }

    const parsed = AssistantResponseSchema.parse(JSON.parse(jsonString));

    const decision = {
      intent: parsed.intent,
      reply: parsed.reply.trim(),
      confidence: parsed.confidence,
      extractedTopic: parsed.extractedTopic ?? null,
      shouldStartBooking: parsed.shouldStartBooking ?? parsed.intent === "booking_start",
      needsHuman: parsed.needsHuman ?? parsed.intent === "handoff",
    };

    await recordChatbotAiEvent({
      userId: params.context.userId,
      channelId: params.context.channelId,
      sender: params.sender ?? null,
      messageId: params.messageId ?? null,
      route: "router",
      intent: decision.intent,
      confidence: decision.confidence,
      model: getAiConfig().model,
      knowledgeHitCount: 0,
      retrievalMs: 0,
      aiMs,
      totalMs: Date.now() - startedAt,
      fallbackUsed: false,
      error: null,
      metadata: {
        extractedTopic: decision.extractedTopic,
        shouldStartBooking: decision.shouldStartBooking,
        needsHuman: decision.needsHuman,
        messagePreview: params.message.slice(0, 120),
      },
    });

    return decision;
  } catch (error) {
    console.warn("AI assistant decision failed:", error);
    await recordChatbotAiEvent({
      userId: params.context.userId,
      channelId: params.context.channelId,
      sender: params.sender ?? null,
      messageId: params.messageId ?? null,
      route: "router",
      intent: null,
      confidence: null,
      model: getAiConfig().model,
      knowledgeHitCount: 0,
      retrievalMs: 0,
      aiMs,
      totalMs: Date.now() - startedAt,
      fallbackUsed: true,
      error: error instanceof Error ? error.message : "Unknown router error",
      metadata: {
        messagePreview: params.message.slice(0, 120),
      },
    });
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
      return formatBranchesSummary(context.branches, 3);
    case "services":
      return formatServicesSummary(context.services, 5);
    case "business_hours":
      return formatBusinessHoursSummary(context.businessHours);
    case "blackout_dates":
      return formatBlackoutSummary(context.blackoutDates, 5);
    case "booking_state":
      return bookingStateSummary?.trim() || "Booking state belum tersedia.";
    default:
      return "-";
  }
}

function getDeterministicFaqAnswer(params: {
  context: AiAssistantContext;
  toolName: AiFaqToolName;
  bookingStateSummary?: string | null;
}) {
  const toolResult = summarizeFaqTool(params.context, params.toolName, params.bookingStateSummary);

  switch (params.toolName) {
    case "merchant_profile":
      return `Info bisnis ${params.context.businessName}:\n${toolResult}`;
    case "branches":
      return `Cabang aktif yang kami temukan:\n${toolResult}`;
    case "services":
      return `Layanan yang tersedia:\n${toolResult}`;
    case "business_hours":
      return `Jam operasional ${params.context.businessName}:\n${toolResult}`;
    case "blackout_dates":
      return `Hari libur / blackout yang aktif:\n${toolResult}`;
    case "booking_state":
      return toolResult;
    default:
      return toolResult;
  }
}

function buildFaqToolAnswerPrompt(params: {
  context: AiAssistantContext;
  message: string;
  toolName: AiFaqToolName;
  toolResult: string;
  bookingStateSummary?: string | null;
  knowledgeMatches: KnowledgeMatch[];
}) {
  const system = [
    "Kamu adalah BookLink AI assistant.",
    "Gunakan hanya data knowledge dan konteks merchant yang diberikan.",
    "Jawab singkat, akurat, dan membantu dalam bahasa Indonesia.",
    "Kalau data tidak cukup, jelaskan keterbatasannya dan sarankan langkah aman.",
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
    knowledgeMatches: params.knowledgeMatches.map((match) => ({
      title: match.row.title,
      question: match.row.question,
      answer: match.row.answer,
      category: match.row.category,
      tags: match.row.tags ?? [],
      score: Number(match.score.toFixed(3)),
      reason: match.reason,
    })),
  };

  return { system, user };
}

function shouldUseAiForFaq(message: string, knowledgeMatches: KnowledgeMatch[]) {
  const normalized = normalizeSearchText(message);
  if (!knowledgeMatches.length) {
    return false;
  }

  if (knowledgeMatches[0]?.score >= 0.88 && knowledgeMatches.length === 1) {
    return false;
  }

  return /(\bjelaskan\b|\brekomendasi\b|\bsaran\b|\bbeda\b|\bperbedaan\b|\bkapan\b|\bkenapa\b|\bbagaimana\b|\bgimana\b|\bcocok\b|\bterbaik\b|\bapa yang\b)/i.test(normalized);
}

export async function generateAiFaqReply(params: {
  context: AiAssistantContext;
  message: string;
  bookingStateSummary?: string | null;
  sender?: string | null;
  messageId?: string | null;
}): Promise<AiBookingAssistantDecision | null> {
  const startedAt = Date.now();
  const toolName = pickFaqToolFromMessage(params.message, params.bookingStateSummary);

  try {
    const retrieval = await searchMerchantKnowledge({
      userId: params.context.userId,
      message: params.message,
      limit: 3,
    });
    const topKnowledgeMatch = retrieval.matches[0] ?? null;
    const toolResult = summarizeFaqTool(params.context, toolName, params.bookingStateSummary);
    const deterministicReply = getDeterministicFaqAnswer({
      context: params.context,
      toolName,
      bookingStateSummary: params.bookingStateSummary,
    });

    console.log("[whatsapp-webhook][ai-faq] selection", {
      toolName,
      messagePreview: params.message.slice(0, 120),
      bookingStatePreview: params.bookingStateSummary?.slice(0, 120) ?? null,
      knowledgeHitCount: retrieval.matches.length,
      topKnowledgeScore: retrieval.matches[0]?.score ?? null,
    });

    if (topKnowledgeMatch && topKnowledgeMatch.score >= 0.58) {
      const reply = topKnowledgeMatch.row.answer.trim();

      await recordChatbotAiEvent({
        userId: params.context.userId,
        channelId: params.context.channelId,
        sender: params.sender ?? null,
        messageId: params.messageId ?? null,
        route: "faq",
        intent: "faq",
        confidence: topKnowledgeMatch.score,
        model: null,
        knowledgeHitCount: retrieval.matches.length,
        retrievalMs: retrieval.retrievalMs,
        aiMs: 0,
        totalMs: Date.now() - startedAt,
        fallbackUsed: false,
        error: null,
        metadata: {
          toolName,
          messagePreview: params.message.slice(0, 120),
          knowledgeReasons: retrieval.matches.map((match) => match.reason),
          selectedReplySource: "knowledge",
        },
      });

      console.log("[whatsapp-webhook][ai-faq] answer", {
        toolName,
        answerPreview: reply.slice(0, 200),
        confidence: topKnowledgeMatch.score,
      });

      return {
        intent: "faq",
        reply,
        confidence: topKnowledgeMatch.score,
        extractedTopic: toolName,
        shouldStartBooking: false,
        needsHuman: false,
      };
    }

    if (!shouldUseAiForFaq(params.message, retrieval.matches)) {
      const reply = deterministicReply;

      await recordChatbotAiEvent({
        userId: params.context.userId,
        channelId: params.context.channelId,
        sender: params.sender ?? null,
        messageId: params.messageId ?? null,
        route: "faq",
        intent: "faq",
        confidence: retrieval.matches[0]?.score ?? 0.5,
        model: null,
        knowledgeHitCount: retrieval.matches.length,
        retrievalMs: retrieval.retrievalMs,
        aiMs: 0,
        totalMs: Date.now() - startedAt,
        fallbackUsed: retrieval.matches.length === 0,
        error: null,
        metadata: {
          toolName,
          messagePreview: params.message.slice(0, 120),
          knowledgeReasons: retrieval.matches.map((match) => match.reason),
          selectedReplySource: "deterministic",
        },
      });

      console.log("[whatsapp-webhook][ai-faq] answer", {
        toolName,
        answerPreview: reply.slice(0, 200),
        confidence: retrieval.matches[0]?.score ?? 0.5,
      });

      return {
        intent: "faq",
        reply,
        confidence: retrieval.matches[0]?.score ?? 0.5,
        extractedTopic: toolName,
        shouldStartBooking: false,
        needsHuman: false,
      };
    }

    const answerPrompt = buildFaqToolAnswerPrompt({
      context: params.context,
      message: params.message,
      toolName,
      toolResult,
      bookingStateSummary: params.bookingStateSummary,
      knowledgeMatches: retrieval.matches,
    });

    const aiStartedAt = Date.now();
    const answerContent = await callAiChatCompletion({
      messages: [
        { role: "system", content: answerPrompt.system },
        { role: "user", content: JSON.stringify(answerPrompt.user) },
      ],
      max_tokens: 220,
      timeoutMs: AI_FAQ_TIMEOUT_MS,
    });
    const aiMs = Date.now() - aiStartedAt;

    const reply = answerContent?.trim() || deterministicReply;

    await recordChatbotAiEvent({
      userId: params.context.userId,
      channelId: params.context.channelId,
      sender: params.sender ?? null,
      messageId: params.messageId ?? null,
      route: "faq",
      intent: "faq",
      confidence: retrieval.matches[0]?.score ?? 0.7,
      model: getAiConfig().model,
      knowledgeHitCount: retrieval.matches.length,
      retrievalMs: retrieval.retrievalMs,
      aiMs,
      totalMs: Date.now() - startedAt,
      fallbackUsed: !answerContent,
      error: null,
      metadata: {
        toolName,
        messagePreview: params.message.slice(0, 120),
        knowledgeReasons: retrieval.matches.map((match) => match.reason),
        selectedReplySource: answerContent ? "ai" : "deterministic",
      },
    });

    console.log("[whatsapp-webhook][ai-faq] answer", {
      toolName,
      answerPreview: reply.slice(0, 200),
      confidence: retrieval.matches[0]?.score ?? 0.7,
    });

    return {
      intent: "faq",
      reply,
      confidence: retrieval.matches[0]?.score ?? 0.7,
      extractedTopic: toolName,
      shouldStartBooking: false,
      needsHuman: false,
    };
  } catch (error) {
    console.warn("AI FAQ reply failed:", error);
    const fallbackReply = getDeterministicFaqAnswer({
      context: params.context,
      toolName,
      bookingStateSummary: params.bookingStateSummary,
    });

    await recordChatbotAiEvent({
      userId: params.context.userId,
      channelId: params.context.channelId,
      sender: params.sender ?? null,
      messageId: params.messageId ?? null,
      route: "faq",
      intent: "faq",
      confidence: 0.5,
      model: getAiConfig().model,
      knowledgeHitCount: 0,
      retrievalMs: 0,
      aiMs: 0,
      totalMs: Date.now() - startedAt,
      fallbackUsed: true,
      error: error instanceof Error ? error.message : "Unknown FAQ error",
      metadata: {
        toolName,
        messagePreview: params.message.slice(0, 120),
      },
    });

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
