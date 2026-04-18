alter table public.dashboard_users
  add column if not exists industry varchar(50) default 'barbershop';