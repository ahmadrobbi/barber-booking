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

    console.log("BODY JSON:", body);

    message =
      body.message?.text ||
      body.message ||
      body.text ||
      "";

    sender = body.sender || body.from || "";
  } catch (err) {
    // 🥈 fallback ke text (form-data)
    const text = await req.text();

    console.log("RAW TEXT:", text);

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
    console.log("❌ SENDER KOSONG - STOP");
    return NextResponse.json({ status: "no sender" });
  }

  let reply = "Maaf, saya tidak mengerti 😅";

  if (message.includes("halo")) {
    reply = "Halo 👋\nSilakan pilih:\n1. Dewasa\n2. Anak-anak";
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

  return NextResponse.json({ status: "ok" });
}