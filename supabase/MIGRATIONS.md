# Supabase Migration Instructions

## ⚠️ Important: Apply Migrations to Supabase

The database migrations must be applied to your Supabase instance for the application to work correctly.

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to [https://supabase.com](https://supabase.com) and login to your project
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the migration SQL from files in `supabase/migrations/` folder
5. Click **Run**

### Option 2: Using Supabase CLI

```bash
supabase db push
```

### Option 3: Manual SQL Execution

1. Open **SQL Editor** in Supabase Dashboard
2. Run each migration file in order:
   - `20260408090000_create_dashboard_users.sql`
   - `20260408120000_add_no_hp_to_dashboard_users.sql`
   - `20260408133000_add_role_to_dashboard_users.sql`
   - `20260408233000_create_app_settings.sql`
   - `20260415_add_industry_column.sql`
   - `20260418150100_add_industry_to_dashboard_users.sql`
   - `20260418150200_create_user_profiles.sql`
   - `20260418150300_add_user_id_to_bookings.sql`
   - `20260418150400_phase1_multi_user_schema.sql`

## 🔧 Quick Fix: Apply All Migrations at Once

If you're getting "Could not find the 'industry' column" error, run this SQL in Supabase SQL Editor:

```sql
-- Ensure dashboard_users has all required columns
ALTER TABLE IF EXISTS public.dashboard_users
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

-- Add index for performance
CREATE INDEX IF NOT EXISTS dashboard_users_industry_idx 
ON public.dashboard_users(industry);

-- Verify column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'dashboard_users' 
  AND column_name = 'industry';
```

## 📋 Migration Files

| File | Purpose |
|------|---------|
| `20260408090000_create_dashboard_users.sql` | Create base dashboard users table |
| `20260408120000_add_no_hp_to_dashboard_users.sql` | Add WhatsApp number field |
| `20260408133000_add_role_to_dashboard_users.sql` | Add user role (admin/member) |
| `20260408233000_create_app_settings.sql` | Create app configuration table |
| `20260415_add_industry_column.sql` | Add industry field to bookings |
| `20260418150100_add_industry_to_dashboard_users.sql` | **Add industry to users** ⚠️ |
| `20260418150200_create_user_profiles.sql` | Create profile table for each dashboard user |
| `20260418150300_add_user_id_to_bookings.sql` | Add user ownership to bookings |
| `20260418150400_phase1_multi_user_schema.sql` | Multi-user dashboard tables |

## ✅ Verification

After applying migrations, verify in Supabase SQL Editor:

```sql
-- Check dashboard_users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'dashboard_users'
ORDER BY ordinal_position;

-- Check user_profiles table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_profiles';
```

## ❓ Need Help?

If you still get schema cache errors:
1. Refresh your browser
2. Wait 30 seconds for Supabase to update cache
3. Try the application again
