# Hybrid AI Booking Design

Dokumen ini menjelaskan arah arsitektur chatbot booking yang lebih natural untuk BookLink tanpa mengorbankan validasi operasional.

## Ringkasan

Targetnya bukan membuat AI mengambil alih seluruh booking flow.

Targetnya adalah:

- AI memahami input customer yang bebas dan natural
- state machine tetap menyimpan posisi flow booking
- booking engine tetap menjadi sumber kebenaran untuk slot, konflik, dan final create booking
- template channel berubah fungsi menjadi style dan fallback, bukan naskah langkah kaku

## Prinsip Dasar

### 1. AI untuk understanding

AI dipakai untuk:

- mengenali intent booking
- memahami input bebas seperti `besok sore`, `mau cabang dago`, `atas nama robbi`
- memetakan input itu ke kandidat yang valid di step saat ini
- membantu menyusun jawaban yang lebih natural

### 2. Engine untuk truth

Rules engine tetap dipakai untuk:

- validasi cabang
- validasi layanan
- generate tanggal tersedia
- generate slot tersedia
- cek konflik booking
- create booking final

### 3. Session state tetap dipakai

`user_sessions.step` tetap menjadi tulang punggung flow:

- `pilih_cabang`
- `pilih_layanan`
- `pilih_tanggal`
- `pilih_jam`
- `isi_nama`
- `konfirmasi`

AI tidak boleh lompat menyimpan booking final tanpa melewati state dan validasi yang sesuai.

## Layer Baru

### Layer 1. Router AI

Sudah ada di repo.

Fungsi:

- bedakan `faq`, `booking_start`, `handoff`, `unknown`

### Layer 2. Booking Parser AI

Baru ditambahkan sebagai tahap 1.

Fungsi:

- saat user berada di satu step booking, AI menerima:
  - step aktif
  - pesan user
  - daftar kandidat valid pada step itu
  - ringkasan state booking saat ini
- AI hanya boleh memilih kandidat dari daftar yang diberikan
- output AI berbentuk JSON terstruktur

Contoh:

- step `pilih_layanan`
- kandidat:
  - `cut-wash`
  - `hair-color`
- user: `saya mau potong biasa aja`
- AI memilih kandidat `cut-wash`

### Layer 3. Response Composer

Balasan chatbot disusun dari:

- data state saat ini
- hasil parser AI
- style config per channel
- fallback templates bila perlu

Artinya jawaban bisa terasa lebih natural, tetapi isi pentingnya tetap deterministic.

## Konfigurasi Channel Baru

`template_overrides` sekarang diposisikan sebagai:

- `reply_style`
- `fallback_templates`

### reply_style

Berisi preferensi seperti:

- `assistantLabel`
- `tone`
- `brevity`
- `emojiLevel`
- `closingLine`
- `useNaturalLanguage`

### fallback_templates

Berisi template lama seperti:

- `greeting`
- `servicePrompt`
- `datePrompt`
- `confirmationPrompt`
- dan seterusnya

Template lama tetap dipertahankan demi kompatibilitas dan fallback bila AI nonaktif atau gagal.

## Alur Eksekusi Baru

1. Customer kirim pesan.
2. Router AI menentukan apakah pesan FAQ, booking start, atau handoff.
3. Jika sedang di flow booking:
   - parser AI mencoba memahami input natural terhadap kandidat step saat ini.
4. Engine memvalidasi hasil parser.
5. Response composer merangkai jawaban natural.
6. Session state diperbarui.
7. Saat konfirmasi final, booking dibuat oleh engine, bukan oleh AI.

## Tahap Implementasi Saat Ini

Tahap 1 yang sudah diimplementasikan:

- parser AI untuk step:
  - `pilih_cabang`
  - `pilih_layanan`
  - `pilih_tanggal`
  - `pilih_jam`
  - `isi_nama`
  - `konfirmasi`
- parser hanya memilih kandidat valid yang memang tersedia
- channel override mulai dipindahkan ke style/fallback model

Belum di tahap ini:

- multi-slot extraction penuh dalam satu pesan
- reschedule/cancel natural end-to-end
- AI-generated full response untuk seluruh step tanpa fallback deterministic

## Kenapa Model Ini Paling Aman

Kalau full template:

- aman
- tapi terasa kaku

Kalau full AI:

- natural
- tapi rawan salah slot, salah parsing, dan sulit diuji

Kalau hybrid:

- tetap aman untuk operasional
- lebih natural untuk customer
- lebih mudah dijual ke UMKM karena tidak gampang bikin salah booking
- masih bisa di-debug dan dites

## Langkah Lanjut Setelah Tahap 1

- izinkan AI mengekstrak beberapa field sekaligus dalam satu pesan
- tambahkan parser untuk reschedule dan cancel
- tambahkan response composer yang lebih kaya untuk variasi gaya bahasa
- tambahkan observability khusus booking parser agar confidence dan fallback bisa diukur
