'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { withValidationSchema } from '@/lib/server-actions';
import {
  CreateAppointmentSchema,
  type CreateAppointmentData,
  RescheduleAppointmentSchema,
  type RescheduleAppointmentData,
  UpdateAppointmentStatusSchema,
  type UpdateAppointmentStatusData,
  CancelAppointmentSchema,
  type CancelAppointmentData,
  AppointmentFilterSchema,
  type AppointmentFilterData,
  CheckDisponibilidadeSchema,
  type CheckDisponibilidadeData,
  AgendamentoStatsSchema,
  type AgendamentoStatsData,
  type HorarioDisponivelData,
  type AppointmentStatus,
} from '@/schemas';
import { ActionResult } from '@/types';

// Importações dos novos tipos centralizados
import {
  Appointment as AppointmentNew,
  CreateAppointmentDTO,
  AppointmentFilters,
} from '@/types/api';
import {
  CreateAppointmentSchema as CreateAppointmentSchemaNew,
  AppointmentFiltersSchema,
} from '@/schemas/api';

// ========================================
// TYPES E INTERFACES
// ========================================

export interface Appointment {
  id: string;
  cliente_id: string;
  profissional_id: string;
  unidade_id: string;
  inicio: string;
  fim: string;
  status: AppointmentStatus;
  total: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  cliente?: {
    id: string;
    nome: string;
    telefone: string;
    email?: string;
  };
  profissional?: {
    id: string;
    nome: string;
    telefone: string;
  };
  servicos?: AppointmentServico[];
}

export interface AppointmentServico {
  id: string;
  appointment_id: string;
  servico_id: string;
  preco_aplicado: number;
  duracao_aplicada: number;
  servico?: {
    id: string;
    nome: string;
    descricao?: string;
  };
}

export interface DisponibilidadeInfo {
  data: string;
  horarios_disponiveis: HorarioDisponivelData[];
  horarios_ocupados: Array<{
    inicio: string;
    fim: string;
    cliente_nome: string;
  }>;
}

export interface AgendamentoStats {
  total_agendamentos: number;
  total_receita: number;
  agendamentos_confirmados: number;
  agendamentos_concluidos: number;
  agendamentos_cancelados: number;
  taxa_ocupacao: number;
  receita_media_por_agendamento: number;
  servicos_mais_agendados: Array<{
    servico_id: string;
    nome: string;
    quantidade: number;
    receita_total: number;
  }>;
}

// ========================================
// UTILITÁRIOS PARA VALIDAÇÃO DE CONFLITOS
// ========================================

export async function checkConflictAvailability(
  profissional_id: string,
  inicio: Date,
  fim: Date,
  exclude_appointment_id?: string,
): Promise<boolean> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase.rpc('check_appointment_conflict', {
    p_profissional_id: profissional_id,
    p_inicio: inicio.toISOString(),
    p_fim: fim.toISOString(),
    p_appointment_id: exclude_appointment_id || null,
  });

  if (error) {
    console.error('Erro ao verificar conflito:', error);
    return true; // Assume conflito em caso de erro
  }

  return data as boolean;
}

async function calculateAppointmentDuration(
  servicos: Array<{ duracao_aplicada: number }>,
): Promise<number> {
  return servicos.reduce((total, servico) => total + servico.duracao_aplicada, 0);
}

// ========================================
// CRIAR AGENDAMENTO
// ========================================

