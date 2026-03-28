import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  const text = await req.text(); // ⬅️ PENTING

  console.log("RAW TEXT:", text);

  const params = new URLSearchParams(text);

  const message =
    params.get("message") ||
    params.get("text") ||
    "";

  const sender = params.get("sender") || "";

  console.log("MESSAGE:", message);
  console.log("SENDER:", sender);

  let reply = "Maaf, saya tidak mengerti 😅";

  if (message.toLowerCase().includes("halo")) {
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

  return Response.json({ status: "ok" });
}