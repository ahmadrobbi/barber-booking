-- Multi-channel WhatsApp foundation
-- Created: 2026-04-19

CREATE TABLE IF NOT EXISTS public.whatsapp_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.dashboard_users(id) ON DELETE CASCADE,
  device_number VARCHAR(32) NOT NULL,
  device_name TEXT,
  fonnte_device_token TEXT,
  webhook_secret TEXT,
  industry VARCHAR(50) DEFAULT 'barbershop',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  template_overrides JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.whatsapp_channels
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.dashboard_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS device_number VARCHAR(32),
ADD COLUMN IF NOT EXISTS device_name TEXT,
ADD COLUMN IF NOT EXISTS fonnte_device_token TEXT,
ADD COLUMN IF NOT EXISTS webhook_secret TEXT,
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_overrides JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.whatsapp_channels
SET device_number = regexp_replace(COALESCE(device_number, ''), '[^0-9]', '', 'g')
WHERE device_number IS DISTINCT FROM regexp_replace(COALESCE(device_number, ''), '[^0-9]', '', 'g');

ALTER TABLE public.whatsapp_channels
ALTER COLUMN device_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_channels_device_number_key
  ON public.whatsapp_channels(device_number);
CREATE INDEX IF NOT EXISTS whatsapp_channels_user_id_idx
  ON public.whatsapp_channels(user_id);
CREATE INDEX IF NOT EXISTS whatsapp_channels_industry_idx
  ON public.whatsapp_channels(industry);
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_channels_default_per_user_idx
  ON public.whatsapp_channels(user_id)
  WHERE is_default = true;

ALTER TABLE IF EXISTS public.user_sessions
ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.whatsapp_channels(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.bookings
ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.whatsapp_channels(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS user_sessions_channel_id_idx
  ON public.user_sessions(channel_id);
CREATE INDEX IF NOT EXISTS bookings_channel_id_idx
  ON public.bookings(channel_id);
CREATE INDEX IF NOT EXISTS bookings_user_date_time_idx
  ON public.bookings(user_id, tanggal, jam);
CREATE INDEX IF NOT EXISTS bookings_channel_date_time_idx
  ON public.bookings(channel_id, tanggal, jam);

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname
  INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.user_sessions'::regclass
    AND contype = 'u'
    AND pg_get_constraintdef(oid) = 'UNIQUE (sender)';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format(
      'ALTER TABLE public.user_sessions DROP CONSTRAINT %I',
      constraint_name
    );
  END IF;
END
$$;

DROP INDEX IF EXISTS public.user_sessions_sender_key;
DROP INDEX IF EXISTS public.user_sessions_sender_idx;

CREATE INDEX IF NOT EXISTS user_sessions_sender_idx
  ON public.user_sessions(sender);
CREATE UNIQUE INDEX IF NOT EXISTS user_sessions_sender_null_channel_id_key
  ON public.user_sessions(sender)
  WHERE channel_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS user_sessions_sender_channel_id_key
  ON public.user_sessions(sender, channel_id)
  WHERE channel_id IS NOT NULL;

DO $$
BEGIN
  IF to_regclass('public.whatsapp_channels') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON TABLE public.whatsapp_channels IS 'Mapped WhatsApp devices per dashboard user for multi-tenant webhook routing.'
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.whatsapp_channels.device_number IS 'Normalized Fonnte device identifier used to route incoming webhooks.'
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.whatsapp_channels.fonnte_device_token IS 'Per-device Fonnte API token for outbound messages.'
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.whatsapp_channels.template_overrides IS 'Per-channel chatbot template overrides.'
    $sql$;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_whatsapp_channels_updated_at ON public.whatsapp_channels;
CREATE TRIGGER update_whatsapp_channels_updated_at
  BEFORE UPDATE ON public.whatsapp_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
