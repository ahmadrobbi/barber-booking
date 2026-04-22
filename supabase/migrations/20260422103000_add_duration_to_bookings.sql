-- Add duration tracking to bookings so slot conflict checks can use real service length.

ALTER TABLE IF EXISTS public.bookings
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60;

CREATE INDEX IF NOT EXISTS bookings_user_date_time_duration_idx
  ON public.bookings(user_id, tanggal, jam, duration_minutes);

CREATE INDEX IF NOT EXISTS bookings_channel_date_time_duration_idx
  ON public.bookings(channel_id, tanggal, jam, duration_minutes);
