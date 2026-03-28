import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  let message = "";
  let sender = "";

  try {
    // 🥇 coba JSON dulu
    const body = await req.json();

    message =
      body.message?.text ||
      body.message ||
      body.text ||
      "";

    sender = body.sender || body.from || "";
  } catch (err) {
    // 🥈 fallback ke form-data
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

  message = message.toLowerCase();

  console.log("FINAL MESSAGE:", message);
  console.log("FINAL SENDER:", sender);

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  console.log("TOKEN:", process.env.FONNTE_TOKEN);

  // =========================
  // 🔥 LOGIC BOOKING FLOW
  // =========================

  let reply = "Maaf, saya tidak mengerti 😅";

  // START
  if (message.includes("halo")) {
    reply =
      "Halo 👋\n" +
      "Selamat datang di Barbershop 💈\n\n" +
      "Silakan pilih layanan:\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  // PILIH LAYANAN
  else if (message === "1") {
    reply =
      "Kamu memilih *Dewasa* ✂️\n\n" +
      "Mau booking jam berapa?\n" +
      "(Contoh: 14:00)";
  }

  else if (message === "2") {
    reply =
      "Kamu memilih *Anak-anak* ✂️\n\n" +
      "Mau booking jam berapa?\n" +
      "(Contoh: 14:00)";
  }

  // INPUT JAM (simple detection)
  else if (message.includes(":")) {
    reply =
      "Konfirmasi booking kamu:\n\n" +
      `⏰ Jam: ${message}\n\n` +
      "Ketik *YA* untuk konfirmasi\n" +
      "Ketik *BATAL* untuk ulang";
  }

  // KONFIRMASI
  else if (message === "ya") {
    reply =
      "✅ Booking berhasil!\n\n" +
      "Kami tunggu kedatangannya 🙌";
  }

  else if (message === "batal") {
    reply =
      "Silakan pilih ulang:\n\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  else {
    reply = "Ketik *halo* untuk mulai booking ✂️";
  }

  // =========================
  // 🚀 KIRIM KE WHATSAPP
  // =========================

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