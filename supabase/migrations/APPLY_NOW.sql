-- ============================================================================
-- COMPREHENSIVE MIGRATION: Add industry column to dashboard_users
-- ============================================================================
-- This script adds the industry column to dashboard_users table for multi-industry support
-- Run this in Supabase SQL Editor if you're getting schema cache errors

BEGIN;

-- 1. Add industry column to dashboard_users if it doesn't exist
ALTER TABLE IF EXISTS public.dashboard_users
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- 2. Update existing rows to have a default industry if NULL
UPDATE public.dashboard_users 
SET industry = 'barbershop' 
WHERE industry IS NULL;

-- 3. Make the column NOT NULL
ALTER TABLE IF EXISTS public.dashboard_users
ALTER COLUMN industry SET NOT NULL;

-- 4. Add comment to document the column
COMMENT ON COLUMN public.dashboard_users.industry IS 'Industry type: barbershop, clinic, fnb, therapy, etc.';

-- 5. Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS dashboard_users_industry_idx 
ON public.dashboard_users(industry);

-- 6. Verify the column was created successfully
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'dashboard_users'
  AND column_name = 'industry';

COMMIT;
