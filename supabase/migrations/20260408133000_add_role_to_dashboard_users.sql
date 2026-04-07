alter table public.dashboard_users
  add column if not exists role varchar(20) not null default 'member';
