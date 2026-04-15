export const INDUSTRIES = {
  barbershop: {
    name: "Barbershop",
    description: "Layanan potong rambut dan perawatan pria",
    services: [
      {
        code: "cut-wash",
        name: "Cut & Wash",
        price: 30000,
        description: "Potong rambut dan perawatan lengkap untuk tampilan rapi.",
        points: [
          "Haircut sesuai keinginan",
          "Rekomendasi model sesuai bentuk wajah",
          "Shampoo + vitamin rambut",
          "Styling akhir dengan pomade",
        ],
      },
      {
        code: "cut-wash-kids",
        name: "Cut & Wash (KIDS)",
        price: 25000,
        description: "Layanan potong rambut nyaman untuk anak-anak.",
        points: [
          "Untuk anak sampai usia 10 tahun",
          "Haircut sesuai keinginan",
          "Shampoo + vitamin rambut",
          "Styling rapi dan nyaman",
        ],
      },
      {
        code: "hair-color",
        name: "Hair Color For Men",
        price: 100000,
        description: "Coloring rambut pria dengan finishing rapi dan natural.",
        points: [
          "Konsultasi pilihan warna",
          "Coloring & grading sesuai request",
          "Shampoo setelah proses",
          "Vitamin rambut setelah coloring",
        ],
      },
    ],
    slots: [
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
    templates: {
      greeting: "Halo, selamat datang di Barokah Barbershop! Berikut layanan kami:\n\n{{service_list}}\n\nBalas dengan nomor layanan ya 👇",
      servicePrompt: "Layanan yang tersedia:\n1. Cut & Wash - IDR 30.000\n2. Cut & Wash (KIDS) - IDR 25.000\n3. Hair Color For Men - IDR 100.000\n\nBalas dengan nomor layanan ya!",
      datePrompt: "Pilih tanggal untuk {tanggal_label}:\n1. Hari ini\n2. Besok\n3. Lusa\n\nBalas dengan nomor tanggal.",
      slotPrompt: "Jam tersedia untuk {tanggal_label}:\n{slot_options}\n\n{confirmation_summary}\n\nBalas *YA* untuk konfirmasi atau *BATAL* untuk ulang.",
      confirmationPrompt: "Konfirmasi booking:\nLayanan: {layanan}\nTanggal: {tanggal_label}\nJam: {jam}\nHarga: {harga}\n\nApakah sudah benar?",
      successMessage: "✅ Booking berhasil!\nLayanan: {layanan}\nTanggal: {tanggal_label}\nJam: {jam}\n\nTerima kasih sudah booking di Barokah Barbershop! Kami tunggu kedatangan Anda 🙌",
      cancelMessage: "Booking dibatalkan. Ketik *halo* untuk mulai lagi ya!",
      invalidOptionMessage: "Pilihan tidak valid. Silakan coba lagi.",
    },
    ui: {
      primaryColor: "#f59e0b", // amber-500
      logo: "BB",
      heroImages: [
        "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1800&q=80",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1800&q=80",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1800&q=80",
      ],
      gallery: [
        "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80",
      ],
    },
  },
  clinic: {
    name: "Klinik",
    description: "Layanan kesehatan dan konsultasi medis",
    services: [
      {
        code: "general-check",
        name: "Pemeriksaan Umum",
        price: 50000,
        description: "Konsultasi medis umum untuk kesehatan Anda.",
        points: [
          "Konsultasi dengan dokter umum",
          "Pemeriksaan tekanan darah",
          "Pemeriksaan fisik dasar",
          "Saran kesehatan",
        ],
      },
      {
        code: "dental-check",
        name: "Pemeriksaan Gigi",
        price: 75000,
        description: "Pemeriksaan gigi lengkap dengan saran perawatan.",
        points: [
          "Konsultasi dengan dokter gigi",
          "Pemeriksaan rongga mulut",
          "Cleaning gigi",
          "Saran perawatan",
        ],
      },
      {
        code: "lab-test",
        name: "Tes Laboratorium",
        price: 100000,
        description: "Paket tes laboratorium lengkap dengan interpretasi hasil.",
        points: [
          "Tes darah lengkap",
          "Tes urine",
          "Konsultasi hasil",
          "Saran medis",
        ],
      },
    ],
    slots: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
    templates: {
      greeting: "Halo, selamat datang di Klinik Sehat! Berikut layanan kami:\n\n{{service_list}}\n\nBalas dengan nomor layanan ya 👇",
      servicePrompt: "Layanan yang tersedia:\n1. Pemeriksaan Umum - IDR 50.000\n2. Pemeriksaan Gigi - IDR 75.000\n3. Tes Laboratorium - IDR 100.000\n\nBalas dengan nomor layanan ya!",
      datePrompt: "Pilih tanggal untuk {tanggal_label}:\n1. Hari ini\n2. Besok\n3. Lusa\n\nBalas dengan nomor tanggal.",
      slotPrompt: "Jam tersedia untuk {tanggal_label}:\n{slot_options}\n\n{confirmation_summary}\n\nBalas *YA* untuk konfirmasi atau *BATAL* untuk ulang.",
      confirmationPrompt: "Konfirmasi booking:\nLayanan: {layanan}\nTanggal: {tanggal_label}\nJam: {jam}\nHarga: {harga}\n\nApakah sudah benar?",
      successMessage: "✅ Booking berhasil!\nLayanan: {layanan}\nTanggal: {tanggal_label}\nJam: {jam}\n\nTerima kasih sudah booking di Klinik Sehat! Kami tunggu kedatangan Anda 🙌",
      cancelMessage: "Booking dibatalkan. Ketik *halo* untuk mulai lagi ya!",
      invalidOptionMessage: "Pilihan tidak valid. Silakan coba lagi.",
    },
    ui: {
      primaryColor: "#3b82f6", // blue-500
      logo: "KS",
      heroImages: [
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1800&q=80",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1800&q=80",
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1800&q=80",
      ],
      gallery: [
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80",
      ],
    },
  },
  // Tambah industri lain di sini (fnb, therapy, dll.)
};

export type IndustryKey = keyof typeof INDUSTRIES;