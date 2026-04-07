create extension if not exists pgcrypto;

create table if not exists public.dashboard_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists dashboard_users_email_idx
  on public.dashboard_users (email);
