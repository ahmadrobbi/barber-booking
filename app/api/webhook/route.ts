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

  if (!sender) return Response.json({ status: "no sender" });

  // ======================
  // ambil session
  // ======================
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
  // belum mulai
  // ======================
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
      reply = "Ketik *1* atau *2* ya ✂️";
    }

    if (layanan) {
      await supabase.from("user_sessions")
        .update({
          step: "pilih_tanggal",
          layanan,
          harga,
        })
        .eq("sender", sender);

      reply = "Masukkan tanggal booking (format: 2026-03-30)";
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
  // PILIH JAM + VALIDASI
  // ======================
  else if (state.step === "pilih_jam") {

    if (!message.includes(":")) {
      reply = "Format jam salah. Contoh: 14:00";
    } else {

      // 🔥 cek bentrok
      const { data: bentrok } = await supabase
        .from("bookings")
        .select("*")
        .eq("tanggal", state.tanggal)
        .eq("jam", message);

      if (bentrok && bentrok.length > 0) {
        reply = "❌ Jam sudah terisi, pilih jam lain ya";
      } else {

        await supabase.from("user_sessions")
          .update({
            step: "konfirmasi",
            jam: message,
          })
          .eq("sender", sender);

        // 🔥 ambil state terbaru (INI FIX UTAMA)
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
  }

  // ======================
  // KONFIRMASI
  // ======================
  else if (state.step === "konfirmasi") {

    if (message === "ya") {

      // 🔥 cek bentrok lagi (double safety)
      const { data: bentrok } = await supabase
        .from("bookings")
        .select("*")
        .eq("tanggal", state.tanggal)
        .eq("jam", state.jam);

      if (bentrok && bentrok.length > 0) {
        reply = "❌ Slot sudah diambil orang lain";
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

        await supabase.from("user_sessions")
          .delete()
          .eq("sender", sender);

        reply =
          "✅ Booking berhasil!\n\n" +
          `📅 ${state.tanggal}\n` +
          `⏰ ${state.jam}\n\n` +
          "Silakan datang 10 menit sebelum jadwal 🙌";
      }
    }

    else if (message === "batal") {
      await supabase.from("user_sessions")
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