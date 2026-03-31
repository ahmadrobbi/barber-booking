
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// cek bentrok
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

  message = message.toLowerCase().trim();

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  const { data: state } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .maybeSingle();

  let reply = "";

  // ======================
  // START (FIX)
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
      "1. Dewasa\n" +
      "2. Anak-anak";
  }

  // ======================
  // STATE NULL
  // ======================
  else if (!state) {
    reply = "Ketik *halo* untuk mulai booking";
  }

  // ======================
  // PILIH LAYANAN
  // ======================
  else if (state.step === "pilih_layanan") {

    if (message === "1" || message === "2") {

      const layanan = message === "1" ? "Dewasa" : "Anak-anak";
      const harga = message === "1" ? 25000 : 20000;

      await supabase.from("user_sessions").upsert(
        {
          sender,
          step: "pilih_tanggal",
          layanan,
          harga,
        },
        { onConflict: "sender" }
      );

      reply = "Masukkan tanggal (format: 2026-04-01)";
    }

    else {
      reply = "Ketik 1 atau 2 ya";
    }
  }

  // ======================
  // PILIH TANGGAL (FIX VALIDASI)
  // ======================
  else if (state.step === "pilih_tanggal") {

    const isTanggalValid = /^\d{4}-\d{2}-\d{2}$/.test(message);

    if (!isTanggalValid) {
      reply = "❌ Format tanggal salah\nContoh: 2026-04-01";
    } else {

      await supabase.from("user_sessions").upsert(
        {
          ...state,
          sender,
          step: "pilih_jam",
          tanggal: message,
        },
        { onConflict: "sender" }
      );

      reply = "Masukkan jam (contoh: 14:00)";
    }
  }

  // ======================
  // PILIH JAM (FIX VALIDASI)
  // ======================
  else if (state.step === "pilih_jam") {

    const isJamValid = /^\d{2}:\d{2}$/.test(message);

    if (!isJamValid) {
      reply = "❌ Format jam salah\nContoh: 14:00";
    } else {

      const bentrok = await isSlotTaken(state.tanggal, message);

      if (bentrok) {
        reply = "❌ Jam sudah dibooking, pilih jam lain";
      } else {

        await supabase.from("user_sessions").upsert(
          {
            ...state,
            sender,
            step: "konfirmasi",
            jam: message,
          },
          { onConflict: "sender" }
        );

        reply =
          `Konfirmasi:\n\n` +
          `✂️ ${state.layanan}\n` +
          `📅 ${state.tanggal}\n` +
          `⏰ ${message}\n` +
          `💰 Rp${state.harga}\n\n` +
          `Ketik YA / BATAL`;
      }
    }
  }

  // ======================
  // KONFIRMASI
  // ======================
  else if (state.step === "konfirmasi") {

    if (message === "ya") {

      const bentrok = await isSlotTaken(state.tanggal, state.jam);

      if (bentrok) {
        reply = "❌ Slot sudah diambil";
      } else {

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
          `${state.tanggal} ${state.jam}`;
      }
    }

    else if (message === "batal") {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("sender", sender);

      reply = "Booking dibatalkan";
    }

    else {
      reply = "Ketik YA atau BATAL";
    }
  }

  // ======================
  // SAFETY
  // ======================
  if (!reply) {
    reply = "Ketik halo untuk mulai";
  }

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

