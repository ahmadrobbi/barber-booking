import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const PRICING = {
  "1": { nama: "Dewasa", harga: 25000 },
  "2": { nama: "Anak-anak", harga: 20000 },
};

export async function POST(req: Request) {
  let message = "";
  let sender = "";

  try {
    const body = await req.json();
    message = (body.message?.text || body.message || body.text || "").toString().trim().toLowerCase();
    sender = body.sender || body.from || "";
  } catch (e) {
    return Response.json({ status: "error" });
  }

  if (!sender) return Response.json({ status: "no sender" });

  // 1. AMBIL STATE DARI DATABASE
  const { data: state, error: fetchError } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("sender", sender)
    .maybeSingle();

  // DEBUG 1: Cek apa yang dibaca bot dari DB
  console.log("--- DEBUG START ---");
  console.log("SENDER:", sender);
  console.log("PESAN USER:", message);
  console.log("STEP SAAT INI DI DB:", state?.step || "TIDAK ADA");
  console.log("DATA STATE LENGKAP:", state);

  let reply = "";

  // ==========================================
  // LOGIKA FLOW
  // ==========================================

  if (message === "halo" || !state) {
    console.log("MASUK KE: RESET/HALO");
    await supabase.from("user_sessions").upsert({
      sender,
      step: "pilih_layanan",
      layanan: null,
      harga: null,
      tanggal: null,
      jam: null,
    }, { onConflict: "sender" });

    reply = "Halo 👋 Pilih layanan:\n1. Dewasa (Rp 25.000)\n2. Anak-anak (Rp 20.000)";
  } 
  
  else if (state.step === "pilih_layanan") {
    console.log("MASUK KE: PROSES PILIH LAYANAN");
    const pilihan = PRICING[message as keyof typeof PRICING];
    if (!pilihan) {
      reply = "⚠️ Ketik 1 atau 2";
    } else {
      const { error: upError } = await supabase.from("user_sessions")
        .update({ step: "pilih_tanggal", layanan: pilihan.nama, harga: pilihan.harga })
        .eq("sender", sender);
      
      console.log("UPDATE KE PILIH_TANGGAL ERROR?:", upError);
      reply = "📅 Masukkan tanggal (YYYY-MM-DD)\nContoh: 2026-04-01";
    }
  }

  else if (state.step === "pilih_tanggal") {
    console.log("MASUK KE: PROSES VALIDASI TANGGAL");
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateRegex.test(message)) {
      console.log("HASIL VALIDASI TANGGAL: GAGAL (Format Salah)");
      reply = "❌ Format tanggal salah.\nGunakan format YYYY-MM-DD";
    } else {
      console.log("HASIL VALIDASI TANGGAL: BERHASIL");
      const { error: upError } = await supabase.from("user_sessions")
        .update({ step: "pilih_jam", tanggal: message })
        .eq("sender", sender);
      
      console.log("UPDATE KE PILIH_JAM ERROR?:", upError);
      reply = "⏰ Masukkan jam (HH:mm)\nContoh: 14:00";
    }
  }

  else if (state.step === "pilih_jam") {
    console.log("MASUK KE: PROSES VALIDASI JAM");
    const timeRegex = /^\d{2}:\d{2}$/;
    
    if (!timeRegex.test(message)) {
      console.log("HASIL VALIDASI JAM: GAGAL (Format Salah)");
      reply = "❌ Format jam salah.\nContoh: 14:00";
    } else {
      console.log("HASIL VALIDASI JAM: BERHASIL");
      // Cek bentrok
      const { data: bentrok } = await supabase.from("bookings")
        .select("id").eq("tanggal", state.tanggal).eq("jam", message).maybeSingle();

      if (bentrok) {
        reply = "🚫 Jam sudah penuh, pilih jam lain:";
      } else {
        await supabase.from("user_sessions")
          .update({ step: "konfirmasi", jam: message })
          .eq("sender", sender);

        reply = `📝 *KONFIRMASI*\nLayanan: ${state.layanan}\nTanggal: ${state.tanggal}\nJam: ${message}\nTotal: *Rp ${state.harga.toLocaleString('id-ID')}*\n\nKetik *YA*`;
      }
    }
  }

  else if (state.step === "konfirmasi" && message === "ya") {
    console.log("MASUK KE: FINALISASI BOOKING");
    await supabase.from("bookings").insert([{
      sender, layanan: state.layanan, harga: state.harga, tanggal: state.tanggal, jam: state.jam, status: "confirmed"
    }]);
    await supabase.from("user_sessions").delete().eq("sender", sender);
    reply = `✅ Berhasil! Total: *Rp ${state.harga.toLocaleString('id-ID')}*`;
  }

  console.log("REPLY AKHIR:", reply);
  console.log("--- DEBUG END ---");

  // KIRIM KE FONNTE
  await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { Authorization: process.env.FONNTE_TOKEN!, "Content-Type": "application/json" },
    body: JSON.stringify({ target: sender, message: reply }),
  });

  return Response.json({ status: "ok" });
}