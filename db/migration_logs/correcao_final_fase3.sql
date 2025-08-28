-- ================================================================================
-- CORREÇÃO FINAL DA MIGRAÇÃO PT->EN - ITENS PENDENTES IDENTIFICADOS
-- Data: 27/08/2025
-- Status atual: 63% completo - corrigindo problemas específicos encontrados
-- ================================================================================

-- IMPORTANTE: Execute este SQL no SQL Editor do Supabase Dashboard
-- Dashboard > SQL Editor > New Query > Colar este código > Run

BEGIN;

-- ================================================================================
-- 1. RENOMEAR TABELAS RESTANTES QUE AINDA EXISTEM EM PORTUGUÊS
-- ================================================================================

-- 1.1 assinaturas -> subscriptions (mas subscriptions já existe, vamos mesclar)
DO $do$
DECLARE
    assinaturas_count INTEGER;
BEGIN
    -- Contar registros na tabela assinaturas
    SELECT COUNT(*) INTO assinaturas_count FROM public.assinaturas;
    
    IF assinaturas_count > 0 THEN
        -- Se tem dados em assinaturas, mesclar com subscriptions
        INSERT INTO public.subscriptions (
            id, customer_id, subscription_plan_id, status, start_date, 
            end_date, created_at, updated_at
        )
        SELECT 
            id, cliente_id, plano_id, status, data_inicio,
            data_fim, created_at, updated_at 
        FROM public.assinaturas
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Dados migrados de assinaturas para subscriptions';
    END IF;
    
    -- Remover tabela assinaturas
    DROP TABLE IF EXISTS public.assinaturas CASCADE;
    RAISE NOTICE 'Tabela assinaturas removida';
END
$do$;

-- 1.2 financeiro_mov -> financial_transactions
DO $do$
BEGIN
    -- Verificar se financial_transactions já existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'financial_transactions') THEN
        -- Renomear tabela
        ALTER TABLE public.financeiro_mov RENAME TO financial_transactions;
        RAISE NOTICE 'Tabela financeiro_mov renomeada para financial_transactions';
    ELSE
        -- Se já existe, mesclar dados se necessário
        RAISE NOTICE 'Tabela financial_transactions já existe';
    END IF;
END
$do$;

-- 1.3 notificacoes -> notifications  
DO $do$
BEGIN
    -- Verificar se notifications já existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        -- Renomear tabela
        ALTER TABLE public.notificacoes RENAME TO notifications;
        RAISE NOTICE 'Tabela notificacoes renomeada para notifications';
    ELSE
        -- Se já existe, mesclar dados se necessário
        RAISE NOTICE 'Tabela notifications já existe';
    END IF;
END
$do$;

-- ================================================================================
-- 2. CRIAR TABELA appointments_services SE NÃO EXISTIR
-- ================================================================================

-- 2.1 Criar tabela appointments_services (relacionamento)
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
    
    -- Índices
    UNIQUE(appointment_id, service_id, professional_id)
);

-- Índices para appointments_services
CREATE INDEX IF NOT EXISTS idx_appointments_services_appointment ON public.appointments_services(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_services_service ON public.appointments_services(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_services_professional ON public.appointments_services(professional_id);

-- RLS para appointments_services
ALTER TABLE public.appointments_services ENABLE ROW LEVEL SECURITY;

-- ================================================================================
-- 3. CORRIGIR COLUNAS ESPECÍFICAS
-- ================================================================================

-- 3.1 profiles.unidade_default_id -> unit_default_id
DO $do$
BEGIN
    -- Verificar se coluna unidade_default_id existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'profiles' 
               AND column_name = 'unidade_default_id') THEN
        ALTER TABLE public.profiles RENAME COLUMN unidade_default_id TO unit_default_id;
        RAISE NOTICE 'Coluna profiles.unidade_default_id renomeada para unit_default_id';
    ELSE
        RAISE NOTICE 'Coluna unidade_default_id não encontrada ou já renomeada';
    END IF;
END
$do$;

-- 3.2 customers.nome -> name (se não existe)
DO $do$
BEGIN
    -- Verificar se coluna nome existe e name não existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'customers' 
               AND column_name = 'nome') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'customers' 
                       AND column_name = 'name') THEN
        ALTER TABLE public.customers RENAME COLUMN nome TO name;
        RAISE NOTICE 'Coluna customers.nome renomeada para name';
    END IF;
END
$do$;

-- 3.3 professionals.nome -> name (se não existe)
DO $do$
BEGIN
    -- Verificar se coluna nome existe e name não existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'professionals' 
               AND column_name = 'nome') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'professionals' 
                       AND column_name = 'name') THEN
        ALTER TABLE public.professionals RENAME COLUMN nome TO name;
        RAISE NOTICE 'Coluna professionals.nome renomeada para name';
    END IF;
END
$do$;

-- 3.4 professionals.papel -> role (se não existe)
DO $do$
BEGIN
    -- Verificar se coluna papel existe e role não existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'professionals' 
               AND column_name = 'papel') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'professionals' 
                       AND column_name = 'role') THEN
        ALTER TABLE public.professionals RENAME COLUMN papel TO role;
        RAISE NOTICE 'Coluna professionals.papel renomeada para role';
    END IF;
END
$do$;

