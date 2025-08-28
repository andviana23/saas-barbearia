import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMarketplaceServico,
  updateMarketplaceServico,
  deleteMarketplaceServico,
  getMarketplaceServico,
  getMarketplaceServicos,
  getCatalogoPublico,
  getServicoCatalogo,
  createReservaMarketplace,
  updateReservaMarketplace,
  getReservasMarketplace,
  createConfiguracaoMarketplace,
  updateConfiguracaoMarketplace,
  getConfiguracaoMarketplace,
  getMarketplaceStats,
} from '@/app/actions/marketplace';
import {
  MarketplaceServico,
  ReservaMarketplace,
  ConfiguracaoMarketplace,
  CatalogoPublico,
  CatalogoPaginado,
  MarketplaceStats,
  MarketplaceFilters,
  MarketplacePagination,
} from '@/types/marketplace';

// =====================================================
// HOOKS PARA MARKETPLACE DE SERVIÇOS
// =====================================================

// =====================================================
// 1. QUERY KEYS
// =====================================================

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  servicos: () => [...marketplaceKeys.all, 'servicos'] as const,
  servico: (id: string) => [...marketplaceKeys.servicos(), id] as const,
  servicosByUnidade: (unidadeId: string) =>
    [...marketplaceKeys.servicos(), 'unidade', unidadeId] as const,
  catalogo: (filters?: MarketplaceFilters, pagination?: MarketplacePagination) =>
    [...marketplaceKeys.all, 'catalogo', filters, pagination] as const,
  servicoCatalogo: (id: string) => [...marketplaceKeys.all, 'catalogo', 'servico', id] as const,
  reservas: () => [...marketplaceKeys.all, 'reservas'] as const,
  reservasByUnidade: (unidadeId: string) =>
    [...marketplaceKeys.all, 'reservas', 'unidade', unidadeId] as const,
  configuracoes: () => [...marketplaceKeys.all, 'configuracoes'] as const,
  configuracaoByUnidade: (unidadeId: string) =>
    [...marketplaceKeys.all, 'configuracoes', 'unidade', unidadeId] as const,
  stats: () => [...marketplaceKeys.all, 'stats'] as const,
} as const;

// =====================================================
// 2. HOOKS PARA SERVIÇOS DO MARKETPLACE
// =====================================================

export function useMarketplaceServicos(unidadeId?: string) {
  return useQuery({
    queryKey: unidadeId ? marketplaceKeys.servicosByUnidade(unidadeId) : marketplaceKeys.servicos(),
    queryFn: () => getMarketplaceServicos(unidadeId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useMarketplaceServico(id: string) {
  return useQuery({
    queryKey: marketplaceKeys.servico(id),
    queryFn: () => getMarketplaceServico(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCreateMarketplaceServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMarketplaceServico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.servicos() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.stats() });
    },
  });
}

export function useUpdateMarketplaceServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateMarketplaceServico(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.servico(id) });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.servicos() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.stats() });
    },
  });
}

export function useDeleteMarketplaceServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMarketplaceServico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.servicos() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.stats() });
    },
  });
}

// =====================================================
// 3. HOOKS PARA CATÁLOGO PÚBLICO
// =====================================================

export function useCatalogoPublico(
  filters?: MarketplaceFilters,
  pagination?: MarketplacePagination,
) {
  // Garantir que disponivel tenha um valor padrão
  const normalizedFilters = filters
    ? {
        ...filters,
        disponivel: filters.disponivel ?? true, // Padrão: mostrar apenas disponíveis
      }
    : { disponivel: true };

  return useQuery({
    queryKey: marketplaceKeys.catalogo(normalizedFilters, pagination),
    queryFn: () => getCatalogoPublico(normalizedFilters, pagination),
    staleTime: 2 * 60 * 1000, // 2 minutos (mais frequente para catálogo)
  });
}

export function useServicoCatalogo(id: string) {
  return useQuery({
    queryKey: marketplaceKeys.servicoCatalogo(id),
    queryFn: () => getServicoCatalogo(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// =====================================================
// 4. HOOKS PARA RESERVAS DO MARKETPLACE
// =====================================================

export function useReservasMarketplace(unidadeId?: string) {
  return useQuery({
    queryKey: unidadeId ? marketplaceKeys.reservasByUnidade(unidadeId) : marketplaceKeys.reservas(),
    queryFn: () => getReservasMarketplace(unidadeId),
    staleTime: 1 * 60 * 1000, // 1 minuto (reservas mudam frequentemente)
  });
}

export function useCreateReservaMarketplace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReservaMarketplace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.reservas() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.stats() });
    },
  });
}

export function useUpdateReservaMarketplace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateReservaMarketplace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.reservas() });
    },
  });
}

// =====================================================
// 5. HOOKS PARA CONFIGURAÇÕES DO MARKETPLACE
// =====================================================

export function useConfiguracaoMarketplace(unidadeId: string) {
  return useQuery({
    queryKey: marketplaceKeys.configuracaoByUnidade(unidadeId),
    queryFn: () => getConfiguracaoMarketplace(unidadeId),
    enabled: !!unidadeId,
    staleTime: 10 * 60 * 1000, // 10 minutos (configurações mudam pouco)
  });
}

export function useCreateConfiguracaoMarketplace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConfiguracaoMarketplace,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: marketplaceKeys.configuracoes(),
      });
    },
  });
}

export function useUpdateConfiguracaoMarketplace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateConfiguracaoMarketplace(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: marketplaceKeys.configuracaoByUnidade(id),
      });
      queryClient.invalidateQueries({
        queryKey: marketplaceKeys.configuracoes(),
      });
    },
  });
}

