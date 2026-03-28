import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  let message = "";
  let sender = "";

  try {
    const body = await req.json();
    message = body.message?.text || body.message || body.text || "";
    sender = body.sender || body.from || "";
  } catch {
    const text = await req.text();
    const params = new URLSearchParams(text);
    message = params.get("message") || params.get("text") || "";
    sender = params.get("sender") || params.get("from") || "";
  }

  message = message.toLowerCase().trim();

  console.log("MESSAGE:", message);
  console.log("SENDER:", sender);

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  // 🔥 ambil session
  const { data: state } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .maybeSingle();

  console.log("STATE:", state);

  let reply = "";

  // ======================
  // START
  // ======================
  if (message === "halo") {
    await supabase.from("user_sessions").upsert(
      {
        sender,
        step: "pilih_layanan",
        layanan: null,
        harga: null,
        jam: null,
      },
      { onConflict: "sender" }
    );

    reply =
      "Halo 👋\n" +
      "Selamat datang di Barbershop 💈\n\n" +
      "Pilih layanan:\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  // ======================
  // PILIH LAYANAN
  // ======================
  else if (state?.step === "pilih_layanan") {
    if (message === "1" || message.includes("dewasa")) {
      await supabase.from("user_sessions").update({
        step: "pilih_jam",
        layanan: "Dewasa",
        harga: 25000,
      }).eq("sender", sender);

      reply = "Kamu pilih *Dewasa* ✂️\n\nMasukkan jam (contoh: 14:00)";
    }

    else if (message === "2" || message.includes("anak")) {
      await supabase.from("user_sessions").update({
        step: "pilih_jam",
        layanan: "Anak-anak",
        harga: 20000,
      }).eq("sender", sender);

      reply = "Kamu pilih *Anak-anak* ✂️\n\nMasukkan jam (contoh: 14:00)";
    }
  }

  // ======================
  // PILIH JAM
  // ======================
  else if (state?.step === "pilih_jam") {
    if (message.includes(":")) {
      await supabase.from("user_sessions").update({
        step: "konfirmasi",
        jam: message,
      }).eq("sender", sender);

      reply =
        `Konfirmasi booking:\n\n` +
        `✂️ Layanan: ${state.layanan}\n` +
        `💰 Harga: Rp${state.harga}\n` +
        `⏰ Jam: ${message}\n\n` +
        `Ketik *YA* untuk konfirmasi\n` +
        `Ketik *BATAL* untuk ulang`;
    }
  }

  // ======================
  // KONFIRMASI
  // ======================
  else if (state?.step === "konfirmasi") {
    if (message === "ya") {
      await supabase.from("bookings").insert([
        {
          sender,
          layanan: state.layanan,
          harga: state.harga,
          jam: state.jam,
          status: "confirmed",
        },
      ]);

      await supabase
        .from("user_sessions")
        .delete()
        .eq("sender", sender);

      reply =
        "✅ Booking berhasil!\n\n" +
        "Silakan datang 10 menit sebelum jadwal 🙌";
    }

    else if (message === "batal") {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("sender", sender);

      reply =
        "❌ Booking dibatalkan.\n\n" +
        "Ketik *halo* untuk mulai lagi.";
    }
  }

  // ======================
  // DEFAULT
  // ======================
  if (!reply) {
    console.log("⛔ NO REPLY");
    return Response.json({ status: "ignored" });
  }

  // ======================
  // KIRIM WA
  // ======================
  const res = await fetch("https://api.fonnte.com/send", {
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

  const result = await res.text();
  console.log("FONNTE RESPONSE:", result);

  return Response.json({ status: "ok" });
}