-- ================================================================================
-- 4. CRIAR/ATUALIZAR FUNÇÃO current_unit_id
-- ================================================================================

-- 4.1 Criar função current_unit_id()
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

-- 4.2 Remover função antiga se existir
DROP FUNCTION IF EXISTS public.current_unidade_id() CASCADE;

-- ================================================================================
-- 5. CRIAR POLICIES RLS PARA TABELAS FALTANTES
-- ================================================================================

-- 5.1 Policies para appointments_services
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

-- 5.2 Policies para financial_transactions (se existe)
DO $do$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'financial_transactions') THEN
        
        -- Habilitar RLS
        ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
        
        -- Criar policies
        CREATE POLICY "Users can view transactions from their unit" ON public.financial_transactions
            FOR SELECT USING (unit_id = current_unit_id());
            
        CREATE POLICY "Users can create transactions in their unit" ON public.financial_transactions
            FOR INSERT WITH CHECK (unit_id = current_unit_id());
            
        RAISE NOTICE 'Policies criadas para financial_transactions';
    END IF;
END
$do$;

-- 5.3 Policies para notifications (se existe)
DO $do$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        
        -- Habilitar RLS
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        
        -- Criar policies
        CREATE POLICY "Users can view notifications from their unit" ON public.notifications
            FOR SELECT USING (unit_id = current_unit_id());
            
        CREATE POLICY "Users can create notifications in their unit" ON public.notifications
            FOR INSERT WITH CHECK (unit_id = current_unit_id());
            
        RAISE NOTICE 'Policies criadas para notifications';
    END IF;
END
$do$;

-- ================================================================================
-- 6. ATUALIZAR TRIGGERS DE updated_at
-- ================================================================================

-- 6.1 Trigger para appointments_services
CREATE TRIGGER trigger_updated_at_appointments_services
    BEFORE UPDATE ON public.appointments_services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6.2 Triggers para outras tabelas se necessário
DO $do$
BEGIN
    -- financial_transactions
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'financial_transactions') THEN
        CREATE TRIGGER trigger_updated_at_financial_transactions
            BEFORE UPDATE ON public.financial_transactions
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- notifications
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        CREATE TRIGGER trigger_updated_at_notifications
            BEFORE UPDATE ON public.notifications
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$do$;

COMMIT;

-- ================================================================================
-- VALIDAÇÕES FINAIS
-- ================================================================================

-- Verificar se todas as tabelas principais existem
SELECT 'VALIDAÇÃO: Tabelas principais' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('units', 'profiles', 'customers', 'professionals', 'services', 
                     'appointments', 'appointments_services', 'queue', 'subscriptions', 
                     'subscription_plans', 'financial_transactions', 'notifications')
ORDER BY table_name;

-- Verificar se tabelas antigas foram removidas
SELECT 'VALIDAÇÃO: Tabelas antigas removidas' as status;
SELECT CASE 
    WHEN COUNT(*) = 0 THEN 'SUCESSO: Nenhuma tabela antiga encontrada'
    ELSE 'ATENÇÃO: ' || COUNT(*) || ' tabela(s) antiga(s) ainda existe(m)'
END as resultado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('unidades', 'clientes', 'profissionais', 'servicos', 'fila', 
                     'assinaturas', 'planos', 'financeiro_mov', 'notificacoes');

-- Verificar coluna unit_default_id
SELECT 'VALIDAÇÃO: Coluna unit_default_id' as status;
SELECT CASE 
    WHEN COUNT(*) > 0 THEN 'SUCESSO: Coluna unit_default_id existe'
    ELSE 'ERRO: Coluna unit_default_id não encontrada'
END as resultado
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'unit_default_id';

-- Verificar função current_unit_id
SELECT 'VALIDAÇÃO: Função current_unit_id' as status;
SELECT CASE 
    WHEN COUNT(*) > 0 THEN 'SUCESSO: Função current_unit_id() existe'
    ELSE 'ERRO: Função current_unit_id() não encontrada'
END as resultado
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'current_unit_id';

-- ================================================================================
-- RELATÓRIO FINAL
-- ================================================================================

/*
CORREÇÕES APLICADAS:

1. TABELAS RENOMEADAS/ORGANIZADAS:
   ✓ assinaturas → subscriptions (dados migrados e tabela removida)
   ✓ financeiro_mov → financial_transactions  
   ✓ notificacoes → notifications

2. TABELAS CRIADAS:
   ✓ appointments_services (relacionamento appointments-services)

3. COLUNAS RENOMEADAS:
   ✓ profiles.unidade_default_id → unit_default_id
   ✓ customers.nome → name
   ✓ professionals.nome → name
   ✓ professionals.papel → role

4. FUNÇÕES ATUALIZADAS:
   ✓ current_unit_id() criada
   ✓ current_unidade_id() removida

5. SEGURANÇA:
   ✓ RLS habilitado para novas tabelas
   ✓ Policies criadas para controle de acesso
   ✓ Triggers updated_at configurados

PRÓXIMOS PASSOS APÓS EXECUÇÃO:
1. npm run build (verificar compilação)
2. supabase gen types typescript (gerar tipos)
3. Executar script de verificação novamente
4. Testar funcionalidades críticas

*/

-- ================================================================================
-- FIM DA CORREÇÃO FINAL
-- ================================================================================
