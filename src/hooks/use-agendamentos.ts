'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  listAppointments,
  checkDisponibilidade,
  getAgendamentoStats,
  getAppointmentById,
  type Appointment,
  type DisponibilidadeInfo,
  type AgendamentoStats,
} from '@/actions/agendamentos';
import {
  type CreateAppointmentData,
  type RescheduleAppointmentData,
  type UpdateAppointmentStatusData,
  type CancelAppointmentData,
  type AppointmentFilterData,
  type CheckDisponibilidadeData,
  type AgendamentoStatsData,
} from '@/schemas';

// ========================================
// QUERY KEYS
// ========================================

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Partial<AppointmentFilterData>) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  disponibilidade: () => [...appointmentKeys.all, 'disponibilidade'] as const,
  disponibilidadeBy: (data: CheckDisponibilidadeData) =>
    [...appointmentKeys.disponibilidade(), data] as const,
  stats: () => [...appointmentKeys.all, 'stats'] as const,
  statsby: (filters: AgendamentoStatsData) => [...appointmentKeys.stats(), filters] as const,
};

// ========================================
// HOOKS PARA CONSULTAS
// ========================================

// Hook para listar agendamentos
export function useAppointments(filters: AppointmentFilterData) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => listAppointments(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// Hook para buscar agendamento por ID
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para verificar disponibilidade
export function useDisponibilidade(data: CheckDisponibilidadeData) {
  return useQuery({
    queryKey: appointmentKeys.disponibilidadeBy(data),
    queryFn: () => checkDisponibilidade(data),
    enabled: !!data.profissional_id && !!data.data,
    staleTime: 1000 * 60, // 1 minuto
  });
}

// Hook para estatísticas de agendamentos
export function useAgendamentoStats(filters: AgendamentoStatsData) {
  return useQuery({
    queryKey: appointmentKeys.statsby(filters),
    queryFn: () => getAgendamentoStats(filters),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

// ========================================
// HOOKS PARA MUTAÇÕES
// ========================================

// Hook para criar agendamento
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar listagens de agendamentos
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });

        // Invalidar disponibilidade do profissional
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.disponibilidade(),
        });

        // Invalidar estatísticas
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() });

        // Invalidar hooks relacionados
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
        queryClient.invalidateQueries({ queryKey: ['profissionais'] });
      }
    },
  });
}

// Hook para reagendar agendamento
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rescheduleAppointment,
    onSuccess: (result, variables: { id: string; [key: string]: unknown }) => {
      if (result.success) {
        // Invalidar o agendamento específico
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.detail(variables.id),
        });

        // Invalidar listagens
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });

        // Invalidar disponibilidade
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.disponibilidade(),
        });

        // Invalidar estatísticas
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() });
      }
    },
  });
}

// Hook para atualizar status do agendamento
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: (result, variables: { id: string; status: string; [key: string]: unknown }) => {
      if (result.success) {
        // Invalidar o agendamento específico
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.detail(variables.id),
        });

        // Invalidar listagens
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });

        // Invalidar estatísticas
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() });

        // Se status final (concluído/cancelado), invalidar disponibilidade
        if (['concluido', 'cancelado', 'faltou'].includes(variables.status)) {
          queryClient.invalidateQueries({
            queryKey: appointmentKeys.disponibilidade(),
          });
        }
      }
    },
  });
}

// Hook para cancelar agendamento
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAppointment,
    onSuccess: (result, variables: { id: string; [key: string]: unknown }) => {
      if (result.success) {
        // Invalidar o agendamento específico
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.detail(variables.id),
        });

        // Invalidar listagens
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });

        // Invalidar disponibilidade
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.disponibilidade(),
        });

        // Invalidar estatísticas
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() });
      }
    },
  });
}

// ========================================
// HOOKS ESPECIALIZADOS
// ========================================

// Hook para agendamentos de hoje
export function useAppointmentsHoje(unidade_id?: string, profissional_id?: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const filters: AppointmentFilterData = {
    data_inicio: hoje,
    data_fim: amanha,
    unidade_id,
    profissional_id,
    ordenacao: 'inicio_asc',
    page: 1,
    limit: 100, // Todos do dia
  };

  return useAppointments(filters);
}

