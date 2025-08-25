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
-- =================================================================
-- MIGRAÇÃO 002: Tabelas Core do Sistema
-- Data: 2025-08-21
-- Descrição: Unidades, Profiles, Profissionais, Clientes, Serviços
-- =================================================================

-- =====================================================
-- 1. TABELA UNIDADES
-- =====================================================

CREATE TABLE public.unidades (
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
CREATE INDEX idx_unidades_ativo ON public.unidades(ativo);
CREATE INDEX idx_unidades_nome ON public.unidades(nome);
CREATE UNIQUE INDEX idx_unidades_cnpj ON public.unidades(cnpj) WHERE cnpj IS NOT NULL;

-- Trigger para updated_at
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

CREATE TABLE public.profiles (
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
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_unidade_default ON public.profiles(unidade_default_id);
CREATE INDEX idx_profiles_papel ON public.profiles(papel);
CREATE INDEX idx_profiles_ativo ON public.profiles(ativo);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema';
COMMENT ON COLUMN public.profiles.user_id IS 'Referência para auth.users do Supabase';
COMMENT ON COLUMN public.profiles.unidade_default_id IS 'Unidade padrão do usuário';

-- =====================================================
-- 2.1. FUNÇÕES DE SEGURANÇA (dependem de profiles)
-- =====================================================

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

-- Função para verificar se usuário é administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.user_id = public.current_user_id()
    AND p.papel = 'admin'::user_role
  );
$$;

-- Comentários das funções
COMMENT ON FUNCTION public.current_unidade_id() IS 'Obtém a unidade padrão do usuário atual';
COMMENT ON FUNCTION public.has_unit_access(uuid) IS 'Verifica se usuário tem acesso à unidade';
COMMENT ON FUNCTION public.is_admin() IS 'Verifica se usuário é administrador';

-- =====================================================
-- 3. TABELA PROFISSIONAIS
-- =====================================================

CREATE TABLE public.profissionais (
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
CREATE INDEX idx_profissionais_unidade_id ON public.profissionais(unidade_id);
CREATE INDEX idx_profissionais_ativo ON public.profissionais(ativo);
CREATE INDEX idx_profissionais_papel ON public.profissionais(papel);

-- Trigger para updated_at
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

CREATE TABLE public.clientes (
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
CREATE INDEX idx_clientes_unidade_id ON public.clientes(unidade_id);
CREATE INDEX idx_clientes_ativo ON public.clientes(ativo);
CREATE INDEX idx_clientes_nome ON public.clientes(nome);
CREATE INDEX idx_clientes_telefone ON public.clientes(telefone) WHERE telefone IS NOT NULL;
CREATE INDEX idx_clientes_email ON public.clientes(email) WHERE email IS NOT NULL;

-- Trigger para updated_at
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

CREATE TABLE public.servicos (
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
CREATE INDEX idx_servicos_unidade_id ON public.servicos(unidade_id);
CREATE INDEX idx_servicos_ativo ON public.servicos(ativo);
CREATE INDEX idx_servicos_categoria ON public.servicos(categoria);
CREATE INDEX idx_servicos_preco ON public.servicos(preco);

-- Trigger para updated_at
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
-- =================================================================
-- MIGRAÇÃO 003: Agendamentos e Sistema de Fila
-- Data: 2025-08-21
-- Descrição: Appointments, Appointments_Servicos, Fila
-- =================================================================

-- =====================================================
-- 1. TABELA APPOINTMENTS (Agendamentos)
-- =====================================================

CREATE TABLE public.appointments (
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

-- Função IMMUTABLE para extrair data de timestamp
CREATE OR REPLACE FUNCTION public.extract_date_immutable(timestamp with time zone)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT $1::date;
$$;

-- Índices para performance e queries frequentes
CREATE INDEX idx_appointments_unidade_id ON public.appointments(unidade_id);
CREATE INDEX idx_appointments_cliente_id ON public.appointments(cliente_id);
CREATE INDEX idx_appointments_profissional_id ON public.appointments(profissional_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_inicio ON public.appointments(inicio);
CREATE INDEX idx_appointments_data ON public.appointments(extract_date_immutable(inicio));

-- Índice composto para consultas de agenda
CREATE INDEX idx_appointments_profissional_data ON public.appointments(profissional_id, extract_date_immutable(inicio));
CREATE INDEX idx_appointments_unidade_data ON public.appointments(unidade_id, extract_date_immutable(inicio));

-- Índice para detectar conflitos de horário
CREATE INDEX idx_appointments_conflict ON public.appointments(profissional_id, inicio, fim);

-- Constraint única para prevenir agendamentos duplicados exatos
CREATE UNIQUE INDEX idx_appointments_unique_slot 
ON public.appointments(profissional_id, inicio, fim)
WHERE status NOT IN ('cancelado', 'faltou');

-- Trigger para updated_at
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

CREATE TABLE public.appointments_servicos (
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
CREATE INDEX idx_appointments_servicos_appointment ON public.appointments_servicos(appointment_id);
CREATE INDEX idx_appointments_servicos_servico ON public.appointments_servicos(servico_id);

-- Constraint única para evitar serviços duplicados no mesmo agendamento
CREATE UNIQUE INDEX idx_appointments_servicos_unique 
ON public.appointments_servicos(appointment_id, servico_id);

-- Comentários
COMMENT ON TABLE public.appointments_servicos IS 'Serviços incluídos em cada agendamento';
COMMENT ON COLUMN public.appointments_servicos.preco_aplicado IS 'Preço que foi aplicado no momento (histórico)';
COMMENT ON COLUMN public.appointments_servicos.duracao_aplicada IS 'Duração aplicada em minutos';

-- =====================================================
-- 3. TABELA FILA (Sistema de Lista de Espera)
-- =====================================================

CREATE TABLE public.fila (
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
CREATE INDEX idx_fila_unidade_id ON public.fila(unidade_id);
CREATE INDEX idx_fila_cliente_id ON public.fila(cliente_id);
CREATE INDEX idx_fila_status ON public.fila(status);
CREATE INDEX idx_fila_prioridade ON public.fila(prioridade);
CREATE INDEX idx_fila_posicao ON public.fila(posicao);

-- Índice composto para ordenação da fila
CREATE INDEX idx_fila_ordenacao ON public.fila(unidade_id, status, prioridade, posicao);

-- Constraint única para posição por unidade (entre itens ativos)
CREATE UNIQUE INDEX idx_fila_posicao_unique 
ON public.fila(unidade_id, posicao)
WHERE status IN ('aguardando', 'chamado');

-- Constraint para evitar cliente duplicado na fila ativa
CREATE UNIQUE INDEX idx_fila_cliente_ativo
ON public.fila(unidade_id, cliente_id)
WHERE status IN ('aguardando', 'chamado', 'em_atendimento');

-- Trigger para updated_at
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
    )
  );
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
-- =================================================================
-- MIGRAÇÃO 004: Sistema Financeiro e RLS (Row Level Security)
-- Data: 2025-08-21
-- Descrição: Tabela financeira e políticas RLS para todas as tabelas
-- =================================================================

-- =====================================================
-- 1. TABELA FINANCEIRO_MOV (Movimentações Financeiras)
-- =====================================================

CREATE TABLE public.financeiro_mov (
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
CREATE INDEX idx_financeiro_mov_unidade_id ON public.financeiro_mov(unidade_id);
CREATE INDEX idx_financeiro_mov_tipo ON public.financeiro_mov(tipo);
CREATE INDEX idx_financeiro_mov_data_mov ON public.financeiro_mov(data_mov);
CREATE INDEX idx_financeiro_mov_origem ON public.financeiro_mov(origem);
CREATE INDEX idx_financeiro_mov_referencia ON public.financeiro_mov(referencia_id) WHERE referencia_id IS NOT NULL;

-- Índice composto para relatórios
CREATE INDEX idx_financeiro_mov_relatorio ON public.financeiro_mov(unidade_id, data_mov, tipo);

-- Trigger para updated_at
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

-- =====================================================
-- 3. POLÍTICAS RLS - UNIDADES
-- =====================================================

-- Admins podem ver todas as unidades
CREATE POLICY "Admins can access all unidades" ON public.unidades
  FOR ALL USING (public.is_admin());

-- Usuários podem ver apenas unidades onde têm acesso
CREATE POLICY "Users can view accessible unidades" ON public.unidades
  FOR SELECT USING (public.has_unit_access(id));

-- Apenas admins podem inserir/atualizar unidades
CREATE POLICY "Only admins can modify unidades" ON public.unidades
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update unidades" ON public.unidades
  FOR UPDATE USING (public.is_admin());

-- =====================================================
-- 4. POLÍTICAS RLS - PROFILES
-- =====================================================

-- Usuários podem ver apenas seu próprio profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = public.current_user_id());

-- Admins podem ver todos os profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Usuários podem atualizar apenas seu próprio profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = public.current_user_id());

-- Admins podem atualizar qualquer profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Apenas admins podem inserir profiles
CREATE POLICY "Only admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

-- =====================================================
-- 5. POLÍTICAS RLS - PROFISSIONAIS
-- =====================================================

-- Usuários podem ver profissionais da sua unidade ou se são admins
CREATE POLICY "Users can view unit profissionais" ON public.profissionais
  FOR SELECT USING (
    public.is_admin() OR 
    public.has_unit_access(unidade_id)
  );

-- Apenas gestores/admins podem modificar profissionais
CREATE POLICY "Managers can modify profissionais" ON public.profissionais
  FOR ALL USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = public.current_user_id()
      AND p.papel IN ('admin', 'gestor')
      AND (p.papel = 'admin' OR public.has_unit_access(unidade_id))
    )
  );

-- =====================================================
-- 6. POLÍTICAS RLS - CLIENTES
-- =====================================================

-- Usuários podem ver clientes da sua unidade
CREATE POLICY "Users can view unit clientes" ON public.clientes
  FOR SELECT USING (
    public.is_admin() OR 
    public.has_unit_access(unidade_id)
  );

-- Usuários autorizados podem modificar clientes da unidade
CREATE POLICY "Authorized users can modify clientes" ON public.clientes
  FOR ALL USING (
    public.is_admin() OR 
    (public.has_unit_access(unidade_id) AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = public.current_user_id()
      AND p.papel IN ('admin', 'gestor', 'recepcao')
      AND p.ativo = true
    ))
  );

-- =====================================================
-- 7. POLÍTICAS RLS - SERVICOS
-- =====================================================

-- Usuários podem ver serviços da sua unidade
CREATE POLICY "Users can view unit servicos" ON public.servicos
  FOR SELECT USING (
    public.is_admin() OR 
    public.has_unit_access(unidade_id)
  );

-- Apenas gestores/admins podem modificar serviços
CREATE POLICY "Managers can modify servicos" ON public.servicos
  FOR ALL USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = public.current_user_id()
      AND p.papel IN ('admin', 'gestor')
      AND (p.papel = 'admin' OR public.has_unit_access(unidade_id))
    )
  );

