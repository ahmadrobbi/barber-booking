-- Fix missing industry column on dashboard_users in production.
-- Earlier migration history already marked 20260418 as applied, so this
-- follow-up migration ensures the column actually exists.

ALTER TABLE IF EXISTS public.dashboard_users
ADD COLUMN IF NOT EXISTS industry VARCHAR(50) DEFAULT 'barbershop';

UPDATE public.dashboard_users
SET industry = 'barbershop'
WHERE industry IS NULL;

COMMENT ON COLUMN public.dashboard_users.industry IS 'Industry type: barbershop, clinic, fnb, therapy, etc.';

CREATE INDEX IF NOT EXISTS dashboard_users_industry_idx
ON public.dashboard_users(industry);

NOTIFY pgrst, 'reload schema';
