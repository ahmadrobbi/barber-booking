CREATE TABLE IF NOT EXISTS public.user_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.dashboard_users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.user_branches(id) ON DELETE CASCADE,
  blackout_date DATE NOT NULL,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_blackout_dates_user_id_idx
  ON public.user_blackout_dates(user_id);

CREATE INDEX IF NOT EXISTS user_blackout_dates_branch_id_idx
  ON public.user_blackout_dates(branch_id);

CREATE INDEX IF NOT EXISTS user_blackout_dates_user_date_idx
  ON public.user_blackout_dates(user_id, blackout_date)
  WHERE branch_id IS NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS user_blackout_dates_user_branch_date_idx
  ON public.user_blackout_dates(user_id, branch_id, blackout_date)
  WHERE branch_id IS NOT NULL AND is_active = true;

DO $$
BEGIN
  IF to_regclass('public.user_blackout_dates') IS NOT NULL THEN
    EXECUTE $sql$
      COMMENT ON TABLE public.user_blackout_dates IS 'Tenant-scoped blackout dates and holidays used by booking flow and AI assistant.'
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.user_blackout_dates.blackout_date IS 'Date blocked for bookings.'
    $sql$;
    EXECUTE $sql$
      COMMENT ON COLUMN public.user_blackout_dates.branch_id IS 'Optional branch-specific blackout date.'
    $sql$;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_blackout_dates_updated_at ON public.user_blackout_dates;
CREATE TRIGGER update_user_blackout_dates_updated_at
  BEFORE UPDATE ON public.user_blackout_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