-- =====================================================
-- 8. POLÍTICAS RLS - APPOINTMENTS
-- =====================================================

-- Usuários podem ver agendamentos da sua unidade
CREATE POLICY "Users can view unit appointments" ON public.appointments
  FOR SELECT USING (
    public.is_admin() OR 
    public.has_unit_access(unidade_id)
  );

-- Usuários autorizados podem modificar agendamentos da unidade
CREATE POLICY "Authorized users can modify appointments" ON public.appointments
  FOR ALL USING (
    public.is_admin() OR 
    (public.has_unit_access(unidade_id) AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = public.current_user_id()
      AND p.papel IN ('admin', 'gestor', 'recepcao', 'profissional')
      AND p.ativo = true
    ))
  );

-- =====================================================
-- 9. POLÍTICAS RLS - APPOINTMENTS_SERVICOS
-- =====================================================

-- Herda permissões do appointment pai
CREATE POLICY "Users can view appointment servicos" ON public.appointments_servicos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_id
      AND (public.is_admin() OR public.has_unit_access(a.unidade_id))
    )
  );

CREATE POLICY "Authorized users can modify appointment servicos" ON public.appointments_servicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_id
      AND (
        public.is_admin() OR 
        (public.has_unit_access(a.unidade_id) AND EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = public.current_user_id()
          AND p.papel IN ('admin', 'gestor', 'recepcao', 'profissional')
          AND p.ativo = true
        ))
      )
    )
  );

