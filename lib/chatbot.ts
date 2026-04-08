import { createAdminSupabase } from "@/lib/supabase";
import { ALL_BOOKING_SLOTS, BOOKING_SERVICES } from "@/lib/bookings";

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
};

export const DEFAULT_CHATBOT_TEMPLATES: ChatbotTemplates = {
  greeting:
    "Halo 👋 Selamat datang di *Barokah Barbershop* 💈\n\nKami siap bantu booking kamu dengan cepat dan rapi.\n\n{{service_list}}\nBalas dengan nomor layanan ya 👇",
  servicePrompt:
    "Mantap 👍 kamu pilih *{{layanan}}*.\n\nSekarang pilih tanggal booking ya 📅\n\n{{date_options}}\nBalas dengan nomor tanggal yang kamu mau.",
  datePrompt:
    "📅 Tanggal dipilih: *{{tanggal_label}}*\n\n⏰ *Jam tersedia:*\n{{slot_options}}\nBalas dengan nomor jam yang kamu mau ya 👇",
  slotPrompt:
    "Sip, jam *{{jam}}* masih tersedia.\n\n{{confirmation_summary}}\nBalas *YA* untuk konfirmasi atau *BATAL* untuk mengulang.",
  confirmationPrompt:
    "📌 *Konfirmasi Booking*\n\n✂️ Layanan: {{layanan}}\n📅 Tanggal: {{tanggal_label}}\n⏰ Jam: {{jam}}\n💰 Total: {{harga}}",
  successMessage:
    "✅ *Booking berhasil!*\n\n✂️ {{layanan}}\n📅 {{tanggal_label}}\n⏰ {{jam}}\n\n🙏 Mohon datang 10 menit sebelum jadwal.\nSampai ketemu di barbershop! 💈",
  cancelMessage:
    "❌ Booking dibatalkan.\nKetik *halo* untuk mulai lagi kapan saja.",
  invalidOptionMessage:
    "Pilihan belum sesuai. Balas dengan nomor yang tersedia ya 🙌",
};

export async function getChatbotTemplates() {
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

export function getServiceOptionsText() {
  return BOOKING_SERVICES.map(
    (service, index) =>
      `${index + 1}. *${service.name}*\n   ${service.description}\n   ${formatRupiah(service.price)}`
  ).join("\n\n");
}

export function getServiceBySelection(message: string) {
  const cleaned = message.trim().toLowerCase();
  const selectedIndex = Number(cleaned);

  if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= BOOKING_SERVICES.length) {
    return BOOKING_SERVICES[selectedIndex - 1] ?? null;
  }

  return (
    BOOKING_SERVICES.find(
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