async function createAppointmentAction(
  data: CreateAppointmentData,
): Promise<ActionResult<Appointment>> {
  try {
    const supabase = createServerSupabase();

    // Calcular duração total e fim do agendamento
    const duracao_total = await calculateAppointmentDuration(data.servicos);
    const fim = new Date(data.inicio.getTime() + duracao_total * 60 * 1000);

    // Verificar conflitos de horário
    const hasConflict = await checkConflictAvailability(data.profissional_id, data.inicio, fim);

    if (hasConflict) {
      return {
        success: false,
        error: 'Conflito de horário detectado. O profissional já possui compromisso neste horário.',
      };
    }

    // Verificar se o profissional está ativo
    const { data: profissional, error: profissionalError } = await supabase
      .from('professionals')
      .select('ativo')
      .eq('id', data.profissional_id)
      .single();

    if (profissionalError || !profissional?.ativo) {
      return {
        success: false,
        error: 'Profissional não encontrado ou inativo.',
      };
    }

    // Calcular total do agendamento
    const total = data.servicos.reduce((acc, servico) => acc + servico.preco_aplicado, 0);

    // Criar agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        cliente_id: data.cliente_id,
        profissional_id: data.profissional_id,
        unidade_id: data.unidade_id,
        inicio: data.inicio.toISOString(),
        fim: fim.toISOString(),
        total,
        notas: data.notas,
        status: 'criado',
      })
      .select()
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: `Erro ao criar agendamento: ${appointmentError.message}`,
      };
    }

    // Inserir serviços do agendamento
    const servicosData = data.servicos.map((servico) => ({
      appointment_id: appointment.id,
      servico_id: servico.servico_id,
      preco_aplicado: servico.preco_aplicado,
      duracao_aplicada: servico.duracao_aplicada,
    }));

    const { error: servicosError } = await supabase
      .from('appointments_servicos')
      .insert(servicosData);

    if (servicosError) {
      // Desfazer criação do agendamento
      await supabase.from('appointments').delete().eq('id', appointment.id);

      return {
        success: false,
        error: `Erro ao adicionar serviços ao agendamento: ${servicosError.message}`,
      };
    }

    return {
      success: true,
      data: appointment as Appointment,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado ao criar agendamento: ${error}`,
    };
  }
}

export const createAppointment = withValidationSchema(
  CreateAppointmentSchema,
  createAppointmentAction,
);

// ========================================
// REAGENDAR AGENDAMENTO
// ========================================

async function rescheduleAppointmentAction(
  data: RescheduleAppointmentData,
): Promise<ActionResult<Appointment>> {
  try {
    const supabase = createServerSupabase();

    // Buscar agendamento existente
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(
        `
        *,
        appointments_servicos(duracao_aplicada)
      `,
      )
      .eq('id', data.id)
      .single();

    if (fetchError || !appointment) {
      return {
        success: false,
        error: 'Agendamento não encontrado.',
      };
    }

    // Verificar se pode ser reagendado
    if (['concluido', 'cancelado'].includes(appointment.status)) {
      return {
        success: false,
        error: 'Agendamento não pode ser reagendado pois já foi concluído ou cancelado.',
      };
    }

    // Calcular nova duração e fim
    const duracao_total = appointment.appointments_servicos.reduce(
      (total: number, servico: { duracao_aplicada: number }) => total + servico.duracao_aplicada,
      0,
    );
    const novo_fim = new Date(data.novo_inicio.getTime() + duracao_total * 60 * 1000);

    // Usar novo profissional se fornecido, senão manter o atual
    const profissional_id = data.profissional_id || appointment.profissional_id;

    // Verificar conflitos (excluindo o próprio agendamento)
    const hasConflict = await checkConflictAvailability(
      profissional_id,
      data.novo_inicio,
      novo_fim,
      data.id,
    );

    if (hasConflict) {
      return {
        success: false,
        error: 'Conflito de horário detectado. O profissional já possui compromisso neste horário.',
      };
    }

    // Atualizar agendamento
    const updateData: {
      inicio: string;
      fim: string;
      profissional_id?: string;
      notas?: string;
    } = {
      inicio: data.novo_inicio.toISOString(),
      fim: novo_fim.toISOString(),
    };

    if (data.profissional_id) {
      updateData.profissional_id = data.profissional_id;
    }

    if (data.notas_reagendamento) {
      const notasAtuais = appointment.notas || '';
      updateData.notas = `${notasAtuais}\n[Reagendamento]: ${data.notas_reagendamento}`.trim();
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: `Erro ao reagendar: ${updateError.message}`,
      };
    }

    return {
      success: true,
      data: updatedAppointment as Appointment,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado ao reagendar: ${error}`,
    };
  }
}

export const rescheduleAppointment = withValidationSchema(
  RescheduleAppointmentSchema,
  rescheduleAppointmentAction,
);

// ========================================
// ATUALIZAR STATUS DO AGENDAMENTO
// ========================================

