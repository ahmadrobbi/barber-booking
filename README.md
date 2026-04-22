# AntriFlow MVP

AntriFlow adalah MVP booking `barbershop` yang berfokus pada satu hasil utama: owner bisa memakai `nomor WhatsApp bisnis sendiri` sebagai bot untuk menerima booking, mengelola jadwal, dan mengirim reminder otomatis.

## Fokus Produk Saat Ini

- Owner mendaftar dan login ke dashboard
- Owner mengatur profil bisnis, slug landing page, dan layanan
- Owner mendaftarkan nomor WhatsApp miliknya sendiri sebagai channel bot
- Customer booking lewat chat WhatsApp atau halaman publik `/b/[slug]`
- Owner mengonfirmasi booking dari dashboard
- Sistem mengirim reminder otomatis dan notifikasi status dasar

## Environment Variables

Isi environment berikut sebelum menjalankan aplikasi:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET` atau `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

Catatan:
- `FONNTE_TOKEN` bukan lagi sumber utama untuk flow tenant-aware. Token utama disimpan per channel di `whatsapp_channels.fonnte_device_token`.
- Jika `AUTH_SECRET` tidak diisi, aplikasi akan fallback ke variabel lain yang kurang ideal. Untuk production, selalu isi `AUTH_SECRET`.

## Jalankan Lokal

```bash
npm install
npm run dev
```

Lalu buka `http://localhost:3000`.

## Database dan Migration

Jalankan migration di folder `supabase/migrations/`.

Migration yang penting untuk MVP tenant-aware saat ini:

- `20260419103000_add_whatsapp_channels.sql`
- `20260421110000_mvp_barbershop_foundation.sql`
- `20260422103000_add_duration_to_bookings.sql`

## Checklist Deploy

Checklist deploy dan smoke test MVP ada di [docs/MVP_DEPLOY_CHECKLIST.md](/Users/robbi-kaspin/Documents/barber_booking/barber-booking/docs/MVP_DEPLOY_CHECKLIST.md:1).

## CI Migration

Repo ini punya workflow `.github/workflows/supabase-db-push.yml` untuk mendorong migration ke Supabase.

Secrets yang dibutuhkan:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_REF`