-- =====================================================
-- 10. POLÍTICAS RLS - FILA
-- =====================================================

-- Usuários podem ver fila da sua unidade
CREATE POLICY "Users can view unit fila" ON public.fila
  FOR SELECT USING (
    public.is_admin() OR 
    public.has_unit_access(unidade_id)
  );

-- Usuários autorizados podem modificar fila da unidade
CREATE POLICY "Authorized users can modify fila" ON public.fila
  FOR ALL USING (
    public.is_admin() OR 
    (public.has_unit_access(unidade_id) AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = public.current_user_id()
      AND p.papel IN ('admin', 'gestor', 'recepcao', 'profissional')
      AND p.ativo = true
    ))
  );

-- =====================================================
-- 11. POLÍTICAS RLS - FINANCEIRO_MOV
-- =====================================================

-- Usuários podem ver movimentações da sua unidade
CREATE POLICY "Users can view unit financeiro_mov" ON public.financeiro_mov
  FOR SELECT USING (
    public.is_admin() OR 
    public.has_unit_access(unidade_id)
  );

-- Apenas gestores/admins podem modificar movimentações financeiras
CREATE POLICY "Managers can modify financeiro_mov" ON public.financeiro_mov
  FOR ALL USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = public.current_user_id()
      AND p.papel IN ('admin', 'gestor')
      AND (p.papel = 'admin' OR public.has_unit_access(unidade_id))
    )
  );

-- =====================================================
-- 12. COMENTÁRIOS DAS POLÍTICAS
-- =====================================================

COMMENT ON POLICY "Admins can access all unidades" ON public.unidades 
IS 'Administradores têm acesso completo a todas as unidades';

COMMENT ON POLICY "Users can view accessible unidades" ON public.unidades 
IS 'Usuários podem ver apenas unidades onde têm acesso';

COMMENT ON POLICY "Users can view own profile" ON public.profiles 
IS 'Usuários podem ver apenas seu próprio perfil';

COMMENT ON POLICY "Users can view unit clientes" ON public.clientes 
IS 'Usuários podem ver apenas clientes de sua unidade';

