import { renderTemplate } from "@/lib/chatbot";
import { createAdminSupabase } from "@/lib/supabase";
import {
  resolveWhatsappContextFromBooking,
  sendWhatsappMessage,
} from "@/lib/whatsapp-channels";

function getSupabase() {
  return createAdminSupabase();
}

export async function GET() {
  try {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    const { data: bookings, error } = await getSupabase()
      .from("bookings")
      .select("id, sender, layanan, tanggal, jam, industry, user_id, channel_id")
      .eq("tanggal", today)
      .eq("status", "confirmed")
      .eq("reminder_sent", false);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return Response.json({ status: "no data" });
    }

    const results = await Promise.all(
      bookings.map(async (item) => {
        try {
          const context = await resolveWhatsappContextFromBooking(item);

          if (!item.sender || !context.token) {
            return {
              id: item.id,
              status: "skipped",
              reason: "missing sender or token",
            };
          }

          const message = renderTemplate(context.templates.reminder, {
            layanan: item.layanan,
            tanggal: item.tanggal,
            jam: item.jam,
          });

          await sendWhatsappMessage({
            target: item.sender,
            message,
            token: context.token,
          });

          await getSupabase()
            .from("bookings")
            .update({ reminder_sent: true })
            .eq("id", item.id);

          return {
            id: item.id,
            status: "sent",
            channelId: context.channelId,
            userId: context.userId,
          };
        } catch (err) {
          console.error("SEND ERROR:", err);
          return {
            id: item.id,
            status: "failed",
          };
        }
      })
    );

    return Response.json({
      status: "done",
      total: bookings.length,
      sent: results.filter((item) => item.status === "sent").length,
      skipped: results.filter((item) => item.status === "skipped").length,
      failed: results.filter((item) => item.status === "failed").length,
    });
  } catch (err) {
    console.error("GLOBAL ERROR:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
