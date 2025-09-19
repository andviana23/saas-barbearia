import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPermissaoHierarquica,
  updatePermissaoHierarquica,
  getPermissoesHierarquicas,
  createAcessoMultiUnidade,
  updateAcessoMultiUnidade,
  getAcessosMultiUnidade,
  registrarAuditoria,
  getAuditoriaAcessos,
  getFaturamentoConsolidado,
  getServicosConsolidado,
  getProfissionaisConsolidado,
  getRelatoriosConsolidados,
  getEstatisticasMultiUnidade,
} from '@/app/actions/multi-unidades';
import {
  PermissaoHierarquica,
  AcessoMultiUnidade,
  AuditoriaAcesso,
  FaturamentoConsolidado,
  ServicosConsolidado,
  ProfissionaisConsolidado,
  RelatoriosConsolidadosResponse,
  EstatisticasMultiUnidade,
  RelatorioConsolidadoFilters,
  RelatorioPagination,
} from '@/types/multi-unidades';
import { UpdatePermissaoHierarquica, UpdateAcessoMultiUnidade } from '@/schemas/multi-unidades';

// =====================================================
// HOOKS PARA GESTÃO MULTI-UNIDADES
// =====================================================

// =====================================================
// 1. QUERY KEYS
// =====================================================

export const multiUnidadesKeys = {
  all: ['multi-unidades'] as const,
  permissoes: () => [...multiUnidadesKeys.all, 'permissoes'] as const,
  permissao: (id: string) => [...multiUnidadesKeys.permissoes(), id] as const,
  acessos: () => [...multiUnidadesKeys.all, 'acessos'] as const,
  acessosByProfile: (profileId: string) =>
    [...multiUnidadesKeys.acessos(), 'profile', profileId] as const,
  acessosByUnidade: (unidadeId: string) =>
    [...multiUnidadesKeys.acessos(), 'unidade', unidadeId] as const,
  auditoria: () => [...multiUnidadesKeys.all, 'auditoria'] as const,
  auditoriaByProfile: (profileId: string) =>
    [...multiUnidadesKeys.auditoria(), 'profile', profileId] as const,
  auditoriaByUnidade: (unidadeId: string) =>
    [...multiUnidadesKeys.auditoria(), 'unidade', unidadeId] as const,
  relatorios: () => [...multiUnidadesKeys.all, 'relatorios'] as const,
  faturamentoConsolidado: (filters?: RelatorioConsolidadoFilters) =>
    [...multiUnidadesKeys.relatorios(), 'faturamento', filters] as const,
  servicosConsolidado: (filters?: RelatorioConsolidadoFilters) =>
    [...multiUnidadesKeys.relatorios(), 'servicos', filters] as const,
  profissionaisConsolidado: (filters?: RelatorioConsolidadoFilters) =>
    [...multiUnidadesKeys.relatorios(), 'profissionais', filters] as const,
  relatoriosCompletos: (filters?: RelatorioConsolidadoFilters) =>
    [...multiUnidadesKeys.relatorios(), 'completos', filters] as const,
  estatisticas: () => [...multiUnidadesKeys.all, 'estatisticas'] as const,
} as const;

// =====================================================
// 2. HOOKS PARA PERMISSÕES HIERÁRQUICAS
// =====================================================

export function usePermissoesHierarquicas() {
  return useQuery({
    queryKey: multiUnidadesKeys.permissoes(),
    queryFn: getPermissoesHierarquicas,
    staleTime: 10 * 60 * 1000, // 10 minutos (permissões mudam pouco)
  });
}

export function useCreatePermissaoHierarquica() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPermissaoHierarquica,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: multiUnidadesKeys.permissoes(),
      });
    },
  });
}

export function useUpdatePermissaoHierarquica() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissaoHierarquica }) =>
      updatePermissaoHierarquica(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: multiUnidadesKeys.permissao(id),
      });
      queryClient.invalidateQueries({
        queryKey: multiUnidadesKeys.permissoes(),
      });
    },
  });
}

