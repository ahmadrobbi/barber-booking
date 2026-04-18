-- Phase 1: Multi-User Dashboard Schema Updates
-- Add user_id column to bookings table for user isolation
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES dashboard_users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id);

-- Create user_profiles table for business information
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES dashboard_users(id) ON DELETE CASCADE,
  business_name TEXT,
  business_description TEXT,
  logo_url TEXT,
  website_url TEXT,
  social_media JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  business_hours JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_transactions table for payment/subscription tracking
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES dashboard_users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'subscription', 'payment', 'refund', 'commission'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  payment_method VARCHAR(50),
  description TEXT,
  reference_id VARCHAR(255), -- external payment reference
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_landing_pages table for personalized landing pages
CREATE TABLE IF NOT EXISTS user_landing_pages (
  user_id UUID PRIMARY KEY REFERENCES dashboard_users(id) ON DELETE CASCADE,
  subdomain VARCHAR(100) UNIQUE,
  custom_domain VARCHAR(255),
  template VARCHAR(50) DEFAULT 'default',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_transactions_user_id_idx ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS user_transactions_type_idx ON user_transactions(type);
CREATE INDEX IF NOT EXISTS user_transactions_status_idx ON user_transactions(status);
CREATE INDEX IF NOT EXISTS user_landing_pages_subdomain_idx ON user_landing_pages(subdomain);
CREATE INDEX IF NOT EXISTS user_landing_pages_custom_domain_idx ON user_landing_pages(custom_domain);

-- Update trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_transactions_updated_at ON user_transactions;
CREATE TRIGGER update_user_transactions_updated_at
  BEFORE UPDATE ON user_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_landing_pages_updated_at ON user_landing_pages;
CREATE TRIGGER update_user_landing_pages_updated_at
  BEFORE UPDATE ON user_landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();