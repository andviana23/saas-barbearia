import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProfissional,
  updateProfissional,
  deleteProfissional,
  listProfissionais,
  getProfissional,
  createHorarioProfissional,
  updateHorarioProfissional,
  deleteHorarioProfissional,
  listHorariosProfissional,
  getDisponibilidadeProfissional,
} from '@/actions/profissionais';
import type { ProfissionalFilterData, HorarioProfissionalFilterData } from '@/schemas';
import type { ActionResult } from '@/types';

// Query Keys para consistência
export const PROFISSIONAIS_QUERY_KEY = 'profissionais';
export const HORARIOS_PROFISSIONAL_QUERY_KEY = 'horarios-profissional';
export const DISPONIBILIDADE_PROFISSIONAL_QUERY_KEY = 'disponibilidade-profissional';

// ====================================
// QUERIES PARA PROFISSIONAIS
// ====================================

// Hook para listar profissionais
export function useProfissionais(
  filters: ProfissionalFilterData = { page: 1, limit: 20, order: 'desc' },
) {
  return useQuery({
    queryKey: [PROFISSIONAIS_QUERY_KEY, filters],
    queryFn: () => listProfissionais(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para buscar profissional específico
export function useProfissional(id: string) {
  return useQuery({
    queryKey: [PROFISSIONAIS_QUERY_KEY, id],
    queryFn: () => getProfissional(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para profissionais ativos de uma unidade
export function useProfissionaisAtivos(unidadeId?: string) {
  return useQuery({
    queryKey: [PROFISSIONAIS_QUERY_KEY, 'ativos', unidadeId],
    queryFn: () =>
      listProfissionais({
        page: 1,
        ativo: true,
        unidade_id: unidadeId,
        limit: 100, // Assumindo que não há muitos profissionais por unidade
        order: 'asc',
      }),
    enabled: !!unidadeId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para profissionais por papel
export function useProfissionaisPorPapel(papel: string, unidadeId?: string) {
  return useQuery({
    queryKey: [PROFISSIONAIS_QUERY_KEY, 'papel', papel, unidadeId],
    queryFn: () =>
      listProfissionais({
        page: 1,
        papel,
        unidade_id: unidadeId,
        ativo: true,
        limit: 50,
        order: 'asc',
      }),
    enabled: !!papel,
    staleTime: 1000 * 60 * 10, // 10 minutos (menos volátil)
  });
}

// ====================================
// MUTATIONS PARA PROFISSIONAIS
// ====================================

// Hook para criar profissional
export function useCreateProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createProfissional(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar todas as queries relacionadas a profissionais
        queryClient.invalidateQueries({ queryKey: [PROFISSIONAIS_QUERY_KEY] });
      }
    },
  });
}

// Hook para atualizar profissional
export function useUpdateProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }): Promise<ActionResult> => {
      return await updateProfissional(id, formData);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar queries específicas
        queryClient.invalidateQueries({ queryKey: [PROFISSIONAIS_QUERY_KEY] });
        queryClient.invalidateQueries({
          queryKey: [PROFISSIONAIS_QUERY_KEY, variables.id],
        });
      }
    },
  });
}

// Hook para deletar profissional
export function useDeleteProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deleteProfissional(id);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar todas as queries de profissionais
        queryClient.invalidateQueries({ queryKey: [PROFISSIONAIS_QUERY_KEY] });
      }
    },
  });
}

// ====================================
// QUERIES PARA HORÁRIOS
// ====================================

// Hook para listar horários de um profissional
export function useHorariosProfissional(
  profissionalId: string,
  filters: HorarioProfissionalFilterData = { page: 1, limit: 20, order: 'asc' },
) {
  return useQuery({
    queryKey: [HORARIOS_PROFISSIONAL_QUERY_KEY, profissionalId, filters],
    queryFn: () => listHorariosProfissional(profissionalId, filters),
    enabled: !!profissionalId,
    staleTime: 1000 * 60 * 10, // 10 minutos (horários mudam menos)
  });
}

