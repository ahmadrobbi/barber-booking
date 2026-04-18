-- Migration: Add industry column to support multi-industry booking
-- Created: 2026-04-15

-- Add industry column to bookings table
ALTER TABLE IF EXISTS public.bookings
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- Add comment
DO $$
BEGIN
  IF to_regclass('public.bookings') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON COLUMN public.bookings.industry IS 'Industry type: barbershop, clinic, fnb, therapy, etc.'
    $sql$;
  END IF;
END
$$;

-- Add industry column to user_sessions table
ALTER TABLE IF EXISTS public.user_sessions
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- Add comment
DO $$
BEGIN
  IF to_regclass('public.user_sessions') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON COLUMN public.user_sessions.industry IS 'Industry type for session context'
    $sql$;
  END IF;
END
$$;

-- Create index on industry for faster queries
CREATE INDEX IF NOT EXISTS bookings_industry_idx ON public.bookings(industry);

DO $$
BEGIN
  IF to_regclass('public.user_sessions') IS NOT NULL THEN
    EXECUTE $sql$
      CREATE INDEX IF NOT EXISTS user_sessions_industry_idx ON public.user_sessions(industry)
    $sql$;
  END IF;
END
$$;
