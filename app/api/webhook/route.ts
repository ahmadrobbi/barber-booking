import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// ======================
// SLOT JAM TERSEDIA
// ======================
const ALL_SLOTS = [
  "09:00","10:00","11:00",
  "13:00","14:00","15:00",
  "16:00","17:00","18:00"
];
     
// ======================
// CEK SLOT TERISI
// ======================
async function isSlotTaken(tanggal: string, jam: string) {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("tanggal", tanggal)
    .eq("jam", jam);

  return data && data.length > 0;
}

// ======================
// AMBIL SLOT KOSONG
// ======================
async function getAvailableSlots(tanggal: string) {
  const { data } = await supabase
    .from("bookings")
    .select("jam")
    .eq("tanggal", tanggal);

  const booked = data?.map(i => i.jam) || [];

  return ALL_SLOTS.filter(jam => !booked.includes(jam));
}

// ======================
// MAIN API
// ======================
export async function POST(req: Request) {
  console.log("🔥 VERSION TERBARU AKTIF");
  console.log("🔥 VERSION TERBARU AKTIF");
  let message = "";
  let sender = "";

  try {
    const body = await req.json();
    message = body.message?.text || body.message || body.text || "";
    sender = body.sender || body.from || "";
  } catch {
    const text = await req.text();
    const params = new URLSearchParams(text);
    message = params.get("message") || params.get("text") || "";
    sender = params.get("sender") || params.get("from") || "";
  }

  message = message.toLowerCase().trim();

  if (!sender) {
    return Response.json({ status: "no sender" });
  }

  const { data: state } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .maybeSingle();

  let reply = "";

  // ======================
  // START
  // ======================
  if (message === "halo") {
    await supabase.from("user_sessions").upsert(
      {
        sender,
        step: "pilih_layanan",
        layanan: null,
        harga: null,
        tanggal: null,
        jam: null,
      },
      { onConflict: "sender" }
    );

    reply =
      "Halo 👋 Selamat datang di *Barbershop Premium* 💈\n\n" +
      "Kami siap bikin kamu tampil lebih percaya diri 😎\n\n" +
      "✨ *Pilih layanan terbaik:*\n\n" +

      "1️⃣ *Dewasa Premium*\n" +
      "✂️ Potong + styling rapi\n" +
      "💰 Rp25.000\n\n" +

      "2️⃣ *Anak-anak*\n" +
      "👶 Potong santai & nyaman\n" +
      "💰 Rp20.000\n\n" +

      "Balas dengan *1* atau *2* ya 👇";
  }

  // ======================
  // STATE NULL
  // ======================
  else if (!state) {
    reply = "Ketik *halo* untuk mulai booking ✂️";
  }

  // ======================
  // PILIH LAYANAN
  // ======================
  else if (state.step === "pilih_layanan") {

    if (message === "1" || message === "2") {

      const layanan = message === "1" ? "Dewasa Premium" : "Anak-anak";
      const harga = message === "1" ? 25000 : 20000;

      await supabase.from("user_sessions").upsert(
        {
          sender,
          step: "pilih_tanggal",
          layanan,
          harga,
        },
        { onConflict: "sender" }
      );

      reply =
        `Mantap 👍 kamu pilih *${layanan}*\n\n` +
        `Sekarang pilih tanggal booking ya 📅\n\n` +
        `Contoh: 2026-04-01`;
    }

    else {
      reply = "Ketik *1* atau *2* ya ✂️";
    }
  }

  // ======================
  // PILIH TANGGAL
  // ======================
  else if (state.step === "pilih_tanggal") {

    const isTanggalValid = /^\d{4}-\d{2}-\d{2}$/.test(message);

    if (!isTanggalValid) {
      reply =
        "❌ Format tanggal salah\n\n" +
        "Contoh: 2026-04-01";
    } else {

      const slots = await getAvailableSlots(message);

      await supabase.from("user_sessions").upsert(
        {
          ...state,
          sender,
          step: "pilih_jam",
          tanggal: message,
        },
        { onConflict: "sender" }
      );

      reply =
        `📅 Tanggal dipilih: *${message}*\n\n` +
        `⏰ *Jam tersedia:*\n` +
        `${slots.join(", ")}\n\n` +
        `Ketik jam yang kamu mau ya 👇\n` +
        `Contoh: 14:00`;
    }
  }

  // ======================
  // PILIH JAM
  // ======================
  else if (state.step === "pilih_jam") {

    const isJamValid = /^\d{2}:\d{2}$/.test(message);

    if (!isJamValid) {
      reply =
        "❌ Format jam salah\n\n" +
        "Contoh: 14:00";
    } else {

      const bentrok = await isSlotTaken(state.tanggal, message);

      if (bentrok) {
        reply = "❌ Jam sudah dibooking, pilih jam lain ya";
      } else {

        await supabase.from("user_sessions").upsert(
          {
            ...state,
            sender,
            step: "konfirmasi",
            jam: message,
          },
          { onConflict: "sender" }
        );

        reply =
          `📌 *Konfirmasi Booking*\n\n` +
          `✂️ Layanan : ${state.layanan}\n` +
          `📅 Tanggal : ${state.tanggal}\n` +
          `⏰ Jam : ${message}\n` +
          `💰 Total : Rp${state.harga}\n\n` +
          `✅ Ketik *YA* untuk lanjut\n` +
          `❌ Ketik *BATAL* untuk ulang`;
      }
    }
  }

  // ======================
  // KONFIRMASI
  // ======================
  else if (state.step === "konfirmasi") {

    if (message === "ya") {

      const bentrok = await isSlotTaken(state.tanggal, state.jam);

      if (bentrok) {
        reply = "❌ Slot sudah diambil orang lain";
      } else {

        await supabase.from("bookings").insert([
          {
            sender,
            layanan: state.layanan,
            harga: state.harga,
            tanggal: state.tanggal,
            jam: state.jam,
            status: "confirmed",
          },
        ]);

        await supabase
          .from("user_sessions")
          .delete()
          .eq("sender", sender);

        reply =
          "✅ *Booking berhasil!*\n\n" +
          `📅 ${state.tanggal}\n` +
          `⏰ ${state.jam}\n\n` +
          "🙏 Mohon datang 10 menit sebelum jadwal\n" +
          "Sampai ketemu di barbershop! 💈";
      }
    }

    else if (message === "batal") {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("sender", sender);

      reply = "❌ Booking dibatalkan\nKetik *halo* untuk mulai lagi";
    }

    else {
      reply = "Ketik *YA* atau *BATAL* ya";
    }
  }

  // ======================
  // SAFETY
  // ======================
  if (!reply) {
    reply = "Ketik *halo* untuk mulai booking ✂️";
  }

  // ======================
  // KIRIM WA
  // ======================
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

    
