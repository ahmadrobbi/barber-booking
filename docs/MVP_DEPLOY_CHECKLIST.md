# MVP Deploy Checklist

Checklist ini dipakai untuk memastikan flow MVP barbershop siap dipakai owner sungguhan: daftar, sambungkan nomor WhatsApp sendiri, terima booking, dan kirim reminder otomatis.

## 1. Environment

- Isi `SUPABASE_URL`
- Isi `SUPABASE_SERVICE_ROLE_KEY`
- Isi `AUTH_SECRET` atau `SESSION_SECRET`
- Isi `NEXT_PUBLIC_APP_URL` dengan URL publik aplikasi
- `FONNTE_TOKEN` tidak lagi jadi sumber utama tenant-aware flow. Token utama disimpan per channel di dashboard owner.
- Untuk AI booking assistant, isi `GEMINI_API_KEY` atau `GOOGLE_API_KEY`
- Jika diperlukan, isi `GEMINI_OPENAI_BASE_URL` dan `AI_BOOKING_MODEL`
- Gunakan `AI_BOOKING_ENABLED=false` hanya jika ingin menonaktifkan routing AI sementara

## 2. Database

- Pastikan semua migration di `supabase/migrations/` sudah diterapkan
- Migration penting untuk MVP saat ini:
  - `20260419103000_add_whatsapp_channels.sql`
  - `20260421110000_mvp_barbershop_foundation.sql`
  - `20260422103000_add_duration_to_bookings.sql`
- Verifikasi tabel ini tersedia:
  - `dashboard_users`
  - `user_profiles`
  - `user_landing_pages`
  - `whatsapp_channels`
  - `user_services`
  - `bookings`
  - `user_sessions`

## 3. Setup Owner Pertama

1. Daftar akun owner dari `/register`
2. Login ke `/admin`
3. Lengkapi profil bisnis:
   nama barbershop, kontak bisnis, dan jam operasional
4. Atur slug landing page
5. Tambahkan layanan di `/admin/settings/services`
   nama layanan, harga, durasi, dan status aktif

## 4. Setup WhatsApp Channel

1. Buka `/admin/settings/webhook`
2. Tambahkan:
   nomor device WhatsApp, nama device, token Fonnte device, dan `webhook_secret` opsional
3. Tandai satu channel sebagai default
4. Arahkan callback provider ke:
   `POST {NEXT_PUBLIC_APP_URL}/api/webhook`
5. Jika memakai secret, kirim secret yang sama dari provider ke webhook

## 5. Smoke Test End-to-End

1. Buka halaman publik tenant: `/b/[slug]`
2. Coba booking manual dari form publik
3. Pastikan booking masuk ke dashboard owner yang benar
4. Coba chat ke nomor WhatsApp bisnis owner
5. Pastikan chatbot membalas dengan layanan tenant yang benar
6. Confirm booking dari dashboard
7. Pastikan pelanggan menerima WA konfirmasi
8. Jalankan reminder flow dan pastikan reminder hanya terkirim ke booking aktif

## 6. Hal yang Perlu Dicek Sebelum Go-Live

- Tidak ada channel tanpa `user_id`
- Tidak ada owner tanpa default WhatsApp channel
- Setiap owner punya minimal satu layanan aktif
- `business_hours` sudah terisi
- Halaman `/b/[slug]` bisa dibuka tanpa login
- Webhook provider mengirim `device` yang cocok dengan `whatsapp_channels.device_number`
- Secret webhook tervalidasi bila diaktifkan

## 7. Batas MVP Saat Ini

- Fokus pada `barbershop`
- Single resource scheduling
- Belum mendukung multi-barber atau multi-chair
- Template WA masih sederhana
- Belum ada billing dan analytics lanjutan
- Shared AI assistant masih default satu nomor platform; dedicated number per merchant bisa jadi add-on nanti
