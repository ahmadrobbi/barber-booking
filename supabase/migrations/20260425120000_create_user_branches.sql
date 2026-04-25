CREATE TABLE IF NOT EXISTS public.user_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.dashboard_users(id) ON DELETE CASCADE,
  name text NOT NULL,
  code character varying,
  address text,
  phone character varying,
  is_active boolean NOT NULL DEFAULT true,
  business_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_branches_user_id_idx
  ON public.user_branches(user_id);

CREATE INDEX IF NOT EXISTS user_branches_user_id_is_active_idx
  ON public.user_branches(user_id, is_active);

CREATE UNIQUE INDEX IF NOT EXISTS user_branches_user_id_name_unique_idx
  ON public.user_branches(user_id, lower(name));

CREATE UNIQUE INDEX IF NOT EXISTS user_branches_user_id_code_unique_idx
  ON public.user_branches(user_id, lower(code))
  WHERE code IS NOT NULL;