// =====================================================
// 6. HOOKS PARA ESTATÍSTICAS
// =====================================================

export function useMarketplaceStats() {
  return useQuery({
    queryKey: marketplaceKeys.stats(),
    queryFn: getMarketplaceStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// =====================================================
// 7. HOOKS DE UTILIDADE
// =====================================================

export function useMarketplaceStatus() {
  const { data: stats } = useMarketplaceStats();

  return {
    totalServicos: stats?.data?.total_servicos || 0,
    totalUnidades: stats?.data?.total_unidades || 0,
    servicosDestaque: stats?.data?.servicos_destaque || 0,
    categoriasDisponiveis: stats?.data?.categorias_disponiveis || [],
    faixaPrecos: stats?.data?.faixa_precos || { min: 0, max: 0, media: 0 },
    servicosPorCategoria: stats?.data?.servicos_por_categoria || {},
    isLoading: !stats,
    isError: !!stats?.error,
  };
}

export function useMarketplaceFeatures() {
  const { data: stats } = useMarketplaceStats();

  return {
    hasServices: (stats?.data?.total_servicos || 0) > 0,
    hasMultipleUnits: (stats?.data?.total_unidades || 0) > 1,
    hasFeaturedServices: (stats?.data?.servicos_destaque || 0) > 0,
    hasMultipleCategories: (stats?.data?.categorias_disponiveis || []).length > 1,
    priceRange: stats?.data?.faixa_precos || { min: 0, max: 0, media: 0 },
  };
}

export function useMarketplaceCache() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
    invalidateServicos: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.servicos() });
    },
    invalidateCatalogo: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.catalogo() });
    },
    invalidateReservas: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.reservas() });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.stats() });
    },
    prefetchServico: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: marketplaceKeys.servico(id),
        queryFn: () => getMarketplaceServico(id),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchCatalogo: (filters?: MarketplaceFilters, pagination?: MarketplacePagination) => {
      // Garantir que disponivel tenha um valor padrão
      const normalizedFilters = filters
        ? {
            ...filters,
            disponivel: filters.disponivel ?? true,
          }
        : { disponivel: true };

      queryClient.prefetchQuery({
        queryKey: marketplaceKeys.catalogo(normalizedFilters, pagination),
        queryFn: () => getCatalogoPublico(normalizedFilters, pagination),
        staleTime: 2 * 60 * 1000,
      });
    },
  };
}

// =====================================================
// 8. HOOKS PARA BUSCA E FILTROS
// =====================================================

export function useMarketplaceSearch(
  query: string,
  filters?: MarketplaceFilters,
  pagination?: MarketplacePagination,
) {
  const { data: catalogo } = useCatalogoPublico(filters, pagination);

  // Verificar se existe dados para pesquisar
  if (!catalogo?.data || !Array.isArray(catalogo.data)) {
    return {
      results: [],
      total: 0,
      isLoading: !catalogo,
      isEmpty: true,
    };
  }

  const searchResults = catalogo.data.filter((servico) => {
    if (!query) return true;

    const searchTerm = query.toLowerCase();
    return (
      servico.nome_publico.toLowerCase().includes(searchTerm) ||
      servico.descricao_publica?.toLowerCase().includes(searchTerm) ||
      servico.categoria_publica?.toLowerCase().includes(searchTerm) ||
      servico.unidade_nome.toLowerCase().includes(searchTerm) ||
      servico.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
    );
  });

  return {
    results: searchResults,
    total: searchResults.length,
    isLoading: !catalogo,
    isError: !!catalogo?.error,
  };
}

export function useMarketplaceFilters() {
  const { data: stats } = useMarketplaceStats();

  return {
    categorias: stats?.data?.categorias_disponiveis || [],
    faixaPrecos: stats?.data?.faixa_precos || { min: 0, max: 0, media: 0 },
    unidades: [], // Seria buscado separadamente
    tags: [], // Seria calculado baseado nos serviços
  };
}

// =====================================================
// 9. HOOKS PARA COMPARAÇÕES
// =====================================================

export function useMarketplaceComparison(unidadeIds: string[]) {
  const queries = useQueries({
    queries: unidadeIds.map((id) => ({
      queryKey: marketplaceKeys.servicosByUnidade(id),
      queryFn: () => getMarketplaceServicos(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const comparisonData = unidadeIds.map((id, index) => ({
    unidadeId: id,
    servicos: queries[index].data?.data || [],
    isLoading: queries[index].isLoading,
    isError: queries[index].isError,
  }));

  return {
    comparisonData,
    isLoading,
    isError,
    totalUnidades: unidadeIds.length,
  };
}

// =====================================================
// 10. HOOKS PARA MÉTRICAS E ANALYTICS
// =====================================================

export function useMarketplaceMetrics(unidadeId?: string) {
  const { data: servicos } = useMarketplaceServicos(unidadeId);
  const { data: reservas } = useReservasMarketplace(unidadeId);
  const { data: stats } = useMarketplaceStats();

  const metrics = {
    totalServicos: servicos?.data?.length || 0,
    totalReservas: reservas?.data?.length || 0,
    servicosAtivos: servicos?.data?.filter((s) => s.disponivel).length || 0,
    servicosDestaque: servicos?.data?.filter((s) => s.destaque).length || 0,
    faturamentoEstimado: (reservas?.data || []).reduce((total, r) => {
      // Aqui seria calculado baseado no preço do serviço
      return total + 0; // Placeholder
    }, 0),
    taxaOcupacao: 0, // Seria calculado baseado em horários disponíveis
  };

  return {
    metrics,
    isLoading: !servicos || !reservas || !stats,
    isError: !!servicos?.error || !!reservas?.error || !!stats?.error,
  };
}
