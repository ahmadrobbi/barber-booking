-- Migration: Add industry column to support multi-industry booking
-- Created: 2026-04-15

-- Add industry column to bookings table
ALTER TABLE IF EXISTS bookings
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- Add comment
COMMENT ON COLUMN bookings.industry IS 'Industry type: barbershop, clinic, fnb, therapy, etc.';

-- Add industry column to user_sessions table
ALTER TABLE IF EXISTS user_sessions
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- Add comment
COMMENT ON COLUMN user_sessions.industry IS 'Industry type for session context';

-- Create index on industry for faster queries
CREATE INDEX IF NOT EXISTS bookings_industry_idx ON bookings(industry);
CREATE INDEX IF NOT EXISTS user_sessions_industry_idx ON user_sessions(industry);