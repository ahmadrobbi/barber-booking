import { createAdminSupabase } from "@/lib/supabase";
import { ALL_BOOKING_SLOTS, BOOKING_SERVICES, type BookingService } from "@/lib/bookings";

export const CHATBOT_TEMPLATE_KEY = "chatbot_templates";

export type ChatbotTemplates = {
  greeting: string;
  servicePrompt: string;
  datePrompt: string;
  slotPrompt: string;
  confirmationPrompt: string;
  successMessage: string;
  cancelMessage: string;
  invalidOptionMessage: string;
  reminder: string;
};

export type ChatbotReplyStyle = {
  assistantLabel: string;
  tone: "friendly" | "warm" | "professional";
  brevity: "compact" | "balanced";
  emojiLevel: "none" | "low" | "medium";
  closingLine: string;
  useNaturalLanguage: boolean;
};

export type ChatbotChannelOverrides = {
  reply_style?: Partial<ChatbotReplyStyle>;
  fallback_templates?: Partial<ChatbotTemplates>;
} & Partial<ChatbotTemplates>;

export const DEFAULT_CHATBOT_TEMPLATES: ChatbotTemplates = {
  greeting:
    "Halo 👋 Selamat datang di *{{business_name}}* 💈\n\nKami siap bantu booking kamu dengan cepat dan rapi.\n\n{{service_list}}\nBalas dengan nomor layanan ya 👇",
  servicePrompt:
    "Mantap 👍 kamu pilih *{{layanan}}*.\n\nSekarang pilih tanggal booking ya 📅\n\n{{date_options}}\nBalas dengan nomor tanggal yang kamu mau.",
  datePrompt:
    "📅 Tanggal dipilih: *{{tanggal_label}}*\n\n⏰ *Jam tersedia:*\n{{slot_options}}\nBalas dengan nomor jam yang kamu mau ya 👇",
  slotPrompt:
    "Sip, jam *{{jam}}* masih tersedia.\n\n{{confirmation_summary}}\nBalas *YA* untuk konfirmasi atau *BATAL* untuk mengulang.",
  confirmationPrompt:
    "📌 *Konfirmasi Booking*\n\n✂️ Layanan: {{layanan}}\n📅 Tanggal: {{tanggal_label}}\n⏰ Jam: {{jam}}\n💰 Total: {{harga}}",
  successMessage:
    "✅ *Booking berhasil!*\n\n✂️ {{layanan}}\n📅 {{tanggal_label}}\n⏰ {{jam}}\n\n🙏 Mohon datang 10 menit sebelum jadwal.\nSampai ketemu di {{business_name}}! 💈",
  cancelMessage:
    "❌ Booking dibatalkan.\nKetik *halo* untuk mulai lagi kapan saja.",
  invalidOptionMessage:
    "Pilihan belum sesuai. Balas dengan nomor yang tersedia ya 🙌",
  reminder:
    "⏰ *Reminder Booking*\n\nHalo 👋\nJangan lupa booking kamu hari ini:\n\n{{layanan}}\n{{tanggal}}\n{{jam}}\n\nDatang 10 menit lebih awal ya 🙌",
};

export const DEFAULT_CHATBOT_REPLY_STYLE: ChatbotReplyStyle = {
  assistantLabel: "BookLink Assistant",
  tone: "warm",
  brevity: "balanced",
  emojiLevel: "low",
  closingLine: "Kalau mau, kamu bisa jawab santai seperti lagi chat biasa ya.",
  useNaturalLanguage: true,
};

export type ChatbotTemplateOverrides = Partial<ChatbotTemplates>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeChatbotReplyStyle(
  value: Partial<ChatbotReplyStyle> | null | undefined
): ChatbotReplyStyle {
  return {
    assistantLabel:
      typeof value?.assistantLabel === "string" && value.assistantLabel.trim()
        ? value.assistantLabel.trim()
        : DEFAULT_CHATBOT_REPLY_STYLE.assistantLabel,
    tone:
      value?.tone === "friendly" || value?.tone === "warm" || value?.tone === "professional"
        ? value.tone
        : DEFAULT_CHATBOT_REPLY_STYLE.tone,
    brevity:
      value?.brevity === "compact" || value?.brevity === "balanced"
        ? value.brevity
        : DEFAULT_CHATBOT_REPLY_STYLE.brevity,
    emojiLevel:
      value?.emojiLevel === "none" || value?.emojiLevel === "low" || value?.emojiLevel === "medium"
        ? value.emojiLevel
        : DEFAULT_CHATBOT_REPLY_STYLE.emojiLevel,
    closingLine:
      typeof value?.closingLine === "string" && value.closingLine.trim()
        ? value.closingLine.trim()
        : DEFAULT_CHATBOT_REPLY_STYLE.closingLine,
    useNaturalLanguage:
      typeof value?.useNaturalLanguage === "boolean"
        ? value.useNaturalLanguage
        : DEFAULT_CHATBOT_REPLY_STYLE.useNaturalLanguage,
  };
}

