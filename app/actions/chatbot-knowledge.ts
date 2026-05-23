"use server";

import { clearAiAssistantCaches } from "@/lib/ai-booking-assistant";
import { getKnowledgeSeedExamples } from "@/lib/chatbot-knowledge";
import { createAdminSupabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { getCurrentUserBusinessName } from "@/lib/industry-config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const knowledgeEntrySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  title: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  category: z.string().min(1).default("general"),
  priority: z.number().int().default(0),
  source: z.string().min(1).default("manual"),
  is_active: z.boolean().default(true),
});

export type ChatbotKnowledgeEntryInput = z.infer<typeof knowledgeEntrySchema>;

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function upsertChatbotKnowledgeEntry(input: ChatbotKnowledgeEntryInput) {
  const payload = knowledgeEntrySchema.parse(input);
  const supabase = createAdminSupabase();

  const { error } = await supabase.from("user_knowledge_entries").upsert(
    {
      id: payload.id,
      user_id: payload.user_id,
      title: payload.title,
      question: payload.question,
      answer: payload.answer,
      tags: payload.tags,
      category: payload.category,
      priority: payload.priority,
      source: payload.source,
      is_active: payload.is_active,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  clearAiAssistantCaches({ userId: payload.user_id });

  return {
    status: "ok",
  };
}

export async function deleteChatbotKnowledgeEntry(entryId: string, userId: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("user_knowledge_entries").delete().eq("id", entryId);

  if (error) {
    throw new Error(error.message);
  }

  clearAiAssistantCaches({ userId });

  return {
    status: "ok",
  };
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePriority(raw: FormDataEntryValue | null) {
  const value = normalizeText(raw);
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function parseBoolean(raw: FormDataEntryValue | null) {
  return raw === "on" || raw === "true" || raw === "1";
}

export async function saveChatbotKnowledgeEntry(formData: FormData) {
  try {
    const user = await requireAdmin();
    const payload = knowledgeEntrySchema.parse({
      id: normalizeText(formData.get("id")) || undefined,
      user_id: user.id,
      title: normalizeText(formData.get("title")),
      question: normalizeText(formData.get("question")),
      answer: normalizeText(formData.get("answer")),
      tags: parseTags(normalizeText(formData.get("tags"))),
      category: normalizeText(formData.get("category")) || "general",
      priority: parsePriority(formData.get("priority")),
      source: normalizeText(formData.get("source")) || "manual",
      is_active: parseBoolean(formData.get("is_active")),
    });

    await upsertChatbotKnowledgeEntry(payload);
    revalidatePath("/admin/settings/knowledge");
    redirect("/admin/settings/knowledge?success=Knowledge%20berhasil%20disimpan.");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan knowledge.";
    redirect(`/admin/settings/knowledge?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteChatbotKnowledgeEntryAction(formData: FormData) {
  try {
    const user = await requireAdmin();
    const entryId = normalizeText(formData.get("entry_id"));

    if (!entryId) {
      redirect("/admin/settings/knowledge?error=ID%20knowledge%20tidak%20valid.");
    }

    await deleteChatbotKnowledgeEntry(entryId, user.id);
    revalidatePath("/admin/settings/knowledge");
    redirect("/admin/settings/knowledge?success=Knowledge%20berhasil%20dihapus.");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus knowledge.";
    redirect(`/admin/settings/knowledge?error=${encodeURIComponent(message)}`);
  }
}

export async function seedDefaultChatbotKnowledgeAction() {
  try {
    const user = await requireAdmin();
    const businessName = await getCurrentUserBusinessName();
    const supabase = createAdminSupabase();
    const { data: existingRows, error: existingError } = await supabase
      .from("user_knowledge_entries")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (existingError && existingError.code !== "42P01") {
      throw new Error(existingError.message);
    }

    if ((existingRows ?? []).length > 0) {
      redirect("/admin/settings/knowledge?error=Knowledge%20sudah%20ada.%20Hapus%20manual%20jika%20ingin%20seed%20ulang.");
    }

    const examples = getKnowledgeSeedExamples(businessName).map((item) => ({
      user_id: user.id,
      ...item,
      is_active: true,
    }));

    const { error } = await supabase.from("user_knowledge_entries").insert(examples);

    if (error) {
      throw new Error(error.message);
    }

    clearAiAssistantCaches({ userId: user.id });
    revalidatePath("/admin/settings/knowledge");
    redirect("/admin/settings/knowledge?success=Contoh%20knowledge%20berhasil%20ditambahkan.");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan saat menambahkan contoh knowledge.";
    redirect(`/admin/settings/knowledge?error=${encodeURIComponent(message)}`);
  }
}
