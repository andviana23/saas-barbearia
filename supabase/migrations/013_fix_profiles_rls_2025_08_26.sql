-- 013_fix_profiles_rls_2025_08_26.sql

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes (se existirem) – compatível com PG 15+
DROP POLICY IF EXISTS profiles_select_owner ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_owner ON public.profiles;
DROP POLICY IF EXISTS profiles_update_owner ON public.profiles;

-- Políticas “somente dono”
CREATE POLICY profiles_select_owner
  ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY profiles_insert_owner
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_update_owner
  ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


