
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET() {
  const now = new Date();

  // format tanggal hari ini
  const today = now.toISOString().split("T")[0];

  console.log("RUN REMINDER:", today);

  // ambil booking hari ini yang belum dikirim reminder
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("tanggal", today)
    .eq("status", "confirmed")
    .eq("reminder_sent", false);

  console.log("BOOKINGS:", bookings);

  for (const item of bookings || []) {
    // kirim WA
    await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: item.sender,
        message:
          `⏰ *Reminder Booking*\n\n` +
          `Halo 👋\n` +
          `Jangan lupa booking kamu hari ini:\n\n` +
          `✂️ ${item.layanan}\n` +
          `📅 ${item.tanggal}\n` +
          `⏰ ${item.jam}\n\n` +
          `Datang 10 menit lebih awal ya 🙌`,
      }),
    });

    // tandai sudah dikirim
    await supabase
      .from("bookings")
      .update({ reminder_sent: true })
      .eq("id", item.id);
  }

  return Response.json({ status: "done" });
}