-- =====================================================
-- 13. FUNÇÃO PARA TESTAR RLS
-- =====================================================

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
-- =====================================
-- 005_produtos_vendas.sql
-- Criação de tabelas para Produtos e Vendas
-- =====================================
-- =====================================
-- Tabela de Produtos
-- =====================================
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    estoque INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================
-- Tabela de Vendas
-- =====================================
CREATE TABLE IF NOT EXISTS public.vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE
    SET NULL,
        profissional_id UUID REFERENCES public.profissionais(id) ON DELETE
    SET NULL,
        valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'aberta',
        -- aberta, paga, cancelada
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================
-- Itens da Venda
-- =====================================
CREATE TABLE IF NOT EXISTS public.vendas_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED
);
-- =====================================
-- Atualiza controle de migrações
-- =====================================
INSERT INTO public.migrations (version, name, executed_at)
VALUES ('005', 'produtos_vendas', NOW()) ON CONFLICT (version) DO NOTHING;
-- =====================================
-- Tabela de Planos de Assinatura
-- =====================================
create table if not exists public.planos (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid not null references public.unidades(id) on delete cascade,
    nome text not null,
    descricao text,
    preco numeric(10, 2) not null,
    duracao_meses int not null,
    -- 1, 3, 6, 12...
    ativo boolean default true,
    created_at timestamp with time zone default now()
);
-- =====================================
-- Tabela de Assinaturas
-- =====================================
create table if not exists public.assinaturas (
    id uuid primary key default uuid_generate_v4(),
    plano_id uuid not null references public.planos(id),
    cliente_id uuid not null references public.clientes(id) on delete cascade,
    unidade_id uuid not null references public.unidades(id) on delete cascade,
    inicio date not null default current_date,
    fim date not null,
    status text not null default 'ativa',
    -- ativa, cancelada, expirada
    created_at timestamp with time zone default now()
);
-- =====================================
-- Tabela de Pagamentos de Assinaturas
-- =====================================
create table if not exists public.pagamentos_assinaturas (
    id uuid primary key default uuid_generate_v4(),
    assinatura_id uuid not null references public.assinaturas(id) on delete cascade,
    valor numeric(10, 2) not null,
    metodo text not null,
    -- cartão, pix, boleto
    status text not null default 'pendente',
    -- pendente, pago, falhou
    data_pagamento timestamp with time zone default now()
);
-- =====================================
-- Tabela de Notificações
-- =====================================
create table if not exists public.notificacoes (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid references public.unidades(id) on delete cascade,
    usuario_id uuid references public.profiles(id) on delete cascade,
    titulo text not null,
    mensagem text not null,
    lida boolean default false,
    tipo text,
    -- sistema, financeiro, agendamento
    created_at timestamp with time zone default now()
);
-- =====================================
-- Tabela de Logs de Sistema
-- =====================================
create table if not exists public.logs (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid references public.unidades(id) on delete cascade,
    usuario_id uuid references public.profiles(id) on delete
    set null,
        acao text not null,
        detalhes jsonb,
        created_at timestamp with time zone default now()
);
-- =====================================
-- View: Faturamento Diário
-- =====================================
create or replace view public.relatorio_faturamento_diario as
select unidade_id,
    date(created_at) as dia,
    sum(valor_total) as faturamento
from public.vendas
where status = 'paga'
group by unidade_id,
    date(created_at);
-- =====================================
-- View: Top Profissionais (por período)
-- =====================================
create or replace view public.relatorio_top_profissionais as
select v.unidade_id,
    v.profissional_id,
    sum(v.valor_total) as total_faturado,
    count(v.id) as qtd_vendas
from public.vendas v
where v.status = 'paga'
group by v.unidade_id,
    v.profissional_id;
-- =====================================
-- View: Assinaturas Ativas
-- =====================================
create or replace view public.relatorio_assinaturas_ativas as
select unidade_id,
    count(id) as total_ativas
from public.assinaturas
where status = 'ativa'
group by unidade_id;
-- =================================================================
-- MIGRAÇÃO 009: Tabela de Horários dos Profissionais
-- Data: 2025-08-21
-- Descrição: Horários de trabalho dos profissionais por dia da semana
-- =================================================================

-- Migration 009: Profissional Horários
-- Controle: versão 009 aplicada em 2025-08-21

-- =====================================================
-- TABELA PROFISSIONAL_HORARIOS
-- =====================================================

CREATE TABLE public.profissional_horarios (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profissional_id uuid REFERENCES public.profissionais(id) ON DELETE CASCADE NOT NULL,
  dia_semana integer NOT NULL, -- 0=domingo, 1=segunda, ..., 6=sábado
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  intervalo_inicio time NULL,
  intervalo_fim time NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT horarios_dia_semana_valido CHECK (dia_semana >= 0 AND dia_semana <= 6),
  CONSTRAINT horarios_hora_inicio_fim CHECK (hora_fim > hora_inicio),
  CONSTRAINT horarios_intervalo_valido CHECK (
    (intervalo_inicio IS NULL AND intervalo_fim IS NULL) OR
    (intervalo_inicio IS NOT NULL AND intervalo_fim IS NOT NULL AND intervalo_fim > intervalo_inicio)
  ),
  CONSTRAINT horarios_intervalo_dentro_horario CHECK (
    (intervalo_inicio IS NULL) OR 
    (intervalo_inicio >= hora_inicio AND intervalo_fim <= hora_fim)
  )
);

-- Índices
CREATE INDEX idx_profissional_horarios_profissional_id ON public.profissional_horarios(profissional_id);
CREATE INDEX idx_profissional_horarios_dia_semana ON public.profissional_horarios(dia_semana);
CREATE INDEX idx_profissional_horarios_ativo ON public.profissional_horarios(ativo);
CREATE INDEX idx_profissional_horarios_profissional_dia ON public.profissional_horarios(profissional_id, dia_semana);

-- Índice único para evitar horários sobrepostos do mesmo profissional no mesmo dia
-- Não podemos usar constraint unique por causa da sobreposição de horários
-- A validação será feita na aplicação

-- Trigger para updated_at
CREATE TRIGGER update_profissional_horarios_updated_at
  BEFORE UPDATE ON public.profissional_horarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.profissional_horarios IS 'Horários de trabalho dos profissionais por dia da semana';
COMMENT ON COLUMN public.profissional_horarios.dia_semana IS '0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado';
COMMENT ON COLUMN public.profissional_horarios.intervalo_inicio IS 'Horário de início do intervalo (almoço/descanso)';
COMMENT ON COLUMN public.profissional_horarios.intervalo_fim IS 'Horário de fim do intervalo (almoço/descanso)';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.profissional_horarios ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver horários dos profissionais da sua unidade
CREATE POLICY "Users can view unit profissional horarios" ON public.profissional_horarios
  FOR SELECT USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.profissionais p
      WHERE p.id = profissional_id 
      AND public.has_unit_access(p.unidade_id)
    )
  );