async function updateAppointmentStatusAction(
  data: UpdateAppointmentStatusData,
): Promise<ActionResult<Appointment>> {
  try {
    const supabase = createServerSupabase();

    // Buscar agendamento atual
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('status, notas')
      .eq('id', data.id)
      .single();

    if (fetchError || !appointment) {
      return {
        success: false,
        error: 'Agendamento não encontrado.',
      };
    }

    // Validar transições de status
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      criado: ['confirmado', 'cancelado'],
      confirmado: ['em_atendimento', 'cancelado', 'faltou'],
      em_atendimento: ['concluido', 'cancelado'],
      concluido: [], // Status final
      cancelado: [], // Status final
      faltou: [], // Status final
    };

    const currentStatus = appointment.status as AppointmentStatus;
    if (!validTransitions[currentStatus].includes(data.status)) {
      return {
        success: false,
        error: `Transição de status inválida: ${currentStatus} -> ${data.status}`,
      };
    }

    // Preparar dados para atualização
    const updateData: {
      status: AppointmentStatus;
      notas?: string;
    } = { status: data.status };

    if (data.notas_status) {
      const notasAtuais = appointment.notas || '';
      updateData.notas = `${notasAtuais}\n[Status ${data.status}]: ${data.notas_status}`.trim();
    }

    // Atualizar agendamento
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: `Erro ao atualizar status: ${updateError.message}`,
      };
    }

    return {
      success: true,
      data: updatedAppointment as Appointment,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado ao atualizar status: ${error}`,
    };
  }
}

export const updateAppointmentStatus = withValidationSchema(
  UpdateAppointmentStatusSchema,
  updateAppointmentStatusAction,
);

// ========================================
// CANCELAR AGENDAMENTO
// ========================================

async function cancelAppointmentAction(
  data: CancelAppointmentData,
): Promise<ActionResult<Appointment>> {
  try {
    const supabase = createServerSupabase();

    // Buscar agendamento
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('status, notas, inicio')
      .eq('id', data.id)
      .single();

    if (fetchError || !appointment) {
      return {
        success: false,
        error: 'Agendamento não encontrado.',
      };
    }

    // Verificar se pode ser cancelado
    if (['concluido', 'cancelado'].includes(appointment.status)) {
      return {
        success: false,
        error: 'Agendamento já foi concluído ou cancelado.',
      };
    }

    // Preparar notas do cancelamento
    const agora = new Date();
    const inicioDate = new Date(appointment.inicio);
    const antecedencia = Math.round((inicioDate.getTime() - agora.getTime()) / (1000 * 60)); // minutos

    const notasCancelamento =
      `[CANCELADO em ${agora.toLocaleString('pt-BR')}]\n` +
      `Motivo: ${data.motivo_cancelamento}\n` +
      `Cancelado por: ${data.cancelado_por}\n` +
      `Antecedência: ${antecedencia > 0 ? antecedencia + ' minutos' : 'Cancelamento tardio'}`;

    const notasCompletas = appointment.notas
      ? `${appointment.notas}\n\n${notasCancelamento}`
      : notasCancelamento;

    // Cancelar agendamento
    const { data: cancelledAppointment, error: cancelError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelado',
        notas: notasCompletas,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (cancelError) {
      return {
        success: false,
        error: `Erro ao cancelar agendamento: ${cancelError.message}`,
      };
    }

    return {
      success: true,
      data: cancelledAppointment as Appointment,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado ao cancelar agendamento: ${error}`,
    };
  }
}

export const cancelAppointment = withValidationSchema(
  CancelAppointmentSchema,
  cancelAppointmentAction,
);

// ========================================
// LISTAR AGENDAMENTOS
// ========================================

async function listAppointmentsAction(filters: AppointmentFilterData): Promise<
  ActionResult<{
    appointments: Appointment[];
    total: number;
    page: number;
    limit: number;
  }>
