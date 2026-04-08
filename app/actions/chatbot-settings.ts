"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  CHATBOT_TEMPLATE_KEY,
  DEFAULT_CHATBOT_TEMPLATES,
  type ChatbotTemplates,
} from "@/lib/chatbot";
import { createAdminSupabase } from "@/lib/supabase";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveChatbotTemplates(formData: FormData) {
  await requireAdmin();

  const payload: ChatbotTemplates = {
    greeting: normalizeText(formData.get("greeting")) || DEFAULT_CHATBOT_TEMPLATES.greeting,
    servicePrompt:
      normalizeText(formData.get("servicePrompt")) || DEFAULT_CHATBOT_TEMPLATES.servicePrompt,
    datePrompt: normalizeText(formData.get("datePrompt")) || DEFAULT_CHATBOT_TEMPLATES.datePrompt,
    slotPrompt: normalizeText(formData.get("slotPrompt")) || DEFAULT_CHATBOT_TEMPLATES.slotPrompt,
    confirmationPrompt:
      normalizeText(formData.get("confirmationPrompt")) ||
      DEFAULT_CHATBOT_TEMPLATES.confirmationPrompt,
    successMessage:
      normalizeText(formData.get("successMessage")) || DEFAULT_CHATBOT_TEMPLATES.successMessage,
    cancelMessage:
      normalizeText(formData.get("cancelMessage")) || DEFAULT_CHATBOT_TEMPLATES.cancelMessage,
    invalidOptionMessage:
      normalizeText(formData.get("invalidOptionMessage")) ||
      DEFAULT_CHATBOT_TEMPLATES.invalidOptionMessage,
  };

  const supabase = createAdminSupabase();
  const { error } = await supabase.from("app_settings").upsert(
    {
      key: CHATBOT_TEMPLATE_KEY,
      value_json: payload,
    },
    { onConflict: "key" }
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/settings/webhook");
}
