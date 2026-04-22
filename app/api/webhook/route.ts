import {
  formatBookingDateLabel,
  formatRupiah,
  getDateBySelection,
  getDateOptionsText,
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
import {
  resolveWhatsappRuntimeContext,
  sendWhatsappMessage,
  type WhatsappRuntimeContext,
} from "@/lib/whatsapp-channels";

type SessionState = {
  sender: string;
  channel_id: string | null;
  user_id: string | null;
  step: string | null;
  layanan: string | null;
  harga: number | null;
  tanggal: string | null;
  jam: string | null;
  industry: IndustryKey;
};

type BookingScope = {
  userId: string | null;
  channelId: string | null;
};

type ParsedWebhookPayload = {
  incomingMessage: string;
  sender: string;
  device: string | null;
  webhookSecret: string | null;
};

function getSupabase() {
  return createAdminSupabase();
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
  });
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
    .eq("sender", sender);

  query = channelId ? query.eq("channel_id", channelId) : query.is("channel_id", null);

  const { data } = await query.maybeSingle();
  return (data ?? null) as SessionState | null;
}

async function saveState(payload: Partial<SessionState> & { sender: string; channel_id: string | null }) {
  const normalizedPayload = {
    ...payload,
    user_id: payload.user_id ?? null,
  };

  if (!payload.channel_id) {
    const existing = await getSupabase()
      .from("user_sessions")
      .select("sender")
      .eq("sender", payload.sender)
      .is("channel_id", null)
      .maybeSingle();

    if (existing.data) {
      await getSupabase()
        .from("user_sessions")
        .update(normalizedPayload)
        .eq("sender", payload.sender)
        .is("channel_id", null);
      return;
    }

    await getSupabase().from("user_sessions").insert(normalizedPayload);
    return;
  }

  await getSupabase()
    .from("user_sessions")
    .upsert(normalizedPayload, { onConflict: "sender,channel_id" });
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
    return {
      incomingMessage: body.message?.text || body.message || body.text || "",
      sender: body.sender || body.from || "",
      device: body.device || body.number || body.device_number || null,
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
      incomingMessage: params.get("message") || params.get("text") || "",
      sender: params.get("sender") || params.get("from") || "",
      device: params.get("device") || params.get("number") || params.get("device_number"),
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
  };
}