// =====================================================
// 3. HOOKS PARA ACESSOS MULTI-UNIDADE
// =====================================================

export function useAcessosMultiUnidade(profileId?: string, unidadeId?: string) {
  return useQuery({
    queryKey: profileId
      ? multiUnidadesKeys.acessosByProfile(profileId)
      : unidadeId
        ? multiUnidadesKeys.acessosByUnidade(unidadeId)
        : multiUnidadesKeys.acessos(),
    queryFn: () => getAcessosMultiUnidade(profileId, unidadeId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCreateAcessoMultiUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAcessoMultiUnidade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multiUnidadesKeys.acessos() });
    },
  });
}

export function useUpdateAcessoMultiUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcessoMultiUnidade }) =>
      updateAcessoMultiUnidade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multiUnidadesKeys.acessos() });
    },
  });
}

// =====================================================
// 4. HOOKS PARA AUDITORIA
// =====================================================

export function useAuditoriaAcessos(
  profileId?: string,
  unidadeId?: string,
  page: number = 1,
  limit: number = 20,
) {
  return useQuery({
    queryKey: profileId
      ? multiUnidadesKeys.auditoriaByProfile(profileId)
      : unidadeId
        ? multiUnidadesKeys.auditoriaByUnidade(unidadeId)
        : multiUnidadesKeys.auditoria(),
    queryFn: () => getAuditoriaAcessos(profileId, unidadeId, page, limit),
    staleTime: 1 * 60 * 1000, // 1 minuto (auditoria pode mudar frequentemente)
  });
}

export function useRegistrarAuditoria() {
  return useMutation({
    mutationFn: ({
      unidadeId,
      acao,
      recurso,
      dadosConsultados,
    }: {
      unidadeId: string;
      acao: string;
      recurso: string;
      dadosConsultados?: Record<string, any>;
    }) => registrarAuditoria(unidadeId, acao, recurso, dadosConsultados),
  });
}

// =====================================================
// 5. HOOKS PARA RELATÓRIOS CONSOLIDADOS
// =====================================================

