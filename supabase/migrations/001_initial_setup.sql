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
-- 4. FUNÇÕES AUXILIARES BÁSICAS
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

-- Função trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- =====================================================
-- 5. COMENTÁRIOS DAS FUNÇÕES
-- =====================================================

COMMENT ON FUNCTION public.current_user_id() IS 'Obtém o UUID do usuário atual do JWT';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger para atualizar campo updated_at';

-- =====================================================
-- 6. ATUALIZAÇÃO DE CONTROLE DE MIGRAÇÕES
-- =====================================================

-- Atualizar tabela de controle se existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migrations') THEN
        INSERT INTO public.migrations (version, name, executed_at)
        VALUES ('001', 'initial_setup', NOW()) 
        ON CONFLICT (version) DO NOTHING;
    END IF;
END $$;