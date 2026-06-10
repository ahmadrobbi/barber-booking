import {
  DEFAULT_CHATBOT_REPLY_STYLE,
  formatBookingDateLabel,
  formatRupiah,
  getUpcomingDateOptions,
  getServiceBySelection,
  getServiceOptionsText,
  getSlotBySelection,
  getSlotOptionsText,
  renderTemplate,
  type ChatbotReplyStyle,
} from "@/lib/chatbot";
import { type IndustryKey, getAvailableIndustries } from "@/lib/industries";
import { isBookingSlotConflict } from "@/lib/booking-conflicts";
import { getServicesForUser } from "@/lib/bookings";
import {
  buildAiAssistantContext,
  parseAiBookingStepInput,
  type AiBookingParserCandidate,
  generateKnowledgePriorityFaqReply,
  generateAiAssistantDecision,
  generateAiFaqReply,
} from "@/lib/ai-booking-assistant";
import { getAvailableSlotsForDate, isSlotAvailable } from "@/lib/scheduling";
import { createAdminSupabase } from "@/lib/supabase";
import { getBranchesForUser, type UserBranch } from "@/lib/user-branches";
import {
  resolveWhatsappRuntimeContext,
  sendWhatsappMessage,
  type WhatsappRuntimeContext,
} from "@/lib/whatsapp-channels";

type SessionState = {
  sender: string;
  channel_id: string | null;
  user_id: string | null;
  branch_id: string | null;
  step: string | null;
  customer_name: string | null;
  layanan: string | null;
  harga: number | null;
  tanggal: string | null;
  jam: string | null;
  industry: IndustryKey;
};

type BookingScope = {
  userId: string | null;
  channelId: string | null;
  branchId: string | null;
};

type ParsedWebhookPayload = {
  eventType: "message" | "status" | "unknown";
  payloadKeys: string[];
  hasMessages: boolean;
  hasStatuses: boolean;
  hasContacts: boolean;
  incomingMessage: string;
  sender: string;
  device: string | null;
  officialPhoneNumberId: string | null;
  webhookSecret: string | null;
  messageId: string | null;
  deliveryStatus: string | null;
  statusRecipientId: string | null;
};

type GreetingParams = {
  sender: string;
  context: WhatsappRuntimeContext;
  industry: IndustryKey;
  tenantServices: Awaited<ReturnType<typeof getServicesForUser>>;
  branches: UserBranch[];
};

type StepReplyParams = {
  state: SessionState;
  context: WhatsappRuntimeContext;
  templates: WhatsappRuntimeContext["templates"];
  tenantServices: Awaited<ReturnType<typeof getServicesForUser>>;
  branches: UserBranch[];
  today: Date;
  scope: BookingScope;
  industry: IndustryKey;
};

const RECENT_MESSAGE_DEDUPE_WINDOW_MS = 15_000;
const RECENT_OUTBOUND_ECHO_WINDOW_MS = 60_000;
const RECENT_OUTBOUND_ECHO_LOOKBACK_BUCKETS = 3;

function getWebhookBuildMarker() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.trim().slice(0, 8) || "local";
  const vercelEnv = process.env.VERCEL_ENV?.trim() || "unknown";

  return `${vercelEnv}:${commitSha}`;
}

function getSupabase() {
  return createAdminSupabase();
}

function normalizeSender(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const digits = value.replace(/[^\d]/g, "");
  return digits || value.trim();
}

function normalizeCustomerName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCancelMessage(message: string) {
  return ["batal", "cancel", "stop", "keluar"].includes(message);
}

function isContinueMessage(message: string) {
  return ["lanjut", "lanjutkan", "opsi", "pilihan", "ulang"].includes(message);
}

function isLikelyFaqMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  if (normalized.includes("?")) {
    return true;
  }

  return /(\bberapa\b|\balamat\b|\bcabang\b|\blokasi\b|\bharga\b|\blibur\b|\bjam buka\b|\bjam operasional\b|\bkontak\b|\bwa\b|\bwhatsapp\b|\binstagram\b|\bpromo\b|\bdurasi\b|\bjadwal\b|\breschedule\b|\blayanan\b|\bservice\b|\bmenu\b|\bpunya\b|\bapa saja\b)/i.test(normalized);
}

function withCancelHint(message: string) {
  return `${message}\n\nKetik *BATAL* kalau mau berhenti dari booking ini.`;
}

function getToneLead(style: ChatbotReplyStyle, variant: "ack" | "guide" | "retry" = "guide") {
  const resolvedStyle = style ?? DEFAULT_CHATBOT_REPLY_STYLE;

  if (resolvedStyle.tone === "professional") {
    if (variant === "ack") return "Baik.";
    if (variant === "retry") return "Mohon coba lagi.";
    return "Silakan lanjut.";
  }

  if (resolvedStyle.tone === "friendly") {
    if (variant === "ack") return "Siap.";
    if (variant === "retry") return "Coba lagi ya.";
    return "Lanjut ya.";
  }

  if (variant === "ack") return "Siap ya.";
  if (variant === "retry") return "Coba lagi pelan-pelan ya.";
  return "Kita lanjut ya.";
}

function maybeAddEmoji(style: ChatbotReplyStyle, emoji: string) {
  if (style.emojiLevel === "none") {
    return "";
  }

  if (style.emojiLevel === "low") {
    return `${emoji} `;
  }

  return `${emoji} `;
}

function composeNaturalReply(params: {
  style: ChatbotReplyStyle;
  intro?: string | null;
  lines?: string[];
  question?: string | null;
  includeClosingLine?: boolean;
}) {
  const parts = [
    params.intro?.trim() ?? "",
    ...(params.lines ?? []).map((line) => line.trim()).filter(Boolean),
    params.question?.trim() ?? "",
    params.includeClosingLine && params.style.closingLine ? params.style.closingLine.trim() : "",
  ].filter(Boolean);

  return parts.join("\n\n");
}

function getBranchOptionsText(branches: UserBranch[]) {
  return branches.map((branch, index) => `${index + 1}. *${branch.name}*`).join("\n");
}

function getBranchCandidates(branches: UserBranch[]): AiBookingParserCandidate[] {
  return branches
    .filter((branch): branch is UserBranch & { id: string } => typeof branch.id === "string")
    .map((branch) => ({
      id: branch.id,
      label: branch.name,
      aliases: [branch.code, branch.name].filter(Boolean) as string[],
      metadata: [branch.address, branch.phone].filter(Boolean) as string[],
    }));
}

function getServiceCandidates(services: Awaited<ReturnType<typeof getServicesForUser>>): AiBookingParserCandidate[] {
  return services.map((service) => ({
    id: service.code,
    label: service.name,
    aliases: [service.code, service.name].filter(Boolean),
    metadata: [service.description, formatRupiah(service.price)].filter(Boolean),
  }));
}

function getDateCandidates(options: Array<{ key: string; label: string; index: number }>): AiBookingParserCandidate[] {
  return options.map((option) => ({
    id: option.key,
    label: option.label,
    aliases: [String(option.index), option.key, option.label],
  }));
}

function getSlotCandidates(slots: readonly string[]): AiBookingParserCandidate[] {
  return slots.map((slot, index) => ({
    id: slot,
    label: slot,
    aliases: [String(index + 1), slot],
  }));
}

function getBranchBySelection(message: string, branches: UserBranch[]) {
  const cleaned = message.trim().toLowerCase();
  const selectedIndex = Number(cleaned);

  if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= branches.length) {
    return branches[selectedIndex - 1] ?? null;
  }

  return (
    branches.find(
      (branch) =>
        branch.id === cleaned ||
        branch.code.toLowerCase() === cleaned ||
        branch.name.toLowerCase() === cleaned
    ) ?? null
  );
}

function getSelectedBranch(branches: UserBranch[], branchId: string | null | undefined) {
  if (!branchId) {
    return null;
  }

  return branches.find((branch) => branch.id === branchId) ?? null;
}

function buildBranchSelectionMessage(context: WhatsappRuntimeContext, branches: UserBranch[]) {
  if (context.replyStyle.useNaturalLanguage) {
    return composeNaturalReply({
      style: context.replyStyle,
      intro:
        `${maybeAddEmoji(context.replyStyle, "👋")}Halo, selamat datang di *${context.businessName}*. ` +
        "Sebelum lanjut booking, pilih cabangnya dulu ya.",
      lines: branches.map((branch, index) => `${index + 1}. *${branch.name}*`),
      question: "Boleh balas dengan nomor, kode cabang, atau nama cabangnya langsung.",
      includeClosingLine: false,
    });
  }

  return (
    `Halo 👋 Selamat datang di *${context.businessName}* 💈\n\n` +
    "Pilih cabang dulu ya sebelum lanjut booking:\n\n" +
    `${getBranchOptionsText(branches)}\n\n` +
    "Balas dengan nomor cabang yang kamu mau."
  );
}

async function getAvailableSlots(
  tanggal: string,
  industry: IndustryKey,
  scope: BookingScope,
  durationMinutes: number
) {
  return getAvailableSlotsForDate({
    date: tanggal,
    industry,
    durationMinutes,
    userId: scope.userId,
    channelId: scope.channelId,
    branchId: scope.branchId,
  });
}

async function getAvailableDateOptions(params: {
  baseDate: Date;
  industry: IndustryKey;
  scope: BookingScope;
  durationMinutes: number;
  maxOptions?: number;
  lookaheadDays?: number;
}) {
  const maxOptions = params.maxOptions ?? 7;
  const lookaheadDays = params.lookaheadDays ?? 14;
  const rawOptions = getUpcomingDateOptions(params.baseDate, lookaheadDays);
  const available: Array<{ key: string; label: string; index: number }> = [];

  for (const option of rawOptions) {
    const slots = await getAvailableSlots(
      option.key,
      params.industry,
      params.scope,
      params.durationMinutes
    );

    if (slots.length > 0) {
      available.push({
        ...option,
        index: available.length + 1,
      });
    }

    if (available.length >= maxOptions) {
      break;
    }
  }

  return available;
}

