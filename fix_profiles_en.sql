-- ================================================================================
-- MIGRAÇÃO EMERGENCIAL: PROFILES PT → EN
-- Data: 27/08/2025
-- Objetivo: Corrigir erros 42703 nos SELECTs de profiles
-- ================================================================================

BEGIN;

-- 1. Renomear colunas em profiles para inglês
ALTER TABLE public.profiles RENAME COLUMN nome TO name;
ALTER TABLE public.profiles RENAME COLUMN telefone TO phone;
ALTER TABLE public.profiles RENAME COLUMN papel TO role;

-- 2. Atualizar função current_unit_id para usar nova estrutura
CREATE OR REPLACE FUNCTION public.current_unit_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT unidade_default_id 
  FROM public.profiles 
  WHERE user_id = public.current_user_id()
  LIMIT 1;
$$;

-- 3. Verificar/criar policy RLS para profiles
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 4. Verificar se RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ================================================================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO
-- ================================================================================

-- Teste básico: Verificar se as colunas foram renomeadas
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public' 
  AND column_name IN ('name', 'phone', 'role', 'nome', 'telefone', 'papel');

-- Teste RLS: Verificar se policy está ativa
SELECT 
  polname, 
  polcmd, 
  polroles,
  polqual
FROM pg_policy 
WHERE polrelid = 'public.profiles'::regclass;