> {
  try {
    const supabase = createServerSupabase();

    let query = supabase.from('appointments').select(`
        *,
        cliente:clientes(id, nome, telefone, email),
        profissional:profissionais(id, nome, telefone),
        appointments_servicos(
          id,
          servico_id,
          preco_aplicado,
          duracao_aplicada,
          servico:servicos(id, nome, descricao)
        )
      `);

    // Aplicar filtros
    if (filters.unidade_id) {
      query = query.eq('unidade_id', filters.unidade_id);
    }

    if (filters.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id);
    }

    if (filters.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id);
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.data_inicio) {
      query = query.gte('inicio', filters.data_inicio.toISOString());
    }

    if (filters.data_fim) {
      query = query.lte('inicio', filters.data_fim.toISOString());
    }

    // Busca textual (nome do cliente ou notas)
    if (filters.busca) {
      const searchTerm = `%${filters.busca}%`;
      query = query.or(`clientes.nome.ilike.${searchTerm},notas.ilike.${searchTerm}`);
    }

    // Ordenação
    switch (filters.ordenacao) {
      case 'inicio_asc':
        query = query.order('inicio', { ascending: true });
        break;
      case 'inicio_desc':
        query = query.order('inicio', { ascending: false });
        break;
      case 'criado_desc':
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Paginação
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        error: `Erro ao buscar agendamentos: ${error.message}`,
      };
    }

    return {
      success: true,
      data: {
        appointments: (data || []) as Appointment[],
        total: count || 0,
        page: filters.page,
        limit: filters.limit,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado ao listar agendamentos: ${error}`,
    };
  }
}

export const listAppointments = withValidationSchema(
  AppointmentFilterSchema,
  listAppointmentsAction,
);

// ========================================
// VERIFICAR DISPONIBILIDADE
// ========================================

async function checkDisponibilidadeAction(
  data: CheckDisponibilidadeData,
): Promise<ActionResult<DisponibilidadeInfo>> {
  try {
    const supabase = createServerSupabase();

    const dataStr = data.data.toISOString().split('T')[0];
    const inicioHorario = new Date(`${dataStr}T06:00:00`);
    const fimHorario = new Date(`${dataStr}T22:00:00`);

    // Buscar agendamentos do profissional no dia
    let query = supabase
      .from('appointments')
      .select(
        `
        inicio,
        fim,
        cliente:clientes(nome)
      `,
      )
      .eq('profissional_id', data.profissional_id)
      .gte('inicio', inicioHorario.toISOString())
      .lt('inicio', fimHorario.toISOString())
      .not('status', 'in', '(cancelado,faltou)')
      .order('inicio');

    // Excluir agendamento específico se fornecido (para reagendamento)
    if (data.agendamento_id) {
      query = query.neq('id', data.agendamento_id);
    }

    const { data: appointments, error } = await query;

    if (error) {
      return {
        success: false,
        error: `Erro ao verificar disponibilidade: ${error.message}`,
      };
    }

    // Gerar horários disponíveis em slots de 15 minutos
    const horariosDisponiveis: HorarioDisponivelData[] = [];
    const horariosOcupados = (appointments || []).map((apt: any) => ({
      inicio: apt.inicio,
      fim: apt.fim,
      cliente_nome: apt.cliente?.nome || 'Cliente não identificado',
    }));

    // Criar slots de 15 minutos
    for (let hora = 6; hora < 22; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 15) {
        const slotInicio = new Date(data.data);
        slotInicio.setHours(hora, minuto, 0, 0);

        const slotFim = new Date(slotInicio.getTime() + data.duracao_minutos * 60 * 1000);

        // Verificar se o slot não conflita com agendamentos existentes
        const hasConflict = horariosOcupados.some(
          (ocupado: { inicio: string; fim: string; cliente_nome: string }) => {
            const ocupadoInicio = new Date(ocupado.inicio);
            const ocupadoFim = new Date(ocupado.fim);

            return (
              (slotInicio >= ocupadoInicio && slotInicio < ocupadoFim) ||
              (slotFim > ocupadoInicio && slotFim <= ocupadoFim) ||
              (slotInicio <= ocupadoInicio && slotFim >= ocupadoFim)
            );
          },
        );

        horariosDisponiveis.push({
          inicio: slotInicio,
          fim: slotFim,
          disponivel: !hasConflict && slotFim.getHours() <= 22,
        });
      }
    }

    return {
      success: true,
      data: {
        data: dataStr,
        horarios_disponiveis: horariosDisponiveis,
        horarios_ocupados: horariosOcupados,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado ao verificar disponibilidade: ${error}`,
    };
  }
}

export const checkDisponibilidade = withValidationSchema(
  CheckDisponibilidadeSchema,
  checkDisponibilidadeAction,
);

// ========================================
// ESTATÍSTICAS DE AGENDAMENTOS
// ========================================

