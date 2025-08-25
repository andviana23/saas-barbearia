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