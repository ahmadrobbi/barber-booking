-- Add customer name to chatbot session state
-- Created: 2026-04-25

ALTER TABLE IF EXISTS public.user_sessions
ADD COLUMN IF NOT EXISTS customer_name TEXT;

CREATE INDEX IF NOT EXISTS user_sessions_customer_name_idx
  ON public.user_sessions(customer_name);

DO $$
BEGIN
  IF to_regclass('public.user_sessions') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON COLUMN public.user_sessions.customer_name IS 'Temporary customer name captured during WhatsApp chatbot booking flow.'
    $sql$;
  END IF;
END
$$;