function getDateOptionsText(
  options: Array<{ key: string; label: string; index: number }>
) {
  return options.map((item) => `${item.index}. ${item.label}`).join("\n");
}

function getDateBySelection(
  message: string,
  options: Array<{ key: string; label: string; index: number }>
) {
  const cleaned = message.trim();
  const selectedIndex = Number(cleaned);

  if (Number.isInteger(selectedIndex)) {
    return options.find((item) => item.index === selectedIndex) ?? null;
  }

  return options.find((item) => item.key === cleaned) ?? null;
}

function getIndustryOptionsText() {
  return getAvailableIndustries()
    .map((item, index) => `${index + 1}. ${item.name} (${item.key})`)
    .join("\n");
}

function getIndustryBySelection(message: string) {
  const selectedIndex = Number(message.trim()) - 1;
  const industries = getAvailableIndustries();

  if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < industries.length) {
    return industries[selectedIndex].key;
  }

  const normalized = message.trim().toLowerCase();
  return (
    industries.find(
      (industry) =>
        industry.key === normalized || industry.name.toLowerCase() === normalized
    )?.key ?? null
  );
}

function getTodayInJakarta() {
  const now = new Date();
  const local = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    })
  );

  local.setHours(0, 0, 0, 0);
  return local;
}

async function loadState(sender: string, channelId: string | null) {
  let query = getSupabase()
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .order("updated_at", { ascending: false })
    .limit(1);

  query = channelId ? query.eq("channel_id", channelId) : query.is("channel_id", null);

  const { data, error } = await query;

  if (error) {
    console.warn("Failed to load chat session:", { sender, channelId, error: error.message });
    return null;
  }

  const row = Array.isArray(data) ? data[0] : null;
  return (row ?? null) as SessionState | null;
}

