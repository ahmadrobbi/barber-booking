alter table public.dashboard_users
  add column if not exists no_hp varchar(20);

alter table public.dashboard_users
  alter column no_hp type varchar(20);
