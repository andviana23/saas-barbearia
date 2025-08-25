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