-- Gestores e admins podem modificar horários dos profissionais da unidade
CREATE POLICY "Managers can modify profissional horarios" ON public.profissional_horarios
  FOR ALL USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.profissionais p, public.profiles prof
      WHERE p.id = profissional_id 
      AND prof.user_id = public.current_user_id()
      AND prof.papel IN ('admin', 'gestor')
      AND prof.ativo = true
      AND (prof.papel = 'admin' OR public.has_unit_access(p.unidade_id))
    )
  );

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL - para desenvolvimento)
-- =====================================================

-- Inserir horários padrão para profissionais existentes (se houver)
-- Esta seção pode ser removida em produção

-- Comentários finais
COMMENT ON TABLE public.profissional_horarios IS 'Migration 009: Tabela de horários dos profissionais - 2025-08-21';
-- =================================================================
-- MIGRAÇÃO 010: Preços Customizados de Serviços por Profissional
-- Data: 2025-08-21
-- Descrição: Permite preços diferentes por profissional para cada serviço
-- =================================================================

-- Migration 010: Preços por profissional
-- Controle: versão 010 aplicada em 2025-08-21

-- =====================================================
-- TABELA SERVICOS_PRECOS_PROFISSIONAL
-- =====================================================

CREATE TABLE public.servicos_precos_profissional (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  servico_id uuid REFERENCES public.servicos(id) ON DELETE CASCADE NOT NULL,
  profissional_id uuid REFERENCES public.profissionais(id) ON DELETE CASCADE NOT NULL,
  preco_customizado decimal(10,2) NOT NULL,
  duracao_customizada integer NULL, -- Se NULL, usa duração padrão do serviço
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT servicos_precos_preco_positive CHECK (preco_customizado > 0),
  CONSTRAINT servicos_precos_duracao_positive CHECK (duracao_customizada IS NULL OR duracao_customizada > 0)
);

-- Índices
CREATE INDEX idx_servicos_precos_servico_id ON public.servicos_precos_profissional(servico_id);
CREATE INDEX idx_servicos_precos_profissional_id ON public.servicos_precos_profissional(profissional_id);
CREATE INDEX idx_servicos_precos_ativo ON public.servicos_precos_profissional(ativo);

-- Índice único para evitar duplicação de preço para mesmo serviço/profissional
CREATE UNIQUE INDEX idx_servicos_precos_unique 
ON public.servicos_precos_profissional(servico_id, profissional_id) 
WHERE ativo = true;

-- Trigger para updated_at
CREATE TRIGGER update_servicos_precos_profissional_updated_at
  BEFORE UPDATE ON public.servicos_precos_profissional
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.servicos_precos_profissional IS 'Preços customizados de serviços por profissional';
COMMENT ON COLUMN public.servicos_precos_profissional.preco_customizado IS 'Preço específico do profissional para este serviço';
COMMENT ON COLUMN public.servicos_precos_profissional.duracao_customizada IS 'Duração específica em minutos (NULL = usar padrão do serviço)';

-- =====================================================
-- TABELA SERVICOS_CATEGORIAS (Sistema de Categorias)
-- =====================================================

CREATE TABLE public.servicos_categorias (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome varchar(50) NOT NULL,
  descricao text NULL,
  cor varchar(7) NULL, -- Código hex para cor da categoria #RRGGBB
  icone varchar(50) NULL, -- Nome do ícone (ex: 'cut', 'color', 'wash')
  ordem integer DEFAULT 0 NOT NULL,
  unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT categorias_nome_length CHECK (length(nome) >= 2),
  CONSTRAINT categorias_cor_formato CHECK (cor IS NULL OR cor ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT categorias_ordem_positive CHECK (ordem >= 0)
);

-- Índices
CREATE INDEX idx_servicos_categorias_unidade_id ON public.servicos_categorias(unidade_id);
CREATE INDEX idx_servicos_categorias_ativo ON public.servicos_categorias(ativo);
CREATE INDEX idx_servicos_categorias_ordem ON public.servicos_categorias(ordem);

-- Índice único para evitar nomes duplicados na mesma unidade
CREATE UNIQUE INDEX idx_servicos_categorias_nome_unidade 
ON public.servicos_categorias(nome, unidade_id) 
WHERE ativo = true;

-- Trigger para updated_at
CREATE TRIGGER update_servicos_categorias_updated_at
  BEFORE UPDATE ON public.servicos_categorias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.servicos_categorias IS 'Categorias de serviços personalizáveis por unidade';
COMMENT ON COLUMN public.servicos_categorias.cor IS 'Cor da categoria em formato hexadecimal (#RRGGBB)';
COMMENT ON COLUMN public.servicos_categorias.icone IS 'Nome do ícone para representar a categoria';
COMMENT ON COLUMN public.servicos_categorias.ordem IS 'Ordem de exibição das categorias';

-- =====================================================
-- ALTERAR TABELA SERVICOS PARA USAR CATEGORIA_ID
-- =====================================================

-- Adicionar coluna categoria_id (opcional, manter categoria como texto também)
ALTER TABLE public.servicos 
ADD COLUMN categoria_id uuid REFERENCES public.servicos_categorias(id) ON DELETE SET NULL;

-- Índice para a nova coluna
CREATE INDEX idx_servicos_categoria_id ON public.servicos(categoria_id);

-- Comentário
COMMENT ON COLUMN public.servicos.categoria_id IS 'Referência para categoria estruturada (opcional, pode usar categoria texto)';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.servicos_precos_profissional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_categorias ENABLE ROW LEVEL SECURITY;

-- Políticas para servicos_precos_profissional
CREATE POLICY "Users can view unit servicos precos" ON public.servicos_precos_profissional
  FOR SELECT USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.servicos s, public.profissionais p
      WHERE s.id = servico_id 
      AND p.id = profissional_id
      AND (public.has_unit_access(s.unidade_id) OR public.has_unit_access(p.unidade_id))
    )
  );

