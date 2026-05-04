-- Add WhatsApp official API support alongside existing Fonnte reminders.
-- Existing channels keep their current behavior; official fields are optional.

ALTER TABLE IF EXISTS public.whatsapp_channels
ADD COLUMN IF NOT EXISTS chatbot_provider VARCHAR(32) DEFAULT 'fonnte',
ADD COLUMN IF NOT EXISTS official_phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS official_access_token TEXT,
ADD COLUMN IF NOT EXISTS official_verify_token TEXT;

UPDATE public.whatsapp_channels
SET chatbot_provider = COALESCE(chatbot_provider, 'fonnte')
WHERE chatbot_provider IS NULL;

ALTER TABLE public.whatsapp_channels
ALTER COLUMN chatbot_provider SET DEFAULT 'fonnte';

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_channels_official_phone_number_id_key
  ON public.whatsapp_channels(official_phone_number_id)
  WHERE official_phone_number_id IS NOT NULL;

DO $$
BEGIN
  IF to_regclass('public.whatsapp_channels') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON COLUMN public.whatsapp_channels.chatbot_provider IS 'Outbound chatbot provider. Fonnte remains for reminders.';
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.whatsapp_channels.official_phone_number_id IS 'Meta WhatsApp Cloud API phone_number_id used to route official webhook events.';
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.whatsapp_channels.official_access_token IS 'Meta WhatsApp Cloud API access token for outbound chatbot replies.';
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.whatsapp_channels.official_verify_token IS 'Meta webhook verification token used for GET challenge responses.';
    $sql$;
  END IF;
END
$$;
