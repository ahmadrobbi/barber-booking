type IndustryService = {
  code: string;
  name: string;
  price: number;
  description: string;
  points: string[];
};

type IndustryTemplates = {
  greeting: string;
  servicePrompt: string;
  datePrompt: string;
  slotPrompt: string;
  confirmationPrompt: string;
  successMessage: string;
  cancelMessage: string;
  invalidOptionMessage: string;
  reminder: string;
};

type IndustryUi = {
  primaryColor: string;
  logo: string;
  heroImages: string[];
  gallery: string[];
};

type IndustryDefinition = {
  name: string;
  description: string;
  services: IndustryService[];
  slots: string[];
  templates: IndustryTemplates;
  ui: IndustryUi;
};

const GENERIC_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function createGenericIndustry(params: {
  name: string;
  description: string;
  primaryColor: string;
  logo: string;
  emoji: string;
  heroImages: string[];
  gallery: string[];
}): IndustryDefinition {
  return {
    name: params.name,
    description: params.description,
    services: [
      {
        code: "booking-utama",
        name: "Booking Utama",
        price: 50000,
        description: `Reservasi utama untuk ${params.name.toLowerCase()}.`,
        points: [
          "Booking via WhatsApp",
          "Pilih jadwal sesuai slot tersedia",
          "Reminder otomatis sebelum jadwal",
          "Mudah dikustomisasi sesuai bisnis",
        ],
      },
      {
        code: "konsultasi-awal",
        name: "Konsultasi Awal",
        price: 0,
        description: `Konsultasi singkat sebelum booking ${params.name.toLowerCase()}.`,
        points: [
          "Tanya kebutuhan pelanggan",
          "Arahkan ke layanan yang sesuai",
          "Bisa diubah jadi paket berbayar",
          "Cocok untuk proses booking awal",
        ],
      },
      {
        code: "paket-layanan",
        name: "Paket Layanan",
        price: 75000,
        description: `Paket layanan standar untuk ${params.name.toLowerCase()}.`,
        points: [
          "Pilihan paket untuk pelanggan",
          "Bisa disesuaikan per merchant",
          "Cocok untuk repeat order",
          "Membantu upsell layanan",
        ],
      },
    ],
    slots: GENERIC_SLOTS,
    templates: {
      greeting: "Halo, selamat datang di {{business_name}}! Berikut layanan kami:\n\n{{service_list}}\n\nBalas dengan nomor layanan ya 👇",
      servicePrompt: "Mantap 👍 kamu pilih *{{layanan}}*.\n\nSekarang pilih tanggal booking ya 📅\n\n{{date_options}}\n\nBalas dengan nomor tanggal.",
      datePrompt: "Pilih tanggal untuk {{tanggal_label}}:\n{{slot_options}}\n\nBalas dengan nomor jam yang kamu mau.",
      slotPrompt: "Jam tersedia untuk {{tanggal_label}}:\n{{slot_options}}\n\n{{confirmation_summary}}\n\nBalas *YA* untuk konfirmasi atau *BATAL* untuk ulang.",
      confirmationPrompt: "Konfirmasi booking:\nLayanan: {{layanan}}\nTanggal: {{tanggal_label}}\nJam: {{jam}}\nHarga: {{harga}}\n\nApakah sudah benar?",
      successMessage: "✅ Booking berhasil!\nLayanan: {{layanan}}\nTanggal: {{tanggal_label}}\nJam: {{jam}}\n\nTerima kasih sudah booking di {{business_name}}. Kami tunggu kedatangan Anda 🙌",
      cancelMessage: "Booking dibatalkan. Ketik *halo* untuk mulai lagi ya!",
      invalidOptionMessage: "Pilihan tidak valid. Silakan coba lagi.",
      reminder: `⏰ *Reminder Booking*\n\nHalo 👋\nJangan lupa booking kamu hari ini:\n\n${params.emoji} {{layanan}}\n📅 {{tanggal}}\n⏰ {{jam}}\n\nDatang 10 menit lebih awal ya 🙌`,
    },
    ui: {
      primaryColor: params.primaryColor,
      logo: params.logo,
      heroImages: params.heroImages,
      gallery: params.gallery,
    },
  };
}

