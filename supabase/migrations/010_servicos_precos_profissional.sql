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