import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

let userState: any = {};

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);

    const message = (params.get("message") || "").toLowerCase();
    const sender = params.get("sender") || "";

    console.log("MSG:", message);
    console.log("SENDER:", sender);

    let reply = "";

    if (!sender) {
      console.log("❌ sender kosong");
      return Response.json({ status: "no sender" });
    }

    // INIT USER
    if (!userState[sender]) {
      userState[sender] = { step: 0 };
    }

    const state = userState[sender];

    // START
    if (message.includes("halo")) {
      state.step = 1;

      reply =
        "Halo 👋\n" +
        "Selamat datang di Barbershop 💈\n\n" +
        "1. Dewasa - Rp25.000\n" +
        "2. Anak-anak - Rp20.000";
    }

    // PILIH LAYANAN
    else if (state.step === 1) {
      if (message === "1") {
        state.layanan = "Dewasa";
        state.harga = "Rp25.000";
      } else if (message === "2") {
        state.layanan = "Anak-anak";
        state.harga = "Rp20.000";
      } else {
        reply = "Ketik 1 atau 2 ya 🙏";
      }

      if (reply === "") {
        state.step = 2;

        reply =
          `Kamu memilih ${state.layanan} ✂️\n\n` +
          "Mau jam berapa?\n(Contoh: 14:00)";
      }
    }

    // INPUT JAM
    else if (state.step === 2) {
      state.jam = message;
      state.step = 3;

      reply =
        "Konfirmasi booking:\n\n" +
        `Layanan: ${state.layanan}\n` +
        `Jam: ${state.jam}\n` +
        `Harga: ${state.harga}\n\n` +
        "Ketik YA / BATAL";
    }

    // KONFIRMASI
    else if (state.step === 3) {
      if (message === "ya") {
        reply = "✅ Booking berhasil!";
        state.step = 0;
      } else if (message === "batal") {
        state.step = 1;
        reply = "Pilih ulang:\n1. Dewasa\n2. Anak-anak";
      } else {
        reply = "Ketik YA atau BATAL ya";
      }
    }

    else {
      reply = "Ketik halo untuk mulai";
    }

    // 🚀 KIRIM WA
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
    console.log("FONNTE:", result);

    return Response.json({ status: "ok" });

  } catch (err) {
    console.log("ERROR:", err);
    return Response.json({ error: "server error" });
  }
}