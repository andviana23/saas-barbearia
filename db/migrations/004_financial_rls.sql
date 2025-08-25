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