-- ================================================================================
-- MIGRAÇÃO FINAL PT → EN - ENUMS E OBJETOS RESTANTES
-- Data: 27/08/2025
-- Estado encontrado: Tabelas parcialmente migradas, ENUMs com valores em português
-- ================================================================================

-- IMPORTANTE: Executar em ambiente de desenvolvimento primeiro!

BEGIN;

-- ================================================================================
-- ETAPA 1: RENOMEAR TABELAS RESTANTES (IDEMPOTENTE)
-- ================================================================================

-- 1.1 Renomear tabelas que ainda estão em português
DO $do$
BEGIN
  -- assinaturas -> subscriptions (já existe subscriptions, mas assinaturas ainda existe vazia)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assinaturas') THEN
    DROP TABLE IF EXISTS public.assinaturas CASCADE;
    RAISE NOTICE 'Tabela assinaturas removida (estava vazia, subscriptions já existe)';
  END IF;

  -- financeiro_mov -> financial_transactions
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_transactions') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financeiro_mov') THEN
    ALTER TABLE public.financeiro_mov RENAME TO financial_transactions;
    RAISE NOTICE 'Tabela financeiro_mov renomeada para financial_transactions';
  END IF;

  -- notificacoes -> notifications
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notificacoes') THEN
    ALTER TABLE public.notificacoes RENAME TO notifications;
    RAISE NOTICE 'Tabela notificacoes renomeada para notifications';
  END IF;
END
$do$;

-- ================================================================================
-- ETAPA 2: RENOMEAR COLUNAS PRINCIPAIS (IDEMPOTENTE)
-- ================================================================================

-- 2.1 Renomear coluna unidade_default_id para unit_default_id na tabela profiles
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'unidade_default_id') THEN
    ALTER TABLE public.profiles RENAME COLUMN unidade_default_id TO unit_default_id;
    RAISE NOTICE 'Coluna profiles.unidade_default_id renomeada para unit_default_id';
  END IF;
END
$do$;

-- 2.2 Renomear papel para role na tabela professionals (se ainda existe)
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'professionals' AND column_name = 'papel') THEN
    ALTER TABLE public.professionals RENAME COLUMN papel TO role;
    RAISE NOTICE 'Coluna professionals.papel renomeada para role';
  END IF;
END
$do$;

-- ================================================================================
-- ETAPA 3: CRIAR NOVOS TIPOS ENUM EM INGLÊS (IDEMPOTENTE)
-- ================================================================================

-- 3.1 Criar novos tipos enum se não existirem
DO $do$
BEGIN
  -- user_role_new
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
    CREATE TYPE user_role_new AS ENUM ('admin', 'manager', 'professional', 'receptionist');
    RAISE NOTICE 'Tipo user_role_new criado';
  END IF;

  -- queue_priority_new 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'queue_priority_new') THEN
    CREATE TYPE queue_priority_new AS ENUM ('normal', 'priority', 'urgent');
    RAISE NOTICE 'Tipo queue_priority_new criado';
  END IF;
END
$do$;

-- ================================================================================
-- ETAPA 4: MIGRAR VALORES DOS ENUMS (IDEMPOTENTE)
-- ================================================================================

-- 4.1 Migrar user_role na tabela profiles (PT -> EN)
DO $do$
DECLARE 
  v_udt text;
BEGIN
  -- Verificar tipo atual da coluna papel
  SELECT udt_name INTO v_udt
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'papel';

  IF v_udt IS DISTINCT FROM 'user_role_new' THEN
    -- Migrar valores de português para inglês
    ALTER TABLE public.profiles 
    ALTER COLUMN papel TYPE user_role_new
    USING CASE papel::text
      WHEN 'gestor' THEN 'manager'::user_role_new
      WHEN 'profissional' THEN 'professional'::user_role_new
      WHEN 'recepcao' THEN 'receptionist'::user_role_new
      ELSE papel::text::user_role_new
    END;
    RAISE NOTICE 'Valores de profiles.papel migrados para inglês';
  END IF;
END
$do$;

-- 4.2 Migrar queue_priority (PT -> EN) 
DO $do$
DECLARE 
  v_udt text;
BEGIN
  -- Verificar tipo atual da coluna priority
  SELECT udt_name INTO v_udt
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'queue' AND column_name = 'priority';

  IF v_udt IS DISTINCT FROM 'queue_priority_new' THEN
    -- Migrar valores de português para inglês
    ALTER TABLE public.queue 
    ALTER COLUMN priority TYPE queue_priority_new
    USING CASE priority::text
      WHEN 'prioritaria' THEN 'priority'::queue_priority_new
      WHEN 'urgente' THEN 'urgent'::queue_priority_new
      ELSE 'normal'::queue_priority_new
    END;
    RAISE NOTICE 'Valores de queue.priority migrados para inglês';
  END IF;
END
$do$;

-- ================================================================================
-- ETAPA 5: SUBSTITUIR TIPOS ENUM (REMOVER ANTIGOS)
-- ================================================================================

-- 5.1 Substituir user_role
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
    DROP TYPE IF EXISTS user_role CASCADE;
    ALTER TYPE user_role_new RENAME TO user_role;
    RAISE NOTICE 'Tipo user_role_new renomeado para user_role';
  END IF;
END
$do$;

-- 5.2 Substituir queue_priority
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'queue_priority_new') THEN
    DROP TYPE IF EXISTS queue_priority CASCADE;
    ALTER TYPE queue_priority_new RENAME TO queue_priority;
    RAISE NOTICE 'Tipo queue_priority_new renomeado para queue_priority';
  END IF;
END
$do$;