// Hook para horários ativos de um profissional
export function useHorariosProfissionalAtivos(profissionalId: string) {
  return useQuery({
    queryKey: [HORARIOS_PROFISSIONAL_QUERY_KEY, profissionalId, 'ativos'],
    queryFn: () =>
      listHorariosProfissional(profissionalId, {
        page: 1,
        limit: 20,
        order: 'asc',
        ativo: true,
      }),
    enabled: !!profissionalId,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}

// Hook para disponibilidade de um profissional em uma data
export function useDisponibilidadeProfissional(profissionalId: string, data: string) {
  return useQuery({
    queryKey: [DISPONIBILIDADE_PROFISSIONAL_QUERY_KEY, profissionalId, data],
    queryFn: () => getDisponibilidadeProfissional(profissionalId, data),
    enabled: !!profissionalId && !!data,
    staleTime: 1000 * 60 * 5, // 5 minutos (pode mudar com novos agendamentos)
  });
}

// ====================================
// MUTATIONS PARA HORÁRIOS
// ====================================

// Hook para criar horário de profissional
export function useCreateHorarioProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createHorarioProfissional(formData);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        const profissionalId = variables.get('profissional_id') as string;

        // Invalidar horários do profissional
        queryClient.invalidateQueries({
          queryKey: [HORARIOS_PROFISSIONAL_QUERY_KEY, profissionalId],
        });

        // Invalidar disponibilidade do profissional
        queryClient.invalidateQueries({
          queryKey: [DISPONIBILIDADE_PROFISSIONAL_QUERY_KEY, profissionalId],
        });

        // Invalidar dados do profissional (inclui horários)
        queryClient.invalidateQueries({
          queryKey: [PROFISSIONAIS_QUERY_KEY, profissionalId],
        });
      }
    },
  });
}

// Hook para atualizar horário de profissional
export function useUpdateHorarioProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }): Promise<ActionResult> => {
      return await updateHorarioProfissional(id, formData);
    },
    onSuccess: (result) => {
      if (result.success && (result.data as any)?.profissional_id) {
        const profissionalId = (result.data as any).profissional_id;

        // Invalidar todas as queries relacionadas ao profissional
        queryClient.invalidateQueries({
          queryKey: [HORARIOS_PROFISSIONAL_QUERY_KEY, profissionalId],
        });
        queryClient.invalidateQueries({
          queryKey: [DISPONIBILIDADE_PROFISSIONAL_QUERY_KEY, profissionalId],
        });
        queryClient.invalidateQueries({
          queryKey: [PROFISSIONAIS_QUERY_KEY, profissionalId],
        });
      }
    },
  });
}

// Hook para deletar horário de profissional
export function useDeleteHorarioProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deleteHorarioProfissional(id);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar todas as queries de horários (não sabemos qual profissional)
        queryClient.invalidateQueries({
          queryKey: [HORARIOS_PROFISSIONAL_QUERY_KEY],
        });
        queryClient.invalidateQueries({
          queryKey: [DISPONIBILIDADE_PROFISSIONAL_QUERY_KEY],
        });
        queryClient.invalidateQueries({ queryKey: [PROFISSIONAIS_QUERY_KEY] });
      }
    },
  });
}

// ====================================
// HOOKS UTILITÁRIOS
// ====================================

// Hook para invalidar todas as queries de profissionais
export function useInvalidateProfissionais() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [PROFISSIONAIS_QUERY_KEY] });
    queryClient.invalidateQueries({
      queryKey: [HORARIOS_PROFISSIONAL_QUERY_KEY],
    });
    queryClient.invalidateQueries({
      queryKey: [DISPONIBILIDADE_PROFISSIONAL_QUERY_KEY],
    });
  };
}

// Hook combinado para criar profissional com horários
export function useCreateProfissionalComHorarios() {
  const createProfissional = useCreateProfissional();
  const createHorario = useCreateHorarioProfissional();

  return {
    createProfissional,
    createHorario,
    isCreatingProfissional: createProfissional.isPending,
    isCreatingHorario: createHorario.isPending,
    error: createProfissional.error || createHorario.error,
  };
}

// Hook para buscar profissionais com seus horários
export function useProfissionaisComHorarios(unidadeId?: string) {
  const profissionaisQuery = useProfissionaisAtivos(unidadeId);

  const profissionaisComHorarios = useQuery({
    queryKey: [PROFISSIONAIS_QUERY_KEY, 'com-horarios', unidadeId],
    queryFn: async () => {
      if (
        !profissionaisQuery.data?.success ||
        !(profissionaisQuery.data.data as any).profissionais
      ) {
        return [];
      }

      const profissionaisComHorarios = await Promise.all(
        (profissionaisQuery.data.data as any).profissionais.map(
          async (profissional: { id: string; [key: string]: unknown }) => {
            const horariosResult = await listHorariosProfissional(profissional.id, {
              page: 1,
              limit: 20,
              order: 'asc',
              ativo: true,
            });
            return {
              ...profissional,
              horarios: horariosResult.success ? horariosResult.data : [],
            };
          },
        ),
      );

      return profissionaisComHorarios;
    },
    enabled: !!profissionaisQuery.data?.success,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  return {
    ...profissionaisComHorarios,
    isLoading: profissionaisQuery.isLoading || profissionaisComHorarios.isLoading,
    error: profissionaisQuery.error || profissionaisComHorarios.error,
  };
}
