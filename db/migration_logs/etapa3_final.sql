-- ================================================================================
-- ETAPA 3: CRIAR appointments_services E FUNÇÃO
-- Execute após as Etapas 1 e 2
-- ================================================================================

BEGIN;

-- Criar tabela appointments_services
CREATE TABLE IF NOT EXISTS public.appointments_services (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id uuid NOT NULL,
    service_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    price decimal(10,2) NOT NULL DEFAULT 0.00,
    duration_minutes integer NOT NULL DEFAULT 30,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CHECK (price >= 0),
    CHECK (duration_minutes > 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_appointments_services_appointment 
ON public.appointments_services(appointment_id);

-- RLS
ALTER TABLE public.appointments_services ENABLE ROW LEVEL SECURITY;

-- Função current_unit_id
CREATE OR REPLACE FUNCTION public.current_unit_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT unit_default_id 
  FROM public.profiles 
  WHERE user_id = public.current_user_id()
  LIMIT 1;
$$;

-- Remover função antiga
DROP FUNCTION IF EXISTS public.current_unidade_id() CASCADE;

COMMIT;

-- Validação Etapa 3
SELECT 'Etapa 3 concluída' as status;
SELECT 'appointments_services criada' as tabela
WHERE EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_name = 'appointments_services');
              
SELECT 'current_unit_id criada' as funcao
WHERE EXISTS (SELECT 1 FROM information_schema.routines 
              WHERE routine_name = 'current_unit_id');
