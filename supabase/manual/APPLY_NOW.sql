-- COMPREHENSIVE MIGRATION: Add industry column to dashboard_users
--
-- This file is kept for manual execution in the Supabase SQL Editor.
-- It is intentionally outside supabase/migrations so `supabase db push`
-- only processes timestamped migration files.

-- 1. Add industry column to dashboard_users if it doesn't exist
ALTER TABLE IF EXISTS public.dashboard_users
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- 2. Update existing rows to have a default industry if NULL
UPDATE public.dashboard_users
SET industry = 'barbershop'
WHERE industry IS NULL;

-- 3. Make industry required for future rows
ALTER TABLE IF EXISTS public.dashboard_users
ALTER COLUMN industry SET NOT NULL;

-- 4. Document the column
COMMENT ON COLUMN public.dashboard_users.industry IS 'Industry type: barbershop, clinic, fnb, therapy, etc.';

-- 5. Add index for performance
CREATE INDEX IF NOT EXISTS dashboard_users_industry_idx
ON public.dashboard_users(industry);

-- 6. Verify the column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'dashboard_users'
  AND column_name = 'industry';