export function useFaturamentoConsolidado(filters?: RelatorioConsolidadoFilters) {
  return useQuery({
    queryKey: multiUnidadesKeys.faturamentoConsolidado(filters),
    queryFn: () => getFaturamentoConsolidado(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useServicosConsolidado(filters?: RelatorioConsolidadoFilters) {
  return useQuery({
    queryKey: multiUnidadesKeys.servicosConsolidado(filters),
    queryFn: () => getServicosConsolidado(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useProfissionaisConsolidado(filters?: RelatorioConsolidadoFilters) {
  return useQuery({
    queryKey: multiUnidadesKeys.profissionaisConsolidado(filters),
    queryFn: () => getProfissionaisConsolidado(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useRelatoriosConsolidados(filters?: RelatorioConsolidadoFilters) {
  return useQuery({
    queryKey: multiUnidadesKeys.relatoriosCompletos(filters),
    queryFn: () => getRelatoriosConsolidados(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// =====================================================
// 6. HOOKS PARA ESTATÍSTICAS
// =====================================================

export function useEstatisticasMultiUnidade() {
  return useQuery({
    queryKey: multiUnidadesKeys.estatisticas(),
    queryFn: getEstatisticasMultiUnidade,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// =====================================================
// 7. HOOKS DE UTILIDADE
// =====================================================

export function useMultiUnidadesStatus() {
  const { data: estatisticas } = useEstatisticasMultiUnidade();

  return {
    totalUnidades: estatisticas?.data?.total_unidades || 0,
    unidadesAtivas: estatisticas?.data?.unidades_ativas || 0,
    totalUsuarios: estatisticas?.data?.total_usuarios || 0,
    acessosMultiUnidade: estatisticas?.data?.acessos_multi_unidade || 0,
    relatoriosConsultados: estatisticas?.data?.relatorios_consultados || 0,
    auditoriaEntradas: estatisticas?.data?.auditoria_entradas || 0,
    usuariosPorPapel: estatisticas?.data?.usuarios_por_papel || {},
    isLoading: !estatisticas,
    isError: !!estatisticas?.error,
  };
}

export function useMultiUnidadesFeatures() {
  const { data: estatisticas } = useEstatisticasMultiUnidade();

  return {
    hasMultipleUnits: (estatisticas?.data?.total_unidades || 0) > 1,
    hasMultiUnitAccess: (estatisticas?.data?.acessos_multi_unidade || 0) > 0,
    hasAuditTrail: (estatisticas?.data?.auditoria_entradas || 0) > 0,
    hasConsolidatedReports: true, // Sempre disponível se implementado
    totalActiveUnits: estatisticas?.data?.unidades_ativas || 0,
  };
}

export function useMultiUnidadesCache() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: multiUnidadesKeys.all });
    },
    invalidatePermissoes: () => {
      queryClient.invalidateQueries({
        queryKey: multiUnidadesKeys.permissoes(),
      });
    },
    invalidateAcessos: () => {
      queryClient.invalidateQueries({ queryKey: multiUnidadesKeys.acessos() });
    },
    invalidateAuditoria: () => {
      queryClient.invalidateQueries({ queryKey: multiUnidadesKeys.auditoria() });
    },
    invalidateRelatorios: () => {
      queryClient.invalidateQueries({
        queryKey: multiUnidadesKeys.relatorios(),
      });
    },
    invalidateEstatisticas: () => {
      queryClient.invalidateQueries({
        queryKey: multiUnidadesKeys.estatisticas(),
      });
    },
    prefetchRelatorios: (filters?: RelatorioConsolidadoFilters) => {
      queryClient.prefetchQuery({
        queryKey: multiUnidadesKeys.relatoriosCompletos(filters),
        queryFn: () => getRelatoriosConsolidados(filters),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}

// =====================================================
// 8. HOOKS PARA COMPARAÇÕES E BENCHMARKS
// =====================================================

export function useUnidadesComparison(unidadeIds: string[]) {
  const faturamentoQueries = useQueries({
    queries: unidadeIds.map((id) => ({
      queryKey: multiUnidadesKeys.faturamentoConsolidado({ unidade_id: id }),
      queryFn: () => getFaturamentoConsolidado({ unidade_id: id }),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const servicosQueries = useQueries({
    queries: unidadeIds.map((id) => ({
      queryKey: multiUnidadesKeys.servicosConsolidado({ unidade_id: id }),
      queryFn: () => getServicosConsolidado({ unidade_id: id }),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const profissionaisQueries = useQueries({
    queries: unidadeIds.map((id) => ({
      queryKey: multiUnidadesKeys.profissionaisConsolidado({ unidade_id: id }),
      queryFn: () => getProfissionaisConsolidado({ unidade_id: id }),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading =
    faturamentoQueries.some((q) => q.isLoading) ||
    servicosQueries.some((q) => q.isLoading) ||
    profissionaisQueries.some((q) => q.isLoading);

  const isError =
    faturamentoQueries.some((q) => q.isError) ||
    servicosQueries.some((q) => q.isError) ||
    profissionaisQueries.some((q) => q.isError);

  const comparisonData = unidadeIds.map((id, index) => ({
    unidadeId: id,
    faturamento: faturamentoQueries[index].data?.data || [],
    servicos: servicosQueries[index].data?.data || [],
    profissionais: profissionaisQueries[index].data?.data || [],
    isLoading:
      faturamentoQueries[index].isLoading ||
      servicosQueries[index].isLoading ||
      profissionaisQueries[index].isLoading,
    isError:
      faturamentoQueries[index].isError ||
      servicosQueries[index].isError ||
      profissionaisQueries[index].isError,
  }));

  return {
    comparisonData,
    isLoading,
    isError,
    totalUnidades: unidadeIds.length,
  };
}

// =====================================================
// 9. HOOKS PARA FILTROS E PAGINAÇÃO
// =====================================================

export function useRelatorioFilters() {
  const { data: estatisticas } = useEstatisticasMultiUnidade();

  return {
    unidades: [], // Seria buscado separadamente
    categorias: [], // Seria buscado separadamente
    papels: ['owner', 'admin', 'gerente', 'profissional', 'operador', 'recepcao'],
    periodos: {
      hoje: new Date().toISOString().split('T')[0],
      semana: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mes: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trimestre: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ano: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };
}

// =====================================================
// 10. HOOKS PARA MÉTRICAS E ANALYTICS
// =====================================================

export function useMultiUnidadesMetrics(unidadeId?: string) {
  const { data: faturamento } = useFaturamentoConsolidado(
    unidadeId ? { unidade_id: unidadeId } : undefined,
  );
  const { data: servicos } = useServicosConsolidado(
    unidadeId ? { unidade_id: unidadeId } : undefined,
  );
  const { data: profissionais } = useProfissionaisConsolidado(
    unidadeId ? { unidade_id: unidadeId } : undefined,
  );

  const metrics = {
    totalFaturamento: (faturamento?.data || []).reduce(
      (total, f) => total + f.faturamento_total,
      0,
    ),
    totalAgendamentos: (faturamento?.data || []).reduce(
      (total, f) => total + f.total_agendamentos,
      0,
    ),
    ticketMedio:
      (faturamento?.data || []).reduce((total, f) => total + f.ticket_medio, 0) /
      Math.max((faturamento?.data || []).length, 1),
    totalServicos: (servicos?.data || []).reduce((total, s) => total + s.total_servicos, 0),
    totalProfissionais: (profissionais?.data || []).reduce(
      (total, p) => total + p.total_profissionais,
      0,
    ),
    unidadesAtivas: (faturamento?.data || []).length,
  };

  return {
    metrics,
    isLoading: !faturamento || !servicos || !profissionais,
    isError: !!faturamento?.error || !!servicos?.error || !!profissionais?.error,
  };
}

// =====================================================
// 11. HOOKS PARA PERMISSÕES E ACESSO
// =====================================================

export function useUserPermissions() {
  const { data: permissoes } = usePermissoesHierarquicas();
  const { data: acessos } = useAcessosMultiUnidade();

  return {
    permissoes: permissoes?.data || [],
    acessos: acessos?.data || [],
    isLoading: !permissoes || !acessos,
    isError: !!permissoes?.error || !!acessos?.error,
    hasPermission: (permission: string) => {
      // Lógica para verificar permissões do usuário
      return true; // Placeholder
    },
    canAccessUnidade: (unidadeId: string) => {
      // Lógica para verificar acesso à unidade
      return true; // Placeholder
    },
  };
}

// =====================================================
// 12. HOOKS PARA EXPORTAÇÃO E RELATÓRIOS
// =====================================================

export function useRelatorioExport() {
  const queryClient = useQueryClient();

  return {
    exportFaturamento: (filters?: RelatorioConsolidadoFilters, formato: 'csv' | 'json' = 'csv') => {
      // Lógica para exportar relatório de faturamento
      console.log('Exportando faturamento:', { filters, formato });
    },
    exportServicos: (filters?: RelatorioConsolidadoFilters, formato: 'csv' | 'json' = 'csv') => {
      // Lógica para exportar relatório de serviços
      console.log('Exportando serviços:', { filters, formato });
    },
    exportProfissionais: (
      filters?: RelatorioConsolidadoFilters,
      formato: 'csv' | 'json' = 'csv',
    ) => {
      // Lógica para exportar relatório de profissionais
      console.log('Exportando profissionais:', { filters, formato });
    },
    exportCompleto: (filters?: RelatorioConsolidadoFilters, formato: 'csv' | 'json' = 'csv') => {
      // Lógica para exportar relatório completo
      console.log('Exportando relatório completo:', { filters, formato });
    },
  };
}
