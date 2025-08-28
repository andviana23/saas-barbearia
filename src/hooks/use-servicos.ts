import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createServico,
  updateServico,
  deleteServico,
  listServicos,
  getServico,
  createCategoriaServico,
  updateCategoriaServico,
  deleteCategoriaServico,
  listCategoriasServico,
  createPrecoCustomizado,
  updatePrecoCustomizado,
  deletePrecoCustomizado,
  calcularPrecoServico,
  listServicosComPrecosProfissional,
  getServicosPopulares,
} from '@/actions/servicos';
import type { ServicoFilterData, CategoriaServicoFilterData } from '@/schemas';
import { buildUnitFilter, resolveUnitIdFromFormData } from '@/lib/units';
import type { ActionResult } from '@/types';

// Query Keys para consistência
export const SERVICOS_QUERY_KEY = 'servicos';
export const CATEGORIAS_SERVICO_QUERY_KEY = 'categorias-servico';
export const PRECOS_CUSTOMIZADOS_QUERY_KEY = 'precos-customizados';
export const CALCULO_PRECO_QUERY_KEY = 'calculo-preco';
export const SERVICOS_POPULARES_QUERY_KEY = 'servicos-populares';

// ====================================
// QUERIES PARA SERVIÇOS
// ====================================

// Hook para listar serviços
export function useServicos(filters: ServicoFilterData = { page: 1, limit: 20, order: 'asc' }) {
  return useQuery({
    queryKey: [SERVICOS_QUERY_KEY, filters],
    queryFn: () => listServicos(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para buscar serviço específico
export function useServico(id: string) {
  return useQuery({
    queryKey: [SERVICOS_QUERY_KEY, id],
    queryFn: () => getServico(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para serviços ativos de uma unidade
export function useServicosAtivos(unitId?: string) {
  return useQuery({
    queryKey: [SERVICOS_QUERY_KEY, 'ativos', unitId],
    queryFn: () =>
      listServicos({
        ativo: true,
        ...buildUnitFilter(unitId),
        limit: 100,
        page: 1,
        order: 'asc',
      }),
    enabled: !!unitId,
    staleTime: 1000 * 60 * 10,
  });
}

// Hook para serviços por categoria
export function useServicosPorCategoria(categoriaId: string, unitId?: string) {
  return useQuery({
    queryKey: [SERVICOS_QUERY_KEY, 'categoria', categoriaId, unitId],
    queryFn: () =>
      listServicos({
        categoria_id: categoriaId,
        ...buildUnitFilter(unitId),
        ativo: true,
        limit: 50,
        page: 1,
        order: 'asc',
      }),
    enabled: !!categoriaId,
    staleTime: 1000 * 60 * 10,
  });
}

// Hook para busca de serviços
export function useBuscarServicos(searchTerm: string, unitId?: string) {
  return useQuery({
    queryKey: [SERVICOS_QUERY_KEY, 'busca', searchTerm, unitId],
    queryFn: () =>
      listServicos({
        q: searchTerm,
        ...buildUnitFilter(unitId),
        ativo: true,
        limit: 20,
        page: 1,
        order: 'asc',
      }),
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook para serviços populares
export function useServicosPopulares(unitId: string, limit = 10) {
  return useQuery({
    queryKey: [SERVICOS_POPULARES_QUERY_KEY, unitId, limit],
    queryFn: () => getServicosPopulares(unitId, limit),
    enabled: !!unitId,
    staleTime: 1000 * 60 * 30,
  });
}

// ====================================
// MUTATIONS PARA SERVIÇOS
// ====================================

// Hook para criar serviço
export function useCreateServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createServico(formData);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar queries de serviços
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });

        // Invalidar serviços populares
        const unitId = resolveUnitIdFromFormData(variables as FormData);
        if (unitId) {
          queryClient.invalidateQueries({
            queryKey: [SERVICOS_POPULARES_QUERY_KEY, unitId],
          });
        }
      }
    },
  });
}

// Hook para atualizar serviço
export function useUpdateServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }): Promise<ActionResult> => {
      return await updateServico(id, formData);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar queries específicas
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
        queryClient.invalidateQueries({
          queryKey: [SERVICOS_QUERY_KEY, variables.id],
        });

        // Invalidar cálculos de preço relacionados
        queryClient.invalidateQueries({
          queryKey: [CALCULO_PRECO_QUERY_KEY, variables.id],
        });
      }
    },
  });
}