// Hook para agendamentos da semana
export function useAppointmentsSemana(unidade_id?: string, profissional_id?: string) {
  const hoje = new Date();
  const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  const filters: AppointmentFilterData = {
    data_inicio: inicioSemana,
    data_fim: fimSemana,
    unidade_id,
    profissional_id,
    ordenacao: 'inicio_asc',
    page: 1,
    limit: 100,
  };

  return useAppointments(filters);
}

// Hook para agendamentos pendentes
export function useAppointmentsPendentes(unidade_id?: string) {
  const filters: AppointmentFilterData = {
    status: ['criado', 'confirmado'],
    unidade_id,
    ordenacao: 'inicio_asc',
    page: 1,
    limit: 50,
  };

  return useAppointments(filters);
}

// Hook para agendamentos em andamento
export function useAppointmentsEmAndamento(unidade_id?: string) {
  const filters: AppointmentFilterData = {
    status: ['em_atendimento'],
    unidade_id,
    ordenacao: 'inicio_asc',
    page: 1,
    limit: 20,
  };

  return useAppointments(filters);
}

// Hook para histórico de agendamentos do cliente
export function useAppointmentsCliente(cliente_id: string, limit = 10) {
  const filters: AppointmentFilterData = {
    cliente_id,
    ordenacao: 'criado_desc',
    page: 1,
    limit,
  };

  return useAppointments(filters);
}

// Hook para agenda do profissional
export function useAgendaProfissional(profissional_id: string, data: Date) {
  const inicioData = new Date(data);
  inicioData.setHours(0, 0, 0, 0);

  const fimData = new Date(data);
  fimData.setHours(23, 59, 59, 999);

  const filters: AppointmentFilterData = {
    profissional_id,
    data_inicio: inicioData,
    data_fim: fimData,
    ordenacao: 'inicio_asc',
    page: 1,
    limit: 50,
  };

  return useAppointments(filters);
}

// Hook para disponibilidade de hoje
export function useDisponibilidadeHoje(profissional_id: string, duracao_minutos = 60) {
  const hoje = new Date();

  const data: CheckDisponibilidadeData = {
    profissional_id,
    data: hoje,
    duracao_minutos,
  };

  return useDisponibilidade(data);
}

// Hook para disponibilidade da semana
export function useDisponibilidadeSemana(profissional_id: string, duracao_minutos = 60) {
  const queryClient = useQueryClient();
  const hoje = new Date();

  // Criar queries para os próximos 7 dias
  const queries = Array.from({ length: 7 }, (_, index) => {
    const data = new Date(hoje);
    data.setDate(data.getDate() + index);

    return {
      queryKey: appointmentKeys.disponibilidadeBy({
        profissional_id,
        data,
        duracao_minutos,
      }),
      queryFn: () =>
        checkDisponibilidade({
          profissional_id,
          data,
          duracao_minutos,
        }),
      staleTime: 1000 * 60,
    };
  });

  return useQuery({
    queryKey: ['disponibilidade-semana', profissional_id, duracao_minutos],
    queryFn: async () => {
      const results = await Promise.all(queries.map((q) => queryClient.fetchQuery(q)));
      return results;
    },
    enabled: !!profissional_id,
    staleTime: 1000 * 60,
  });
}

// Hook para estatísticas rápidas do mês
export function useStatsRapidas(unidade_id?: string) {
  const filters: AgendamentoStatsData = {
    periodo: 'mes',
    unidade_id,
  };

  return useAgendamentoStats(filters);
}

// ========================================
// HOOKS PARA BUSCA E FILTROS
// ========================================

// Hook para buscar agendamentos por texto
export function useBuscaAppointments(busca: string, unidade_id?: string) {
  const filters: AppointmentFilterData = {
    busca: busca.trim(),
    unidade_id,
    ordenacao: 'inicio_desc',
    page: 1,
    limit: 20,
  };

  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => listAppointments(filters),
    enabled: busca.length >= 2, // Só buscar com pelo menos 2 caracteres
    staleTime: 1000 * 30, // 30 segundos
  });
}

// Hook para invalidar todas as queries de agendamento
export function useInvalidateAppointments() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
  };
}
