-- Migration: Add industry column to dashboard_users for multi-industry support
-- Created: 2026-04-18
-- Adds industry tracking to support multi-industry booking platform

-- Add industry column to dashboard_users table
ALTER TABLE IF EXISTS public.dashboard_users
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- Add comment to document the column
COMMENT ON COLUMN public.dashboard_users.industry IS 'Industry type: barbershop, clinic, fnb, therapy, etc.';

-- Create index on industry for faster queries and foreign key relationships
CREATE INDEX IF NOT EXISTS dashboard_users_industry_idx ON public.dashboard_users(industry);

-- Verify column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'dashboard_users' AND column_name = 'industry';
