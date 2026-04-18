alter table public.bookings
  add column if not exists user_id uuid references public.dashboard_users(id);

create index if not exists bookings_user_id_idx on public.bookings(user_id);