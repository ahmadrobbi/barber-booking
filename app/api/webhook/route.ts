import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

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
    message = params.get("message") || "";
    sender = params.get("sender") || "";
  }

  message = message.toLowerCase().trim();

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  // ambil state
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
        tanggal: null,
        jam: null,
      },
      { onConflict: "sender" }
    );

    reply =
      "Halo 👋\n\n" +
      "Pilih layanan:\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  // ======================
  // kalau belum mulai → DIAM
  // ======================
  else if (!state) {
    return Response.json({ status: "ignored" });
  }

  // ======================
  // PILIH LAYANAN
  // ======================
  else if (state.step === "pilih_layanan") {
    if (message === "1" || message === "2") {
      const layanan = message === "1" ? "Dewasa" : "Anak-anak";
      const harga = message === "1" ? 25000 : 20000;

      await supabase.from("user_sessions")
        .update({
          step: "pilih_tanggal",
          layanan,
          harga,
        })
        .eq("sender", sender);

      reply = "Masukkan tanggal booking (contoh: 2026-04-02)";
    } else {
      reply = "Ketik *1* atau *2* ya";
    }
  }

  // ======================
  // PILIH TANGGAL
  // ======================
  else if (state.step === "pilih_tanggal") {

    await supabase.from("user_sessions")
      .update({
        step: "pilih_jam",
        tanggal: message,
      })
      .eq("sender", sender);

    reply = "Masukkan jam (contoh: 14:00)";
  }

  // ======================
  // PILIH JAM
  // ======================
  else if (state.step === "pilih_jam") {

    if (!message.includes(":")) {
      reply = "Format jam salah. Contoh: 14:00";
    } else {

      await supabase.from("user_sessions")
        .update({
          step: "konfirmasi",
          jam: message,
        })
        .eq("sender", sender);

      // 🔥 ambil state terbaru (WAJIB)
      const { data: newState } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("sender", sender)
        .single();

      reply =
        `Konfirmasi booking:\n\n` +
        `✂️ ${newState.layanan}\n` +
        `📅 ${newState.tanggal}\n` +
        `⏰ ${newState.jam}\n` +
        `💰 Rp${newState.harga}\n\n` +
        `Ketik *YA* untuk konfirmasi\n` +
        `Ketik *BATAL* untuk ulang`;
    }
  }

  // ======================
  // KONFIRMASI
  // ======================
  else if (state.step === "konfirmasi") {

    if (message === "ya") {

      await supabase.from("bookings").insert([
        {
          sender,
          layanan: state.layanan,
          harga: state.harga,
          tanggal: state.tanggal,
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
        `📅 ${state.tanggal}\n` +
        `⏰ ${state.jam}\n\n` +
        "Silakan datang 10 menit sebelum jadwal 🙌";
    }

    else if (message === "batal") {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("sender", sender);

      reply = "❌ Booking dibatalkan.\n\nKetik *halo* untuk mulai lagi.";
    }

    else {
      reply = "Ketik *YA* atau *BATAL* ya";
    }
  }

  // ======================
  // fallback
  // ======================
  if (!reply) {
    console.log("NO REPLY");
    return Response.json({ status: "ignored" });
  }

  // ======================
  // kirim WA
  // ======================
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