-- =================================================================
-- MIGRAÇÃO 000: Sistema de Controle de Migrações
-- Data: 2025-08-21
-- Descrição: Tabela para controlar execução de migrações
-- =================================================================

-- =====================================================
-- 1. TABELA DE CONTROLE DE MIGRAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.migrations (
  id serial PRIMARY KEY,
  version varchar(20) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  execution_time_ms integer NULL,
  checksum varchar(64) NULL,
  success boolean DEFAULT true NOT NULL,
  error_message text NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_migrations_version ON public.migrations(version);
CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON public.migrations(executed_at);
CREATE INDEX IF NOT EXISTS idx_migrations_success ON public.migrations(success);

-- Comentários
COMMENT ON TABLE public.migrations IS 'Controle de execução de migrações do banco';
COMMENT ON COLUMN public.migrations.version IS 'Versão da migração (ex: 001, 002, etc)';
COMMENT ON COLUMN public.migrations.checksum IS 'Hash MD5 do conteúdo da migração';
COMMENT ON COLUMN public.migrations.execution_time_ms IS 'Tempo de execução em milissegundos';

-- =====================================================
-- 2. FUNÇÕES AUXILIARES PARA CONTROLE
-- =====================================================

-- Função para registrar início de migração
CREATE OR REPLACE FUNCTION public.start_migration(
  p_version varchar(20),
  p_name varchar(255),
  p_checksum varchar(64) DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  migration_id integer;
BEGIN
  -- Verificar se migração já foi executada com sucesso
  IF EXISTS (
    SELECT 1 FROM public.migrations 
    WHERE version = p_version AND success = true
  ) THEN
    RAISE EXCEPTION 'Migração % já foi executada com sucesso', p_version;
  END IF;

  -- Remover tentativas anteriores falhadas
  DELETE FROM public.migrations 
  WHERE version = p_version AND success = false;

  -- Inserir registro da migração
  INSERT INTO public.migrations (version, name, checksum, success)
  VALUES (p_version, p_name, p_checksum, false)
  RETURNING id INTO migration_id;

  RETURN migration_id;
END;
$$;

-- Função para marcar migração como concluída
CREATE OR REPLACE FUNCTION public.complete_migration(
  p_migration_id integer,
  p_execution_time_ms integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.migrations 
  SET 
    success = true,
    execution_time_ms = p_execution_time_ms
  WHERE id = p_migration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Migração com ID % não encontrada', p_migration_id;
  END IF;
END;
$$;

-- Função para marcar migração como falhada
CREATE OR REPLACE FUNCTION public.fail_migration(
  p_migration_id integer,
  p_error_message text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.migrations 
  SET 
    success = false,
    error_message = p_error_message
  WHERE id = p_migration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Migração com ID % não encontrada', p_migration_id;
  END IF;
END;
$$;

-- Função para listar migrações pendentes
CREATE OR REPLACE FUNCTION public.get_pending_migrations()
RETURNS TABLE (
  expected_version varchar(20),
  expected_name varchar(255)
)
LANGUAGE sql
AS $$
  -- Lista de migrações esperadas (manter atualizada)
  WITH expected_migrations AS (
    SELECT '000' as version, 'Sistema de Controle de Migrações' as name
    UNION ALL SELECT '001', 'Configuração Inicial do Banco'
    UNION ALL SELECT '002', 'Tabelas Core do Sistema'
    UNION ALL SELECT '003', 'Agendamentos e Sistema de Fila'
    UNION ALL SELECT '004', 'Sistema Financeiro e RLS'
  )
  SELECT e.version, e.name
  FROM expected_migrations e
  LEFT JOIN public.migrations m ON e.version = m.version AND m.success = true
  WHERE m.version IS NULL
  ORDER BY e.version;
$$;

-- Função para verificar integridade das migrações
CREATE OR REPLACE FUNCTION public.check_migration_integrity()
RETURNS TABLE (
  version varchar(20),
  name varchar(255),
  status varchar(20),
  issue text
)
LANGUAGE sql
AS $$
  SELECT 
    m.version,
    m.name,
    CASE 
      WHEN m.success THEN 'SUCCESS'
      WHEN m.success = false THEN 'FAILED'
      ELSE 'UNKNOWN'
    END as status,
    CASE 
      WHEN m.error_message IS NOT NULL THEN m.error_message
      WHEN m.success = false THEN 'Migração falhou sem mensagem de erro'
      ELSE NULL
    END as issue
  FROM public.migrations m
  ORDER BY m.version;
$$;

-- =====================================================
-- 3. REGISTRAR ESTA MIGRAÇÃO
-- =====================================================

-- Registrar a própria migração de controle
INSERT INTO public.migrations (version, name, success) 
VALUES ('000', 'Sistema de Controle de Migrações', true)
ON CONFLICT (version) DO NOTHING;

-- =====================================================
-- 4. COMENTÁRIOS DAS FUNÇÕES
-- =====================================================

COMMENT ON FUNCTION public.start_migration(varchar, varchar, varchar) 
IS 'Registra início de execução de migração';

COMMENT ON FUNCTION public.complete_migration(integer, integer) 
IS 'Marca migração como concluída com sucesso';

COMMENT ON FUNCTION public.fail_migration(integer, text) 
IS 'Marca migração como falhada com erro';

COMMENT ON FUNCTION public.get_pending_migrations() 
IS 'Lista migrações que ainda precisam ser executadas';

COMMENT ON FUNCTION public.check_migration_integrity() 
IS 'Verifica integridade e status de todas as migrações';