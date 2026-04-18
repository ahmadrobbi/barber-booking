alter table public.dashboard_users
  add column if not exists industry varchar(50) default 'barbershop';

create index if not exists dashboard_users_industry_idx on public.dashboard_users(industry);
