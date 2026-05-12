import {
  formatBookingDateLabel,
  formatRupiah,
  getUpcomingDateOptions,
  getServiceBySelection,
  getServiceOptionsText,
  getSlotBySelection,
  getSlotOptionsText,
  renderTemplate,
} from "@/lib/chatbot";
import { type IndustryKey, getAvailableIndustries } from "@/lib/industries";
import { isBookingSlotConflict } from "@/lib/booking-conflicts";
import { getServicesForUser } from "@/lib/bookings";
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

function withCancelHint(message: string) {
  return `${message}\n\nKetik *BATAL* kalau mau berhenti dari booking ini.`;
}

function getBranchOptionsText(branches: UserBranch[]) {
  return branches.map((branch, index) => `${index + 1}. *${branch.name}*`).join("\n");
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
      officialValue?.message?.text?.body ||
      officialValue?.message?.body ||
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

  return renderTemplate(context.templates.greeting, {
    business_name: context.businessName,
    service_list: getServiceOptionsText(tenantServices),
  });
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

  return sendWhatsappMessage({
    target,
    message,
    token: context.token,
    provider: context.chatbotProvider,
    officialAccessToken: context.officialAccessToken,
    officialPhoneNumberId: context.officialPhoneNumberId,
  });
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
    eventType,
    officialPhoneNumberId: officialPhoneNumberId || null,
    messageId: messageId || null,
    hasMessages: Boolean(incomingMessage),
    hasStatuses: deliveryStatus !== null,
    hasContacts: Boolean(sender),
    payloadKeys: payloadKeys.slice(0, 12),
  });

  console.log("[whatsapp-webhook] incoming", {
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

  if (messageId) {
    const dedupeKey = `whatsapp_webhook_message:${messageId}`;
    try {
      const supabase = getSupabase();
      const { data: existingDedupe } = await supabase
        .from("app_settings")
        .select("key")
        .eq("key", dedupeKey)
        .maybeSingle();

      if (existingDedupe) {
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

      await supabase.from("app_settings").insert({
        key: dedupeKey,
        value_json: {
          sender,
          device: device || null,
          officialPhoneNumberId: officialPhoneNumberId || null,
          createdAt: new Date().toISOString(),
        },
      });
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

  if (state && isCancelMessage(message)) {
    await clearState(sender, context.channelId);
    reply = templates.cancelMessage;
  } else if (state && isContinueMessage(message)) {
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
  } else if (message === "halo" || message === "menu" || message === "booking") {
    reply = await resetToGreetingState({
      sender,
      context,
      industry,
      tenantServices,
      branches,
    });
  } else if (
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
  } else if (state?.step === "pilih_industri") {
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
  } else if (state?.step === "pilih_cabang") {
    const selectedBranch = getBranchBySelection(message, branches);

    if (!selectedBranch) {
      reply = withCancelHint(
        `Kita masih di langkah pilih cabang.\n\nPilihan belum sesuai. Balas dengan nomor cabang yang tersedia ya 🙌\n\n${getBranchOptionsText(branches)}`
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
        `Cabang dipilih: *${selectedBranch.name}*\n\n` +
          renderTemplate(templates.greeting, {
            business_name: context.businessName,
            service_list: getServiceOptionsText(tenantServices),
          })
      );
    }
  } else if (!state) {
    reply = await resetToGreetingState({
      sender,
      context,
      industry,
      tenantServices,
      branches,
    });
  } else if (state.step === "pilih_layanan") {
    const industryServices = tenantServices;
    const service = getServiceBySelection(message, industryServices);
    const selectedBranch = getSelectedBranch(branches, state.branch_id);

    if (!service) {
      reply = withCancelHint(
        `Kita masih di langkah pilih layanan.\n\n` +
          `${selectedBranch ? `Cabang terpilih: *${selectedBranch.name}*\n\n` : ""}` +
          `${templates.invalidOptionMessage}\n\n${getServiceOptionsText(industryServices)}`
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
          `${selectedBranch ? `Cabang: *${selectedBranch.name}*\n\n` : ""}` +
            renderTemplate(templates.servicePrompt, {
              business_name: context.businessName,
              layanan: service.name,
              date_options: getDateOptionsText(dateOptions),
            })
        );
      }
    }
  } else if (state.step === "pilih_tanggal") {
    const dateOptions = await getAvailableDateOptions({
      baseDate: today,
      industry,
      scope,
      durationMinutes: getServiceDuration(state?.layanan),
    });
    const selectedDate = getDateBySelection(message, dateOptions);
    const selectedBranch = getSelectedBranch(branches, state.branch_id);

    if (!selectedDate) {
      reply =
        dateOptions.length > 0
          ? withCancelHint(
              `Kita masih di langkah pilih tanggal.\n\n` +
                `${selectedBranch ? `Cabang: *${selectedBranch.name}*\n\n` : ""}` +
                `${templates.invalidOptionMessage}\n\n${getDateOptionsText(dateOptions)}`
            )
          : "Maaf, belum ada tanggal yang tersedia dalam beberapa hari ke depan. Silakan coba lagi nanti ya 🙏";
    } else {
      const slots = await getAvailableSlots(
        selectedDate.key,
        industry,
        scope,
        getServiceDuration(state?.layanan)
      );

      if (slots.length === 0) {
        const refreshedDateOptions = await getAvailableDateOptions({
          baseDate: today,
          industry,
          scope,
          durationMinutes: getServiceDuration(state?.layanan),
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
          `${selectedBranch ? `Cabang: *${selectedBranch.name}*\n\n` : ""}` +
            renderTemplate(templates.datePrompt, {
              business_name: context.businessName,
              tanggal_label: selectedDate.label,
              slot_options: getSlotOptionsText(slots),
            })
        );
      }
    }
  } else if (state.step === "pilih_jam") {
    if (!state.tanggal) {
      await clearState(sender, context.channelId);
      reply = "Sesi booking kamu sudah kedaluwarsa. Ketik *halo* untuk mulai lagi.";
    } else {
      const durationMinutes = getServiceDuration(state.layanan);
      const slots = await getAvailableSlots(state.tanggal, industry, scope, durationMinutes);
      const selectedSlot = getSlotBySelection(message, slots);
      const selectedBranch = getSelectedBranch(branches, state.branch_id);

      if (!selectedSlot) {
        reply = withCancelHint(
          `Kita masih di langkah pilih jam.\n\n` +
            `${selectedBranch ? `Cabang: *${selectedBranch.name}*\n\n` : ""}` +
            `${templates.invalidOptionMessage}\n\n${getSlotOptionsText(slots)}`
        );
      } else if (!(await isSlotAvailable({
        date: state.tanggal,
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
            await getAvailableSlots(state.tanggal, industry, scope, durationMinutes)
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

        reply =
          `Sip, jam *${selectedSlot}* masih tersedia untuk *${state.layanan}*.\n\n` +
          "Sekarang balas dengan *nama pemesan* untuk melanjutkan booking ya 🙌\n\n" +
          "Ketik *BATAL* kalau mau berhenti.";
      }
    }
  } else if (state.step === "isi_nama") {
    const customerName = normalizeCustomerName(rawMessage);

    if (!customerName || customerName.length < 2) {
      reply =
        "Kita masih di langkah isi nama.\n\n" +
        `${getSelectedBranch(branches, state.branch_id) ? `Cabang: *${getSelectedBranch(branches, state.branch_id)?.name ?? "-"}*\n` : ""}` +
        "Nama pemesan minimal 2 karakter. Balas dengan nama yang benar ya 🙌\n\n" +
        "Ketik *BATAL* kalau mau berhenti.";
    } else {
      const confirmationSummary = renderTemplate(templates.confirmationPrompt, {
        business_name: context.businessName,
        customer_name: customerName,
        layanan: state.layanan,
        tanggal_label: state.tanggal ? formatBookingDateLabel(state.tanggal) : "-",
        jam: state.jam,
        harga: formatRupiah(state.harga),
        branch_name: getSelectedBranch(branches, state.branch_id)?.name,
      });

      await saveState({
        sender,
        channel_id: context.channelId,
        user_id: context.userId,
        branch_id: state.branch_id ?? null,
        step: "konfirmasi",
        customer_name: customerName,
        industry,
      });

      reply =
        `${confirmationSummary}\n\n` +
        `${getSelectedBranch(branches, state.branch_id) ? `📍 Cabang: ${getSelectedBranch(branches, state.branch_id)?.name ?? "-"}\n` : ""}` +
        `🙍 Nama pemesan: ${customerName}\n\n` +
        "Balas *YA* untuk konfirmasi atau *BATAL* untuk mengulang.";
    }
  } else if (state.step === "konfirmasi") {
    if (message === "ya") {
      if (!state.tanggal || !state.jam || !state.customer_name) {
        await clearState(sender, context.channelId);
        reply = "Sesi booking kamu sudah kedaluwarsa. Ketik *halo* untuk mulai lagi.";
      } else if (!(await isSlotAvailable({
        date: state.tanggal,
        time: state.jam,
        industry,
        durationMinutes: getServiceDuration(state.layanan),
        userId: scope.userId,
        channelId: scope.channelId,
        branchId: scope.branchId,
      }))) {
        reply = "❌ Slot sudah diambil pelanggan lain. Ketik *halo* untuk mulai pilih ulang ya.";
      } else {
        const durationMinutes = getServiceDuration(state.layanan);
        const selectedService = tenantServices.find((service) => service.name === state.layanan);
        const { error: bookingInsertError } = await getSupabase().from("bookings").insert([
          {
            sender,
            customer_name: state.customer_name,
            branch_id: state.branch_id,
            layanan: state.layanan,
            service_codes: selectedService ? [selectedService.code] : [],
            harga: state.harga,
            tanggal: state.tanggal,
            jam: state.jam,
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
          customer_name: state.customer_name,
          layanan: state.layanan,
          tanggal_label: formatBookingDateLabel(state.tanggal),
          jam: state.jam,
          branch_name: getSelectedBranch(branches, state.branch_id)?.name,
        });
      }
    } else if (message === "batal") {
      await clearState(sender, context.channelId);
      reply = templates.cancelMessage;
    } else {
      reply =
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
