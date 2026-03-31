
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 🔥 cek bentrok
async function isSlotTaken(tanggal: string, jam: string) {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("tanggal", tanggal)
    .eq("jam", jam);

  return data && data.length > 0;
}

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
  // START / RESET
  // ======================
  if (message === "halo" || !state) {
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

    // validasi sederhana format YYYY-MM-DD
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
  // PILIH JAM (FIX BUG DISINI)
  // ======================
  else if (state.step === "pilih_jam") {

    if (!message.match(/^\d{2}:\d{2}$/)) {
      reply = "Format jam salah.\nContoh: 14:00";
    } else {

      // 🔥 ambil ulang state terbaru (INI KUNCI FIX)
      const { data: fresh } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("sender", sender)
        .single();

      if (!fresh?.tanggal) {
        reply = "❌ Tanggal hilang, ketik *halo* ulang ya";
      } else {

        const bentrok = await isSlotTaken(fresh.tanggal, message);

        if (bentrok) {
          reply = "❌ Jam sudah penuh, pilih jam lain ya";
        } else {

          await supabase.from("user_sessions")
            .update({
              step: "konfirmasi",
              jam: message,
            })
            .eq("sender", sender);

          reply =
            `Konfirmasi booking:\n\n` +
            `✂️ ${fresh.layanan}\n` +
            `📅 ${fresh.tanggal}\n` +
            `⏰ ${message}\n` +
            `💰 Rp${fresh.harga}\n\n` +
            `Ketik *YA* untuk konfirmasi\n` +
            `Ketik *BATAL* untuk ulang`;
        }
      }
    }
  }

  // ======================
  // KONFIRMASI
  // ======================
  else if (state.step === "konfirmasi") {

    if (message === "ya") {

      // 🔥 ambil ulang lagi biar aman
      const { data: fresh } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("sender", sender)
        .single();

      const bentrok = await isSlotTaken(fresh.tanggal, fresh.jam);

      if (bentrok) {
        reply = "❌ Slot sudah diambil orang lain";
      } else {

        await supabase.from("bookings").insert([
          {
            sender,
            layanan: fresh.layanan,
            harga: fresh.harga,
            tanggal: fresh.tanggal,
            jam: fresh.jam,
            status: "confirmed",
          },
        ]);

        await supabase
          .from("user_sessions")
          .delete()
          .eq("sender", sender);

        reply =
          "✅ Booking berhasil!\n\n" +
          `📅 ${fresh.tanggal}\n` +
          `⏰ ${fresh.jam}\n\n` +
          "Silakan datang 10 menit sebelum jadwal 🙌";
      }
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

    else {
      reply = "Ketik *YA* atau *BATAL* ya";
    }
  }

  // ======================
  // SAFETY NET
  // ======================
  if (!reply) {
    reply = "Ketik *halo* untuk mulai booking ✂️";
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

