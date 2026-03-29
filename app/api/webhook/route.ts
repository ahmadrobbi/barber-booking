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

  if (!sender) return Response.json({ status: "no sender" });

  const { data: state } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .maybeSingle();

  let reply = "";

  // ======================
  // START
  // ======================
  if (message === "halo") {
    await supabase.from("user_sessions").upsert(
      {
        sender,
        step: "pilih_layanan",
      },
      { onConflict: "sender" }
    );

    reply =
      "Halo 👋\n\n" +
      "Pilih layanan:\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  else if (!state) {
    return Response.json({ status: "ignored" });
  }

  // ======================
  // PILIH LAYANAN
  // ======================
  else if (state.step === "pilih_layanan") {
    let layanan = "";
    let harga = 0;

    if (message === "1") {
      layanan = "Dewasa";
      harga = 25000;
    } else if (message === "2") {
      layanan = "Anak-anak";
      harga = 20000;
    } else {
      reply = "Ketik 1 atau 2";
    }

    if (layanan) {
      await supabase.from("user_sessions").update({
        step: "pilih_tanggal",
        layanan,
        harga,
      }).eq("sender", sender);

      reply = "Masukkan tanggal booking (format: 2026-03-30)";
    }
  }

  // ======================
  // PILIH TANGGAL
  // ======================
  else if (state.step === "pilih_tanggal") {
    await supabase.from("user_sessions").update({
      step: "pilih_jam",
      tanggal: message,
    }).eq("sender", sender);

    reply = "Masukkan jam (contoh: 14:00)";
  }

  // ======================
  // PILIH JAM + VALIDASI
  // ======================
  else if (state.step === "pilih_jam") {

    // 🔥 cek bentrok
    const { data: bentrok } = await supabase
      .from("bookings")
      .select("*")
      .eq("tanggal", state.tanggal)
      .eq("jam", message);

    if (bentrok && bentrok.length > 0) {
      reply =
        "❌ Jam sudah terisi.\n" +
        "Silakan pilih jam lain 🙏";
    } else {
      await supabase.from("user_sessions").update({
        step: "konfirmasi",
        jam: message,
      }).eq("sender", sender);

      reply =
        `Konfirmasi booking:\n\n` +
        `✂️ ${state.layanan}\n` +
        `📅 ${state.tanggal}\n` +
        `⏰ ${message}\n` +
        `💰 Rp${state.harga}\n\n` +
        `Ketik YA untuk konfirmasi`;
    }
  }

  // ======================
  // KONFIRMASI
  // ======================
  else if (state.step === "konfirmasi") {
    if (message === "ya") {

      // 🔥 double check bentrok (important!)
      const { data: bentrok } = await supabase
        .from("bookings")
        .select("*")
        .eq("tanggal", state.tanggal)
        .eq("jam", state.jam);

      if (bentrok && bentrok.length > 0) {
        reply = "❌ Maaf, slot sudah diambil orang lain.";
      } else {

        await supabase.from("bookings").insert({
          sender,
          layanan: state.layanan,
          harga: state.harga,
          tanggal: state.tanggal,
          jam: state.jam,
          status: "confirmed",
        });

        await supabase.from("user_sessions")
          .delete()
          .eq("sender", sender);

        reply =
          "✅ Booking berhasil!\n\n" +
          `📅 ${state.tanggal}\n` +
          `⏰ ${state.jam}\n\n` +
          "Datang 10 menit lebih awal 🙌";
      }
    }
  }

  if (!reply) return Response.json({ status: "ignored" });

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