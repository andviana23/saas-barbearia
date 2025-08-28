-- ================================================================================
-- CORREÇÃO SIMPLIFICADA - SEM COMANDOS PROBLEMÁTICOS
-- Data: 27/08/2025
-- Versão: Sem sintaxe que causa erro no PostgreSQL
-- ================================================================================

-- COMANDOS BÁSICOS E SEGUROS
BEGIN;

-- ================================================================================
-- 1. RENOMEAR COLUNAS CRÍTICAS (COMANDOS INDIVIDUAIS)
-- ================================================================================

-- 1.1 appointments.unidade_id -> unit_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'appointments' 
               AND column_name = 'unidade_id') THEN
        ALTER TABLE public.appointments RENAME COLUMN unidade_id TO unit_id;
        RAISE NOTICE 'appointments.unidade_id renomeada para unit_id';
    END IF;
END $$;

-- 1.2 profiles.unidade_default_id -> unit_default_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'profiles' 
               AND column_name = 'unidade_default_id') THEN
        ALTER TABLE public.profiles RENAME COLUMN unidade_default_id TO unit_default_id;
        RAISE NOTICE 'profiles.unidade_default_id renomeada para unit_default_id';
    END IF;
END $$;

-- 1.3 customers.nome -> name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'customers' 
               AND column_name = 'nome') THEN
        ALTER TABLE public.customers RENAME COLUMN nome TO name;
        RAISE NOTICE 'customers.nome renomeada para name';
    END IF;
END $$;

-- 1.4 professionals.nome -> name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'professionals' 
               AND column_name = 'nome') THEN
        ALTER TABLE public.professionals RENAME COLUMN nome TO name;
        RAISE NOTICE 'professionals.nome renomeada para name';
    END IF;
END $$;

-- 1.5 professionals.papel -> role
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'professionals' 
               AND column_name = 'papel') THEN
        ALTER TABLE public.professionals RENAME COLUMN papel TO role;
        RAISE NOTICE 'professionals.papel renomeada para role';
    END IF;
END $$;

-- ================================================================================
-- 2. RENOMEAR TABELAS (COMANDOS INDIVIDUAIS)
-- ================================================================================

-- 2.1 financeiro_mov -> financial_transactions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'financeiro_mov') THEN
        ALTER TABLE public.financeiro_mov RENAME TO financial_transactions;
        RAISE NOTICE 'Tabela financeiro_mov renomeada para financial_transactions';
    END IF;
END $$;

-- 2.2 notificacoes -> notifications
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'notificacoes') THEN
        ALTER TABLE public.notificacoes RENAME TO notifications;
        RAISE NOTICE 'Tabela notificacoes renomeada para notifications';
    END IF;
END $$;

-- 2.3 assinaturas -> remover (subscriptions já existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'assinaturas') THEN
        DROP TABLE IF EXISTS public.assinaturas CASCADE;
        RAISE NOTICE 'Tabela assinaturas removida';
    END IF;
END $$;

-- ================================================================================
-- 3. CRIAR appointments_services (SINTAXE LIMPA)
-- ================================================================================

-- 3.1 Criar tabela se não existe
CREATE TABLE IF NOT EXISTS public.appointments_services (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id uuid NOT NULL,
    service_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    price decimal(10,2) NOT NULL DEFAULT 0.00,
    duration_minutes integer NOT NULL DEFAULT 30,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3.2 Adicionar constraints se tabela foi criada
DO $$
BEGIN
    -- Adicionar constraint de preço positivo
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                   WHERE conname = 'appointments_services_price_positive') THEN
        ALTER TABLE public.appointments_services 
        ADD CONSTRAINT appointments_services_price_positive CHECK (price >= 0);
    END IF;
    
    -- Adicionar constraint de duração positiva
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                   WHERE conname = 'appointments_services_duration_positive') THEN
        ALTER TABLE public.appointments_services 
        ADD CONSTRAINT appointments_services_duration_positive CHECK (duration_minutes > 0);
    END IF;
END $$;

-- 3.3 Criar índices
CREATE INDEX IF NOT EXISTS idx_appointments_services_appointment 
ON public.appointments_services(appointment_id);

CREATE INDEX IF NOT EXISTS idx_appointments_services_service 
ON public.appointments_services(service_id);

CREATE INDEX IF NOT EXISTS idx_appointments_services_professional 
ON public.appointments_services(professional_id);

-- 3.4 Habilitar RLS
ALTER TABLE public.appointments_services ENABLE ROW LEVEL SECURITY;

-- ================================================================================
-- 4. CRIAR FUNÇÃO current_unit_id
-- ================================================================================

-- 4.1 Criar função
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

-- 4.2 Remover função antiga
DROP FUNCTION IF EXISTS public.current_unidade_id() CASCADE;

COMMIT;

-- ================================================================================
-- VALIDAÇÕES
-- ================================================================================

-- Verificar colunas renomeadas
SELECT 'VALIDAÇÃO: Colunas críticas' as status;
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND ((table_name = 'appointments' AND column_name = 'unit_id') OR
       (table_name = 'profiles' AND column_name = 'unit_default_id') OR
       (table_name = 'customers' AND column_name = 'name') OR
       (table_name = 'professionals' AND column_name IN ('name', 'role')))
ORDER BY table_name, column_name;

-- Verificar tabelas principais
SELECT 'VALIDAÇÃO: Tabelas principais' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('appointments', 'appointments_services', 'customers', 
                     'professionals', 'financial_transactions', 'notifications')
ORDER BY table_name;

-- Verificar função
SELECT 'VALIDAÇÃO: Função current_unit_id' as status;
SELECT routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'current_unit_id';

-- ================================================================================
-- FIM - VERSÃO SIMPLIFICADA
-- ================================================================================
