import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 🧠 memory sementara (simple)
const userState: Record<string, any> = {};

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  let message = "";
  let sender = "";

  try {
    const body = await req.json();

    message =
      body.message?.text ||
      body.message ||
      body.text ||
      "";

    sender = body.sender || body.from || "";
  } catch {
    const text = await req.text();
    const params = new URLSearchParams(text);

    message =
      params.get("message") ||
      params.get("text") ||
      "";

    sender =
      params.get("sender") ||
      params.get("from") ||
      "";
  }

  message = message.toLowerCase().trim();

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  // ambil state user
  if (!userState[sender]) {
    userState[sender] = {};
  }

  let state = userState[sender];
  let reply = "";

  // ======================
  // FLOW
  // ======================

  if (message === "halo") {
    state.step = "pilih_layanan";

    reply =
      "Halo 👋\n" +
      "Selamat datang di Barbershop 💈\n\n" +
      "Pilih layanan:\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  else if (state.step === "pilih_layanan") {
    if (message === "1") {
      state.layanan = "Dewasa";
      state.harga = 25000;
      state.step = "pilih_jam";

      reply = "Pilih jam (contoh: 14:00)";
    }

    else if (message === "2") {
      state.layanan = "Anak-anak";
      state.harga = 20000;
      state.step = "pilih_jam";

      reply = "Pilih jam (contoh: 14:00)";
    }
  }

  else if (state.step === "pilih_jam") {
    if (message.includes(":")) {
      state.jam = message;
      state.step = "konfirmasi";

      reply =
        `Konfirmasi booking:\n\n` +
        `✂️ Layanan: ${state.layanan}\n` +
        `💰 Harga: Rp${state.harga}\n` +
        `⏰ Jam: ${state.jam}\n\n` +
        `Ketik *YA* untuk konfirmasi\n` +
        `Ketik *BATAL* untuk ulang`;
    }
  }

  else if (state.step === "konfirmasi") {
    if (message === "ya") {
      // 💾 simpan ke database
      await supabase.from("bookings").insert([
        {
          sender,
          layanan: state.layanan,
          harga: state.harga,
          jam: state.jam,
          status: "confirmed",
        },
      ]);

      reply =
        "✅ Booking berhasil!\n\n" +
        "Silakan datang 10 menit sebelum jadwal 🙌";

      // reset state
      delete userState[sender];
    }

    else if (message === "batal") {
      delete userState[sender];

      reply = "Booking dibatalkan.\nKetik *halo* untuk mulai lagi.";
    }
  }

  // kalau tidak ada reply → diam
  if (!reply) {
    return Response.json({ status: "ignored" });
  }

  // kirim WA
  await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: process.env.FONNTE_TOKEN!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: sender,
      message: reply,
    }),
  });

  return Response.json({ status: "ok" });
}