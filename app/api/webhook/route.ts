import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  const body = await req.json();

  console.log("BODY:", body);

  const message =
    body.message?.text?.toLowerCase() ||
    body.message?.toLowerCase() ||
    body.text?.toLowerCase() ||
    "";

  const sender = body.sender;

  console.log("MESSAGE:", message);
  console.log("SENDER:", sender);

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

  return Response.json({ status: "ok" });
}