CREATE POLICY "Managers can modify servicos precos" ON public.servicos_precos_profissional
  FOR ALL USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.servicos s, public.profissionais p, public.profiles prof
      WHERE s.id = servico_id 
      AND p.id = profissional_id
      AND prof.user_id = public.current_user_id()
      AND prof.papel IN ('admin', 'gestor')
      AND prof.ativo = true
      AND (prof.papel = 'admin' OR (public.has_unit_access(s.unidade_id) AND public.has_unit_access(p.unidade_id)))
    )
  );

-- Políticas para servicos_categorias
CREATE POLICY "Users can view unit categorias" ON public.servicos_categorias
  FOR SELECT USING (
    public.is_admin() OR 
    public.has_unit_access(unidade_id)
  );

CREATE POLICY "Managers can modify categorias" ON public.servicos_categorias
  FOR ALL USING (
    public.is_admin() OR 
    (public.has_unit_access(unidade_id) AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = public.current_user_id()
      AND p.papel IN ('admin', 'gestor')
      AND p.ativo = true
    ))
  );

-- =====================================================
-- DADOS INICIAIS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Inserir algumas categorias padrão (pode ser removido em produção)
-- Estas serão criadas dinamicamente pela aplicação conforme necessário

-- Comentários finais
COMMENT ON TABLE public.servicos_precos_profissional IS 'Migration 010: Preços customizados por profissional - 2025-08-21';
COMMENT ON TABLE public.servicos_categorias IS 'Migration 010: Sistema de categorias de serviços - 2025-08-21';
-- =====================================
-- EP19: Pagamentos Externos (Revisado)
-- =====================================

-- Tabela de Tipos de Pagamento
create table if not exists public.tipos_pagamento (
    id uuid primary key default uuid_generate_v4(),
    codigo text unique not null, -- 'asaas_pix', 'asaas_cartao', 'dinheiro', 'transferencia', 'maquininha'
    nome text not null,
    descricao text,
    icone text, -- nome do ícone Material-UI
    cor text, -- cor hex para UI
    requer_asaas boolean default false,
    ativo boolean default true,
    ordem int default 0,
    created_at timestamp with time zone default now()
);

-- Inserir tipos padrão
insert into public.tipos_pagamento (codigo, nome, descricao, icone, cor, requer_asaas, ordem) values
('asaas_pix', 'PIX (ASAAS)', 'Pagamento via PIX processado pelo ASAAS', 'Pix', '#32BCAD', true, 1),
('asaas_cartao', 'Cartão (ASAAS)', 'Cartão de crédito/débito via ASAAS', 'CreditCard', '#4CAF50', true, 2),
('dinheiro', 'Dinheiro', 'Pagamento em espécie', 'AttachMoney', '#FF9800', false, 3),
('transferencia', 'Transferência', 'Transferência bancária externa', 'AccountBalance', '#2196F3', false, 4),
('maquininha', 'Maquininha', 'Cartão na maquininha própria', 'Payment', '#9C27B0', false, 5);

