import { createAdminSupabase } from "@/lib/supabase";

export type ChatbotKnowledgeEntry = {
  id: string;
  user_id: string;
  title: string;
  question: string;
  answer: string;
  tags: string[];
  category: string;
  priority: number;
  source: string;
  is_active: boolean;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
};

type ChatbotKnowledgeRow = {
  id: string;
  user_id: string;
  title: string;
  question: string;
  answer: string;
  tags: string[] | null;
  category: string | null;
  priority: number | null;
  source: string | null;
  is_active: boolean | null;
  embedding: unknown;
  created_at: string | null;
  updated_at: string | null;
};

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function mapKnowledgeRow(row: ChatbotKnowledgeRow): ChatbotKnowledgeEntry {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    question: row.question,
    answer: row.answer,
    tags: row.tags ?? [],
    category: row.category ?? "general",
    priority: row.priority ?? 0,
    source: row.source ?? "manual",
    is_active: Boolean(row.is_active ?? true),
    embedding: isNumberArray(row.embedding) ? row.embedding : null,
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
  };
}

export async function getKnowledgeEntriesForUser(userId: string) {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_knowledge_entries")
      .select(
        "id, user_id, title, question, answer, tags, category, priority, source, is_active, embedding, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("priority", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return ((data ?? []) as ChatbotKnowledgeRow[]).map(mapKnowledgeRow);
  } catch (error) {
    console.warn("Failed to load knowledge entries:", error);
    return [] as ChatbotKnowledgeEntry[];
  }
}

export function getKnowledgeSeedExamples(businessName: string) {
  return [
    {
      title: "Jam operasional",
      question: "Jam buka bisnis ini kapan?",
      answer: `Kami buka mengikuti jam operasional ${businessName}. Silakan cek jam buka terbaru di menu cabang atau tanya langsung ke admin bila ingin jadwal hari tertentu.`,
      tags: ["jam buka", "operasional", "buka hari ini"],
      category: "operational",
      priority: 10,
      source: "seed",
    },
    {
      title: "Layanan tersedia",
      question: "Layanan apa saja yang tersedia?",
      answer:
        "Silakan pilih layanan dari daftar yang tersedia di chatbot. Kalau kamu mau, saya bisa bantu arahkan ke flow booking sesuai layanan yang diinginkan.",
      tags: ["layanan", "harga", "menu"],
      category: "services",
      priority: 9,
      source: "seed",
    },
    {
      title: "Alamat cabang",
      question: "Cabangnya di mana?",
      answer:
        "Kami punya daftar cabang aktif di sistem. Balas dengan pertanyaan cabang atau pilih cabang saat booking supaya saya tampilkan lokasi yang sesuai.",
      tags: ["alamat", "cabang", "lokasi"],
      category: "branches",
      priority: 9,
      source: "seed",
    },
    {
      title: "Cara booking",
      question: "Bagaimana cara booking?",
      answer:
        "Cukup balas HALO atau MENU, lalu ikuti langkah pilih layanan, tanggal, jam, dan nama pemesan. Setelah itu tinggal konfirmasi booking.",
      tags: ["booking", "cara booking", "reservasi"],
      category: "booking",
      priority: 8,
      source: "seed",
    },
    {
      title: "Pembatalan",
      question: "Bagaimana kalau mau batal booking?",
      answer:
        "Kalau masih di dalam flow booking, balas BATAL untuk mengulang atau berhenti. Kalau booking sudah terlanjur dibuat, silakan hubungi admin untuk bantuan lanjut.",
      tags: ["batal", "cancel", "reschedule"],
      category: "booking",
      priority: 8,
      source: "seed",
    },
    {
      title: "Kontak admin",
      question: "Kalau mau tanya langsung ke admin bagaimana?",
      answer:
        "Kalau butuh bantuan manusia, saya bisa arahkan ke admin. Silakan pakai kontak bisnis yang tersedia di profil atau sebutkan pertanyaanmu supaya saya bantu dulu jika bisa.",
      tags: ["admin", "kontak", "human handoff"],
      category: "handoff",
      priority: 7,
      source: "seed",
    },
  ];
}

