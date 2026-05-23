import { createAdminSupabase } from "@/lib/supabase";

export type ChatbotAiEventInput = {
  userId: string | null;
  channelId: string | null;
  sender: string | null;
  messageId: string | null;
  route: "router" | "faq";
  intent: string | null;
  confidence: number | null;
  model: string | null;
  knowledgeHitCount: number;
  retrievalMs: number;
  aiMs: number;
  totalMs: number;
  fallbackUsed: boolean;
  error: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordChatbotAiEvent(input: ChatbotAiEventInput) {
  if ((process.env.CHATBOT_AI_LOGGING_ENABLED?.trim().toLowerCase() ?? "true") === "false") {
    return;
  }

  try {
    const supabase = createAdminSupabase();
    const { error } = await supabase.from("chatbot_ai_events").insert({
      user_id: input.userId,
      channel_id: input.channelId,
      sender: input.sender,
      message_id: input.messageId,
      route: input.route,
      intent: input.intent,
      confidence: input.confidence,
      model: input.model,
      knowledge_hit_count: input.knowledgeHitCount,
      retrieval_ms: input.retrievalMs,
      ai_ms: input.aiMs,
      total_ms: input.totalMs,
      fallback_used: input.fallbackUsed,
      error: input.error,
      metadata: input.metadata ?? {},
    });

    if (error && error.code !== "42P01") {
      console.warn("[chatbot-observability] failed to record AI event:", error.message);
    }
  } catch (error) {
    console.warn("[chatbot-observability] record AI event failed:", error);
  }
}