-- Tabela de Transações Financeiras (Unificada)
create table if not exists public.transacoes (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid not null references public.unidades(id) on delete cascade,
    cliente_id uuid references public.clientes(id) on delete set null,
    profissional_id uuid references public.profissionais(id) on delete set null,
    
    -- Dados da transação
    tipo text not null, -- 'venda', 'assinatura', 'estorno'
    valor numeric(10, 2) not null,
    descricao text not null,
    
    -- Meio de pagamento
    tipo_pagamento_id uuid not null references public.tipos_pagamento(id),
    
    -- Dados ASAAS (quando aplicável)
    asaas_payment_id text,
    asaas_customer_id text,
    asaas_status text,
    
    -- Dados externos (quando aplicável)
    comprovante_url text,
    observacoes text,
    
    -- Metadados
    data_transacao timestamp with time zone default now(),
    status text not null default 'confirmado', -- 'pendente', 'confirmado', 'cancelado'
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Tabela de Itens da Transação
create table if not exists public.itens_transacao (
    id uuid primary key default uuid_generate_v4(),
    transacao_id uuid not null references public.transacoes(id) on delete cascade,
    
    -- Referência ao item vendido
    tipo_item text not null, -- 'servico', 'produto'
    servico_id uuid references public.servicos(id) on delete set null,
    produto_id uuid references public.produtos(id) on delete set null,
    
    -- Dados do item
    nome text not null,
    quantidade numeric(10, 2) not null default 1,
    valor_unitario numeric(10, 2) not null,
    valor_total numeric(10, 2) not null,
    
    -- Comissão (se aplicável)
    comissao_percentual numeric(5, 2),
    comissao_valor numeric(10, 2),
    
    created_at timestamp with time zone default now()
);

-- Índices para performance
create index if not exists idx_transacoes_unidade_data on public.transacoes(unidade_id, data_transacao);
create index if not exists idx_transacoes_tipo_pagamento on public.transacoes(tipo_pagamento_id);
create index if not exists idx_transacoes_profissional on public.transacoes(profissional_id);
create index if not exists idx_transacoes_status on public.transacoes(status);
create index if not exists idx_itens_transacao on public.itens_transacao(transacao_id);

-- RLS Policies
alter table public.tipos_pagamento enable row level security;
alter table public.transacoes enable row level security;
alter table public.itens_transacao enable row level security;

-- Tipos de pagamento são visíveis para todos os usuários autenticados
create policy "Tipos de pagamento são públicos" on public.tipos_pagamento
    for select using (auth.role() = 'authenticated');

-- Transações por unidade
create policy "Usuários veem transações da sua unidade" on public.transacoes
    for select using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

create policy "Usuários inserem transações na sua unidade" on public.transacoes
    for insert with check (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

create policy "Usuários atualizam transações da sua unidade" on public.transacoes
    for update using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

-- Itens de transação seguem a mesma regra da transação pai
create policy "Usuários veem itens das transações da sua unidade" on public.itens_transacao
    for select using (
        transacao_id in (
            select id from public.transacoes t
            where t.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

create policy "Usuários inserem itens nas transações da sua unidade" on public.itens_transacao
    for insert with check (
        transacao_id in (
            select id from public.transacoes t
            where t.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

-- Trigger para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    NEW.updated_at = now();
    return NEW;
end;
$$ language 'plpgsql';

create trigger update_transacoes_updated_at before update
    on public.transacoes for each row execute procedure update_updated_at_column();

-- View para relatórios consolidados
create or replace view public.view_transacoes_completas as
select 
    t.*,
    tp.nome as tipo_pagamento_nome,
    tp.icone as tipo_pagamento_icone,
    tp.cor as tipo_pagamento_cor,
    tp.requer_asaas,
    c.nome as cliente_nome,
    p.nome as profissional_nome,
    u.nome as unidade_nome,
    -- Totais agregados
    (
        select coalesce(sum(valor_total), 0)
        from public.itens_transacao it
        where it.transacao_id = t.id
    ) as total_itens,
    (
        select coalesce(sum(comissao_valor), 0) 
        from public.itens_transacao it
        where it.transacao_id = t.id
    ) as total_comissoes
from public.transacoes t
    join public.tipos_pagamento tp on t.tipo_pagamento_id = tp.id
    left join public.clientes c on t.cliente_id = c.id
    left join public.profissionais p on t.profissional_id = p.id
    left join public.unidades u on t.unidade_id = u.id;

-- Grant permissions na view
grant select on public.view_transacoes_completas to authenticated;
-- =====================================
-- EP20: Sistema de Notificações Externas
-- =====================================

-- Tabela de Canais de Notificação
create table if not exists public.canais_notificacao (
    id uuid primary key default uuid_generate_v4(),
    codigo text unique not null, -- 'whatsapp', 'sms', 'email', 'push'
    nome text not null,
    descricao text,
    icone text, -- ícone Material-UI
    ativo boolean default true,
    configuracao jsonb, -- configurações específicas do canal
    ordem int default 0,
    created_at timestamp with time zone default now()
);

-- Inserir canais padrão
insert into public.canais_notificacao (codigo, nome, descricao, icone, ordem) values
('whatsapp', 'WhatsApp', 'Mensagens via WhatsApp Business API', 'WhatsApp', 1),
('sms', 'SMS', 'Mensagens de texto via SMS', 'Sms', 2),
('email', 'E-mail', 'Notificações por e-mail', 'Email', 3),
('push', 'Push', 'Notificações push no navegador', 'Notifications', 4);

-- Tabela de Templates de Notificação
create table if not exists public.templates_notificacao (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid references public.unidades(id) on delete cascade,
    canal_id uuid not null references public.canais_notificacao(id),
    
    -- Identificação do template
    codigo text not null, -- 'agendamento_confirmado', 'lembrete_horario', etc.
    nome text not null,
    descricao text,
    
    -- Conteúdo do template
    titulo text, -- para push e email
    mensagem text not null, -- suporte a variáveis {{nome}}, {{data}}, etc.
    
    -- Configurações
    ativo boolean default true,
    enviar_automatico boolean default false, -- envio automático em eventos
    tempo_antecedencia interval, -- para lembretes (ex: 1 hour)
    
    -- Metadados
    variaveis jsonb, -- lista de variáveis disponíveis
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Garantir que não haja templates duplicados
    unique(unidade_id, canal_id, codigo)
);

-- Tabela de Preferências de Notificação dos Clientes
create table if not exists public.preferencias_notificacao (
    id uuid primary key default uuid_generate_v4(),
    cliente_id uuid not null references public.clientes(id) on delete cascade,
    canal_id uuid not null references public.canais_notificacao(id),
    
    -- Preferências
    aceita_notificacao boolean default true,
    aceita_promocoes boolean default true,
    aceita_lembretes boolean default true,
    
    -- Dados de contato por canal
    whatsapp_numero text,
    sms_numero text,
    email_endereco text,
    push_subscription jsonb, -- dados da subscription para push
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Um cliente só pode ter uma preferência por canal
    unique(cliente_id, canal_id)
);

-- Tabela de Fila de Notificações
create table if not exists public.fila_notificacoes (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid not null references public.unidades(id) on delete cascade,
    
    -- Destinatário
    cliente_id uuid references public.clientes(id) on delete cascade,
    destinatario jsonb not null, -- {tipo: 'cliente'|'profissional', id: uuid, contato: string}
    
    -- Template e canal
    template_id uuid not null references public.templates_notificacao(id),
    canal_id uuid not null references public.canais_notificacao(id),
    
    -- Conteúdo processado
    titulo text,
    mensagem text not null,
    dados_contexto jsonb, -- dados para substituir variáveis
    
    -- Status do envio
    status text not null default 'pendente', -- 'pendente', 'enviando', 'enviado', 'erro', 'cancelado'
    tentativas int default 0,
    max_tentativas int default 3,
    proximo_envio timestamp with time zone default now(),
    
    -- Resultado do envio
    enviado_em timestamp with time zone,
    erro_mensagem text,
    provider_id text, -- ID retornado pelo provedor (WhatsApp, SMS, etc.)
    provider_response jsonb, -- resposta completa do provedor
    
    -- Prioridade
    prioridade int default 5, -- 1 (alta) a 10 (baixa)
    
    -- Agendamento
    agendar_para timestamp with time zone,
    
    -- Metadados
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Tabela de Logs de Entrega
create table if not exists public.logs_notificacao (
    id uuid primary key default uuid_generate_v4(),
    fila_id uuid not null references public.fila_notificacoes(id) on delete cascade,
    
    -- Dados do log
    evento text not null, -- 'enviado', 'entregue', 'lido', 'falhou'
    detalhes jsonb,
    provider_webhook jsonb, -- dados do webhook do provedor
    
    -- Timestamp
    timestamp timestamp with time zone default now()
);

-- Índices para performance
create index if not exists idx_templates_unidade_canal on public.templates_notificacao(unidade_id, canal_id);
create index if not exists idx_templates_codigo on public.templates_notificacao(codigo);
create index if not exists idx_preferencias_cliente on public.preferencias_notificacao(cliente_id);
create index if not exists idx_fila_status_proximo on public.fila_notificacoes(status, proximo_envio);
create index if not exists idx_fila_unidade_status on public.fila_notificacoes(unidade_id, status);
create index if not exists idx_logs_fila on public.logs_notificacao(fila_id);

-- RLS Policies
alter table public.canais_notificacao enable row level security;
alter table public.templates_notificacao enable row level security;
alter table public.preferencias_notificacao enable row level security;
alter table public.fila_notificacoes enable row level security;
alter table public.logs_notificacao enable row level security;

-- Canais são públicos para usuários autenticados
create policy "Canais de notificação são públicos" on public.canais_notificacao
    for select using (auth.role() = 'authenticated');

-- Templates por unidade
create policy "Usuários veem templates da sua unidade" on public.templates_notificacao
    for select using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

create policy "Usuários gerenciam templates da sua unidade" on public.templates_notificacao
    for all using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

-- Preferências dos clientes da unidade
create policy "Usuários veem preferências dos clientes da unidade" on public.preferencias_notificacao
    for select using (
        cliente_id in (
            select c.id from public.clientes c
            where c.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

create policy "Usuários gerenciam preferências dos clientes da unidade" on public.preferencias_notificacao
    for all using (
        cliente_id in (
            select c.id from public.clientes c
            where c.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

-- Fila por unidade
create policy "Usuários veem fila da sua unidade" on public.fila_notificacoes
    for select using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

create policy "Usuários gerenciam fila da sua unidade" on public.fila_notificacoes
    for all using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

-- Logs seguem as permissões da fila
create policy "Usuários veem logs das notificações da unidade" on public.logs_notificacao
    for select using (
        fila_id in (
            select fn.id from public.fila_notificacoes fn
            where fn.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

-- Trigger para updated_at
create trigger update_templates_updated_at before update
    on public.templates_notificacao for each row execute procedure update_updated_at_column();

create trigger update_preferencias_updated_at before update
    on public.preferencias_notificacao for each row execute procedure update_updated_at_column();

create trigger update_fila_updated_at before update
    on public.fila_notificacoes for each row execute procedure update_updated_at_column();

-- Inserir templates padrão (serão criados via seed ou interface)
-- Função para inserir templates por unidade será criada nas actions

-- View para relatórios de notificação
create or replace view public.view_relatorio_notificacoes as
select 
    fn.*,
    c.nome as canal_nome,
    c.icone as canal_icone,
    t.nome as template_nome,
    t.codigo as template_codigo,
    cl.nome as cliente_nome,
    u.nome as unidade_nome,
    -- Contagem de logs
    (select count(*) from public.logs_notificacao ln where ln.fila_id = fn.id) as total_logs
from public.fila_notificacoes fn
    join public.canais_notificacao c on fn.canal_id = c.id
    join public.templates_notificacao t on fn.template_id = t.id
    left join public.clientes cl on fn.cliente_id = cl.id
    join public.unidades u on fn.unidade_id = u.id;

-- Grant permissions
grant select on public.view_relatorio_notificacoes to authenticated;
grant select on public.canais_notificacao to authenticated;

-- Função para processar variáveis no template
create or replace function processar_template(
    template_mensagem text,
    dados jsonb
) returns text as $$
declare
    resultado text;
    variavel text;
    valor text;
begin
    resultado := template_mensagem;
    
    -- Substituir variáveis no formato {{variavel}}
    for variavel, valor in select key, value::text from jsonb_each_text(dados) loop
        resultado := replace(resultado, '{{' || variavel || '}}', valor);
    end loop;
    
    return resultado;
end;
$$ language plpgsql;
-- noop: placeholder para alinhar hist�rico com remoto
