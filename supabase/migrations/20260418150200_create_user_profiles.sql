create table if not exists public.user_profiles (
  user_id uuid primary key references public.dashboard_users(id) on delete cascade,
  business_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);