export async function POST(req: Request) {
  const { incomingMessage, sender, device, webhookSecret } = await parseWebhookPayload(req);
  const context = await resolveWhatsappRuntimeContext(device);

  if (!device) {
    return Response.json({ status: "missing device" }, { status: 400 });
  }

  if (!context.channel) {
    return Response.json({ status: "unknown device" }, { status: 404 });
  }

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  if (!isValidWebhookSecret(context, webhookSecret)) {
    return Response.json({ status: "invalid secret" }, { status: 403 });
  }

  if (!context.token) {
    return Response.json({ status: "missing token" }, { status: 500 });
  }

  const message = incomingMessage.toLowerCase().trim();
  const state = await loadState(sender, context.channelId);
  const industry: IndustryKey = state?.industry || context.industry;
  const templates = context.templates;
  const tenantServices = await getServicesForUser(context.userId, industry);
  const today = getTodayInJakarta();
  const industryPrompt = getIndustryOptionsText();
  const scope = getRuntimeScope(context);
  const getServiceDuration = (serviceName: string | null | undefined) =>
    tenantServices.find((service) => service.name === serviceName)?.duration_minutes ?? 60;
  let reply = "";

  if (message === "halo" || message === "menu" || message === "booking") {
    await saveState({
      sender,
      channel_id: context.channelId,
      user_id: context.userId,
      step: "pilih_layanan",
      layanan: null,
      harga: null,
      tanggal: null,
      jam: null,
      industry,
    });

    reply = renderTemplate(templates.greeting, {
      business_name: context.businessName,
      service_list: getServiceOptionsText(tenantServices),
    });
  } else if (
    ["industri", "pilih industri", "ganti industri", "ubah industri"].includes(message)
  ) {
    await saveState({
      sender,
      channel_id: context.channelId,
      user_id: context.userId,
      step: "pilih_industri",
      industry,
    });

    reply = `Pilih industri:\n${industryPrompt}\n\nBalas dengan nomor atau nama industri.`;
  } else if (state?.step === "pilih_industri") {
    const selectedIndustry = getIndustryBySelection(message);

    if (!selectedIndustry) {
      reply = `${templates.invalidOptionMessage}\n\nPilih industri:\n${industryPrompt}`;
    } else {
      const selectedTemplates = context.templates;

      await saveState({
        sender,
        channel_id: context.channelId,
        user_id: context.userId,
        step: "pilih_layanan",
        industry: selectedIndustry,
        layanan: null,
        harga: null,
        tanggal: null,
        jam: null,
      });

      reply = renderTemplate(selectedTemplates.greeting, {
        business_name: context.businessName,
        service_list: getServiceOptionsText(
          await getServicesForUser(context.userId, selectedIndustry)
        ),
      });
    }
  } else if (!state) {
    reply = "Ketik *halo* untuk mulai booking ✂️";
  } else if (state.step === "pilih_layanan") {
    const industryServices = tenantServices;
    const service = getServiceBySelection(message, industryServices);

    if (!service) {
      reply = `${templates.invalidOptionMessage}\n\n${getServiceOptionsText(industryServices)}`;
    } else {
      await saveState({
        sender,
        channel_id: context.channelId,
        user_id: context.userId,
        step: "pilih_tanggal",
        layanan: service.name,
        harga: service.price,
        industry,
      });

      reply = renderTemplate(templates.servicePrompt, {
        business_name: context.businessName,
        layanan: service.name,
        date_options: getDateOptionsText(today),
      });
    }
  } else if (state.step === "pilih_tanggal") {
    const selectedDate = getDateBySelection(message, today);

    if (!selectedDate) {
      reply = `${templates.invalidOptionMessage}\n\n${getDateOptionsText(today)}`;
    } else {
      const slots = await getAvailableSlots(
        selectedDate.key,
        industry,
        scope,
        getServiceDuration(state?.layanan)
      );

      if (slots.length === 0) {
        reply =
          `Maaf, semua jam pada *${selectedDate.label}* sudah penuh.\n\n` +
          `${getDateOptionsText(today)}\n\n` +
          "Balas dengan nomor tanggal lain ya 🙌";
      } else {
        await saveState({
          sender,
          channel_id: context.channelId,
          user_id: context.userId,
          step: "pilih_jam",
          tanggal: selectedDate.key,
          industry,
        });

        reply = renderTemplate(templates.datePrompt, {
          business_name: context.businessName,
          tanggal_label: selectedDate.label,
          slot_options: getSlotOptionsText(slots),
        });
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

      if (!selectedSlot) {
        reply = `${templates.invalidOptionMessage}\n\n${getSlotOptionsText(slots)}`;
      } else if (!(await isSlotAvailable({
        date: state.tanggal,
        time: selectedSlot,
        industry,
        durationMinutes,
        userId: scope.userId,
        channelId: scope.channelId,
      }))) {
        reply =
          "Jam tersebut baru saja terisi. Pilih jam lain ya 🙏\n\n" +
          getSlotOptionsText(
            await getAvailableSlots(state.tanggal, industry, scope, durationMinutes)
          );
      } else {
        const confirmationSummary = renderTemplate(templates.confirmationPrompt, {
          business_name: context.businessName,
          layanan: state.layanan,
          tanggal_label: formatBookingDateLabel(state.tanggal),
          jam: selectedSlot,
          harga: formatRupiah(state.harga),
        });

        await saveState({
          sender,
          channel_id: context.channelId,
          user_id: context.userId,
          step: "konfirmasi",
          jam: selectedSlot,
          industry,
        });

        reply = renderTemplate(templates.slotPrompt, {
          business_name: context.businessName,
          jam: selectedSlot,
          confirmation_summary: confirmationSummary,
        });
      }
    }
  } else if (state.step === "konfirmasi") {
    if (message === "ya") {
      if (!state.tanggal || !state.jam) {
        await clearState(sender, context.channelId);
        reply = "Sesi booking kamu sudah kedaluwarsa. Ketik *halo* untuk mulai lagi.";
      } else if (!(await isSlotAvailable({
        date: state.tanggal,
        time: state.jam,
        industry,
        durationMinutes: getServiceDuration(state.layanan),
        userId: scope.userId,
        channelId: scope.channelId,
      }))) {
        reply = "❌ Slot sudah diambil pelanggan lain. Ketik *halo* untuk mulai pilih ulang ya.";
      } else {
        const durationMinutes = getServiceDuration(state.layanan);
        const { error: bookingInsertError } = await getSupabase().from("bookings").insert([
          {
            sender,
            layanan: state.layanan,
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
          await sendWhatsappMessage({
            target: sender,
            message: reply,
            token: context.token,
          });

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
          layanan: state.layanan,
          tanggal_label: formatBookingDateLabel(state.tanggal),
          jam: state.jam,
        });
      }
    } else if (message === "batal") {
      await clearState(sender, context.channelId);
      reply = templates.cancelMessage;
    } else {
      reply = `${templates.invalidOptionMessage}\n\nBalas *YA* untuk konfirmasi atau *BATAL* untuk mengulang.`;
    }
  }

  if (!reply) {
    reply = "Ketik *halo* untuk mulai booking ✂️";
  }

  await sendWhatsappMessage({
    target: sender,
    message: reply,
    token: context.token,
  });

  return Response.json({
    status: "ok",
    channelId: context.channelId,
    userId: context.userId,
    legacy: false,
  });
}