export const INDUSTRIES = {
  general_booking: createGenericIndustry({
    name: "Bisnis Booking Umum",
    description: "Untuk bisnis yang menerima reservasi, jadwal, atau antrian",
    primaryColor: "#0f766e",
    logo: "BK",
    emoji: "🗓️",
    heroImages: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1556742203-1fd1c00f5e15?auto=format&fit=crop&w=1800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556742203-1fd1c00f5e15?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556742203-1fd1c00f5e15?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
    ],
  }),
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
      greeting: "Halo, selamat datang di {{business_name}}! Berikut layanan kami:\n\n{{service_list}}\n\nBalas dengan nomor layanan ya 👇",
      servicePrompt: "Mantap 👍 kamu pilih *{{layanan}}*.\n\nSekarang pilih tanggal booking ya 📅\n\n{{date_options}}\n\nBalas dengan nomor tanggal.",
      datePrompt: "Pilih tanggal untuk {{tanggal_label}}:\n{{slot_options}}\n\nBalas dengan nomor jam yang kamu mau.",
      slotPrompt: "Jam tersedia untuk {{tanggal_label}}:\n{{slot_options}}\n\n{{confirmation_summary}}\n\nBalas *YA* untuk konfirmasi atau *BATAL* untuk ulang.",
      confirmationPrompt: "Konfirmasi booking:\nLayanan: {{layanan}}\nTanggal: {{tanggal_label}}\nJam: {{jam}}\nHarga: {{harga}}\n\nApakah sudah benar?",
      successMessage: "✅ Booking berhasil!\nLayanan: {{layanan}}\nTanggal: {{tanggal_label}}\nJam: {{jam}}\n\nTerima kasih sudah booking di {{business_name}}. Kami tunggu kedatangan Anda 🙌",
      cancelMessage: "Booking dibatalkan. Ketik *halo* untuk mulai lagi ya!",
      invalidOptionMessage: "Pilihan tidak valid. Silakan coba lagi.",
      reminder: "⏰ *Reminder Booking*\n\nHalo 👋\nJangan lupa booking kamu hari ini:\n\n✂️ {{layanan}}\n📅 {{tanggal}}\n⏰ {{jam}}\n\nDatang 10 menit lebih awal ya 🙌",
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
      greeting: "Halo, selamat datang di {{business_name}}! Berikut layanan kami:\n\n{{service_list}}\n\nBalas dengan nomor layanan ya 👇",
      servicePrompt: "Mantap 👍 kamu pilih *{{layanan}}*.\n\nSekarang pilih tanggal booking ya 📅\n\n{{date_options}}\n\nBalas dengan nomor tanggal.",
      datePrompt: "Pilih tanggal untuk {{tanggal_label}}:\n{{slot_options}}\n\nBalas dengan nomor jam yang kamu mau.",
      slotPrompt: "Jam tersedia untuk {{tanggal_label}}:\n{{slot_options}}\n\n{{confirmation_summary}}\n\nBalas *YA* untuk konfirmasi atau *BATAL* untuk ulang.",
      confirmationPrompt: "Konfirmasi booking:\nLayanan: {{layanan}}\nTanggal: {{tanggal_label}}\nJam: {{jam}}\nHarga: {{harga}}\n\nApakah sudah benar?",
      successMessage: "✅ Booking berhasil!\nLayanan: {{layanan}}\nTanggal: {{tanggal_label}}\nJam: {{jam}}\n\nTerima kasih sudah booking di {{business_name}}. Kami tunggu kedatangan Anda 🙌",
      cancelMessage: "Booking dibatalkan. Ketik *halo* untuk mulai lagi ya!",
      invalidOptionMessage: "Pilihan tidak valid. Silakan coba lagi.",
      reminder: "⏰ *Reminder Booking*\n\nHalo 👋\nJangan lupa booking kamu hari ini:\n\n🏥 {{layanan}}\n📅 {{tanggal}}\n⏰ {{jam}}\n\nDatang 10 menit lebih awal ya 🙌",
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
  salon: createGenericIndustry({
    name: "Salon",
    description: "Layanan kecantikan, perawatan, dan styling",
    primaryColor: "#d946ef",
    logo: "SL",
    emoji: "💇",
    heroImages: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    ],
  }),
  bengkel: createGenericIndustry({
    name: "Bengkel",
    description: "Servis kendaraan, booking perbaikan, dan antrian kerja",
    primaryColor: "#0ea5e9",
    logo: "BG",
    emoji: "🛠️",
    heroImages: [
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=1800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
    ],
  }),
  laundry: createGenericIndustry({
    name: "Laundry",
    description: "Penerimaan order cuci, setrika, dan pickup jadwal",
    primaryColor: "#06b6d4",
    logo: "LD",
    emoji: "🧺",
    heroImages: [
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1519923834699-7bd0e3d1b6a5?auto=format&fit=crop&w=1800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519923834699-7bd0e3d1b6a5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519923834699-7bd0e3d1b6a5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
    ],
  }),
  toko_online: createGenericIndustry({
    name: "Toko Online",
    description: "Pemesanan barang, pickup, dan slot pengambilan",
    primaryColor: "#7c3aed",
    logo: "TO",
    emoji: "🛍️",
    heroImages: [
      "https://images.unsplash.com/photo-1523428096881-5bd79d043006?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=1800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1523428096881-5bd79d043006?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523428096881-5bd79d043006?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523428096881-5bd79d043006?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=900&q=80",
    ],
  }),
} satisfies Record<string, IndustryDefinition>;

export type IndustryKey = keyof typeof INDUSTRIES;

/**
 * Get list of all available industries
 * Pure function - can be used from client or server
 */
export function getAvailableIndustries(): Array<{ key: IndustryKey; name: string }> {
  return Object.entries(INDUSTRIES).map(([key, data]) => ({
    key: key as IndustryKey,
    name: data.name,
  }));
}

export function getIndustryDisplayName(industry: IndustryKey | string) {
  return INDUSTRIES[industry as IndustryKey]?.name ?? industry;
}
