import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

let userState: any = {};

export async function POST(req: Request) {
  const text = await req.text();
  const params = new URLSearchParams(text);

  const message = (params.get("message") || "").toLowerCase();
  const sender = params.get("sender") || "";

  let reply = "";

  // INIT USER
  if (!userState[sender]) {
    userState[sender] = { step: 0 };
  }

  const state = userState[sender];

  // STEP 0 → START
  if (message.includes("halo")) {
    state.step = 1;

    reply =
      "Halo 👋\n" +
      "Selamat datang di Barbershop 💈\n\n" +
      "Silakan pilih layanan:\n" +
      "1. Dewasa - Rp25.000\n" +
      "2. Anak-anak - Rp20.000";
  }

  // STEP 1 → PILIH LAYANAN
  else if (state.step === 1) {
    if (message === "1") {
      state.layanan = "Dewasa";
      state.harga = "Rp25.000";
    } else if (message === "2") {
      state.layanan = "Anak-anak";
      state.harga = "Rp20.000";
    } else {
      reply = "Pilihan tidak valid. Ketik 1 atau 2 ya 🙏";
      return sendReply(sender, reply);
    }

    state.step = 2;

    reply =
      `Kamu memilih *${state.layanan}* ✂️\n\n` +
      "Mau booking jam berapa?\n" +
      "(Contoh: 13:00 / 15:30)";
  }

  // STEP 2 → INPUT JAM
  else if (state.step === 2) {
    state.jam = message;
    state.step = 3;

    reply =
      "Konfirmasi booking kamu:\n\n" +
      `👤 Layanan: ${state.layanan}\n` +
      `⏰ Jam: ${state.jam}\n` +
      `💰 Harga: ${state.harga}\n\n` +
      "Ketik *YA* untuk konfirmasi\n" +
      "Ketik *BATAL* untuk ulang";
  }

  // STEP 3 → KONFIRMASI
  else if (state.step === 3) {
    if (message === "ya") {
      reply =
        "✅ Booking berhasil!\n\n" +
        "Kami tunggu kedatangannya 🙌";

      state.step = 0; // reset
    } else if (message === "batal") {
      state.step = 1;

      reply =
        "Oke, silakan pilih ulang:\n\n" +
        "1. Dewasa - Rp25.000\n" +
        "2. Anak-anak - Rp20.000";
    } else {
      reply = "Ketik *YA* atau *BATAL* ya 🙏";
    }
  }

  else {
    reply = "Ketik *halo* untuk mulai booking ✂️";
  }

  return sendReply(sender, reply);
}

// 🔥 helper kirim WA
async function sendReply(sender: string, message: string) {
  await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: process.env.FONNTE_TOKEN!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: sender,
      message: message,
    }),
  });

  return Response.json({ status: "ok" });
}