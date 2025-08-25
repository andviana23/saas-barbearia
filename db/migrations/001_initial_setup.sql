-- =================================================================
-- MIGRAÇÃO 001: Configuração Inicial do Banco
-- Data: 2025-08-21
-- Descrição: Extensões, esquemas, tipos e funções base
-- =================================================================

-- =====================================================
-- 1. EXTENSÕES OBRIGATÓRIAS
-- =====================================================

-- Extensão para UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensão para funções criptográficas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Extensão para case-insensitive text (emails, etc)
CREATE EXTENSION IF NOT EXISTS "citext";

-- =====================================================
-- 2. ESQUEMAS
-- =====================================================

-- Schema para auditoria
CREATE SCHEMA IF NOT EXISTS audit;

-- Schema público já existe (public)
-- Schema auth já existe (Supabase)

-- =====================================================
-- 3. TIPOS ENUMERADOS
-- =====================================================

-- Papéis de usuário
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'gestor', 
  'profissional',
  'recepcao'
);

-- Status de agendamentos
CREATE TYPE public.appointment_status AS ENUM (
  'criado',
  'confirmado',
  'em_atendimento',
  'concluido',
  'cancelado',
  'faltou'
);

-- Status da fila
CREATE TYPE public.queue_status AS ENUM (
  'aguardando',
  'chamado',
  'em_atendimento',
  'concluido',
  'desistiu'
);

-- Prioridade da fila
CREATE TYPE public.queue_priority AS ENUM (
  'normal',
  'prioritaria',
  'urgente'
);

-- Tipo de movimento financeiro
CREATE TYPE public.movimento_tipo AS ENUM (
  'entrada',
  'saida'
);

-- =====================================================
-- 4. FUNÇÕES AUXILIARES DE SEGURANÇA
-- =====================================================

-- Função para obter o ID do usuário atual via JWT
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );
$$;

-- Função para obter a unidade padrão do usuário atual
CREATE OR REPLACE FUNCTION public.current_unidade_id()
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

-- Função para verificar se usuário tem acesso a uma unidade
CREATE OR REPLACE FUNCTION public.has_unit_access(unidade_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.user_id = public.current_user_id()
    AND (
      p.papel = 'admin'::user_role OR
      p.unidade_default_id = unidade_id
    )
  );
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = public.current_user_id()
    AND papel = 'admin'::user_role
    AND ativo = true
  );
$$;

-- =====================================================
-- 5. FUNÇÕES DE AUDITORIA
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- =====================================================
-- 6. PAPÉIS SQL (comentado para implementação manual)
-- =====================================================

/*
-- Papel para aplicação com RLS
CREATE ROLE app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA auth TO app_user;

-- Papel para administração/migrações
CREATE ROLE app_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON SCHEMA audit TO app_admin;

-- Papel read-only para relatórios
CREATE ROLE app_ro;
GRANT USAGE ON SCHEMA public TO app_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_ro;
*/

-- =====================================================
-- 7. COMENTÁRIOS E METADADOS
-- =====================================================

COMMENT ON EXTENSION "uuid-ossp" IS 'Geração de UUIDs v4 para chaves primárias';
COMMENT ON EXTENSION "pgcrypto" IS 'Funções criptográficas para segurança';
COMMENT ON EXTENSION "citext" IS 'Texto case-insensitive para emails';

COMMENT ON SCHEMA audit IS 'Schema para tabelas de auditoria e logs';

COMMENT ON TYPE public.user_role IS 'Papéis de usuário no sistema';
COMMENT ON TYPE public.appointment_status IS 'Status dos agendamentos';
COMMENT ON TYPE public.queue_status IS 'Status dos itens na fila';
COMMENT ON TYPE public.queue_priority IS 'Prioridade na fila de atendimento';
COMMENT ON TYPE public.movimento_tipo IS 'Tipo de movimento financeiro';

COMMENT ON FUNCTION public.current_user_id() IS 'Retorna UUID do usuário autenticado';
COMMENT ON FUNCTION public.current_unidade_id() IS 'Retorna UUID da unidade padrão do usuário';
COMMENT ON FUNCTION public.has_unit_access(uuid) IS 'Verifica se usuário tem acesso à unidade';
COMMENT ON FUNCTION public.is_admin() IS 'Verifica se usuário é administrador';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger para atualizar campo updated_at';