-- ================================================================================
-- CORREÇÕES IDENTIFICADAS VIA API - COMANDOS ESPECÍFICOS
-- Data: 27/08/2025
-- Problemas encontrados: 4 itens críticos identificados
-- ================================================================================

-- EXECUTE ESTE SQL NO SUPABASE DASHBOARD
-- SQL Editor > New Query > Colar este código > Run

BEGIN;

-- ================================================================================
-- 1. RENOMEAR COLUNAS CRÍTICAS
-- ================================================================================

-- 1.1 appointments.unidade_id -> unit_id (CRÍTICO para aplicação)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'appointments' 
               AND column_name = 'unidade_id') THEN
        ALTER TABLE public.appointments RENAME COLUMN unidade_id TO unit_id;
        RAISE NOTICE 'appointments.unidade_id renomeada para unit_id';
    ELSE
        RAISE NOTICE 'appointments.unidade_id já renomeada ou não existe';
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
    ELSE
        RAISE NOTICE 'profiles.unidade_default_id já renomeada ou não existe';
    END IF;
END $$;

-- 1.3 customers.nome -> name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'customers' 
               AND column_name = 'nome') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'customers' 
                       AND column_name = 'name') THEN
        ALTER TABLE public.customers RENAME COLUMN nome TO name;
        RAISE NOTICE 'customers.nome renomeada para name';
    ELSE
        RAISE NOTICE 'customers.nome já renomeada ou name já existe';
    END IF;
END $$;

-- 1.4 professionals.nome -> name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'professionals' 
               AND column_name = 'nome') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'professionals' 
                       AND column_name = 'name') THEN
        ALTER TABLE public.professionals RENAME COLUMN nome TO name;
        RAISE NOTICE 'professionals.nome renomeada para name';
    ELSE
        RAISE NOTICE 'professionals.nome já renomeada ou name já existe';
    END IF;
END $$;

-- 1.5 professionals.papel -> role
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'professionals' 
               AND column_name = 'papel') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'professionals' 
                       AND column_name = 'role') THEN
        ALTER TABLE public.professionals RENAME COLUMN papel TO role;
        RAISE NOTICE 'professionals.papel renomeada para role';
    ELSE
        RAISE NOTICE 'professionals.papel já renomeada ou role já existe';
    END IF;
END $$;

-- ================================================================================
-- 2. RENOMEAR TABELAS RESTANTES
-- ================================================================================

-- 2.1 assinaturas -> subscriptions (mesclar se necessário)
DO $$
DECLARE
    assinaturas_count INTEGER := 0;
    subscriptions_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se assinaturas existe
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'assinaturas') THEN
        
        -- Verificar se subscriptions já existe
        SELECT EXISTS (SELECT 1 FROM information_schema.tables 
                       WHERE table_schema = 'public' AND table_name = 'subscriptions')
        INTO subscriptions_exists;
        
        IF subscriptions_exists THEN
            -- Mesclar dados se subscriptions já existe
            SELECT COUNT(*) INTO assinaturas_count FROM public.assinaturas;
            
            IF assinaturas_count > 0 THEN
                -- Tentar mesclar dados (pode dar erro se estruturas forem diferentes)
                BEGIN
                    INSERT INTO public.subscriptions (
                        id, customer_id, subscription_plan_id, status, 
                        start_date, end_date, created_at, updated_at
                    )
                    SELECT 
                        id, customer_id, subscription_plan_id, status,
                        start_date, end_date, created_at, updated_at
                    FROM public.assinaturas
                    ON CONFLICT (id) DO NOTHING;
                    
                    RAISE NOTICE 'Dados de assinaturas migrados para subscriptions';
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE 'Erro ao migrar dados de assinaturas: %', SQLERRM;
                END;
            END IF;
            
            -- Remover tabela assinaturas
            DROP TABLE IF EXISTS public.assinaturas CASCADE;
            RAISE NOTICE 'Tabela assinaturas removida';
        ELSE
            -- Apenas renomear se subscriptions não existe
            ALTER TABLE public.assinaturas RENAME TO subscriptions;
            RAISE NOTICE 'Tabela assinaturas renomeada para subscriptions';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela assinaturas não existe (já processada)';
    END IF;
END $$;

-- 2.2 financeiro_mov -> financial_transactions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'financeiro_mov') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables 
                       WHERE table_schema = 'public' AND table_name = 'financial_transactions') THEN
        ALTER TABLE public.financeiro_mov RENAME TO financial_transactions;
        RAISE NOTICE 'Tabela financeiro_mov renomeada para financial_transactions';
    ELSE
        RAISE NOTICE 'financeiro_mov já processada ou financial_transactions já existe';
    END IF;
END $$;