async function getAgendamentoStatsAction(
  filters: AgendamentoStatsData,
): Promise<ActionResult<AgendamentoStats>> {
  try {
    const supabase = createServerSupabase();

    // Definir período
    const agora = new Date();
    let dataInicio: Date;
    let dataFim: Date = new Date(agora);

    switch (filters.periodo) {
      case 'hoje':
        dataInicio = new Date(agora.setHours(0, 0, 0, 0));
        dataFim = new Date(agora.setHours(23, 59, 59, 999));
        break;
      case 'semana':
        dataInicio = new Date(agora.setDate(agora.getDate() - 7));
        break;
      case 'mes':
        dataInicio = new Date(agora.setMonth(agora.getMonth() - 1));
        break;
      case 'ano':
        dataInicio = new Date(agora.setFullYear(agora.getFullYear() - 1));
        break;
    }

    let query = supabase
      .from('appointments')
      .select(
        `
        id,
        status,
        total,
        inicio,
        appointments_servicos(
          servico:servicos(id, nome),
          preco_aplicado
        )
      `,
      )
      .gte('inicio', dataInicio.toISOString())
      .lte('inicio', dataFim.toISOString());

    if (filters.unidade_id) {
      query = query.eq('unidade_id', filters.unidade_id);
    }

    if (filters.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id);
    }

    const { data: appointments, error } = await query;

    if (error) {
      return {
        success: false,
        error: `Erro ao buscar estatísticas: ${error.message}`,
      };
    }

    const dados = appointments || [];

    // Calcular estatísticas
    const totalAgendamentos = dados.length;
    const agendamentosConfirmados = dados.filter((a: { status: string }) =>
      ['confirmado', 'em_atendimento'].includes(a.status),
    ).length;
    const agendamentosConcluidos = dados.filter(
      (a: { status: string }) => a.status === 'concluido',
    ).length;
    const agendamentosCancelados = dados.filter((a: { status: string }) =>
      ['cancelado', 'faltou'].includes(a.status),
    ).length;

    const receitaTotal = dados
      .filter((a: { status: string }) => a.status === 'concluido')
      .reduce((total: number, apt: { total?: number }) => total + (apt.total || 0), 0);

    const receitaMedia = agendamentosConcluidos > 0 ? receitaTotal / agendamentosConcluidos : 0;

    // Calcular taxa de ocupação (assumindo 8h de trabalho por dia)
    const diasNoPeriodo = Math.ceil(
      (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24),
    );
    const horasDisponiveis = diasNoPeriodo * 8 * 60; // em minutos
    const minutosOcupados = dados
      .filter((a: { status: string }) => !['cancelado', 'faltou'].includes(a.status))
      .reduce((total: number, apt: any) => {
        const duracao =
          apt.appointments_servicos?.reduce(
            (sum: number, s: any) => sum + (s.duracao_aplicada || 30),
            0,
          ) || 30;
        return total + duracao;
      }, 0);

    const taxaOcupacao = horasDisponiveis > 0 ? (minutosOcupados / horasDisponiveis) * 100 : 0;

    // Serviços mais agendados
    const servicosMap = new Map<
      string,
      {
        servico_id: string;
        nome: string;
        quantidade: number;
        receita_total: number;
      }
    >();
    dados.forEach((apt: any) => {
      apt.appointments_servicos?.forEach((as: any) => {
        const servicoId = as.servico?.id;
        const servicoNome = as.servico?.nome;
        if (servicoId) {
          const existing = servicosMap.get(servicoId) || {
            quantidade: 0,
            receita_total: 0,
          };
          servicosMap.set(servicoId, {
            servico_id: servicoId,
            nome: servicoNome,
            quantidade: existing.quantidade + 1,
            receita_total: existing.receita_total + (as.preco_aplicado || 0),
          });
        }
      });
    });

    const servicosMaisAgendados = Array.from(servicosMap.values())
      .sort((a: { quantidade: number }, b: { quantidade: number }) => b.quantidade - a.quantidade)
      .slice(0, 10);

    const stats: AgendamentoStats = {
      total_agendamentos: totalAgendamentos,
      total_receita: receitaTotal,
      agendamentos_confirmados: agendamentosConfirmados,
      agendamentos_concluidos: agendamentosConcluidos,
      agendamentos_cancelados: agendamentosCancelados,
      taxa_ocupacao: Math.round(taxaOcupacao * 100) / 100,
      receita_media_por_agendamento: Math.round(receitaMedia * 100) / 100,
      servicos_mais_agendados: servicosMaisAgendados,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado ao calcular estatísticas: ${error}`,
    };
  }
}

export const getAgendamentoStats = withValidationSchema(
  AgendamentoStatsSchema,
  getAgendamentoStatsAction,
);

// ========================================
// BUSCAR AGENDAMENTO POR ID
// ========================================

export async function getAppointmentById(id: string): Promise<ActionResult<Appointment>> {
  try {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        cliente:clientes(id, nome, telefone, email),
        profissional:profissionais(id, nome, telefone),
        appointments_servicos(
          id,
          servico_id,
          preco_aplicado,
          duracao_aplicada,
          servico:servicos(id, nome, descricao)
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      return {
        success: false,
        error: `Agendamento não encontrado: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as Appointment,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado ao buscar agendamento: ${error}`,
    };
  }
}
