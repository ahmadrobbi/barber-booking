import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const PRICING = {
  "1": { nama: "Dewasa", harga: 25000 },
  "2": { nama: "Anak-anak", harga: 20000 },
};

async function isSlotTaken(tanggal: string, jam: string) {
  const { data } = await supabase
    .from("bookings")
    .select("id")
    .eq("tanggal", tanggal)
    .eq("jam", jam)
    .maybeSingle();
  return !!data;
}

export async function POST(req: Request) {
  let message = "";
  let sender = "";

  try {
    const body = await req.json();
    // Normalisasi pesan: hapus spasi, huruf kecil
    message = (body.message?.text || body.message || body.text || "").toString().trim().toLowerCase();
    sender = body.sender || body.from || "";
  } catch (e) {
    return Response.json({ status: "error" });
  }

  if (!sender) return Response.json({ status: "no sender" });

  // 1. Ambil State User
  const { data: state } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .maybeSingle();

  let reply = "";

  // ==========================================
  // LOGIKA FLOW (URUTAN DIBALIK AGAR LEBIH STABIL)
  // ==========================================

  // A. RESET / MULAI BARU (Hanya jika ketik halo atau belum ada state)
  if (message === "halo" || !state) {
    await supabase.from("user_sessions").upsert({
      sender,
      step: "pilih_layanan",
      layanan: null,
      harga: null,
      tanggal: null,
      jam: null,
    }, { onConflict: "sender" });

    reply = "Halo 👋 Selamat datang di Barbershop!\n\nPilih layanan:\n1. Dewasa (Rp 25.000)\n2. Anak-anak (Rp 20.000)\n\nKetik angkanya saja.";
  } 

  // B. SEDANG PILIH LAYANAN
  else if (state.step === "pilih_layanan") {
    const pilihan = PRICING[message as keyof typeof PRICING];
    if (!pilihan) {
      reply = "⚠️ Mohon ketik *1* atau *2* saja.";
    } else {
      await supabase.from("user_sessions").update({
        step: "pilih_tanggal",
        layanan: pilihan.nama,
        harga: pilihan.harga,
      }).eq("sender", sender);
      reply = "📅 Masukkan tanggal booking\nFormat: *YYYY-MM-DD*\nContoh: 2026-04-01";
    }
  }

  // C. SEDANG PILIH TANGGAL (Penyebab Error Sebelumnya di sini)
  else if (state.step === "pilih_tanggal") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(message)) {
      reply = "❌ Format tanggal salah.\nGunakan format *YYYY-MM-DD*\nContoh: 2026-04-01";
    } else {
      await supabase.from("user_sessions").update({
        step: "pilih_jam",
        tanggal: message,
      }).eq("sender", sender);
      reply = "⏰ Pilih jam booking\nFormat: *HH:mm*\nContoh: 14:00";
    }
  }

  // D. SEDANG PILIH JAM
  else if (state.step === "pilih_jam") {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(message)) {
      reply = "❌ Format jam salah.\nContoh: 14:00";
    } else {
      // PENTING: Gunakan state.tanggal yang sudah tersimpan di database
      const bentrok = await isSlotTaken(state.tanggal, message);
      if (bentrok) {
        reply = `🚫 Maaf, jam ${message} pada tanggal ${state.tanggal} sudah penuh. Pilih jam lain:`;
      } else {
        await supabase.from("user_sessions").update({
          step: "konfirmasi",
          jam: message,
        }).eq("sender", sender);

        reply = `📝 *KONFIRMASI BOOKING*\n\n` +
                `• Layanan: ${state.layanan}\n` +
                `• Tanggal: ${state.tanggal}\n` +
                `• Jam: ${message}\n` +
                `• Total: *Rp ${state.harga.toLocaleString('id-ID')}*\n\n` +
                `Ketik *YA* untuk memproses.`;
      }
    }
  }

  // E. KONFIRMASI AKHIR
  else if (state.step === "konfirmasi") {
    if (message === "ya") {
      await supabase.from("bookings").insert([{
        sender,
        layanan: state.layanan,
        harga: state.harga,
        tanggal: state.tanggal,
        jam: state.jam,
        status: "confirmed"
      }]);

      await supabase.from("user_sessions").delete().eq("sender", sender);

      reply = `✅ *BOOKING BERHASIL!*\n\n` +
              `Layanan: ${state.layanan}\n` +
              `Total Bayar: *Rp ${state.harga.toLocaleString('id-ID')}*\n\n` +
              `Silakan datang tepat waktu ya! ✂️`;
    } else {
      reply = "Ketik *YA* untuk konfirmasi atau *halo* untuk ulang.";
    }
  }

  // 2. Kirim Pesan via Fonnte
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