// Hook para deletar serviço
export function useDeleteServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deleteServico(id);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar todas as queries de serviços
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
        queryClient.invalidateQueries({
          queryKey: [SERVICOS_POPULARES_QUERY_KEY],
        });

        // Remover cache específico
        queryClient.removeQueries({
          queryKey: [SERVICOS_QUERY_KEY, variables],
        });
        queryClient.removeQueries({
          queryKey: [CALCULO_PRECO_QUERY_KEY, variables],
        });
      }
    },
  });
}

// ====================================
// QUERIES PARA CATEGORIAS
// ====================================

// Hook para listar categorias
export function useCategoriasServico(
  filters: CategoriaServicoFilterData = { page: 1, limit: 20, order: 'asc' },
) {
  return useQuery({
    queryKey: [CATEGORIAS_SERVICO_QUERY_KEY, filters],
    queryFn: () => listCategoriasServico(filters),
    staleTime: 1000 * 60 * 15, // 15 minutos (menos volátil)
  });
}

// Hook para categorias ativas de uma unidade
export function useCategoriasServicosAtivas(unitId?: string) {
  return useQuery({
    queryKey: [CATEGORIAS_SERVICO_QUERY_KEY, 'ativas', unitId],
    queryFn: () =>
      listCategoriasServico({
        ativo: true,
        ...buildUnitFilter(unitId),
        limit: 50,
        page: 0,
        sort: 'ordem',
        order: 'asc',
      }),
    enabled: !!unitId,
    staleTime: 1000 * 60 * 15,
  });
}

// ====================================
// MUTATIONS PARA CATEGORIAS
// ====================================

// Hook para criar categoria
export function useCreateCategoriaServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createCategoriaServico(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar queries de categorias e serviços
        queryClient.invalidateQueries({
          queryKey: [CATEGORIAS_SERVICO_QUERY_KEY],
        });
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
      }
    },
  });
}

// Hook para atualizar categoria
export function useUpdateCategoriaServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }): Promise<ActionResult> => {
      return await updateCategoriaServico(id, formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [CATEGORIAS_SERVICO_QUERY_KEY],
        });
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
      }
    },
  });
}

// Hook para deletar categoria
export function useDeleteCategoriaServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deleteCategoriaServico(id);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [CATEGORIAS_SERVICO_QUERY_KEY],
        });
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
      }
    },
  });
}

// ====================================
// QUERIES E MUTATIONS PARA PREÇOS CUSTOMIZADOS
// ====================================

// Hook para criar preço customizado
export function useCreatePrecoCustomizado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createPrecoCustomizado(formData);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        const servicoId = variables.get('servico_id');
        // const profissionalId = variables.get('profissional_id') // Será usado quando implementar lógica específica

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
        queryClient.invalidateQueries({
          queryKey: [PRECOS_CUSTOMIZADOS_QUERY_KEY],
        });

        if (servicoId) {
          queryClient.invalidateQueries({
            queryKey: [SERVICOS_QUERY_KEY, servicoId],
          });
          queryClient.invalidateQueries({
            queryKey: [CALCULO_PRECO_QUERY_KEY, servicoId],
          });
        }
      }
    },
  });
}

// Hook para atualizar preço customizado
export function useUpdatePrecoCustomizado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }): Promise<ActionResult> => {
      return await updatePrecoCustomizado(id, formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
        queryClient.invalidateQueries({
          queryKey: [PRECOS_CUSTOMIZADOS_QUERY_KEY],
        });
        // Invalidar todas as queries relacionadas a serviços
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === SERVICOS_QUERY_KEY,
        });
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === CALCULO_PRECO_QUERY_KEY,
        });
      }
    },
  });
}

// Hook para deletar preço customizado
export function useDeletePrecoCustomizado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deletePrecoCustomizado(id);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
        queryClient.invalidateQueries({
          queryKey: [PRECOS_CUSTOMIZADOS_QUERY_KEY],
        });
        queryClient.invalidateQueries({ queryKey: [CALCULO_PRECO_QUERY_KEY] });
      }
    },
  });
}

// ====================================
// QUERIES PARA CÁLCULOS E REGRAS
// ====================================