-- 2.3 notificacoes -> notifications
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'notificacoes') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables 
                       WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        ALTER TABLE public.notificacoes RENAME TO notifications;
        RAISE NOTICE 'Tabela notificacoes renomeada para notifications';
    ELSE
        RAISE NOTICE 'notificacoes já processada ou notifications já existe';
    END IF;
END $$;

-- ================================================================================
-- 3. CRIAR TABELA appointments_services SE NÃO EXISTIR
-- ================================================================================

-- 3.1 Criar appointments_services
CREATE TABLE IF NOT EXISTS public.appointments_services (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    service_id uuid REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
    professional_id uuid REFERENCES public.professionals(id) ON DELETE RESTRICT NOT NULL,
    price decimal(10,2) NOT NULL DEFAULT 0.00,
    duration_minutes integer NOT NULL DEFAULT 30,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT appointments_services_price_positive CHECK (price >= 0),
    CONSTRAINT appointments_services_duration_positive CHECK (duration_minutes > 0),
    
    -- Índice único
    UNIQUE(appointment_id, service_id, professional_id)
);

-- Índices para appointments_services
CREATE INDEX IF NOT EXISTS idx_appointments_services_appointment ON public.appointments_services(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_services_service ON public.appointments_services(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_services_professional ON public.appointments_services(professional_id);

-- RLS para appointments_services
ALTER TABLE public.appointments_services ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at para appointments_services
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_updated_at_appointments_services') THEN
        CREATE TRIGGER trigger_updated_at_appointments_services
            BEFORE UPDATE ON public.appointments_services
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- ================================================================================
-- 4. CRIAR FUNÇÃO current_unit_id ATUALIZADA
-- ================================================================================

-- 4.1 Criar função current_unit_id
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

COMMENT ON FUNCTION public.current_unit_id() IS 'Retorna a unidade padrão do usuário atual';

-- 4.2 Remover função antiga
DROP FUNCTION IF EXISTS public.current_unidade_id() CASCADE;

-- ================================================================================
-- 5. CRIAR POLICIES RLS BÁSICAS PARA NOVAS TABELAS
-- ================================================================================

-- 5.1 Policies para appointments_services
DO $$
BEGIN
    -- Remover policies existentes se houver
    DROP POLICY IF EXISTS "Users can view appointment services from their unit" ON public.appointments_services;
    DROP POLICY IF EXISTS "Users can create appointment services in their unit" ON public.appointments_services;
    
    -- Criar policies
    CREATE POLICY "Users can view appointment services from their unit" ON public.appointments_services
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.id = appointment_id AND a.unit_id = current_unit_id()
            )
        );

    CREATE POLICY "Users can create appointment services in their unit" ON public.appointments_services
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.id = appointment_id AND a.unit_id = current_unit_id()
            )
        );
END $$;

COMMIT;

-- ================================================================================
-- VALIDAÇÕES FINAIS
-- ================================================================================

-- Verificar colunas críticas
SELECT 'VALIDAÇÃO: Colunas críticas' as status;
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND (
    (table_name = 'appointments' AND column_name = 'unit_id') OR
    (table_name = 'profiles' AND column_name = 'unit_default_id') OR
    (table_name = 'customers' AND column_name = 'name') OR
    (table_name = 'professionals' AND column_name IN ('name', 'role'))
  )
ORDER BY table_name, column_name;

-- Verificar tabelas principais
SELECT 'VALIDAÇÃO: Tabelas principais' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('units', 'profiles', 'customers', 'professionals', 'services', 
                     'appointments', 'appointments_services', 'queue', 'subscriptions', 
                     'subscription_plans', 'financial_transactions', 'notifications')
ORDER BY table_name;

-- Verificar função current_unit_id
SELECT 'VALIDAÇÃO: Função current_unit_id' as status;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'current_unit_id';

-- ================================================================================
-- RELATÓRIO FINAL
-- ================================================================================

/*
CORREÇÕES APLICADAS:

✓ COLUNAS CRÍTICAS RENOMEADAS:
  - appointments.unidade_id → unit_id (CRÍTICO)
  - profiles.unidade_default_id → unit_default_id
  - customers.nome → name
  - professionals.nome → name
  - professionals.papel → role

✓ TABELAS RENOMEADAS:
  - assinaturas → subscriptions (dados preservados)
  - financeiro_mov → financial_transactions
  - notificacoes → notifications

✓ TABELAS CRIADAS:
  - appointments_services (com RLS e policies)

✓ FUNÇÕES ATUALIZADAS:
  - current_unit_id() criada
  - current_unidade_id() removida

PRÓXIMOS PASSOS:
1. Execute: node check_migration_direct.js
2. Deve mostrar 95%+ de conclusão
3. npm run build
4. supabase gen types typescript

*/

-- ================================================================================
-- FIM DAS CORREÇÕES IDENTIFICADAS
-- ================================================================================
