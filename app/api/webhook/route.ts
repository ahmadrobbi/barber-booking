import { NextResponse } from "next/server";

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

  message = message.toLowerCase();

  console.log("FINAL MESSAGE:", message);
  console.log("FINAL SENDER:", sender);

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  // ✅ LOG TOKEN (tambahkan di sini juga)
  console.log("TOKEN:", process.env.FONNTE_TOKEN);

  let reply = "Maaf, saya tidak mengerti 😅";

  if (message.includes("halo")) {
    reply = "Halo 👋\nSilakan pilih:\n1. Dewasa\n2. Anak-anak";
  }

  // 🔥 👉 DI SINI TEMPATNYA
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