// Hook para calcular preço de serviço para profissional
export function useCalcularPrecoServico(data: {
  servico_id: string;
  profissional_id: string;
  unidade_id: string; // manter até refactor completo
  [key: string]: unknown;
}) {
  return useQuery({
    queryKey: [CALCULO_PRECO_QUERY_KEY, data.servico_id, data.profissional_id],
    queryFn: () => calcularPrecoServico(data),
    enabled: !!data.servico_id && !!data.profissional_id && !!data.unidade_id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

// Hook para listar serviços com preços para profissional
export function useServicosComPrecosProfissional(
  profissionalId: string,
  unidadeId: string,
  filters: ServicoFilterData = { page: 1, limit: 20, order: 'asc' },
) {
  return useQuery({
    queryKey: [SERVICOS_QUERY_KEY, 'com-precos', profissionalId, unidadeId, filters],
    queryFn: () => listServicosComPrecosProfissional(profissionalId, unidadeId, filters),
    enabled: !!profissionalId && !!unidadeId,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

// ====================================
// HOOKS UTILITÁRIOS
// ====================================

// Hook para invalidar todas as queries de serviços
export function useInvalidateServicos() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [SERVICOS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [CATEGORIAS_SERVICO_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [PRECOS_CUSTOMIZADOS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [CALCULO_PRECO_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [SERVICOS_POPULARES_QUERY_KEY] });
  };
}

// Hook para serviços agrupados por categoria
export function useServicosAgrupadosPorCategoria(unidadeId?: string) {
  const servicosQuery = useServicosAtivos(unidadeId);
  const categoriasQuery = useCategoriasServicosAtivas(unidadeId);

  const servicosAgrupados = useQuery({
    queryKey: [SERVICOS_QUERY_KEY, 'agrupados-categoria', unidadeId],
    queryFn: async () => {
      if (!servicosQuery.data?.success || !categoriasQuery.data?.success) {
        return [] as Array<{
          categoria: { id: string; nome: string; cor?: string; icone?: string };
          servicos: ServicoLite[];
        }>;
      }

      type ServicoLite = {
        id?: string;
        categoria_id?: string | null;
        categoria?: string | null;
        [key: string]: unknown;
      };
      type CategoriaLite = { id: string; nome: string; cor?: string; icone?: string };

      const servicos =
        (servicosQuery.data.data as { servicos?: ServicoLite[] } | undefined)?.servicos || [];
      const categorias =
        (categoriasQuery.data.data as { categorias?: CategoriaLite[] } | undefined)?.categorias ||
        [];

      const grupos = categorias.map((categoria) => ({
        categoria,
        servicos: servicos.filter(
          (servico) =>
            servico.categoria_id === categoria.id || servico.categoria === categoria.nome,
        ),
      }));

      const servicosSemCategoria = servicos.filter((s) => !s.categoria_id && !s.categoria);

      if (servicosSemCategoria.length > 0) {
        grupos.push({
          categoria: {
            id: 'none',
            nome: 'Outros',
            cor: '#6B7280',
            icone: 'more_horiz',
          },
          servicos: servicosSemCategoria,
        });
      }

      return grupos;
    },
    enabled: !!servicosQuery.data?.success && !!categoriasQuery.data?.success,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  return {
    ...servicosAgrupados,
    isLoading: servicosQuery.isLoading || categoriasQuery.isLoading || servicosAgrupados.isLoading,
    error: servicosQuery.error || categoriasQuery.error || servicosAgrupados.error,
  };
}

// Hook para estatísticas de serviços
export function useEstatisticasServicos(unitId: string) {
  return useQuery({
    queryKey: [SERVICOS_QUERY_KEY, 'estatisticas', unitId],
    queryFn: async () => {
      const [servicosResult, categoriasResult, popularesResult] = await Promise.all([
        listServicos({ ...buildUnitFilter(unitId), limit: 1000, page: 1, order: 'asc' }),
        listCategoriasServico({ ...buildUnitFilter(unitId), limit: 100, page: 1, order: 'asc' }),
        getServicosPopulares(unitId, 5),
      ]);

      if (!servicosResult.success || !categoriasResult.success || !popularesResult.success) {
        throw new Error('Erro ao carregar estatísticas');
      }

      interface ServicoStats {
        ativo?: boolean;
        preco?: number;
        duracao_min?: number;
      }
      const servicos =
        (servicosResult.data as { servicos?: ServicoStats[] } | undefined)?.servicos || [];
      const categorias =
        (categoriasResult.data as { categorias?: Array<Record<string, unknown>> } | undefined)
          ?.categorias || [];
      const populares = (popularesResult.data as Array<Record<string, unknown>> | undefined) || [];

      return {
        total_servicos: servicos.length,
        servicos_ativos: servicos.filter((s) => s.ativo).length,
        servicos_inativos: servicos.filter((s) => s.ativo === false).length,
        total_categorias: categorias.length,
        preco_medio:
          servicos.length > 0
            ? servicos.reduce((sum: number, s) => sum + (s.preco || 0), 0) / servicos.length
            : 0,
        duracao_media:
          servicos.length > 0
            ? servicos.reduce((sum: number, s) => sum + (s.duracao_min || 0), 0) / servicos.length
            : 0,
        servicos_populares: populares,
      };
    },
    enabled: !!unitId,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}
