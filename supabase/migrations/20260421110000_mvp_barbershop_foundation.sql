-- MVP foundation for per-user WhatsApp channels and tenant-scoped booking flow
-- Safe to apply on top of the current production schema.

-- 1) Strengthen tenant ownership on chatbot session state.
ALTER TABLE IF EXISTS public.user_sessions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.dashboard_users(id) ON DELETE CASCADE;

UPDATE public.user_sessions AS sessions
SET user_id = channels.user_id
FROM public.whatsapp_channels AS channels
WHERE sessions.channel_id = channels.id
  AND sessions.user_id IS NULL
  AND channels.user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx
  ON public.user_sessions(user_id);

CREATE INDEX IF NOT EXISTS user_sessions_user_channel_idx
  ON public.user_sessions(user_id, channel_id);

-- 2) Prepare bookings for explicit source tracking and safer tenant queries.
ALTER TABLE IF EXISTS public.bookings
ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'wa_chat';

UPDATE public.bookings
SET source = 'wa_chat'
WHERE source IS NULL;

ALTER TABLE IF EXISTS public.bookings
ALTER COLUMN source SET DEFAULT 'wa_chat';

CREATE INDEX IF NOT EXISTS bookings_user_status_date_idx
  ON public.bookings(user_id, status, tanggal);

CREATE INDEX IF NOT EXISTS bookings_channel_status_date_idx
  ON public.bookings(channel_id, status, tanggal);

CREATE INDEX IF NOT EXISTS bookings_source_idx
  ON public.bookings(source);

-- 3) Add a tenant-level services catalog for the barbershop MVP.
CREATE TABLE IF NOT EXISTS public.user_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.dashboard_users(id) ON DELETE CASCADE,
  code VARCHAR(64) NOT NULL,
  name TEXT NOT NULL,
  price BIGINT NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_services_user_code_key
  ON public.user_services(user_id, code);

CREATE INDEX IF NOT EXISTS user_services_user_active_idx
  ON public.user_services(user_id, is_active, sort_order);

DO $$
BEGIN
  IF to_regclass('public.user_services') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON TABLE public.user_services IS 'Tenant-owned service catalog used by the booking flow.'
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.user_services.code IS 'Stable per-tenant service code exposed to the application.'
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.user_services.duration_minutes IS 'Service duration used for future scheduling rules.'
    $sql$;
  END IF;
END
$$;

-- 4) Seed default services for existing barbershop tenants when no custom services exist yet.
INSERT INTO public.user_services (user_id, code, name, price, duration_minutes, sort_order)
SELECT
  users.id,
  seeded.code,
  seeded.name,
  seeded.price,
  seeded.duration_minutes,
  seeded.sort_order
FROM public.dashboard_users AS users
CROSS JOIN (
  VALUES
    ('haircut', 'Haircut', 50000::bigint, 60, 1),
    ('haircut_beard', 'Haircut + Beard Trim', 75000::bigint, 75, 2),
    ('kids_haircut', 'Kids Haircut', 40000::bigint, 45, 3)
) AS seeded(code, name, price, duration_minutes, sort_order)
WHERE COALESCE(users.industry, 'barbershop') = 'barbershop'
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_services AS services
    WHERE services.user_id = users.id
  )
ON CONFLICT (user_id, code) DO NOTHING;

-- 5) Normalize landing page routing keys for tenant-aware public booking pages.
UPDATE public.user_landing_pages
SET subdomain = lower(regexp_replace(subdomain, '[^a-zA-Z0-9-]', '', 'g'))
WHERE subdomain IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_landing_pages_subdomain_lower_key
  ON public.user_landing_pages ((lower(subdomain)))
  WHERE subdomain IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_landing_pages_custom_domain_lower_key
  ON public.user_landing_pages ((lower(custom_domain)))
  WHERE custom_domain IS NOT NULL;

-- 6) Add safe uniqueness protection for slot collisions when current data allows it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM (
      SELECT user_id, tanggal, jam
      FROM public.bookings
      WHERE user_id IS NOT NULL
        AND tanggal IS NOT NULL
        AND jam IS NOT NULL
        AND status IN ('pending', 'confirmed')
      GROUP BY user_id, tanggal, jam
      HAVING COUNT(*) > 1
    ) duplicated_slots
  ) THEN
    EXECUTE $sql$
      CREATE UNIQUE INDEX IF NOT EXISTS bookings_user_active_slot_key
      ON public.bookings(user_id, tanggal, jam)
      WHERE user_id IS NOT NULL
        AND tanggal IS NOT NULL
        AND jam IS NOT NULL
        AND status IN ('pending', 'confirmed')
    $sql$;
  ELSE
    RAISE NOTICE 'Skipping bookings_user_active_slot_key because duplicate active slots already exist.';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM (
      SELECT channel_id, tanggal, jam
      FROM public.bookings
      WHERE channel_id IS NOT NULL
        AND tanggal IS NOT NULL
        AND jam IS NOT NULL
        AND status IN ('pending', 'confirmed')
      GROUP BY channel_id, tanggal, jam
      HAVING COUNT(*) > 1
    ) duplicated_slots
  ) THEN
    EXECUTE $sql$
      CREATE UNIQUE INDEX IF NOT EXISTS bookings_channel_active_slot_key
      ON public.bookings(channel_id, tanggal, jam)
      WHERE channel_id IS NOT NULL
        AND tanggal IS NOT NULL
        AND jam IS NOT NULL
        AND status IN ('pending', 'confirmed')
    $sql$;
  ELSE
    RAISE NOTICE 'Skipping bookings_channel_active_slot_key because duplicate active channel slots already exist.';
  END IF;
END
$$;

-- 7) updated_at trigger for the new services table.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_services_updated_at ON public.user_services;
CREATE TRIGGER update_user_services_updated_at
  BEFORE UPDATE ON public.user_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