async function saveState(payload: Partial<SessionState> & { sender: string; channel_id: string | null }) {
  const normalizedPayload = {
    ...payload,
    user_id: payload.user_id ?? null,
  };

  let existingQuery = getSupabase()
    .from("user_sessions")
    .select("id")
    .eq("sender", payload.sender)
    .order("updated_at", { ascending: false })
    .limit(1);

  existingQuery = payload.channel_id
    ? existingQuery.eq("channel_id", payload.channel_id)
    : existingQuery.is("channel_id", null);

  const { data: existingRows, error: existingError } = await existingQuery;

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingRow = Array.isArray(existingRows) ? existingRows[0] : null;

  if (existingRow?.id) {
    const { error: updateError } = await getSupabase()
      .from("user_sessions")
      .update(normalizedPayload)
      .eq("id", existingRow.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return;
  }

  const { error: insertError } = await getSupabase().from("user_sessions").insert(normalizedPayload);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function clearState(sender: string, channelId: string | null) {
  let query = getSupabase().from("user_sessions").delete().eq("sender", sender);
  query = channelId ? query.eq("channel_id", channelId) : query.is("channel_id", null);
  await query;
}

function buildRecentMessageDedupeKey(params: {
  sender: string;
  channelId: string | null;
  officialPhoneNumberId: string | null;
  message: string;
  bucket: number;
}) {
  const normalizedMessage = params.message.trim().toLowerCase().replace(/\s+/g, " ");
  const messageKey = Buffer.from(normalizedMessage).toString("base64url");
  const channelKey = params.channelId ?? params.officialPhoneNumberId ?? "global";

  return `whatsapp_webhook_recent:${channelKey}:${params.sender}:${messageKey}:${params.bucket}`;
}

async function shouldIgnoreRecentDuplicateMessage(params: {
  sender: string;
  channelId: string | null;
  officialPhoneNumberId: string | null;
  message: string;
}) {
  const normalizedMessage = params.message.trim().toLowerCase().replace(/\s+/g, " ");

  if (!normalizedMessage) {
    return false;
  }

  const bucket = Math.floor(Date.now() / RECENT_MESSAGE_DEDUPE_WINDOW_MS);
  const dedupeKey = buildRecentMessageDedupeKey({
    sender: params.sender,
    channelId: params.channelId,
    officialPhoneNumberId: params.officialPhoneNumberId,
    message: normalizedMessage,
    bucket,
  });

  const { error } = await getSupabase().from("app_settings").insert({
    key: dedupeKey,
    value_json: {
      sender: params.sender,
      channelId: params.channelId,
      officialPhoneNumberId: params.officialPhoneNumberId,
      message: normalizedMessage,
      createdAt: new Date().toISOString(),
      bucket,
    },
  });

  if (!error) {
    return false;
  }

  if (error.code === "23505") {
    return true;
  }

  console.warn("[whatsapp-webhook] recent duplicate claim failed", {
    sender: params.sender,
    channelId: params.channelId,
    officialPhoneNumberId: params.officialPhoneNumberId,
    error: error.message,
  });

  return false;
}

function buildRecentOutboundEchoKey(params: {
  sender: string;
  channelId: string | null;
  officialPhoneNumberId: string | null;
  message: string;
  bucket: number;
}) {
  const normalizedMessage = params.message.trim().toLowerCase().replace(/\s+/g, " ");
  const messageKey = Buffer.from(normalizedMessage).toString("base64url");
  const channelKey = params.channelId ?? params.officialPhoneNumberId ?? "global";

  return `whatsapp_webhook_outbound:${channelKey}:${params.sender}:${messageKey}:${params.bucket}`;
}

async function shouldIgnoreRecentOutboundEcho(params: {
  sender: string;
  channelId: string | null;
  officialPhoneNumberId: string | null;
  message: string;
}) {
  const normalizedMessage = params.message.trim().toLowerCase().replace(/\s+/g, " ");

  if (!normalizedMessage) {
    return false;
  }

  const currentBucket = Math.floor(Date.now() / RECENT_OUTBOUND_ECHO_WINDOW_MS);
  const bucketCandidates = Array.from(
    { length: RECENT_OUTBOUND_ECHO_LOOKBACK_BUCKETS },
    (_, index) => currentBucket - index
  ).filter((bucket) => bucket >= 0);
  const keys = bucketCandidates.map((bucket) =>
    buildRecentOutboundEchoKey({
      sender: params.sender,
      channelId: params.channelId,
      officialPhoneNumberId: params.officialPhoneNumberId,
      message: normalizedMessage,
      bucket,
    })
  );

  const { data, error } = await getSupabase().from("app_settings").select("key").in("key", keys);

  if (error) {
    console.warn("[whatsapp-webhook] outbound echo lookup failed", {
      sender: params.sender,
      channelId: params.channelId,
      officialPhoneNumberId: params.officialPhoneNumberId,
      error: error.message,
    });
    return false;
  }

  return Boolean(data?.length);
}

async function recordRecentOutboundEcho(params: {
  sender: string;
  channelId: string | null;
  officialPhoneNumberId: string | null;
  message: string;
}) {
  const normalizedMessage = params.message.trim().toLowerCase().replace(/\s+/g, " ");

  if (!normalizedMessage) {
    return;
  }

  const bucket = Math.floor(Date.now() / RECENT_OUTBOUND_ECHO_WINDOW_MS);
  const dedupeKey = buildRecentOutboundEchoKey({
    sender: params.sender,
    channelId: params.channelId,
    officialPhoneNumberId: params.officialPhoneNumberId,
    message: normalizedMessage,
    bucket,
  });

  const { error } = await getSupabase().from("app_settings").insert({
    key: dedupeKey,
    value_json: {
      sender: params.sender,
      channelId: params.channelId,
      officialPhoneNumberId: params.officialPhoneNumberId,
      message: normalizedMessage,
      createdAt: new Date().toISOString(),
      bucket,
    },
  });

  if (error && error.code !== "23505") {
    console.warn("[whatsapp-webhook] outbound echo store failed", {
      sender: params.sender,
      channelId: params.channelId,
      officialPhoneNumberId: params.officialPhoneNumberId,
      error: error.message,
    });
  }
}

async function parseWebhookPayload(req: Request): Promise<ParsedWebhookPayload> {
  const url = new URL(req.url);

  try {
    const body = await req.json();

    const officialValue = body?.entry?.[0]?.changes?.[0]?.value ?? body?.value ?? body;
    const officialStatus = officialValue?.statuses?.[0] ?? null;
    const payloadKeys = isRecord(officialValue) ? Object.keys(officialValue) : [];
    const officialMessageId =
      officialValue?.messages?.[0]?.id ||
      officialStatus?.id ||
      body?.message_id ||
      body?.messageId ||
      null;
    const officialPhoneNumberId =
      officialValue?.metadata?.phone_number_id ||
      officialValue?.phone_number_id ||
      body?.phone_number_id ||
      null;

    const officialMessage =
      officialValue?.messages?.[0]?.text?.body ||
      officialValue?.messages?.[0]?.body ||
      officialValue?.messages?.[0]?.interactive?.button_reply?.title ||
      officialValue?.messages?.[0]?.interactive?.list_reply?.title ||
      officialValue?.messages?.[0]?.button?.text ||
      officialValue?.messages?.[0]?.caption ||
      officialValue?.message?.text?.body ||
      officialValue?.message?.body ||
      officialValue?.message?.interactive?.button_reply?.title ||
      officialValue?.message?.interactive?.list_reply?.title ||
      officialValue?.message?.button?.text ||
      officialValue?.message?.caption ||
      body?.message?.text ||
      body?.message ||
      body?.text ||
      "";

    const officialSender =
      officialValue?.contacts?.[0]?.wa_id ||
      officialValue?.messages?.[0]?.from ||
      body?.from ||
      body?.sender ||
      "";
    const eventType: ParsedWebhookPayload["eventType"] = officialStatus
      ? "status"
      : officialMessage
        ? "message"
        : officialValue?.messages?.[0]
        ? "message"
        : "unknown";

    return {
      eventType,
      payloadKeys,
      hasMessages: Boolean(officialValue?.messages?.length),
      hasStatuses: Boolean(officialValue?.statuses?.length),
      hasContacts: Boolean(officialValue?.contacts?.length),
      incomingMessage: officialMessage,
      sender: normalizeSender(officialSender),
      device: body.device || body.number || body.device_number || null,
      officialPhoneNumberId:
        typeof officialPhoneNumberId === "string" ? officialPhoneNumberId.trim() : null,
      messageId: typeof officialMessageId === "string" ? officialMessageId.trim() : null,
      deliveryStatus: typeof officialStatus?.status === "string" ? officialStatus.status : null,
      statusRecipientId:
        typeof officialStatus?.recipient_id === "string" ? officialStatus.recipient_id : null,
      webhookSecret:
        body.webhook_secret ||
        body.secret ||
        req.headers.get("x-webhook-secret") ||
        req.headers.get("x-fonnte-secret") ||
        url.searchParams.get("secret") ||
        null,
    };
  } catch {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return {
      eventType: "unknown",
      payloadKeys: Array.from(params.keys()),
      hasMessages: params.has("message") || params.has("text"),
      hasStatuses: params.has("status"),
      hasContacts: params.has("sender") || params.has("from"),
      incomingMessage: params.get("message") || params.get("text") || "",
      sender: normalizeSender(params.get("sender") || params.get("from") || ""),
      device: params.get("device") || params.get("number") || params.get("device_number"),
      officialPhoneNumberId: params.get("phone_number_id"),
      messageId: params.get("message_id"),
      deliveryStatus: params.get("status"),
      statusRecipientId: params.get("recipient_id"),
      webhookSecret:
        params.get("webhook_secret") ||
        params.get("secret") ||
        req.headers.get("x-webhook-secret") ||
        req.headers.get("x-fonnte-secret") ||
        url.searchParams.get("secret") ||
        null,
    };
  }
}

function isMetaWebhookVerificationRequest(url: URL) {
  return (
    url.searchParams.get("hub.mode") === "subscribe" &&
    typeof url.searchParams.get("hub.challenge") === "string" &&
    !!url.searchParams.get("hub.verify_token")
  );
}

function getMetaVerificationToken(req: Request) {
  const url = new URL(req.url);
  return (
    url.searchParams.get("hub.verify_token") ||
    req.headers.get("x-webhook-verify-token") ||
    null
  );
}

function getMetaChallenge(req: Request) {
  const url = new URL(req.url);
  return url.searchParams.get("hub.challenge");
}

function isValidWebhookSecret(context: WhatsappRuntimeContext, providedSecret: string | null) {
  const expectedSecret = context.channel?.webhook_secret?.trim();

  if (!expectedSecret) {
    return true;
  }

  return expectedSecret === (providedSecret?.trim() ?? "");
}

function getRuntimeScope(context: WhatsappRuntimeContext): BookingScope {
  return {
    userId: context.userId,
    channelId: context.channelId,
    branchId: null,
  };
}

function isOfficialReplyDryRun() {
  const value = process.env.WHATSAPP_OFFICIAL_TEST_MODE?.trim().toLowerCase();

  return value === "1" || value === "true" || value === "yes" || value === "on";
}

async function resetToGreetingState({
  sender,
  context,
  industry,
  tenantServices,
  branches,
}: GreetingParams) {
  if (branches.length > 0) {
    await saveState({
      sender,
      channel_id: context.channelId,
      user_id: context.userId,
      branch_id: null,
      step: "pilih_cabang",
      customer_name: null,
      layanan: null,
      harga: null,
      tanggal: null,
      jam: null,
      industry,
    });

    return buildBranchSelectionMessage(context, branches);
  }

  await saveState({
    sender,
    channel_id: context.channelId,
    user_id: context.userId,
    branch_id: null,
    step: "pilih_layanan",
    customer_name: null,
    layanan: null,
    harga: null,
    tanggal: null,
    jam: null,
    industry,
  });

  if (context.replyStyle.useNaturalLanguage) {
    return composeNaturalReply({
      style: context.replyStyle,
      intro:
        `${maybeAddEmoji(context.replyStyle, "👋")}Halo, selamat datang di *${context.businessName}*. ` +
        "Aku bantu bookingnya ya.",
      lines: [
        getToneLead(context.replyStyle, "guide"),
        "Ini layanan yang tersedia saat ini:",
        getServiceOptionsText(tenantServices),
      ],
      question: "Kamu bisa balas dengan nomor layanan, nama layanan, atau tulis kebutuhanmu langsung.",
      includeClosingLine: false,
    });
  }

  return renderTemplate(context.templates.greeting, {
    business_name: context.businessName,
    service_list: getServiceOptionsText(tenantServices),
  });
}

function buildBookingStateSummary(params: {
  state: SessionState;
  branches: UserBranch[];
  tenantServices: Awaited<ReturnType<typeof getServicesForUser>>;
}) {
  const branchName = getSelectedBranch(params.branches, params.state.branch_id)?.name ?? null;
  const serviceName =
    params.tenantServices.find((service) => service.name === params.state.layanan)?.name ?? null;

  return [
    params.state.step ? `step: ${params.state.step}` : null,
    branchName ? `cabang: ${branchName}` : null,
    serviceName ? `layanan: ${serviceName}` : null,
    params.state.tanggal ? `tanggal: ${params.state.tanggal}` : null,
    params.state.jam ? `jam: ${params.state.jam}` : null,
    params.state.customer_name ? `nama: ${params.state.customer_name}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function parseBookingStepWithAi(params: {
  context: WhatsappRuntimeContext;
  industry: IndustryKey;
  step: "pilih_cabang" | "pilih_layanan" | "pilih_tanggal" | "pilih_jam" | "isi_nama" | "konfirmasi";
  rawMessage: string;
  state: SessionState;
  tenantServices: Awaited<ReturnType<typeof getServicesForUser>>;
  branches: UserBranch[];
  candidates?: AiBookingParserCandidate[];
}) {
  if (!params.context.userId) {
    return null;
  }

  const aiContext = await buildAiAssistantContext({
    channelId: params.context.channelId,
    userId: params.context.userId,
    industry: params.industry,
    branches: params.branches,
    services: params.tenantServices,
  });

  return parseAiBookingStepInput({
    context: aiContext,
    step: params.step,
    message: params.rawMessage,
    candidates: params.candidates,
    bookingStateSummary: buildBookingStateSummary({
      state: params.state,
      branches: params.branches,
      tenantServices: params.tenantServices,
    }),
  });
}

function isLikelyMultiFieldBookingMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return /(\bbooking\b|\bmau\b|\batas nama\b|\bnama saya\b|\bbesok\b|\blusa\b|\bhari ini\b|\bjam\b|\bpukul\b|\btanggal\b|\d{4}-\d{2}-\d{2}|\d{1,2}[:.]\d{2})/i.test(
    normalized
  );
}

function getNextBookingStep(params: {
  branches: UserBranch[];
  branchId: string | null;
  layanan: string | null;
  tanggal: string | null;
  jam: string | null;
  customerName: string | null;
}) {
  if (params.branches.length > 0 && !params.branchId) {
    return "pilih_cabang" as const;
  }

  if (!params.layanan) {
    return "pilih_layanan" as const;
  }

  if (!params.tanggal) {
    return "pilih_tanggal" as const;
  }

  if (!params.jam) {
    return "pilih_jam" as const;
  }

  if (!params.customerName) {
    return "isi_nama" as const;
  }

  return "konfirmasi" as const;
}

function buildConfirmationReply(params: {
  style: ChatbotReplyStyle;
  context: WhatsappRuntimeContext;
  templates: WhatsappRuntimeContext["templates"];
  branchName: string | null;
  layanan: string;
  tanggal: string;
  jam: string;
  harga: number | null;
  customerName: string;
}) {
  const confirmationSummary = renderTemplate(params.templates.confirmationPrompt, {
    business_name: params.context.businessName,
    customer_name: params.customerName,
    layanan: params.layanan,
    tanggal_label: formatBookingDateLabel(params.tanggal),
    jam: params.jam,
    harga: formatRupiah(params.harga),
    branch_name: params.branchName,
  });

  if (params.style.useNaturalLanguage) {
    return composeNaturalReply({
      style: params.style,
      intro: `${getToneLead(params.style, "ack")} Aku sudah rangkum bookingnya ya.`,
      lines: [
        confirmationSummary,
        params.branchName ? `📍 Cabang: ${params.branchName}` : "",
        `🙍 Nama pemesan: ${params.customerName}`,
      ],
      question: "Kalau sudah benar, balas *YA*. Kalau mau ubah, balas *BATAL* dulu ya.",
      includeClosingLine: false,
    });
  }

  return (
    `${confirmationSummary}\n\n` +
    `${params.branchName ? `📍 Cabang: ${params.branchName}\n` : ""}` +
    `🙍 Nama pemesan: ${params.customerName}\n\n` +
    "Balas *YA* untuk konfirmasi atau *BATAL* untuk mengulang."
  );
}

async function tryFastForwardBookingFromMessage(params: {
  sender: string;
  rawMessage: string;
  context: WhatsappRuntimeContext;
  industry: IndustryKey;
  state: SessionState | null;
  tenantServices: Awaited<ReturnType<typeof getServicesForUser>>;
  branches: UserBranch[];
  today: Date;
}): Promise<string | null> {
  if (!isLikelyMultiFieldBookingMessage(params.rawMessage)) {
    return null;
  }

  const currentState = params.state;
  const initialBranchId =
    currentState?.branch_id ??
    (params.branches.length === 1 && typeof params.branches[0]?.id === "string"
      ? params.branches[0].id
      : null);
  let branchId = initialBranchId;
  let layanan = currentState?.layanan ?? null;
  let harga = currentState?.harga ?? null;
  let tanggal = currentState?.tanggal ?? null;
  let jam = currentState?.jam ?? null;
  let customerName = currentState?.customer_name ?? null;

  if (params.branches.length > 1 && !branchId) {
    const parsedBranch = getBranchBySelection(params.rawMessage.toLowerCase(), params.branches);
    const aiParsedBranch = parsedBranch
      ? null
      : await parseBookingStepWithAi({
          context: params.context,
          industry: params.industry,
          step: "pilih_cabang",
          rawMessage: params.rawMessage,
          state:
            currentState ?? {
              sender: params.sender,
              channel_id: params.context.channelId,
              user_id: params.context.userId,
              branch_id: null,
              step: "pilih_cabang",
              customer_name: null,
              layanan: null,
              harga: null,
              tanggal: null,
              jam: null,
              industry: params.industry,
            },
          tenantServices: params.tenantServices,
          branches: params.branches,
          candidates: getBranchCandidates(params.branches),
        });

    branchId =
      parsedBranch?.id ??
      params.branches.find((branch) => branch.id === aiParsedBranch?.matchedCandidateId)?.id ??
      null;
  }

  if (!layanan) {
    const parsedService = getServiceBySelection(params.rawMessage.toLowerCase(), params.tenantServices);
    const aiParsedService = parsedService
      ? null
      : await parseBookingStepWithAi({
          context: params.context,
          industry: params.industry,
          step: "pilih_layanan",
          rawMessage: params.rawMessage,
          state:
            currentState ?? {
              sender: params.sender,
              channel_id: params.context.channelId,
              user_id: params.context.userId,
              branch_id: branchId,
              step: "pilih_layanan",
              customer_name: null,
              layanan: null,
              harga: null,
              tanggal: null,
              jam: null,
              industry: params.industry,
            },
          tenantServices: params.tenantServices,
          branches: params.branches,
          candidates: getServiceCandidates(params.tenantServices),
        });

    const selectedService =
      parsedService ??
      params.tenantServices.find((service) => service.code === aiParsedService?.matchedCandidateId) ??
      null;

    layanan = selectedService?.name ?? null;
    harga = selectedService?.price ?? harga;
  }

  const scope: BookingScope = {
    userId: params.context.userId,
    channelId: params.context.channelId,
    branchId,
  };

  if (layanan && !tanggal) {
    const durationMinutes =
      params.tenantServices.find((service) => service.name === layanan)?.duration_minutes ?? 60;
    const dateOptions = await getAvailableDateOptions({
      baseDate: params.today,
      industry: params.industry,
      scope,
      durationMinutes,
    });
    const parsedDate = getDateBySelection(params.rawMessage, dateOptions);
    const aiParsedDate = parsedDate
      ? null
      : await parseBookingStepWithAi({
          context: params.context,
          industry: params.industry,
          step: "pilih_tanggal",
          rawMessage: params.rawMessage,
          state:
            currentState ?? {
              sender: params.sender,
              channel_id: params.context.channelId,
              user_id: params.context.userId,
              branch_id: branchId,
              step: "pilih_tanggal",
              customer_name: null,
              layanan,
              harga,
              tanggal: null,
              jam: null,
              industry: params.industry,
            },
          tenantServices: params.tenantServices,
          branches: params.branches,
          candidates: getDateCandidates(dateOptions),
        });

    tanggal =
      parsedDate?.key ??
      dateOptions.find((option) => option.key === aiParsedDate?.matchedCandidateId)?.key ??
      null;
  }

  if (layanan && tanggal && !jam) {
    const durationMinutes =
      params.tenantServices.find((service) => service.name === layanan)?.duration_minutes ?? 60;
    const slots = await getAvailableSlots(tanggal, params.industry, scope, durationMinutes);
    const parsedSlot = getSlotBySelection(params.rawMessage, slots);
    const aiParsedSlot = parsedSlot
      ? null
      : await parseBookingStepWithAi({
          context: params.context,
          industry: params.industry,
          step: "pilih_jam",
          rawMessage: params.rawMessage,
          state:
            currentState ?? {
              sender: params.sender,
              channel_id: params.context.channelId,
              user_id: params.context.userId,
              branch_id: branchId,
              step: "pilih_jam",
              customer_name: null,
              layanan,
              harga,
              tanggal,
              jam: null,
              industry: params.industry,
            },
          tenantServices: params.tenantServices,
          branches: params.branches,
          candidates: getSlotCandidates(slots),
        });

    jam = parsedSlot ?? aiParsedSlot?.matchedCandidateId ?? null;
  }

  if (!customerName) {
    const aiParsedName = await parseBookingStepWithAi({
      context: params.context,
      industry: params.industry,
      step: "isi_nama",
      rawMessage: params.rawMessage,
      state:
        currentState ?? {
          sender: params.sender,
          channel_id: params.context.channelId,
          user_id: params.context.userId,
          branch_id: branchId,
          step: "isi_nama",
          customer_name: null,
          layanan,
          harga,
          tanggal,
          jam,
          industry: params.industry,
        },
      tenantServices: params.tenantServices,
      branches: params.branches,
    });

    customerName = normalizeCustomerName(aiParsedName?.customerName || "");
    if (customerName.length < 2) {
      customerName = null;
    }
  }

  const nextStep = getNextBookingStep({
    branches: params.branches,
    branchId,
    layanan,
    tanggal,
    jam,
    customerName,
  });

  const selectedBranch = getSelectedBranch(params.branches, branchId);

  await saveState({
    sender: params.sender,
    channel_id: params.context.channelId,
    user_id: params.context.userId,
    branch_id: branchId,
    step: nextStep,
    customer_name: customerName,
    layanan,
    harga,
    tanggal,
    jam,
    industry: params.industry,
  });

  if (nextStep === "konfirmasi" && layanan && tanggal && jam && customerName) {
    return withCancelHint(
      buildConfirmationReply({
        style: params.context.replyStyle,
        context: params.context,
        templates: params.context.templates,
        branchName: selectedBranch?.name ?? null,
        layanan,
        tanggal,
        jam,
        harga,
        customerName,
      })
    );
  }

  if (nextStep === "pilih_cabang") {
    const capturedDetails = [
      layanan ? `Layanan: *${layanan}*` : "",
      tanggal ? `Tanggal: *${formatBookingDateLabel(tanggal)}*` : "",
      jam ? `Jam: *${jam}*` : "",
      customerName ? `Atas nama: *${customerName}*` : "",
    ].filter(Boolean);

    return withCancelHint(
      composeNaturalReply({
        style: params.context.replyStyle,
        intro:
          `${getToneLead(params.context.replyStyle, "ack")} Aku sudah tangkap beberapa detail bookingmu.`,
        lines: [
          capturedDetails.length > 0 ? capturedDetails.join("\n") : "",
          "Sebelum lanjut, pilih cabangnya dulu ya:",
          getBranchOptionsText(params.branches),
        ],
        question: "Balas dengan nomor, kode, atau nama cabang yang tersedia.",
        includeClosingLine: false,
      })
    );
  }

  if (nextStep === "pilih_layanan") {
    return withCancelHint(
      composeNaturalReply({
        style: params.context.replyStyle,
        intro:
          `${getToneLead(params.context.replyStyle, "ack")} Aku siap bantu lanjut bookingnya.` +
          (selectedBranch ? ` Cabang *${selectedBranch.name}* sudah kupilih.` : ""),
        lines: ["Tinggal pilih layanannya ya:", getServiceOptionsText(params.tenantServices)],
        question: "Kamu bisa balas dengan nomor layanan, nama layanan, atau tulis kebutuhanmu langsung.",
        includeClosingLine: false,
      })
    );
  }

  if (nextStep === "pilih_tanggal" && layanan) {
    const durationMinutes =
      params.tenantServices.find((service) => service.name === layanan)?.duration_minutes ?? 60;
    const dateOptions = await getAvailableDateOptions({
      baseDate: params.today,
      industry: params.industry,
      scope,
      durationMinutes,
    });

    if (dateOptions.length > 0) {
      return withCancelHint(
        composeNaturalReply({
          style: params.context.replyStyle,
          intro:
            `${getToneLead(params.context.replyStyle, "ack")} Layanan *${layanan}* sudah kupilih.` +
            (selectedBranch ? ` Untuk cabang *${selectedBranch.name}* ya.` : ""),
          lines: ["Tanggal yang masih tersedia:", getDateOptionsText(dateOptions)],
          question: "Kamu bisa balas dengan nomor tanggal, tulis tanggalnya langsung, atau bilang misalnya besok/lusa.",
          includeClosingLine: false,
        })
      );
    }
  }

  if (nextStep === "pilih_jam" && tanggal && layanan) {
    const durationMinutes =
      params.tenantServices.find((service) => service.name === layanan)?.duration_minutes ?? 60;
    const slots = await getAvailableSlots(tanggal, params.industry, scope, durationMinutes);
    if (slots.length > 0) {
      return withCancelHint(
        composeNaturalReply({
          style: params.context.replyStyle,
          intro:
            `${getToneLead(params.context.replyStyle, "ack")} ` +
            `Aku sudah tangkap layanan *${layanan}*` +
            `${selectedBranch ? ` di cabang *${selectedBranch.name}*` : ""}` +
            ` untuk *${formatBookingDateLabel(tanggal)}*.`,
          lines: ["Jam yang masih tersedia:", getSlotOptionsText(slots)],
          question: "Tinggal pilih jamnya ya. Boleh tulis misalnya `jam 3 sore` atau pilih dari daftar.",
          includeClosingLine: false,
        })
      );
    }
  }

  if (nextStep === "isi_nama" && layanan && tanggal && jam) {
    return withCancelHint(
      composeNaturalReply({
        style: params.context.replyStyle,
        intro:
          `${getToneLead(params.context.replyStyle, "ack")} ` +
          `Aku sudah tangkap layanan *${layanan}*, tanggal *${formatBookingDateLabel(tanggal)}*, dan jam *${jam}*.`,
        lines: [selectedBranch ? `Cabang: *${selectedBranch.name}*` : ""],
        question: "Sekarang kirim nama pemesannya ya. Contohnya: `atas nama Robbi`.",
        includeClosingLine: false,
      })
    );
  }

  return null;
}

async function getRichFaqReply(params: {
  context: WhatsappRuntimeContext;
  industry: IndustryKey;
  rawMessage: string;
  state?: SessionState | null;
  tenantServices: Awaited<ReturnType<typeof getServicesForUser>>;
  branches: UserBranch[];
  sender: string;
  messageId: string | null;
}) {
  if (!params.context.userId) {
    return null;
  }

  const aiContext = await buildAiAssistantContext({
    channelId: params.context.channelId,
    userId: params.context.userId,
    industry: params.industry,
    branches: params.branches,
    services: params.tenantServices,
  });

  const knowledgeFirstReply = await generateKnowledgePriorityFaqReply({
    context: aiContext,
    message: params.rawMessage,
    sender: params.sender,
    messageId: params.messageId,
    bookingStateSummary: params.state
      ? buildBookingStateSummary({
          state: params.state,
          branches: params.branches,
          tenantServices: params.tenantServices,
        })
      : null,
  });

  if (knowledgeFirstReply?.reply) {
    return knowledgeFirstReply;
  }

  return generateAiFaqReply({
    context: aiContext,
    message: params.rawMessage,
    sender: params.sender,
    messageId: params.messageId,
    bookingStateSummary: params.state
      ? buildBookingStateSummary({
          state: params.state,
          branches: params.branches,
          tenantServices: params.tenantServices,
        })
      : null,
  });
}

async function maybeGetInFlowFaqReply(params: {
  context: WhatsappRuntimeContext;
  industry: IndustryKey;
  rawMessage: string;
  state: SessionState;
  tenantServices: Awaited<ReturnType<typeof getServicesForUser>>;
  branches: UserBranch[];
  sender: string;
  messageId: string | null;
}) {
  if (!isLikelyFaqMessage(params.rawMessage)) {
    return null;
  }

  const richFaqReply = await getRichFaqReply({
    context: params.context,
    industry: params.industry,
    rawMessage: params.rawMessage,
    state: params.state,
    tenantServices: params.tenantServices,
    branches: params.branches,
    sender: params.sender,
    messageId: params.messageId,
  });

  return richFaqReply?.reply ?? null;
}

async function getAiFallbackReply(params: {
  sender: string;
  context: WhatsappRuntimeContext;
  industry: IndustryKey;
  tenantServices: Awaited<ReturnType<typeof getServicesForUser>>;
  branches: UserBranch[];
  rawMessage: string;
  messageId: string | null;
}) {
  if (!params.context.userId) {
    return null;
  }

  if (isLikelyFaqMessage(params.rawMessage)) {
    const richFaqReply = await getRichFaqReply({
      context: params.context,
      industry: params.industry,
      rawMessage: params.rawMessage,
      tenantServices: params.tenantServices,
      branches: params.branches,
      sender: params.sender,
      messageId: params.messageId,
    });

    return richFaqReply?.reply ?? null;
  }

  const aiContext = await buildAiAssistantContext({
    channelId: params.context.channelId,
    userId: params.context.userId,
    industry: params.industry,
    branches: params.branches,
    services: params.tenantServices,
  });
  const decision = await generateAiAssistantDecision({
    context: aiContext,
    message: params.rawMessage,
    sender: params.sender,
    messageId: params.messageId,
  });

  if (!decision) {
    return null;
  }

  if (decision.intent === "faq" && decision.reply) {
    const richFaqReply = await getRichFaqReply({
      context: params.context,
      industry: params.industry,
      rawMessage: params.rawMessage,
      tenantServices: params.tenantServices,
      branches: params.branches,
      sender: params.sender,
      messageId: params.messageId,
    });

    return richFaqReply?.reply || decision.reply;
  }

  if (decision.intent === "handoff" && decision.reply) {
    return decision.reply;
  }

  if (decision.intent === "booking_start" || decision.shouldStartBooking) {
    return resetToGreetingState({
      sender: params.sender,
      context: params.context,
      industry: params.industry,
      tenantServices: params.tenantServices,
      branches: params.branches,
    });
  }

  return null;
}

async function sendReply(context: WhatsappRuntimeContext, target: string, message: string) {
  if (context.chatbotProvider === "official" && isOfficialReplyDryRun()) {
    console.log("[whatsapp-webhook] official reply dry run", {
      target,
      channelId: context.channelId,
      preview: message.slice(0, 160),
    });

    return { dryRun: true as const };
  }

  const delivery = await sendWhatsappMessage({
    target,
    message,
    token: context.token,
    provider: context.chatbotProvider,
    officialAccessToken: context.officialAccessToken,
    officialPhoneNumberId: context.officialPhoneNumberId,
  });

  if (context.chatbotProvider === "official") {
    await recordRecentOutboundEcho({
      sender: target,
      channelId: context.channelId,
      officialPhoneNumberId: context.officialPhoneNumberId,
      message,
    });
  }

  return delivery;
}

async function buildCurrentStepReply({
  state,
  context,
  templates,
  tenantServices,
  branches,
  today,
  scope,
  industry,
}: StepReplyParams) {
  const selectedBranch = getSelectedBranch(branches, state.branch_id);

  if (state.step === "pilih_industri") {
    return withCancelHint("Kita masih di langkah pilih industri.\n\nPilih industri:\n" + getIndustryOptionsText());
  }

  if (state.step === "pilih_cabang") {
    return withCancelHint(
      "Kita masih di langkah pilih cabang.\n\n" + buildBranchSelectionMessage(context, branches)
    );
  }

  if (state.step === "pilih_layanan") {
    return withCancelHint(
      "Kita masih di langkah pilih layanan.\n\n" +
        (selectedBranch ? `Cabang terpilih: *${selectedBranch.name}*\n\n` : "") +
        renderTemplate(templates.greeting, {
          business_name: context.businessName,
          service_list: getServiceOptionsText(tenantServices),
        })
    );
  }

  if (state.step === "pilih_tanggal") {
    const durationMinutes =
      tenantServices.find((service) => service.name === state.layanan)?.duration_minutes ?? 60;
    const dateOptions = await getAvailableDateOptions({
      baseDate: today,
      industry,
      scope,
      durationMinutes,
    });

    if (dateOptions.length === 0) {
      return "Maaf, belum ada tanggal yang tersedia dalam beberapa hari ke depan. Silakan hubungi admin untuk penjadwalan manual ya 🙏";
    }

    return withCancelHint(
      "Kita masih di langkah pilih tanggal.\n\n" +
        (selectedBranch ? `Cabang: *${selectedBranch.name}*\n\n` : "") +
        renderTemplate(templates.servicePrompt, {
          business_name: context.businessName,
          layanan: state.layanan,
          date_options: getDateOptionsText(dateOptions),
        })
    );
  }

  if (state.step === "pilih_jam") {
    if (!state.tanggal) {
      return "Sesi booking kamu sudah kedaluwarsa. Ketik *halo* untuk mulai lagi.";
    }

    const durationMinutes =
      tenantServices.find((service) => service.name === state.layanan)?.duration_minutes ?? 60;
    const slots = await getAvailableSlots(state.tanggal, industry, scope, durationMinutes);

    if (slots.length === 0) {
      return "Maaf, slot untuk tanggal ini sudah habis. Balas *LANJUT* untuk lihat pilihan tanggal lagi atau *BATAL* untuk berhenti.";
    }

    return withCancelHint(
      "Kita masih di langkah pilih jam.\n\n" +
        (selectedBranch ? `Cabang: *${selectedBranch.name}*\n\n` : "") +
        renderTemplate(templates.datePrompt, {
          business_name: context.businessName,
          tanggal_label: formatBookingDateLabel(state.tanggal),
          slot_options: getSlotOptionsText(slots),
        })
    );
  }

  if (state.step === "isi_nama") {
    return withCancelHint(
      `Kita masih di langkah isi nama.\n\n` +
        (selectedBranch ? `Cabang: *${selectedBranch.name}*\n` : "") +
        `Layanan: *${state.layanan ?? "-"}*\n` +
        `Tanggal: *${state.tanggal ? formatBookingDateLabel(state.tanggal) : "-"}*\n` +
        `Jam: *${state.jam ?? "-"}*\n\n` +
        "Balas dengan *nama pemesan* untuk melanjutkan ya 🙌"
    );
  }

  if (state.step === "konfirmasi") {
    const confirmationSummary = renderTemplate(templates.confirmationPrompt, {
      business_name: context.businessName,
      customer_name: state.customer_name,
      layanan: state.layanan,
      tanggal_label: state.tanggal ? formatBookingDateLabel(state.tanggal) : "-",
      jam: state.jam,
      harga: formatRupiah(state.harga),
      branch_name: selectedBranch?.name,
    });

    return (
      `${confirmationSummary}\n\n` +
      (selectedBranch ? `📍 Cabang: ${selectedBranch.name}\n` : "") +
      `🙍 Nama pemesan: ${state.customer_name ?? "-"}\n\n` +
      "Balas *YA* untuk konfirmasi atau *BATAL* untuk mengulang."
    );
  }

  return withCancelHint(
    branches.length > 0
      ? buildBranchSelectionMessage(context, branches)
      : renderTemplate(templates.greeting, {
          business_name: context.businessName,
          service_list: getServiceOptionsText(tenantServices),
        })
  );
}

export async function POST(req: Request) {
  const {
    eventType,
    incomingMessage,
    sender,
    device,
    officialPhoneNumberId,
    webhookSecret,
    messageId,
    deliveryStatus,
    statusRecipientId,
    payloadKeys,
  } =
    await parseWebhookPayload(req);

  if (eventType === "status") {
    console.log("[whatsapp-webhook] delivery status", {
      officialPhoneNumberId: officialPhoneNumberId || null,
      messageId: messageId || null,
      recipientId: statusRecipientId || null,
      status: deliveryStatus || null,
    });

    return Response.json({
      status: "status_event_logged",
      officialPhoneNumberId: officialPhoneNumberId || null,
      messageId: messageId || null,
      recipientId: statusRecipientId || null,
      deliveryStatus: deliveryStatus || null,
      legacy: false,
    });
  }

  console.log("[whatsapp-webhook] payload diag", {
    buildMarker: getWebhookBuildMarker(),
    eventType,
    officialPhoneNumberId: officialPhoneNumberId || null,
    messageId: messageId || null,
    hasMessages: Boolean(incomingMessage),
    hasStatuses: deliveryStatus !== null,
    hasContacts: Boolean(sender),
    payloadKeys: payloadKeys.slice(0, 12),
  });

  console.log("[whatsapp-webhook] incoming", {
    buildMarker: getWebhookBuildMarker(),
    sender: sender || null,
    device: device || null,
    officialPhoneNumberId: officialPhoneNumberId || null,
    messageId: messageId || null,
    messagePreview: incomingMessage ? incomingMessage.slice(0, 120) : "",
  });

  const context = await resolveWhatsappRuntimeContext({
    deviceNumber: device,
    officialPhoneNumberId,
  });

  if (!device && !officialPhoneNumberId) {
    return Response.json({ status: "missing device" }, { status: 400 });
  }

  if (!context.channel) {
    console.warn("[whatsapp-webhook] unknown channel", {
      sender: sender || null,
      device: device || null,
      officialPhoneNumberId: officialPhoneNumberId || null,
    });
    return Response.json({ status: "unknown device" }, { status: 404 });
  }

  if (!sender) {
    console.warn("[whatsapp-webhook] missing sender", {
      device: device || null,
      officialPhoneNumberId: officialPhoneNumberId || null,
      messageId: messageId || null,
    });
    return Response.json({ status: "no sender" });
  }

  if (eventType === "message" && !incomingMessage.trim()) {
    console.log("[whatsapp-webhook] ignored empty text message", {
      sender,
      channelId: context.channelId,
      officialPhoneNumberId: officialPhoneNumberId || null,
      messageId: messageId || null,
      payloadKeys: payloadKeys.slice(0, 12),
    });

    return Response.json({
      status: "ignored_empty_text_message",
      channelId: context.channelId,
      userId: context.userId,
      legacy: false,
    });
  }

  if (eventType === "unknown") {
    console.log("[whatsapp-webhook] ignored non-text event", {
      sender,
      channelId: context.channelId,
      officialPhoneNumberId: officialPhoneNumberId || null,
      messageId: messageId || null,
      payloadKeys: payloadKeys.slice(0, 12),
    });

    return Response.json({
      status: "ignored_non_text_event",
      channelId: context.channelId,
      userId: context.userId,
      legacy: false,
    });
  }

  if (
    eventType === "message" &&
    incomingMessage &&
    (await shouldIgnoreRecentOutboundEcho({
      sender,
      channelId: context.channelId,
      officialPhoneNumberId,
      message: incomingMessage,
    }))
  ) {
    console.log("[whatsapp-webhook] outbound echo ignored", {
      sender,
      channelId: context.channelId,
      officialPhoneNumberId: officialPhoneNumberId || null,
      messageId: messageId || null,
      messagePreview: incomingMessage.slice(0, 120),
    });

    return Response.json({
      status: "outbound_echo_ignored",
      channelId: context.channelId,
      userId: context.userId,
      legacy: false,
    });
  }

  if (
    eventType === "message" &&
    incomingMessage &&
    (await shouldIgnoreRecentDuplicateMessage({
      sender,
      channelId: context.channelId,
      officialPhoneNumberId,
      message: incomingMessage,
    }))
  ) {
    console.log("[whatsapp-webhook] recent duplicate ignored", {
      sender,
      channelId: context.channelId,
      officialPhoneNumberId: officialPhoneNumberId || null,
      messageId: messageId || null,
      messagePreview: incomingMessage.slice(0, 120),
    });

    return Response.json({
      status: "recent_duplicate_ignored",
      channelId: context.channelId,
      userId: context.userId,
      legacy: false,
    });
  }

  if (messageId) {
    const dedupeKey = `whatsapp_webhook_message:${messageId}`;
    try {
      const { error: dedupeInsertError } = await getSupabase().from("app_settings").insert({
        key: dedupeKey,
        value_json: {
          sender,
          device: device || null,
          officialPhoneNumberId: officialPhoneNumberId || null,
          createdAt: new Date().toISOString(),
        },
      });

      if (dedupeInsertError) {
        if (dedupeInsertError.code === "23505") {
          console.log("[whatsapp-webhook] duplicate message ignored", {
            sender,
            messageId,
          });
          return Response.json({
            status: "duplicate_ignored",
            channelId: context.channelId,
            userId: context.userId,
            legacy: false,
          });
        }

        throw new Error(dedupeInsertError.message);
      }
    } catch (error) {
      console.warn("[whatsapp-webhook] dedupe store failed", {
        sender,
        messageId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (!isValidWebhookSecret(context, webhookSecret)) {
    console.warn("[whatsapp-webhook] invalid webhook secret", {
      sender,
      device: device || null,
      officialPhoneNumberId: officialPhoneNumberId || null,
      messageId: messageId || null,
    });
    return Response.json({ status: "invalid secret" }, { status: 403 });
  }

  if (!context.token) {
    if (context.chatbotProvider === "official") {
      if (!context.officialAccessToken || !context.officialPhoneNumberId) {
        return Response.json({ status: "missing official token" }, { status: 500 });
      }
    } else {
      return Response.json({ status: "missing token" }, { status: 500 });
    }
  }

  const rawMessage = incomingMessage.trim();
  const message = rawMessage.toLowerCase();
  const state = await loadState(sender, context.channelId);
  const industry: IndustryKey = state?.industry || context.industry;
  const templates = context.templates;
  const replyStyle = context.replyStyle;
  const branches = await getBranchesForUser(context.userId, { activeOnly: true });
  const tenantServices = await getServicesForUser(context.userId, industry);
  const today = getTodayInJakarta();
  const industryPrompt = getIndustryOptionsText();
  const scope = {
    ...getRuntimeScope(context),
    branchId: state?.branch_id ?? null,
  };
  const getServiceDuration = (serviceName: string | null | undefined) =>
    tenantServices.find((service) => service.name === serviceName)?.duration_minutes ?? 60;
  let reply = "";

  if (isLikelyFaqMessage(rawMessage)) {
    const faqReply = await getAiFallbackReply({
      sender,
      context,
      industry,
      tenantServices,
      branches,
      rawMessage,
      messageId,
    });

    if (faqReply) {
      reply = faqReply;
    }
  }

  if (!reply && state && isCancelMessage(message)) {
    await clearState(sender, context.channelId);
    reply = templates.cancelMessage;
  } else if (!reply && state && isContinueMessage(message)) {
    reply = await buildCurrentStepReply({
      state,
      context,
      templates,
      tenantServices,
      branches,
      today,
      scope,
      industry,
    });
  } else if (!reply && (message === "halo" || message === "menu" || message === "booking")) {
    reply = await resetToGreetingState({
      sender,
      context,
      industry,
      tenantServices,
      branches,
    });
  } else if (
    !reply &&
    state &&
    branches.length > 0 &&
    ["cabang", "pilih cabang", "ganti cabang", "ubah cabang"].includes(message)
  ) {
    await saveState({
      sender,
      channel_id: context.channelId,
      user_id: context.userId,
      branch_id: null,
      step: "pilih_cabang",
      customer_name: null,
      layanan: null,
      harga: null,
      tanggal: null,
      jam: null,
      industry,
    });

    reply = withCancelHint(buildBranchSelectionMessage(context, branches));
  } else if (
    !reply &&
    ["industri", "pilih industri", "ganti industri", "ubah industri"].includes(message)
  ) {
    await saveState({
      sender,
      channel_id: context.channelId,
      user_id: context.userId,
      branch_id: state?.branch_id ?? null,
      step: "pilih_industri",
      industry,
    });

    reply = withCancelHint(`Pilih industri:\n${industryPrompt}\n\nBalas dengan nomor atau nama industri.`);
  } else if (!reply && state?.step === "pilih_industri") {
    const selectedIndustry = getIndustryBySelection(message);

    if (!selectedIndustry) {
      reply = withCancelHint(
        `Kita masih di langkah pilih industri.\n\n${templates.invalidOptionMessage}\n\nPilih industri:\n${industryPrompt}`
      );
    } else {
      const selectedTemplates = context.templates;

      await saveState({
        sender,
        channel_id: context.channelId,
        user_id: context.userId,
        branch_id: null,
        step: "pilih_layanan",
        customer_name: null,
        industry: selectedIndustry,
        layanan: null,
        harga: null,
        tanggal: null,
        jam: null,
      });

      reply = withCancelHint(
        renderTemplate(selectedTemplates.greeting, {
          business_name: context.businessName,
          service_list: getServiceOptionsText(
            await getServicesForUser(context.userId, selectedIndustry)
          ),
        })
      );
    }
  } else if (
    !reply &&
    state?.step !== "pilih_industri" &&
    (!state ||
      (typeof state.step === "string" &&
        ["pilih_cabang", "pilih_layanan", "pilih_tanggal", "pilih_jam", "isi_nama"].includes(
          state.step
        )))
  ) {
    const fastForwardReply = await tryFastForwardBookingFromMessage({
      sender,
      rawMessage,
      context,
      industry,
      state,
      tenantServices,
      branches,
      today,
    });

    if (fastForwardReply) {
      reply = fastForwardReply;
    }
  } else if (!reply && state?.step === "pilih_cabang") {
    const parsedBranch = getBranchBySelection(message, branches);
    const aiParsedBranch =
      parsedBranch || branches.length === 0
        ? null
        : await parseBookingStepWithAi({
            context,
            industry,
            step: "pilih_cabang",
            rawMessage,
            state,
            tenantServices,
            branches,
            candidates: getBranchCandidates(branches),
          });
    const selectedBranch =
      parsedBranch ??
      branches.find((branch) => branch.id === aiParsedBranch?.matchedCandidateId) ??
      null;

    if (!selectedBranch) {
      const faqReply = await maybeGetInFlowFaqReply({
        context,
        industry,
        rawMessage,
        state,
        tenantServices,
        branches,
        sender,
        messageId,
      });

      reply =
        faqReply ||
        withCancelHint(
          composeNaturalReply({
            style: replyStyle,
            intro: "Kita masih di langkah pilih cabang ya.",
            lines: [
              aiParsedBranch?.clarificationReason || "Aku belum bisa memastikan cabang yang kamu maksud.",
              getBranchOptionsText(branches),
            ],
            question: "Balas dengan nomor, kode, atau nama cabang yang tersedia ya.",
            includeClosingLine: false,
          })
        );
    } else {
      await saveState({
        sender,
        channel_id: context.channelId,
        user_id: context.userId,
        branch_id: selectedBranch.id ?? null,
        step: "pilih_layanan",
        customer_name: null,
        layanan: null,
        harga: null,
        tanggal: null,
        jam: null,
        industry,
      });

      reply = withCancelHint(
        replyStyle.useNaturalLanguage
          ? composeNaturalReply({
              style: replyStyle,
              intro:
                `${getToneLead(replyStyle, "ack")} Cabang *${selectedBranch.name}* sudah kupilih.`,
              lines: ["Sekarang kita lanjut pilih layanannya ya.", getServiceOptionsText(tenantServices)],
              question: "Boleh balas dengan nomor layanan, nama layanan, atau jelaskan kebutuhanmu langsung.",
              includeClosingLine: false,
            })
          : `Cabang dipilih: *${selectedBranch.name}*\n\n` +
            renderTemplate(templates.greeting, {
              business_name: context.businessName,
              service_list: getServiceOptionsText(tenantServices),
            })
      );
    }
  } else if (!reply && !state) {
    reply =
      (await getAiFallbackReply({
        sender,
        context,
        industry,
        tenantServices,
        branches,
        rawMessage,
        messageId,
      })) ??
      (await resetToGreetingState({
        sender,
        context,
        industry,
        tenantServices,
        branches,
      }));
  } else if (!reply && state?.step === "pilih_layanan") {
    const bookingState = state;
    const industryServices = tenantServices;
    const parsedService = getServiceBySelection(message, industryServices);
    const aiParsedService =
      parsedService
        ? null
        : await parseBookingStepWithAi({
            context,
            industry,
            step: "pilih_layanan",
            rawMessage,
            state: bookingState,
            tenantServices,
            branches,
            candidates: getServiceCandidates(industryServices),
          });
    const service =
      parsedService ??
      industryServices.find((item) => item.code === aiParsedService?.matchedCandidateId) ??
      null;
    const selectedBranch = getSelectedBranch(branches, bookingState.branch_id);

    if (!service) {
      const faqReply = await maybeGetInFlowFaqReply({
        context,
        industry,
        rawMessage,
        state: bookingState,
        tenantServices,
        branches,
        sender,
        messageId,
      });

      reply =
        faqReply ||
        withCancelHint(
          composeNaturalReply({
            style: replyStyle,
            intro: "Kita masih di langkah pilih layanan ya.",
            lines: [
              selectedBranch ? `Cabang terpilih: *${selectedBranch.name}*` : "",
              aiParsedService?.clarificationReason || templates.invalidOptionMessage,
              getServiceOptionsText(industryServices),
            ],
            question: "Balas dengan nomor layanan, nama layanan, atau jelaskan layanan yang kamu mau.",
            includeClosingLine: false,
          })
        );
    } else {
      const dateOptions = await getAvailableDateOptions({
        baseDate: today,
        industry,
        scope,
        durationMinutes: service.duration_minutes ?? 60,
      });

      if (dateOptions.length === 0) {
        reply =
          "Maaf, belum ada tanggal yang tersedia dalam beberapa hari ke depan. " +
          "Silakan hubungi admin untuk penjadwalan manual ya 🙏";
      } else {
        await saveState({
          sender,
          channel_id: context.channelId,
          user_id: context.userId,
          step: "pilih_tanggal",
          customer_name: null,
          layanan: service.name,
          harga: service.price,
          industry,
        });

        reply = withCancelHint(
          replyStyle.useNaturalLanguage
            ? composeNaturalReply({
                style: replyStyle,
                intro:
                  `${getToneLead(replyStyle, "ack")} Kamu pilih *${service.name}*.` +
                  (selectedBranch ? ` Untuk cabang *${selectedBranch.name}* ya.` : ""),
                lines: ["Tanggal yang masih tersedia:", getDateOptionsText(dateOptions)],
                question: "Kamu bisa balas dengan nomor tanggal, tulis tanggalnya langsung, atau bilang misalnya besok/lusa.",
                includeClosingLine: false,
              })
            : `${selectedBranch ? `Cabang: *${selectedBranch.name}*\n\n` : ""}` +
              renderTemplate(templates.servicePrompt, {
                business_name: context.businessName,
                layanan: service.name,
                date_options: getDateOptionsText(dateOptions),
              })
        );
      }
    }
  } else if (!reply && state?.step === "pilih_tanggal") {
    const bookingState = state;
    const dateOptions = await getAvailableDateOptions({
      baseDate: today,
      industry,
      scope,
      durationMinutes: getServiceDuration(bookingState.layanan),
    });
    const parsedDate = getDateBySelection(message, dateOptions);
    const aiParsedDate =
      parsedDate || dateOptions.length === 0
        ? null
        : await parseBookingStepWithAi({
            context,
            industry,
            step: "pilih_tanggal",
            rawMessage,
            state: bookingState,
            tenantServices,
            branches,
            candidates: getDateCandidates(dateOptions),
          });
    const selectedDate =
      parsedDate ??
      dateOptions.find((option) => option.key === aiParsedDate?.matchedCandidateId) ??
      null;
    const selectedBranch = getSelectedBranch(branches, bookingState.branch_id);

    if (!selectedDate) {
      const faqReply = await maybeGetInFlowFaqReply({
        context,
        industry,
        rawMessage,
        state: bookingState,
        tenantServices,
        branches,
        sender,
        messageId,
      });

      reply =
        faqReply ||
        (dateOptions.length > 0
          ? withCancelHint(
              composeNaturalReply({
                style: replyStyle,
                intro: "Kita masih di langkah pilih tanggal ya.",
                lines: [
                  selectedBranch ? `Cabang: *${selectedBranch.name}*` : "",
                  aiParsedDate?.clarificationReason || templates.invalidOptionMessage,
                  getDateOptionsText(dateOptions),
                ],
                question: "Balas dengan nomor, tanggal, atau sebutkan hari yang kamu inginkan.",
                includeClosingLine: false,
              })
            )
          : "Maaf, belum ada tanggal yang tersedia dalam beberapa hari ke depan. Silakan coba lagi nanti ya 🙏");
    } else {
      const slots = await getAvailableSlots(
        selectedDate.key,
        industry,
        scope,
        getServiceDuration(bookingState.layanan)
      );

      if (slots.length === 0) {
        const refreshedDateOptions = await getAvailableDateOptions({
          baseDate: today,
          industry,
          scope,
          durationMinutes: getServiceDuration(bookingState.layanan),
        });

        reply =
          `Maaf, semua jam pada *${selectedDate.label}* sudah penuh.\n\n` +
          `${getDateOptionsText(refreshedDateOptions)}\n\n` +
          "Balas dengan nomor tanggal lain yang masih tersedia ya 🙌\n\nKetik *BATAL* kalau mau berhenti.";
      } else {
        await saveState({
          sender,
          channel_id: context.channelId,
          user_id: context.userId,
          step: "pilih_jam",
          tanggal: selectedDate.key,
          industry,
        });

        reply = withCancelHint(
          replyStyle.useNaturalLanguage
            ? composeNaturalReply({
                style: replyStyle,
                intro:
                  `${getToneLead(replyStyle, "ack")} Tanggal *${selectedDate.label}* sudah kupilih.` +
                  (selectedBranch ? ` Untuk cabang *${selectedBranch.name}* ya.` : ""),
                lines: ["Jam yang masih tersedia:", getSlotOptionsText(slots)],
                question: "Boleh balas dengan nomor jam, tulis jam langsung, atau bilang misalnya jam 3 sore.",
                includeClosingLine: false,
              })
            : `${selectedBranch ? `Cabang: *${selectedBranch.name}*\n\n` : ""}` +
              renderTemplate(templates.datePrompt, {
                business_name: context.businessName,
                tanggal_label: selectedDate.label,
                slot_options: getSlotOptionsText(slots),
              })
        );
      }
    }
  } else if (!reply && state?.step === "pilih_jam") {
    const bookingState = state;
    if (!bookingState.tanggal) {
      await clearState(sender, context.channelId);
      reply = "Sesi booking kamu sudah kedaluwarsa. Ketik *halo* untuk mulai lagi.";
    } else {
      const durationMinutes = getServiceDuration(bookingState.layanan);
      const slots = await getAvailableSlots(bookingState.tanggal, industry, scope, durationMinutes);
      const parsedSlot = getSlotBySelection(message, slots);
      const aiParsedSlot =
        parsedSlot || slots.length === 0
          ? null
          : await parseBookingStepWithAi({
              context,
              industry,
              step: "pilih_jam",
              rawMessage,
              state: bookingState,
              tenantServices,
              branches,
              candidates: getSlotCandidates(slots),
            });
      const selectedSlot = parsedSlot ?? aiParsedSlot?.matchedCandidateId ?? null;
      const selectedBranch = getSelectedBranch(branches, bookingState.branch_id);

      if (!selectedSlot) {
        const faqReply = await maybeGetInFlowFaqReply({
          context,
          industry,
          rawMessage,
          state: bookingState,
          tenantServices,
          branches,
          sender,
          messageId,
        });

        reply =
          faqReply ||
          withCancelHint(
            composeNaturalReply({
              style: replyStyle,
              intro: "Kita masih di langkah pilih jam ya.",
              lines: [
                selectedBranch ? `Cabang: *${selectedBranch.name}*` : "",
                aiParsedSlot?.clarificationReason || templates.invalidOptionMessage,
                getSlotOptionsText(slots),
              ],
              question: "Balas dengan nomor jam atau tulis jam yang kamu mau langsung.",
              includeClosingLine: false,
            })
          );
      } else if (!(await isSlotAvailable({
        date: bookingState.tanggal,
        time: selectedSlot,
        industry,
        durationMinutes,
        userId: scope.userId,
        channelId: scope.channelId,
        branchId: scope.branchId,
      }))) {
        reply =
          "Jam tersebut baru saja terisi. Pilih jam lain ya 🙏\n\n" +
          getSlotOptionsText(
            await getAvailableSlots(bookingState.tanggal, industry, scope, durationMinutes)
          ) +
          "\n\nKetik *BATAL* kalau mau berhenti.";
      } else {
        await saveState({
          sender,
          channel_id: context.channelId,
          user_id: context.userId,
          step: "isi_nama",
          jam: selectedSlot,
          industry,
        });

        reply = withCancelHint(
          replyStyle.useNaturalLanguage
            ? composeNaturalReply({
                style: replyStyle,
                intro:
                  `${getToneLead(replyStyle, "ack")} Jam *${selectedSlot}* masih tersedia untuk *${bookingState.layanan}*.`,
                question: "Sekarang kirim nama pemesannya ya. Kamu bisa tulis misalnya `Atas nama Robbi`.",
                includeClosingLine: false,
              })
            : `Sip, jam *${selectedSlot}* masih tersedia untuk *${bookingState.layanan}*.\n\n` +
              "Sekarang balas dengan *nama pemesan* untuk melanjutkan booking ya 🙌"
        );
      }
    }
  } else if (!reply && state?.step === "isi_nama") {
    const bookingState = state;
    const parsedName = normalizeCustomerName(rawMessage);
    const aiParsedName =
      await parseBookingStepWithAi({
        context,
        industry,
        step: "isi_nama",
        rawMessage,
        state: bookingState,
        tenantServices,
        branches,
      });
    const customerName = normalizeCustomerName(aiParsedName?.customerName || parsedName);

    if (!customerName || customerName.length < 2) {
      const faqReply = await maybeGetInFlowFaqReply({
        context,
        industry,
        rawMessage,
        state: bookingState,
        tenantServices,
        branches,
        sender,
        messageId,
      });

      reply =
        faqReply ||
        withCancelHint(
          composeNaturalReply({
            style: replyStyle,
            intro: "Kita masih di langkah isi nama ya.",
            lines: [
              getSelectedBranch(branches, bookingState.branch_id)
                ? `Cabang: *${getSelectedBranch(branches, bookingState.branch_id)?.name ?? "-"}*`
                : "",
              "Nama pemesan minimal 2 karakter.",
            ],
            question: "Balas dengan nama pemesannya ya. Contohnya: `Atas nama Robbi`.",
            includeClosingLine: false,
          })
        );
    } else {
      const confirmationSummary = renderTemplate(templates.confirmationPrompt, {
        business_name: context.businessName,
        customer_name: customerName,
        layanan: bookingState.layanan,
        tanggal_label: bookingState.tanggal ? formatBookingDateLabel(bookingState.tanggal) : "-",
        jam: bookingState.jam,
        harga: formatRupiah(bookingState.harga),
        branch_name: getSelectedBranch(branches, bookingState.branch_id)?.name,
      });

      await saveState({
        sender,
        channel_id: context.channelId,
        user_id: context.userId,
        branch_id: bookingState.branch_id ?? null,
        step: "konfirmasi",
        customer_name: customerName,
        industry,
      });

      reply = replyStyle.useNaturalLanguage
        ? composeNaturalReply({
            style: replyStyle,
            intro: `${getToneLead(replyStyle, "ack")} Datanya sudah lengkap.`,
            lines: [
              confirmationSummary,
              getSelectedBranch(branches, bookingState.branch_id)
                ? `📍 Cabang: ${getSelectedBranch(branches, bookingState.branch_id)?.name ?? "-"}`
                : "",
              `🙍 Nama pemesan: ${customerName}`,
            ],
            question: "Kalau sudah benar, balas *YA*. Kalau mau ganti, balas *BATAL* dulu ya.",
            includeClosingLine: false,
          })
        : `${confirmationSummary}\n\n` +
          `${getSelectedBranch(branches, bookingState.branch_id) ? `📍 Cabang: ${getSelectedBranch(branches, bookingState.branch_id)?.name ?? "-"}\n` : ""}` +
          `🙍 Nama pemesan: ${customerName}\n\n` +
          "Balas *YA* untuk konfirmasi atau *BATAL* untuk mengulang.";
    }
  } else if (!reply && state?.step === "konfirmasi") {
    const bookingState = state;
    const aiParsedConfirmation = await parseBookingStepWithAi({
      context,
      industry,
      step: "konfirmasi",
      rawMessage,
      state: bookingState,
      tenantServices,
      branches,
    });
    if (message === "ya" || aiParsedConfirmation?.confirmBooking) {
      if (!bookingState.tanggal || !bookingState.jam || !bookingState.customer_name) {
        await clearState(sender, context.channelId);
        reply = "Sesi booking kamu sudah kedaluwarsa. Ketik *halo* untuk mulai lagi.";
      } else if (!(await isSlotAvailable({
        date: bookingState.tanggal,
        time: bookingState.jam,
        industry,
        durationMinutes: getServiceDuration(bookingState.layanan),
        userId: scope.userId,
        channelId: scope.channelId,
        branchId: scope.branchId,
      }))) {
        reply = "❌ Slot sudah diambil pelanggan lain. Ketik *halo* untuk mulai pilih ulang ya.";
      } else {
        const durationMinutes = getServiceDuration(bookingState.layanan);
        const selectedService = tenantServices.find((service) => service.name === bookingState.layanan);
        const { error: bookingInsertError } = await getSupabase().from("bookings").insert([
          {
            sender,
            customer_name: bookingState.customer_name,
            branch_id: bookingState.branch_id,
            layanan: bookingState.layanan,
            service_codes: selectedService ? [selectedService.code] : [],
            harga: bookingState.harga,
            tanggal: bookingState.tanggal,
            jam: bookingState.jam,
            duration_minutes: durationMinutes,
            status: "confirmed",
            industry,
            user_id: context.userId,
            channel_id: context.channelId,
          },
        ]);

        if (bookingInsertError) {
          if (isBookingSlotConflict(bookingInsertError)) {
            reply = "❌ Slot baru saja diambil pelanggan lain. Ketik *halo* untuk mulai pilih ulang ya.";
          } else {
            console.error("Failed to create WhatsApp booking:", bookingInsertError);
            reply = "Maaf, booking belum berhasil diproses. Ketik *halo* untuk coba lagi ya.";
          }

          await clearState(sender, context.channelId);
          await sendReply(context, sender, reply);

          return Response.json({
            status: "booking_failed",
            channelId: context.channelId,
            userId: context.userId,
            legacy: false,
          }, { status: 409 });
        }

        await clearState(sender, context.channelId);

        reply = renderTemplate(templates.successMessage, {
          business_name: context.businessName,
          customer_name: bookingState.customer_name,
          layanan: bookingState.layanan,
          tanggal_label: formatBookingDateLabel(bookingState.tanggal),
          jam: bookingState.jam,
          branch_name: getSelectedBranch(branches, bookingState.branch_id)?.name,
        });
      }
    } else if (message === "batal") {
      await clearState(sender, context.channelId);
      reply = templates.cancelMessage;
    } else {
      const faqReply = await maybeGetInFlowFaqReply({
        context,
        industry,
        rawMessage,
        state: bookingState,
        tenantServices,
        branches,
        sender,
        messageId,
      });

      reply =
        faqReply ||
        "Kita masih di langkah konfirmasi.\n\n" +
        `${templates.invalidOptionMessage}\n\nBalas *YA* untuk konfirmasi atau *BATAL* untuk mengulang.`;
    }
  }

  if (!reply) {
    reply = await resetToGreetingState({
      sender,
      context,
      industry,
      tenantServices,
      branches,
    });
  }

  console.log("[whatsapp-webhook] reply prepared", {
    buildMarker: getWebhookBuildMarker(),
    sender,
    channelId: context.channelId,
    provider: context.chatbotProvider,
    replyPreview: reply.slice(0, 160),
  });

  try {
    const delivery = await sendReply(context, sender, reply);

    if (delivery && typeof delivery === "object" && "dryRun" in delivery) {
      console.log("[whatsapp-webhook] reply skipped in test mode", {
        sender,
        channelId: context.channelId,
        provider: context.chatbotProvider,
      });
    } else {
      console.log("[whatsapp-webhook] reply sent", {
        sender,
        channelId: context.channelId,
        provider: context.chatbotProvider,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown send error";
    console.error("[whatsapp-webhook] reply send failed", {
      sender,
      channelId: context.channelId,
      provider: context.chatbotProvider,
      error: message,
    });

    return Response.json(
      {
        status: "reply_send_failed",
        channelId: context.channelId,
        userId: context.userId,
        legacy: false,
      },
      { status: 200 }
    );
  }

  return Response.json({
    status: "ok",
    channelId: context.channelId,
    userId: context.userId,
    legacy: false,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  if (!isMetaWebhookVerificationRequest(url)) {
    return Response.json({ status: "webhook_endpoint_active" });
  }

  const verifyToken = getMetaVerificationToken(req);
  const challenge = getMetaChallenge(req);
  const officialPhoneNumberId = url.searchParams.get("phone_number_id");
  const context = await resolveWhatsappRuntimeContext({
    officialPhoneNumberId: officialPhoneNumberId ?? undefined,
  });

  const expectedToken = context.officialVerifyToken?.trim();

  if (!expectedToken || verifyToken?.trim() !== expectedToken) {
    return Response.json({ status: "invalid verify token" }, { status: 403 });
  }

  return new Response(challenge ?? "", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
