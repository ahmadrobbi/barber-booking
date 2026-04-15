import { createClient } from "@supabase/supabase-js";
import {
  formatBookingDateLabel,
  formatRupiah,
  getChatbotTemplates,
  getDateBySelection,
  getDateOptionsText,
  getServiceBySelection,
  getServiceOptionsText,
  getSlotBySelection,
  getSlotOptionsText,
  renderTemplate,
} from "@/lib/chatbot";
import { getIndustryConfig } from "@/lib/industry-config";
import { INDUSTRIES, type IndustryKey } from "@/lib/industries";
import { getServicesForIndustry, getSlotsForIndustry } from "@/lib/bookings";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_KEY ?? ""
  );
}

const ALL_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

type SessionState = {
  sender: string;
  step: string | null;
  layanan: string | null;
  harga: number | null;
  tanggal: string | null;
  jam: string | null;
  industry: IndustryKey;
};

async function isSlotTaken(tanggal: string, jam: string) {
  const { data } = await getSupabase()
    .from("bookings")
    .select("id")
    .eq("tanggal", tanggal)
    .eq("jam", jam);

  return Boolean(data && data.length > 0);
}

async function getAvailableSlots(tanggal: string, industry: IndustryKey = "barbershop") {
  const { data } = await getSupabase()
    .from("bookings")
    .select("jam")
    .eq("tanggal", tanggal);

  const booked = data?.map((item) => item.jam) || [];
  const allSlots = getSlotsForIndustry(industry);
  return allSlots.filter((jam) => !booked.includes(jam));
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

async function loadState(sender: string) {
  const { data } = await getSupabase()
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .maybeSingle();

  return (data ?? null) as SessionState | null;
}

async function saveState(payload: Partial<SessionState> & { sender: string }) {
  await getSupabase().from("user_sessions").upsert(payload, { onConflict: "sender" });
}

async function clearState(sender: string) {
  await getSupabase().from("user_sessions").delete().eq("sender", sender);
}

async function sendWhatsappMessage(target: string, message: string) {
  await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: process.env.FONNTE_TOKEN!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target,
      message,
    }),
  });
}

export async function POST(req: Request) {
  let incomingMessage = "";
  let sender = "";

  try {
    const body = await req.json();
    incomingMessage = body.message?.text || body.message || body.text || "";
    sender = body.sender || body.from || "";
  } catch {
    const text = await req.text();
    const params = new URLSearchParams(text);
    incomingMessage = params.get("message") || params.get("text") || "";
    sender = params.get("sender") || params.get("from") || "";
  }

  const message = incomingMessage.toLowerCase().trim();

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  const state = await loadState(sender);
  
  // Get industry config and determine default industry
  const config = await getIndustryConfig();
  const industry: IndustryKey = state?.industry || config.default;
  
  const templates = INDUSTRIES[industry].templates;
  const today = getTodayInJakarta();
  let reply = "";

  if (message === "halo" || message === "menu" || message === "booking") {
    await saveState({
      sender,
      step: "pilih_layanan",
      layanan: null,
      harga: null,
      tanggal: null,
      jam: null,
      industry,
    });

    reply = renderTemplate(templates.greeting, {
      service_list: getServiceOptionsText(getServicesForIndustry(industry)),
    });
  } else if (!state) {
    reply = "Ketik *halo* untuk mulai booking ✂️";
  } else if (state.step === "pilih_layanan") {
    const industryServices = getServicesForIndustry(industry);
    const service = getServiceBySelection(message, industryServices);

    if (!service) {
      reply = `${templates.invalidOptionMessage}\n\n${getServiceOptionsText(industryServices)}`;
    } else {
      await saveState({
        sender,
        step: "pilih_tanggal",
        layanan: service.name,
        harga: service.price,
        industry,
      });

      reply = renderTemplate(templates.servicePrompt, {
        layanan: service.name,
        date_options: getDateOptionsText(today),
      });
    }
  } else if (state.step === "pilih_tanggal") {
    const selectedDate = getDateBySelection(message, today);

    if (!selectedDate) {
      reply = `${templates.invalidOptionMessage}\n\n${getDateOptionsText(today)}`;
    } else {
      const slots = await getAvailableSlots(selectedDate.key, industry);

      if (slots.length === 0) {
        reply =
          `Maaf, semua jam pada *${selectedDate.label}* sudah penuh.\n\n` +
          `${getDateOptionsText(today)}\n\n` +
          "Balas dengan nomor tanggal lain ya 🙌";
      } else {
        await saveState({
          sender,
          step: "pilih_jam",
          tanggal: selectedDate.key,
          industry,
        });

        reply = renderTemplate(templates.datePrompt, {
          tanggal_label: selectedDate.label,
          slot_options: getSlotOptionsText(slots),
        });
      }
    }
  } else if (state.step === "pilih_jam") {
    if (!state.tanggal) {
      await clearState(sender);
      reply = "Sesi booking kamu sudah kedaluwarsa. Ketik *halo* untuk mulai lagi.";
    } else {
      const slots = await getAvailableSlots(state.tanggal, industry);
      const selectedSlot = getSlotBySelection(message, slots);

      if (!selectedSlot) {
        reply = `${templates.invalidOptionMessage}\n\n${getSlotOptionsText(slots)}`;
      } else if (await isSlotTaken(state.tanggal, selectedSlot)) {
        reply =
          "Jam tersebut baru saja terisi. Pilih jam lain ya 🙏\n\n" +
          getSlotOptionsText(await getAvailableSlots(state.tanggal, industry));
      } else {
        const confirmationSummary = renderTemplate(templates.confirmationPrompt, {
          layanan: state.layanan,
          tanggal_label: formatBookingDateLabel(state.tanggal),
          jam: selectedSlot,
          harga: formatRupiah(state.harga),
        });

        await saveState({
          sender,
          step: "konfirmasi",
          jam: selectedSlot,
          industry,
        });

        reply = renderTemplate(templates.slotPrompt, {
          jam: selectedSlot,
          confirmation_summary: confirmationSummary,
        });
      }
    }
  } else if (state.step === "konfirmasi") {
    if (message === "ya") {
      if (!state.tanggal || !state.jam) {
        await clearState(sender);
        reply = "Sesi booking kamu sudah kedaluwarsa. Ketik *halo* untuk mulai lagi.";
      } else if (await isSlotTaken(state.tanggal, state.jam)) {
        reply = "❌ Slot sudah diambil pelanggan lain. Ketik *halo* untuk mulai pilih ulang ya.";
      } else {
        await getSupabase().from("bookings").insert([
          {
            sender,
            layanan: state.layanan,
            harga: state.harga,
            tanggal: state.tanggal,
            jam: state.jam,
            status: "confirmed",
            industry,
          },
        ]);

        await clearState(sender);

        reply = renderTemplate(templates.successMessage, {
          layanan: state.layanan,
          tanggal_label: formatBookingDateLabel(state.tanggal),
          jam: state.jam,
        });
      }
    } else if (message === "batal") {
      await clearState(sender);
      reply = templates.cancelMessage;
    } else {
      reply = `${templates.invalidOptionMessage}\n\nBalas *YA* untuk konfirmasi atau *BATAL* untuk mengulang.`;
    }
  }

  if (!reply) {
    reply = "Ketik *halo* untuk mulai booking ✂️";
  }

  await sendWhatsappMessage(sender, reply);
  return Response.json({ status: "ok" });
}
