-- Add customer name and multi-service support for MVP public bookings
-- Created: 2026-04-23

ALTER TABLE IF EXISTS public.bookings
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS service_codes JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.bookings
SET service_codes = CASE
  WHEN service_codes IS NULL OR service_codes = 'null'::jsonb THEN '[]'::jsonb
  ELSE service_codes
END;

ALTER TABLE IF EXISTS public.bookings
ALTER COLUMN service_codes SET DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS bookings_customer_name_idx
  ON public.bookings(customer_name);

DO $$
BEGIN
  IF to_regclass('public.bookings') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON COLUMN public.bookings.customer_name IS 'Customer-facing display name for a booking.'
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.bookings.service_codes IS 'JSON array of selected tenant service codes for multi-service bookings.'
    $sql$;
  END IF;
END
$$;
