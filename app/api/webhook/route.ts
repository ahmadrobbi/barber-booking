import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const message = body.message?.toLowerCase();
  const sender = body.sender;

  let reply = "";

  if (!message) return NextResponse.json({ status: "ok" });

  if (message.includes("halo")) {
    reply = `Halo 👋

Silakan pilih layanan:
1. Dewasa (25k)
2. Anak-anak (20k)`;
  }

  else if (message === "1") {
    reply = `Pilih jam:

1. 10:00
2. 10:30
3. 11:00`;
  }

  else if (message === "2") {
    reply = `Pilih jam:

1. 10:00
2. 10:30
3. 11:00`;
  }

  else if (["10:00","10:30","11:00"].includes(message)) {
    reply = `Booking kamu jam ${message} sudah dicatat ✅

Silakan datang tepat waktu ya 🙏`;
  }

  if (reply) {
    await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": process.env.FONNTE_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: sender,
        message: reply,
      }),
    });
  }

  return NextResponse.json({ status: "ok" });
}