export function normalizeChatbotChannelOverrides(
  value: unknown
): {
  replyStyle: ChatbotReplyStyle;
  fallbackTemplates: ChatbotTemplateOverrides;
} {
  if (!isRecord(value)) {
    return {
      replyStyle: DEFAULT_CHATBOT_REPLY_STYLE,
      fallbackTemplates: {},
    };
  }

  const fallbackTemplates: ChatbotTemplateOverrides = {};

  for (const key of Object.keys(DEFAULT_CHATBOT_TEMPLATES) as Array<keyof ChatbotTemplates>) {
    const candidate =
      isRecord(value.fallback_templates) && typeof value.fallback_templates[key] === "string"
        ? value.fallback_templates[key]
        : typeof value[key] === "string"
          ? value[key]
          : null;

    if (candidate && candidate.trim()) {
      fallbackTemplates[key] = candidate.trim();
    }
  }

  const replyStyle = normalizeChatbotReplyStyle(
    isRecord(value.reply_style)
      ? {
          assistantLabel:
            typeof value.reply_style.assistantLabel === "string"
              ? value.reply_style.assistantLabel
              : undefined,
          tone:
            value.reply_style.tone === "friendly" ||
            value.reply_style.tone === "warm" ||
            value.reply_style.tone === "professional"
              ? value.reply_style.tone
              : undefined,
          brevity:
            value.reply_style.brevity === "compact" || value.reply_style.brevity === "balanced"
              ? value.reply_style.brevity
              : undefined,
          emojiLevel:
            value.reply_style.emojiLevel === "none" ||
            value.reply_style.emojiLevel === "low" ||
            value.reply_style.emojiLevel === "medium"
              ? value.reply_style.emojiLevel
              : undefined,
          closingLine:
            typeof value.reply_style.closingLine === "string"
              ? value.reply_style.closingLine
              : undefined,
          useNaturalLanguage:
            typeof value.reply_style.useNaturalLanguage === "boolean"
              ? value.reply_style.useNaturalLanguage
              : undefined,
        }
      : null
  );

  return {
    replyStyle,
    fallbackTemplates,
  };
}

export async function getGlobalChatbotTemplates() {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value_json")
    .eq("key", CHATBOT_TEMPLATE_KEY)
    .maybeSingle();

  if (error && error.code !== "PGRST116" && error.code !== "42P01") {
    throw new Error(error.message);
  }

  const stored =
    data && typeof data.value_json === "object" && data.value_json !== null
      ? (data.value_json as Partial<ChatbotTemplates>)
      : {};

  return {
    ...DEFAULT_CHATBOT_TEMPLATES,
    ...stored,
  };
}

export async function getChatbotTemplates() {
  return getGlobalChatbotTemplates();
}

export function mergeChatbotTemplates(
  ...templateSets: Array<ChatbotTemplateOverrides | null | undefined>
) {
  return templateSets.reduce<ChatbotTemplates>(
    (merged, item) => ({
      ...merged,
      ...(item ?? {}),
    }),
    { ...DEFAULT_CHATBOT_TEMPLATES }
  );
}

export function renderTemplate(
  template: string,
  values: Record<string, string | number | null | undefined>
) {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    const value = values[key];
    return value === null || value === undefined ? "" : String(value);
  });
}

export function getUpcomingDateOptions(baseDate = new Date(), count = 7) {
  const options: Array<{ key: string; label: string; index: number }> = [];

  for (let offset = 0; offset < count; offset += 1) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + offset);

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const label = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    options.push({
      key,
      label,
      index: offset + 1,
    });
  }

  return options;
}

export function getDateOptionsText(baseDate = new Date()) {
  return getUpcomingDateOptions(baseDate)
    .map((item) => `${item.index}. ${item.label}`)
    .join("\n");
}

export function getServiceOptionsText(services: readonly BookingService[] = BOOKING_SERVICES) {
  return services
    .map(
      (service, index) =>
        `${index + 1}. *${service.name}*\n   ${service.description}\n   ${formatRupiah(service.price)}`
    )
    .join("\n\n");
}

export function getServiceBySelection(
  message: string,
  services: readonly BookingService[] = BOOKING_SERVICES
) {
  const cleaned = message.trim().toLowerCase();
  const selectedIndex = Number(cleaned);

  if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= services.length) {
    return services[selectedIndex - 1] ?? null;
  }

  return (
    services.find(
      (service) =>
        service.code.toLowerCase() === cleaned ||
        service.name.toLowerCase() === cleaned
    ) ?? null
  );
}

export function getDateBySelection(message: string, baseDate = new Date()) {
  const cleaned = message.trim();
  const selectedIndex = Number(cleaned);

  if (Number.isInteger(selectedIndex)) {
    return getUpcomingDateOptions(baseDate).find((item) => item.index === selectedIndex) ?? null;
  }

  return getUpcomingDateOptions(baseDate).find((item) => item.key === cleaned) ?? null;
}

export function getSlotOptionsText(slots: readonly string[]) {
  return slots.map((slot, index) => `${index + 1}. ${slot}`).join("\n");
}

export function getSlotBySelection(message: string, slots: readonly string[]) {
  const cleaned = message.trim();
  const selectedIndex = Number(cleaned);

  if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= slots.length) {
    return slots[selectedIndex - 1] ?? null;
  }

  return ALL_BOOKING_SLOTS.includes(cleaned as (typeof ALL_BOOKING_SLOTS)[number])
    ? cleaned
    : null;
}

export function formatBookingDateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatRupiah(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
