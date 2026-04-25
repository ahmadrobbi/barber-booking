DROP INDEX IF EXISTS public.bookings_user_active_slot_key;
DROP INDEX IF EXISTS public.bookings_channel_active_slot_key;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT user_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid) AS scoped_branch_id, tanggal, jam, COUNT(*) AS total
      FROM public.bookings
      WHERE user_id IS NOT NULL
        AND status IN ('pending', 'confirmed')
        AND tanggal IS NOT NULL
        AND jam IS NOT NULL
      GROUP BY user_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid), tanggal, jam
      HAVING COUNT(*) > 1
    ) duplicates
  ) THEN
    RAISE NOTICE 'Skipping bookings_user_branch_active_slot_key because duplicate active scoped slots already exist.';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS bookings_user_branch_active_slot_key
      ON public.bookings(user_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid), tanggal, jam)
      WHERE user_id IS NOT NULL
        AND status IN ('pending', 'confirmed')
        AND tanggal IS NOT NULL
        AND jam IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT channel_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid) AS scoped_branch_id, tanggal, jam, COUNT(*) AS total
      FROM public.bookings
      WHERE channel_id IS NOT NULL
        AND status IN ('pending', 'confirmed')
        AND tanggal IS NOT NULL
        AND jam IS NOT NULL
      GROUP BY channel_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid), tanggal, jam
      HAVING COUNT(*) > 1
    ) duplicates
  ) THEN
    RAISE NOTICE 'Skipping bookings_channel_branch_active_slot_key because duplicate active scoped channel slots already exist.';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS bookings_channel_branch_active_slot_key
      ON public.bookings(channel_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid), tanggal, jam)
      WHERE channel_id IS NOT NULL
        AND status IN ('pending', 'confirmed')
        AND tanggal IS NOT NULL
        AND jam IS NOT NULL;
  END IF;
END $$;
