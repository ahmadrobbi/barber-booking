-- Chatbot knowledge base and AI observability
-- Created: 2026-05-23

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.user_knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.dashboard_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  category VARCHAR(64) NOT NULL DEFAULT 'general',
  priority INTEGER NOT NULL DEFAULT 0,
  source VARCHAR(32) NOT NULL DEFAULT 'manual',
  is_active BOOLEAN NOT NULL DEFAULT true,
  embedding vector(768),
  search_content TSVECTOR GENERATED ALWAYS AS (
    to_tsvector(
      'simple',
      COALESCE(title, '') || ' ' ||
      COALESCE(question, '') || ' ' ||
      COALESCE(answer, '') || ' ' ||
      COALESCE(category, '') || ' ' ||
      COALESCE(array_to_string(tags, ' '), '')
    )
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_knowledge_entries_user_active_idx
  ON public.user_knowledge_entries(user_id, is_active, priority DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS user_knowledge_entries_category_idx
  ON public.user_knowledge_entries(user_id, category);

CREATE INDEX IF NOT EXISTS user_knowledge_entries_search_idx
  ON public.user_knowledge_entries USING GIN (search_content);

CREATE INDEX IF NOT EXISTS user_knowledge_entries_tags_idx
  ON public.user_knowledge_entries USING GIN (tags);

DO $$
BEGIN
  IF to_regclass('public.user_knowledge_entries') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON TABLE public.user_knowledge_entries IS 'Merchant-scoped FAQ and knowledge base for AI retrieval.';
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.user_knowledge_entries.embedding IS 'Optional vector embedding for future semantic retrieval.';
    $sql$;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.update_user_knowledge_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_knowledge_entries_updated_at ON public.user_knowledge_entries;
CREATE TRIGGER update_user_knowledge_entries_updated_at
  BEFORE UPDATE ON public.user_knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_user_knowledge_entries_updated_at();

CREATE TABLE IF NOT EXISTS public.chatbot_ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.dashboard_users(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES public.whatsapp_channels(id) ON DELETE SET NULL,
  sender TEXT,
  message_id TEXT,
  route VARCHAR(32) NOT NULL,
  intent VARCHAR(32),
  confidence NUMERIC(4,3),
  model TEXT,
  knowledge_hit_count INTEGER NOT NULL DEFAULT 0,
  retrieval_ms INTEGER NOT NULL DEFAULT 0,
  ai_ms INTEGER NOT NULL DEFAULT 0,
  total_ms INTEGER NOT NULL DEFAULT 0,
  fallback_used BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chatbot_ai_events_user_created_idx
  ON public.chatbot_ai_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS chatbot_ai_events_channel_created_idx
  ON public.chatbot_ai_events(channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS chatbot_ai_events_route_created_idx
  ON public.chatbot_ai_events(route, created_at DESC);

