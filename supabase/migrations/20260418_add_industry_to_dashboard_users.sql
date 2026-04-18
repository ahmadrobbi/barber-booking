-- Migration: Add industry column to dashboard_users for multi-industry support
-- Created: 2026-04-18

-- Add industry column to dashboard_users table
ALTER TABLE IF EXISTS dashboard_users
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- Add comment
COMMENT ON COLUMN dashboard_users.industry IS 'Industry type: barbershop, clinic, fnb, therapy, etc.';

-- Create index on industry for faster queries
CREATE INDEX IF NOT EXISTS dashboard_users_industry_idx ON dashboard_users(industry);
