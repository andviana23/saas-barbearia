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

-- Índices para performance e queries frequentes
CREATE INDEX idx_appointments_unidade_id ON public.appointments(unidade_id);
CREATE INDEX idx_appointments_cliente_id ON public.appointments(cliente_id);
CREATE INDEX idx_appointments_profissional_id ON public.appointments(profissional_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_inicio ON public.appointments(inicio);
CREATE INDEX idx_appointments_data ON public.appointments((inicio::date));

-- Índice composto para consultas de agenda
CREATE INDEX idx_appointments_profissional_data ON public.appointments(profissional_id, (inicio::date));
CREATE INDEX idx_appointments_unidade_data ON public.appointments(unidade_id, (inicio::date));

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