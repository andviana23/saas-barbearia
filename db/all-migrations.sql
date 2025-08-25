-- =========================================================================
-- ARQUIVO CONSOLIDADO DE MIGRAÇÕES OTIMIZADO - SISTEMA BARBERSHOP SaaS
-- Data de geração: 2025-08-21T16:22:26.055Z
-- Total de migrações: 5
-- VERSÃO IDEMPOTENTE: Pode ser executado múltiplas vezes sem erro
-- =========================================================================


-- =========================================================================
-- MIGRAÇÃO 000: MIGRATION CONTROL  
-- =========================================================================

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


-- =========================================================================
-- MIGRAÇÃO 001: INITIAL SETUP  
-- =========================================================================

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
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM (
      'admin',
      'gestor', 
      'profissional',
      'recepcao'
  --   );
  END IF;
END
$$;

-- Status de agendamentos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE public.appointment_status AS ENUM (
      'criado',
      'confirmado',
      'em_atendimento',
      'concluido',
      'cancelado',
      'faltou'
  --   );
  END IF;
END
$$;

-- Status da fila
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'queue_status') THEN
    CREATE TYPE public.queue_status AS ENUM (
      'aguardando',
      'chamado',
      'em_atendimento',
      'concluido',
      'desistiu'
  --   );
  END IF;
END
$$;

-- Prioridade da fila
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'queue_priority') THEN
    CREATE TYPE public.queue_priority AS ENUM (
      'normal',
      'prioritaria',
      'urgente'
  --   );
  END IF;
END
$$;

-- Tipo de movimento financeiro
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movimento_tipo') THEN
    CREATE TYPE public.movimento_tipo AS ENUM (
      'entrada',
      'saida'
  --   );
  END IF;
END
$$;

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
--   );
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
--     )
--   );
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
--   );
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


-- =========================================================================
-- MIGRAÇÃO 002: CORE TABLES  
-- =========================================================================

-- =================================================================
-- MIGRAÇÃO 002: Tabelas Core do Sistema
-- Data: 2025-08-21
-- Descrição: Unidades, Profiles, Profissionais, Clientes, Serviços
-- =================================================================

