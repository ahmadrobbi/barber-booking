import { createClient } from "@supabase/supabase-js";
import { INDUSTRIES, type IndustryKey } from "@/lib/industries";
import { renderTemplate } from "@/lib/chatbot";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_KEY ?? ""
  );
}

export async function GET() {
  try {
    // ✅ FIX timezone WIB
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    console.log("RUN REMINDER:", today);

    // ✅ handle error supabase
    const { data: bookings, error } = await getSupabase()
      .from("bookings")
      .select("id, sender, layanan, tanggal, jam, industry")
      .eq("tanggal", today)
      .eq("status", "confirmed")
      .eq("reminder_sent", false);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      console.log("NO BOOKINGS");
      return Response.json({ status: "no data" });
    }

    console.log("BOOKINGS:", bookings.length);

    // ✅ kirim paralel (lebih cepat)
    await Promise.all(
      bookings.map(async (item) => {
        try {
          const industry = (item.industry as IndustryKey) || "barbershop";
          const industryData = INDUSTRIES[industry];
          const reminderTemplate = industryData?.templates?.reminder || "⏰ *Reminder Booking*\n\nHalo 👋\nJangan lupa booking kamu hari ini:\n\n{{layanan}}\n{{tanggal}}\n{{jam}}\n\nDatang 10 menit lebih awal ya 🙌";

          const message = renderTemplate(reminderTemplate, {
            layanan: item.layanan,
            tanggal: item.tanggal,
            jam: item.jam,
          });

          const res = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
              Authorization: process.env.FONNTE_TOKEN!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              target: item.sender,
              message,
            }),
          });

          const result = await res.json();

          if (!res.ok) {
            console.error("FONNTE ERROR:", result);
            return;
          }

          // ✅ update hanya kalau sukses
          await getSupabase()
            .from("bookings")
            .update({ reminder_sent: true })
            .eq("id", item.id);

        } catch (err) {
          console.error("SEND ERROR:", err);
        }
      })
    );

    return Response.json({ status: "done" });

  } catch (err) {
    console.error("GLOBAL ERROR:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}