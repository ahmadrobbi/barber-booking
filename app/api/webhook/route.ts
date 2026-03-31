
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 🔥 NORMALIZE NOMOR
function normalizePhone(phone: string) {
  return phone.replace(/\D/g, ""); // ambil angka saja
}

// 🔥 cek bentrok
async function isSlotTaken(tanggal: string, jam: string) {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("tanggal", tanggal)
    .eq("jam", jam);

  return data && data.length > 0;
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

  sender = normalizePhone(sender);
  message = message.toLowerCase().trim();

  console.log("SENDER:", sender);
  console.log("MESSAGE:", message);

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  // ambil session
  const { data: state } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .maybeSingle();

  console.log("STATE:", state);

  let reply = "";

  // ======================
  // START (HANYA JIKA HALO)
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
      "Halo 👋\n" +
      "Selamat datang di Barbershop 💈\n\n" +
      "Pilih layanan:\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  // ======================
  // ❗ JANGAN RESET OTOMATIS
  // ======================
  else if (!state) {
    reply = "Ketik *halo* untuk mulai booking ✂️";
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

      reply = "Masukkan tanggal booking\nFormat: 2026-04-01";
    } else {
      reply = "Ketik *1* atau *2* ya ✂️";
    }
  }

  // ======================
  // PILIH TANGGAL
  // ======================
  else if (state.step === "pilih_tanggal") {

    if (!message.match(/^\d{4}-\d{2}-\d{2}$/)) {
      reply = "Format tanggal salah.\nContoh: 2026-04-01";
    } else {

      await supabase.from("user_sessions")
        .update({
          step: "pilih_jam",
          tanggal: message,
        })
        .eq("sender", sender);

      reply = "Masukkan jam (contoh: 14:00)";
    }
  }

  // ======================
  // PILIH JAM
  // ======================
  else if (state.step === "pilih_jam") {

    if (!message.match(/^\d{2}:\d{2}$/)) {
      reply = "Format jam salah.\nContoh: 14:00";
    } else {

      const bentrok = await isSlotTaken(state.tanggal, message);

      if (bentrok) {
        reply = "❌ Jam sudah penuh, pilih jam lain";
      } else {

        await supabase.from("user_sessions")
          .update({
            step: "konfirmasi",
            jam: message,
          })
          .eq("sender", sender);

        reply =
          `Konfirmasi booking:\n\n` +
          `✂️ ${state.layanan}\n` +
          `📅 ${state.tanggal}\n` +
          `⏰ ${message}\n` +
          `💰 Rp${state.harga}\n\n` +
          `Ketik *YA* untuk konfirmasi\n` +
          `Ketik *BATAL* untuk ulang`;
      }
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
        `⏰ ${state.jam}`;
    }

    else if (message === "batal") {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("sender", sender);

      reply = "❌ Booking dibatalkan.\nKetik *halo* untuk ulang";
    }

    else {
      reply = "Ketik *YA* atau *BATAL* ya";
    }
  }

  // ======================
  // KIRIM WA
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

