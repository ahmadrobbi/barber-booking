import { NextResponse } from "next/server";

let userState: any = {};

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
  } catch (err) {
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

  // INIT USER
  if (!userState[sender]) {
    userState[sender] = { step: 0 };
  }

  const state = userState[sender];

  let reply = "";

  // =========================
  // STEP 0 → START
  // =========================
  if (message === "halo") {
    state.step = 1;

    reply =
      "Halo 👋\n" +
      "Selamat datang di Barbershop 💈\n\n" +
      "Pilih layanan (bisa lebih dari satu):\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000\n\n" +
      "Contoh: 1 atau 1,2";
  }

  // =========================
  // STEP 1 → PILIH LAYANAN
  // =========================
  else if (state.step === 1) {
    const selected = message.split(",");

    let layanan = [];
    let total = 0;

    for (let item of selected) {
      item = item.trim();

      if (item === "1") {
        layanan.push("Dewasa");
        total += 25000;
      }

      if (item === "2") {
        layanan.push("Anak-anak");
        total += 20000;
      }
    }

    if (layanan.length === 0) {
      reply = "Pilihan tidak valid. Contoh: 1 atau 1,2";
    } else {
      state.layanan = layanan;
      state.total = total;
      state.step = 2;

      reply =
        `Layanan: ${layanan.join(", ")}\n` +
        `Total: Rp${total}\n\n` +
        "Mau booking jam berapa?\n(Contoh: 14:00)";
    }
  }

  // =========================
  // STEP 2 → INPUT JAM
  // =========================
  else if (state.step === 2) {
    state.jam = message;
    state.step = 3;

    reply =
      "Konfirmasi booking:\n\n" +
      `Layanan: ${state.layanan.join(", ")}\n` +
      `Jam: ${state.jam}\n` +
      `Total: Rp${state.total}\n\n` +
      "Ketik *YA* untuk konfirmasi\n" +
      "Ketik *BATAL* untuk ulang";
  }

  // =========================
  // STEP 3 → KONFIRMASI
  // =========================
  else if (state.step === 3) {
    if (message === "ya") {
      reply =
        "✅ Booking berhasil!\n\n" +
        `📅 Jam: ${state.jam}\n` +
        `💰 Total: Rp${state.total}\n\n` +
        "⏰ Harap datang 10 menit sebelum jadwal ya 🙏";

      state.step = 0; // reset
    }

    else if (message === "batal") {
      state.step = 1;

      reply =
        "Silakan pilih ulang:\n" +
        "1. Dewasa - Rp25.000\n" +
        "2. Anak-anak - Rp20.000";
    }

    else {
      reply = "Ketik YA atau BATAL ya 🙏";
    }
  }

  // =========================
  // ❗ DI LUAR FLOW → DIAM
  // =========================
  if (!reply) {
    return Response.json({ status: "ignored" });
  }

  // =========================
  // 🚀 KIRIM WA
  // =========================
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