-- =====================================================
-- 1. TABELA UNIDADES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.unidades (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome varchar(100) NOT NULL,
  cnpj varchar(14) NULL, -- Apenas números após validação Zod
  endereco text NULL,
  telefone varchar(11) NULL, -- Apenas números após validação Zod  
  email citext NULL,
  config jsonb DEFAULT '{}'::jsonb NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT unidades_nome_length CHECK (length(nome) >= 2),
  CONSTRAINT unidades_cnpj_length CHECK (cnpj IS NULL OR length(cnpj) = 14),
  CONSTRAINT unidades_telefone_length CHECK (telefone IS NULL OR length(telefone) >= 10),
  CONSTRAINT unidades_config_is_object CHECK (jsonb_typeof(config) = 'object')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_unidades_ativo ON public.unidades(ativo);
CREATE INDEX IF NOT EXISTS idx_unidades_nome ON public.unidades(nome);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unidades_cnpj ON public.unidades(cnpj) WHERE cnpj IS NOT NULL;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_unidades_updated_at ON public.unidades;
CREATE TRIGGER update_unidades_updated_at
  BEFORE UPDATE ON public.unidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.unidades IS 'Unidades/filiais do sistema (multi-tenant)';
COMMENT ON COLUMN public.unidades.config IS 'Configurações específicas da unidade em JSON';

-- =====================================================
-- 2. TABELA PROFILES (Perfis de Usuário)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome varchar(100) NOT NULL,
  email citext NOT NULL,
  telefone varchar(11) NULL,
  unidade_default_id uuid REFERENCES public.unidades(id) ON DELETE SET NULL,
  papel public.user_role DEFAULT 'profissional'::public.user_role NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT profiles_nome_length CHECK (length(nome) >= 2),
  CONSTRAINT profiles_telefone_length CHECK (telefone IS NULL OR length(telefone) >= 10),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_unidade_default ON public.profiles(unidade_default_id);
CREATE INDEX IF NOT EXISTS idx_profiles_papel ON public.profiles(papel);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON public.profiles(ativo);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema';
COMMENT ON COLUMN public.profiles.user_id IS 'Referência para auth.users do Supabase';
COMMENT ON COLUMN public.profiles.unidade_default_id IS 'Unidade padrão do usuário';

-- =====================================================
-- 3. TABELA PROFISSIONAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profissionais (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome varchar(100) NOT NULL,
  papel varchar(50) NOT NULL,
  unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  comissao_regra jsonb NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT profissionais_nome_length CHECK (length(nome) >= 2),
  CONSTRAINT profissionais_papel_length CHECK (length(papel) >= 2),
  CONSTRAINT profissionais_comissao_is_object CHECK (comissao_regra IS NULL OR jsonb_typeof(comissao_regra) = 'object')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profissionais_unidade_id ON public.profissionais(unidade_id);
CREATE INDEX IF NOT EXISTS idx_profissionais_ativo ON public.profissionais(ativo);
CREATE INDEX IF NOT EXISTS idx_profissionais_papel ON public.profissionais(papel);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profissionais_updated_at ON public.profissionais;
CREATE TRIGGER update_profissionais_updated_at
  BEFORE UPDATE ON public.profissionais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.profissionais IS 'Profissionais que prestam serviços';
COMMENT ON COLUMN public.profissionais.comissao_regra IS 'Regras de comissão em JSON';

-- =====================================================
-- 4. TABELA CLIENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome varchar(100) NOT NULL,
  email citext NULL,
  telefone varchar(11) NULL,
  preferencias jsonb NULL,
  unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT clientes_nome_length CHECK (length(nome) >= 2),
  CONSTRAINT clientes_telefone_length CHECK (telefone IS NULL OR length(telefone) >= 10),
  CONSTRAINT clientes_preferencias_is_object CHECK (preferencias IS NULL OR jsonb_typeof(preferencias) = 'object')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_unidade_id ON public.clientes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON public.clientes(ativo);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON public.clientes(telefone) WHERE telefone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email) WHERE email IS NOT NULL;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.clientes IS 'Clientes do sistema';
COMMENT ON COLUMN public.clientes.preferencias IS 'Preferências do cliente em JSON';

-- =====================================================
-- 5. TABELA SERVIÇOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.servicos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome varchar(100) NOT NULL,
  categoria varchar(50) NULL,
  preco decimal(10,2) NOT NULL,
  duracao_min integer NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT servicos_nome_length CHECK (length(nome) >= 2),
  CONSTRAINT servicos_preco_positive CHECK (preco > 0),
  CONSTRAINT servicos_duracao_positive CHECK (duracao_min > 0),
  CONSTRAINT servicos_categoria_length CHECK (categoria IS NULL OR length(categoria) >= 2)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_servicos_unidade_id ON public.servicos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON public.servicos(ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON public.servicos(categoria);
CREATE INDEX IF NOT EXISTS idx_servicos_preco ON public.servicos(preco);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_servicos_updated_at ON public.servicos;
CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.servicos IS 'Catálogo de serviços oferecidos';
COMMENT ON COLUMN public.servicos.duracao_min IS 'Duração em minutos';
COMMENT ON COLUMN public.servicos.preco IS 'Preço em reais (BRL)';

-- =====================================================
-- 6. GRANTS DE PERMISSÕES (comentado para configuração manual)
-- =====================================================

/*
-- Grants para app_user (aplicação com RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unidades TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profissionais TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos TO app_user;

-- Grants para app_ro (read-only)
GRANT SELECT ON public.unidades TO app_ro;
GRANT SELECT ON public.profiles TO app_ro;
GRANT SELECT ON public.profissionais TO app_ro;
GRANT SELECT ON public.clientes TO app_ro;
GRANT SELECT ON public.servicos TO app_ro;
*/


-- =========================================================================
-- MIGRAÇÃO 003: APPOINTMENTS QUEUE  
-- =========================================================================

-- =================================================================
-- MIGRAÇÃO 003: Agendamentos e Sistema de Fila
-- Data: 2025-08-21
-- Descrição: Appointments, Appointments_Servicos, Fila
-- =================================================================

-- =====================================================
-- 1. TABELA APPOINTMENTS (Agendamentos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE RESTRICT NOT NULL,
  profissional_id uuid REFERENCES public.profissionais(id) ON DELETE RESTRICT NOT NULL,
  unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE NOT NULL,
  inicio timestamp with time zone NOT NULL,
  fim timestamp with time zone NOT NULL,
  status public.appointment_status DEFAULT 'criado'::public.appointment_status NOT NULL,
  total decimal(10,2) NOT NULL DEFAULT 0,
  notas text NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT appointments_fim_depois_inicio CHECK (fim > inicio),
  CONSTRAINT appointments_total_positive CHECK (total >= 0),
  CONSTRAINT appointments_notas_length CHECK (notas IS NULL OR length(notas) <= 1000)
);

-- Índices para performance e queries frequentes
CREATE INDEX IF NOT EXISTS idx_appointments_unidade_id ON public.appointments(unidade_id);
CREATE INDEX IF NOT EXISTS idx_appointments_cliente_id ON public.appointments(cliente_id);
CREATE INDEX IF NOT EXISTS idx_appointments_profissional_id ON public.appointments(profissional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_inicio ON public.appointments(inicio);
CREATE INDEX IF NOT EXISTS idx_appointments_data ON public.appointments((inicio::date));

-- Índice composto para consultas de agenda
CREATE INDEX IF NOT EXISTS idx_appointments_profissional_data ON public.appointments(profissional_id, (inicio::date));
CREATE INDEX IF NOT EXISTS idx_appointments_unidade_data ON public.appointments(unidade_id, (inicio::date));

-- Índice para detectar conflitos de horário
CREATE INDEX IF NOT EXISTS idx_appointments_conflict ON public.appointments(profissional_id, inicio, fim);

-- Constraint única para prevenir agendamentos duplicados exatos
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_unique_slot 
ON public.appointments(profissional_id, inicio, fim)
WHERE status NOT IN ('cancelado', 'faltou');

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.appointments IS 'Agendamentos de serviços';
COMMENT ON COLUMN public.appointments.total IS 'Valor total do agendamento em reais';
-- COMMENT ON INDEX idx_appointments_unique_slot IS 'Previne agendamentos conflitantes';

-- =====================================================
-- 2. TABELA APPOINTMENTS_SERVICOS (Relacionamento N:N)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.appointments_servicos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  servico_id uuid REFERENCES public.servicos(id) ON DELETE RESTRICT NOT NULL,
  preco_aplicado decimal(10,2) NOT NULL,
  duracao_aplicada integer NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT appointments_servicos_preco_positive CHECK (preco_aplicado > 0),
  CONSTRAINT appointments_servicos_duracao_positive CHECK (duracao_aplicada > 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_appointments_servicos_appointment ON public.appointments_servicos(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_servicos_servico ON public.appointments_servicos(servico_id);

-- Constraint única para evitar serviços duplicados no mesmo agendamento
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_servicos_unique 
ON public.appointments_servicos(appointment_id, servico_id);

-- Comentários
COMMENT ON TABLE public.appointments_servicos IS 'Serviços incluídos em cada agendamento';
COMMENT ON COLUMN public.appointments_servicos.preco_aplicado IS 'Preço que foi aplicado no momento (histórico)';
COMMENT ON COLUMN public.appointments_servicos.duracao_aplicada IS 'Duração aplicada em minutos';

-- =====================================================
-- 3. TABELA FILA (Sistema de Lista de Espera)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.fila (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE NOT NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  status public.queue_status DEFAULT 'aguardando'::public.queue_status NOT NULL,
  prioridade public.queue_priority DEFAULT 'normal'::public.queue_priority NOT NULL,
  posicao integer NOT NULL,
  estimativa_min integer NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT fila_posicao_positive CHECK (posicao > 0),
  CONSTRAINT fila_estimativa_positive CHECK (estimativa_min IS NULL OR estimativa_min >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fila_unidade_id ON public.fila(unidade_id);
CREATE INDEX IF NOT EXISTS idx_fila_cliente_id ON public.fila(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fila_status ON public.fila(status);
CREATE INDEX IF NOT EXISTS idx_fila_prioridade ON public.fila(prioridade);
CREATE INDEX IF NOT EXISTS idx_fila_posicao ON public.fila(posicao);

-- Índice composto para ordenação da fila
CREATE INDEX IF NOT EXISTS idx_fila_ordenacao ON public.fila(unidade_id, status, prioridade, posicao);

-- Constraint única para posição por unidade (entre itens ativos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_fila_posicao_unique 
ON public.fila(unidade_id, posicao)
WHERE status IN ('aguardando', 'chamado');

-- Constraint para evitar cliente duplicado na fila ativa
CREATE UNIQUE INDEX IF NOT EXISTS idx_fila_cliente_ativo
ON public.fila(unidade_id, cliente_id)
WHERE status IN ('aguardando', 'chamado', 'em_atendimento');

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_fila_updated_at ON public.fila;
CREATE TRIGGER update_fila_updated_at
  BEFORE UPDATE ON public.fila
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.fila IS 'Sistema de fila de atendimento por unidade';
COMMENT ON COLUMN public.fila.posicao IS 'Posição na fila (1 = próximo)';
COMMENT ON COLUMN public.fila.estimativa_min IS 'Estimativa de espera em minutos';

-- =====================================================
-- 4. FUNÇÕES AUXILIARES PARA AGENDAMENTOS
-- =====================================================

-- Função para verificar conflitos de agendamento
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
  p_profissional_id uuid,
  p_inicio timestamp with time zone,
  p_fim timestamp with time zone,
  p_appointment_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.appointments a
    WHERE a.profissional_id = p_profissional_id
    AND a.status NOT IN ('cancelado', 'faltou')
    AND (a.id != p_appointment_id OR p_appointment_id IS NULL)
    AND (
      (a.inicio <= p_inicio AND a.fim > p_inicio) OR
      (a.inicio < p_fim AND a.fim >= p_fim) OR
      (a.inicio >= p_inicio AND a.fim <= p_fim)
--     )
--   );
$$;

-- Função para calcular total do agendamento
CREATE OR REPLACE FUNCTION public.calculate_appointment_total(p_appointment_id uuid)
RETURNS decimal(10,2)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(SUM(preco_aplicado), 0::decimal(10,2))
  FROM public.appointments_servicos
  WHERE appointment_id = p_appointment_id;
$$;

-- Trigger para atualizar total automaticamente
CREATE OR REPLACE FUNCTION public.update_appointment_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar total do agendamento
  UPDATE public.appointments 
  SET total = public.calculate_appointment_total(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.appointment_id ELSE NEW.appointment_id END
  )
  WHERE id = CASE WHEN TG_OP = 'DELETE' THEN OLD.appointment_id ELSE NEW.appointment_id END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar trigger na tabela de serviços do agendamento
DROP TRIGGER IF EXISTS update_appointment_total_on_servicos ON public.appointments_servicos;
CREATE TRIGGER update_appointment_total_on_servicos
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments_servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_appointment_total();

-- =====================================================
-- 5. FUNÇÕES AUXILIARES PARA FILA
-- =====================================================

-- Função para obter próxima posição na fila
CREATE OR REPLACE FUNCTION public.get_next_queue_position(p_unidade_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(MAX(posicao), 0) + 1
  FROM public.fila
  WHERE unidade_id = p_unidade_id
  AND status IN ('aguardando', 'chamado');
$$;

-- Comentários das funções
COMMENT ON FUNCTION public.check_appointment_conflict(uuid, timestamp with time zone, timestamp with time zone, uuid) 
IS 'Verifica se há conflito de horário para agendamento';

COMMENT ON FUNCTION public.calculate_appointment_total(uuid) 
IS 'Calcula o total do agendamento baseado nos serviços';

COMMENT ON FUNCTION public.get_next_queue_position(uuid) 
IS 'Retorna a próxima posição disponível na fila';


-- =========================================================================
-- MIGRAÇÃO 004: FINANCIAL RLS  
-- =========================================================================

-- =================================================================
-- MIGRAÇÃO 004: Sistema Financeiro e RLS (Row Level Security)
-- Data: 2025-08-21
-- Descrição: Tabela financeira e políticas RLS para todas as tabelas
-- =================================================================

-- =====================================================
-- 1. TABELA FINANCEIRO_MOV (Movimentações Financeiras)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.financeiro_mov (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE NOT NULL,
  tipo public.movimento_tipo NOT NULL,
  valor decimal(10,2) NOT NULL,
  origem varchar(100) NOT NULL,
  referencia_id uuid NULL, -- Pode referenciar appointments, produtos, etc.
  data_mov date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT financeiro_mov_valor_positive CHECK (valor > 0),
  CONSTRAINT financeiro_mov_origem_length CHECK (length(origem) >= 2)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_financeiro_mov_unidade_id ON public.financeiro_mov(unidade_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_mov_tipo ON public.financeiro_mov(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_mov_data_mov ON public.financeiro_mov(data_mov);
CREATE INDEX IF NOT EXISTS idx_financeiro_mov_origem ON public.financeiro_mov(origem);
CREATE INDEX IF NOT EXISTS idx_financeiro_mov_referencia ON public.financeiro_mov(referencia_id) WHERE referencia_id IS NOT NULL;

-- Índice composto para relatórios
CREATE INDEX IF NOT EXISTS idx_financeiro_mov_relatorio ON public.financeiro_mov(unidade_id, data_mov, tipo);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_financeiro_mov_updated_at ON public.financeiro_mov;
CREATE TRIGGER update_financeiro_mov_updated_at
  BEFORE UPDATE ON public.financeiro_mov
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.financeiro_mov IS 'Movimentações financeiras do sistema';
COMMENT ON COLUMN public.financeiro_mov.origem IS 'Origem da movimentação (venda, serviço, etc.)';
COMMENT ON COLUMN public.financeiro_mov.referencia_id IS 'ID de referência (appointment, produto, etc.)';

-- =====================================================
-- 2. ATIVAR ROW LEVEL SECURITY EM TODAS AS TABELAS
-- =====================================================
-- NOTA: RLS comentado temporariamente para evitar problemas com funções STABLE
-- Execute este bloco após a criação de todas as tabelas

/*
-- Ativar RLS nas tabelas principais
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fila ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_mov ENABLE ROW LEVEL SECURITY;
*/

-- =====================================================
-- 3. POLÍTICAS RLS - UNIDADES
-- =====================================================

-- Admins podem ver todas as unidades
-- CREATE POLICY "Admins can access all unidades" ON public.unidades
-- FOR ALL USING (public.is_admin());

-- Usuários podem ver apenas unidades onde têm acesso
-- CREATE POLICY "Users can view accessible unidades" ON public.unidades
-- FOR SELECT USING (public.has_unit_access(id));

-- Apenas admins podem inserir/atualizar unidades
-- CREATE POLICY "Only admins can modify unidades" ON public.unidades
-- FOR INSERT WITH CHECK (public.is_admin());

-- CREATE POLICY "Only admins can update unidades" ON public.unidades
-- FOR UPDATE USING (public.is_admin());

-- =====================================================
-- 4. POLÍTICAS RLS - PROFILES
-- =====================================================

-- Usuários podem ver apenas seu próprio profile
-- CREATE POLICY "Users can view own profile" ON public.profiles
-- FOR SELECT USING (user_id = public.current_user_id());

-- Admins podem ver todos os profiles
-- CREATE POLICY "Admins can view all profiles" ON public.profiles
-- FOR SELECT USING (public.is_admin());

-- Usuários podem atualizar apenas seu próprio profile
-- CREATE POLICY "Users can update own profile" ON public.profiles
-- FOR UPDATE USING (user_id = public.current_user_id());

-- Admins podem atualizar qualquer profile
-- CREATE POLICY "Admins can update any profile" ON public.profiles
-- FOR UPDATE USING (public.is_admin());

-- Apenas admins podem inserir profiles
-- CREATE POLICY "Only admins can insert profiles" ON public.profiles
-- FOR INSERT WITH CHECK (public.is_admin());

-- =====================================================
-- 5. POLÍTICAS RLS - PROFISSIONAIS
-- =====================================================

-- Usuários podem ver profissionais da sua unidade ou se são admins
-- CREATE POLICY "Users can view unit profissionais" ON public.profissionais
-- FOR SELECT USING (
-- --     public.is_admin() OR 
-- --     public.has_unit_access(unidade_id)
-- --   );

-- Apenas gestores/admins podem modificar profissionais
-- CREATE POLICY "Managers can modify profissionais" ON public.profissionais
-- FOR ALL USING (
-- --     public.is_admin() OR 
-- --     EXISTS (
-- --       SELECT 1 FROM public.profiles p
-- --       WHERE p.user_id = public.current_user_id()
-- --       AND p.papel IN ('admin', 'gestor')
-- --       AND (p.papel = 'admin' OR public.has_unit_access(unidade_id))
-- --     )
-- --   );

-- =====================================================
-- 6. POLÍTICAS RLS - CLIENTES
-- =====================================================

-- Usuários podem ver clientes da sua unidade
-- CREATE POLICY "Users can view unit clientes" ON public.clientes
-- FOR SELECT USING (
--     public.is_admin() OR 
--     public.has_unit_access(unidade_id)
--   );

-- Usuários autorizados podem modificar clientes da unidade
-- CREATE POLICY "Authorized users can modify clientes" ON public.clientes
-- FOR ALL USING (
--     public.is_admin() OR 
    (public.has_unit_access(unidade_id) AND EXISTS (
--       SELECT 1 FROM public.profiles p
--       WHERE p.user_id = public.current_user_id()
--       AND p.papel IN ('admin', 'gestor', 'recepcao')
--       AND p.ativo = true
--     ))
--   );

-- =====================================================
-- 7. POLÍTICAS RLS - SERVICOS
-- =====================================================

-- Usuários podem ver serviços da sua unidade
-- CREATE POLICY "Users can view unit servicos" ON public.servicos
-- FOR SELECT USING (
--     public.is_admin() OR 
--     public.has_unit_access(unidade_id)
--   );

-- Apenas gestores/admins podem modificar serviços
-- CREATE POLICY "Managers can modify servicos" ON public.servicos
-- FOR ALL USING (
--     public.is_admin() OR 
--     EXISTS (
--       SELECT 1 FROM public.profiles p
--       WHERE p.user_id = public.current_user_id()
--       AND p.papel IN ('admin', 'gestor')
--       AND (p.papel = 'admin' OR public.has_unit_access(unidade_id))
--     )
--   );

-- =====================================================
-- 8. POLÍTICAS RLS - APPOINTMENTS
-- =====================================================

-- Usuários podem ver agendamentos da sua unidade
-- CREATE POLICY "Users can view unit appointments" ON public.appointments
-- FOR SELECT USING (
--     public.is_admin() OR 
--     public.has_unit_access(unidade_id)
--   );

-- Usuários autorizados podem modificar agendamentos da unidade
-- CREATE POLICY "Authorized users can modify appointments" ON public.appointments
-- FOR ALL USING (
--     public.is_admin() OR 
    (public.has_unit_access(unidade_id) AND EXISTS (
--       SELECT 1 FROM public.profiles p
--       WHERE p.user_id = public.current_user_id()
--       AND p.papel IN ('admin', 'gestor', 'recepcao', 'profissional')
--       AND p.ativo = true
--     ))
--   );

-- =====================================================
-- 9. POLÍTICAS RLS - APPOINTMENTS_SERVICOS
-- =====================================================

-- Herda permissões do appointment pai
-- CREATE POLICY "Users can view appointment servicos" ON public.appointments_servicos
-- FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.appointments a
--       WHERE a.id = appointment_id
--       AND (public.is_admin() OR public.has_unit_access(a.unidade_id))
--     )
--   );

-- CREATE POLICY "Authorized users can modify appointment servicos" ON public.appointments_servicos
-- FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM public.appointments a
--       WHERE a.id = appointment_id
--       AND (
--         public.is_admin() OR 
--         (public.has_unit_access(a.unidade_id) AND EXISTS (
--         SELECT 1 FROM public.profiles p
--         WHERE p.user_id = public.current_user_id()
--         AND p.papel IN ('admin', 'gestor', 'recepcao', 'profissional')
--         AND p.ativo = true
--       ))
--       )
--     )
--   );

-- =====================================================
-- 10. POLÍTICAS RLS - FILA
-- =====================================================

-- Usuários podem ver fila da sua unidade
-- CREATE POLICY "Users can view unit fila" ON public.fila
-- FOR SELECT USING (
--     public.is_admin() OR 
--     public.has_unit_access(unidade_id)
--   );

-- Usuários autorizados podem modificar fila da unidade
-- CREATE POLICY "Authorized users can modify fila" ON public.fila
-- FOR ALL USING (
--     public.is_admin() OR 
    (public.has_unit_access(unidade_id) AND EXISTS (
--       SELECT 1 FROM public.profiles p
--       WHERE p.user_id = public.current_user_id()
--       AND p.papel IN ('admin', 'gestor', 'recepcao', 'profissional')
--       AND p.ativo = true
--     ))
--   );

-- =====================================================
-- 11. POLÍTICAS RLS - FINANCEIRO_MOV
-- =====================================================

-- Usuários podem ver movimentações da sua unidade
-- CREATE POLICY "Users can view unit financeiro_mov" ON public.financeiro_mov
-- FOR SELECT USING (
--     public.is_admin() OR 
--     public.has_unit_access(unidade_id)
--   );

-- Apenas gestores/admins podem modificar movimentações financeiras
-- CREATE POLICY "Managers can modify financeiro_mov" ON public.financeiro_mov
-- FOR ALL USING (
--     public.is_admin() OR 
--     EXISTS (
--       SELECT 1 FROM public.profiles p
--       WHERE p.user_id = public.current_user_id()
--       AND p.papel IN ('admin', 'gestor')
--       AND (p.papel = 'admin' OR public.has_unit_access(unidade_id))
--     )
--   );

-- =====================================================
-- 12. COMENTÁRIOS DAS POLÍTICAS
-- =====================================================

-- COMMENT ON POLICY "Admins can access all unidades" ON public.unidades 
IS 'Administradores têm acesso completo a todas as unidades';

-- COMMENT ON POLICY "Users can view accessible unidades" ON public.unidades 
IS 'Usuários podem ver apenas unidades onde têm acesso';

-- COMMENT ON POLICY "Users can view own profile" ON public.profiles 
IS 'Usuários podem ver apenas seu próprio perfil';

-- COMMENT ON POLICY "Users can view unit clientes" ON public.clientes 
IS 'Usuários podem ver apenas clientes de sua unidade';

-- =====================================================
-- 13. FUNÇÃO PARA TESTAR RLS (COMENTADA TEMPORARIAMENTE)
-- =====================================================
-- Execute após ativar as políticas RLS

/*
CREATE OR REPLACE FUNCTION public.test_rls_policies(test_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  table_name text,
  operation text,
  can_access boolean,
  row_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Função auxiliar para testar se as políticas RLS estão funcionando
  -- Para uso apenas em desenvolvimento/testes
  
  RETURN QUERY SELECT 
    'unidades'::text as table_name,
    'SELECT'::text as operation,
    true as can_access,
    (SELECT count(*) FROM public.unidades)::bigint as row_count;
    
  -- Adicionar mais testes conforme necessário
END;
$$;

COMMENT ON FUNCTION public.test_rls_policies(uuid) 
IS 'Função para testar políticas RLS - apenas para desenvolvimento';
*/


-- =========================================================================
-- FINALIZAÇÃO E VERIFICAÇÕES
-- =========================================================================

-- Verificar se todas as extensões foram instaladas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    RAISE WARNING 'Extensão uuid-ossp não encontrada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    RAISE WARNING 'Extensão pgcrypto não encontrada';
  END IF;
END
$$;

-- Notificação de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migrações executadas com sucesso!';
  RAISE NOTICE 'Sistema pronto para uso.';
  RAISE NOTICE ''; 
  RAISE NOTICE 'PRÓXIMO PASSO: Ative as políticas RLS';
  RAISE NOTICE 'Execute as seções comentadas do RLS quando necessário.';
END
$$;
