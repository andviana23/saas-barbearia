-- ================================================================================
-- ETAPA 1: APENAS RENOMEAR COLUNAS CRÍTICAS
-- Execute esta etapa primeiro
-- ================================================================================

BEGIN;

-- appointments.unidade_id -> unit_id (MAIS CRÍTICO)
ALTER TABLE public.appointments RENAME COLUMN unidade_id TO unit_id;

-- profiles.unidade_default_id -> unit_default_id  
ALTER TABLE public.profiles RENAME COLUMN unidade_default_id TO unit_default_id;

-- customers.nome -> name
ALTER TABLE public.customers RENAME COLUMN nome TO name;

-- professionals.nome -> name
ALTER TABLE public.professionals RENAME COLUMN nome TO name;

-- professionals.papel -> role
ALTER TABLE public.professionals RENAME COLUMN papel TO role;

COMMIT;

-- Validação Etapa 1
SELECT 'Etapa 1 concluída' as status;
SELECT table_name, column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND ((table_name = 'appointments' AND column_name = 'unit_id') OR
       (table_name = 'profiles' AND column_name = 'unit_default_id') OR
       (table_name = 'customers' AND column_name = 'name') OR
       (table_name = 'professionals' AND column_name IN ('name', 'role')));
