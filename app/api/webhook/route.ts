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

  let reply = "";
  let layanan = "";
  let harga = 0;
  let jam = "";

  // 🔥 FLOW
  if (message === "halo") {
    reply =
      "Halo 👋\n" +
      "Selamat datang di Barbershop 💈\n\n" +
      "Pilih layanan:\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  else if (message === "1") {
    layanan = "Dewasa";
    harga = 25000;

    reply = "Jam berapa? (contoh: 14:00)";
  }

  else if (message === "2") {
    layanan = "Anak-anak";
    harga = 20000;

    reply = "Jam berapa? (contoh: 14:00)";
  }

  else if (message.includes(":")) {
    jam = message;

    reply =
      `Konfirmasi:\n\n` +
      `⏰ Jam: ${jam}\n\n` +
      `Ketik YA untuk lanjut`;
  }

  else if (message === "ya") {
    // 💾 SIMPAN KE DATABASE
    const { data, error } = await supabase.from("bookings").insert([
      {
        sender,
        layanan: "Dewasa",
        harga: 25000,
        jam: "manual",
        status: "confirmed",
      },
    ]);

    console.log("SUPABASE DATA:", data);
    console.log("SUPABASE ERROR:", error);

    reply =
      "✅ Booking berhasil!\n\n" +
      "Silakan datang 10 menit sebelum jadwal 🙌";
  }

  // ❗ kalau bukan "halo" → diam
  if (!reply) {
    return Response.json({ status: "ignored" });
  }

  // 🚀 kirim WA
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