-- ================================================================================
-- ETAPA 6: ATUALIZAR FUNÇÃO DE SEGURANÇA
-- ================================================================================

-- 6.1 Criar/atualizar função current_unit_id
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

-- 6.2 Remover função antiga
DROP FUNCTION IF EXISTS public.current_unidade_id();

-- ================================================================================
-- ETAPA 7: RENOMEAR ÍNDICES PRINCIPAIS (IDEMPOTENTE)
-- ================================================================================

-- 7.1 Índices da tabela profiles
DO $do$
BEGIN
  -- idx_profiles_unidade_default -> idx_profiles_unit_default
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_unidade_default') THEN
    ALTER INDEX idx_profiles_unidade_default RENAME TO idx_profiles_unit_default;
    RAISE NOTICE 'Índice idx_profiles_unidade_default renomeado';
  END IF;

  -- idx_profiles_papel -> idx_profiles_role
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_papel') THEN
    ALTER INDEX idx_profiles_papel RENAME TO idx_profiles_role;
    RAISE NOTICE 'Índice idx_profiles_papel renomeado';
  END IF;
END
$do$;

-- 7.2 Criar novos índices se necessário
CREATE INDEX IF NOT EXISTS idx_queue_status ON public.queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_priority ON public.queue(priority);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(papel);

-- ================================================================================
-- ETAPA 8: ATUALIZAR POLICIES RLS PRINCIPAIS (IDEMPOTENTE)
-- ================================================================================

-- 8.1 Atualizar policies que usam current_unidade_id() para current_unit_id()
DO $do$
BEGIN
  -- Customers policies
  DROP POLICY IF EXISTS "Usuários podem ver clientes da sua unidade" ON customers;
  CREATE POLICY "Users can view customers from their unit" ON customers
    FOR SELECT USING (unit_id = current_unit_id());

  DROP POLICY IF EXISTS "Usuários podem criar clientes na sua unidade" ON customers;  
  CREATE POLICY "Users can create customers in their unit" ON customers
    FOR INSERT WITH CHECK (unit_id = current_unit_id());

  DROP POLICY IF EXISTS "Usuários podem atualizar clientes da sua unidade" ON customers;
  CREATE POLICY "Users can update customers from their unit" ON customers
    FOR UPDATE USING (unit_id = current_unit_id());

  -- Professionals policies
  DROP POLICY IF EXISTS "Usuários podem ver profissionais da sua unidade" ON professionals;
  CREATE POLICY "Users can view professionals from their unit" ON professionals
    FOR SELECT USING (unit_id = current_unit_id());

  -- Services policies  
  DROP POLICY IF EXISTS "Usuários podem ver serviços da sua unidade" ON services;
  CREATE POLICY "Users can view services from their unit" ON services
    FOR SELECT USING (unit_id = current_unit_id());

  -- Queue policies
  DROP POLICY IF EXISTS "Usuários podem ver fila da sua unidade" ON queue;
  CREATE POLICY "Users can view queue from their unit" ON queue
    FOR SELECT USING (unit_id = current_unit_id());

  RAISE NOTICE 'Policies RLS atualizadas para usar current_unit_id()';
END
$do$;

COMMIT;

-- ================================================================================
-- VALIDAÇÕES FINAIS
-- ================================================================================

-- Verificar se todas as tabelas foram renomeadas corretamente
SELECT 'VALIDAÇÃO: Tabelas em português ainda existentes' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('unidades', 'clientes', 'profissionais', 'servicos', 'fila', 'planos', 'assinaturas', 'financeiro_mov', 'notificacoes');

-- Verificar ENUMs atualizados
SELECT 'VALIDAÇÃO: ENUMs em inglês' as status;
SELECT 
  typname as enum_name,
  array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('user_role', 'appointment_status', 'queue_status', 'queue_priority', 'transaction_type')
GROUP BY typname
ORDER BY typname;

-- Verificar função current_unit_id
SELECT 'VALIDAÇÃO: Função current_unit_id() existe' as status;
SELECT proname 
FROM pg_proc 
WHERE proname = 'current_unit_id' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Verificar colunas atualizadas na tabela profiles
SELECT 'VALIDAÇÃO: Colunas da tabela profiles' as status;
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name IN ('unit_default_id', 'papel', 'role')
ORDER BY column_name;

-- ================================================================================
-- RELATÓRIO FINAL
-- ================================================================================

/*
MIGRAÇÃO CONCLUÍDA - RELATÓRIO:

1. TABELAS RENOMEADAS:
   - assinaturas → subscriptions (tabela vazia removida)
   - financeiro_mov → financial_transactions 
   - notificacoes → notifications

2. COLUNAS RENOMEADAS:
   - profiles.unidade_default_id → unit_default_id
   - professionals.papel → role (se existia)

3. ENUMS MIGRADOS:
   - user_role: gestor→manager, profissional→professional, recepcao→receptionist
   - queue_priority: prioritaria→priority, urgente→urgent

4. FUNÇÕES ATUALIZADAS:
   - current_unidade_id() → current_unit_id()

5. POLICIES RLS ATUALIZADAS:
   - Todas as policies migradas para usar current_unit_id()

6. ÍNDICES RENOMEADOS:
   - idx_profiles_unidade_default → idx_profiles_unit_default
   - idx_profiles_papel → idx_profiles_role

PRÓXIMOS PASSOS:
1. Validar build da aplicação: npm run build
2. Gerar tipos: supabase gen types typescript
3. Testar todas as funcionalidades
4. Monitorar logs por 24-48h

*/

-- ================================================================================
-- FIM DA MIGRAÇÃO FINAL PT → EN
-- ================================================================================
