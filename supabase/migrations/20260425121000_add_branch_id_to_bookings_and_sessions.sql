ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS branch_id uuid;

ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS branch_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_branch_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_branch_id_fkey
      FOREIGN KEY (branch_id) REFERENCES public.user_branches(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_sessions_branch_id_fkey'
  ) THEN
    ALTER TABLE public.user_sessions
      ADD CONSTRAINT user_sessions_branch_id_fkey
      FOREIGN KEY (branch_id) REFERENCES public.user_branches(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS bookings_user_id_branch_id_idx
  ON public.bookings(user_id, branch_id);

CREATE INDEX IF NOT EXISTS bookings_branch_id_tanggal_jam_idx
  ON public.bookings(branch_id, tanggal, jam);

CREATE INDEX IF NOT EXISTS user_sessions_sender_channel_branch_idx
  ON public.user_sessions(sender, channel_id, branch_id);
