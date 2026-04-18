alter table if exists public.bookings
  add column if not exists user_id uuid references public.dashboard_users(id);

do $$
begin
  if to_regclass('public.bookings') is not null then
    execute $sql$
      create index if not exists bookings_user_id_idx on public.bookings(user_id)
    $sql$;
  end if;
end
$$;
