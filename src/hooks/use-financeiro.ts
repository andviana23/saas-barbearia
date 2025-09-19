'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMovimentacao,
  updateMovimentacao,
  deleteMovimentacao,
  listMovimentacoes,
  getMovimentacao,
  lancamentoRapido,
  calcularComissao,
  fechamentoCaixa,
  gerarRelatorioFinanceiro,
  getEstatisticasFinanceiras,
} from '@/actions/financeiro';
import type {
  MovimentacaoFilterData,
  EstatisticasFinanceirasData,
  RelatorioFinanceiroData,
} from '@/schemas';

// Interfaces para tipagem dos dados financeiros
interface EstatisticasFinanceirasResponse {
  origens_receita?: Record<string, number>;
  [key: string]: unknown;
}

// Query keys para o sistema financeiro
export const FINANCEIRO_QUERY_KEY = 'financeiro';
export const MOVIMENTACOES_QUERY_KEY = 'movimentacoes';
export const ESTATISTICAS_QUERY_KEY = 'estatisticas-financeiras';
export const RELATORIOS_QUERY_KEY = 'relatorios-financeiros';
export const COMISSOES_QUERY_KEY = 'comissoes';

// =====================================================
// REACT QUERY HOOKS PARA GESTÃO FINANCEIRA (EP9)
// =====================================================

/**
 * Hook para listar movimentações financeiras
 */
export function useMovimentacoes(filters?: MovimentacaoFilterData) {
  return useQuery({
    queryKey: [MOVIMENTACOES_QUERY_KEY, filters],
    queryFn: () => listMovimentacoes(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos (dados financeiros mudam frequentemente)
    retry: 3,
    enabled: true,
  });
}

/**
 * Hook para buscar movimentação específica
 */
export function useMovimentacao(id: string) {
  return useQuery({
    queryKey: [MOVIMENTACOES_QUERY_KEY, id],
    queryFn: () => getMovimentacao(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para criar movimentação financeira
 */
export function useCreateMovimentacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await createMovimentacao(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache das movimentações
        queryClient.invalidateQueries({ queryKey: [MOVIMENTACOES_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [ESTATISTICAS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [RELATORIOS_QUERY_KEY] });
      }
    },
    onError: (error) => {
      console.error('Erro ao criar movimentação:', error);
    },
  });
}

/**
 * Hook para atualizar movimentação financeira
 */
export function useUpdateMovimentacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateMovimentacao(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache das movimentações
        queryClient.invalidateQueries({ queryKey: [MOVIMENTACOES_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [ESTATISTICAS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [RELATORIOS_QUERY_KEY] });
      }
    },
    onError: (error) => {
      console.error('Erro ao atualizar movimentação:', error);
    },
  });
}

/**
 * Hook para deletar movimentação financeira
 */
export function useDeleteMovimentacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteMovimentacao(id);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache das movimentações
        queryClient.invalidateQueries({ queryKey: [MOVIMENTACOES_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [ESTATISTICAS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [RELATORIOS_QUERY_KEY] });
      }
    },
    onError: (error) => {
      console.error('Erro ao deletar movimentação:', error);
    },
  });
}

/**
 * Hook para lançamento rápido
 */
export function useLancamentoRapido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await lancamentoRapido(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache das movimentações
        queryClient.invalidateQueries({ queryKey: [MOVIMENTACOES_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [ESTATISTICAS_QUERY_KEY] });
      }
    },
    onError: (error) => {
      console.error('Erro ao criar lançamento rápido:', error);
    },
  });
}

/**
 * Hook para calcular comissão
 */
export function useCalcularComissao() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await calcularComissao(formData);
    },
    onError: (error) => {
      console.error('Erro ao calcular comissão:', error);
    },
  });
}

/**
 * Hook para fechamento de caixa
 */
export function useFechamentoCaixa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await fechamentoCaixa(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache relevante
        queryClient.invalidateQueries({ queryKey: [MOVIMENTACOES_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [ESTATISTICAS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [RELATORIOS_QUERY_KEY] });
      }
    },
    onError: (error) => {
      console.error('Erro no fechamento de caixa:', error);
    },
  });
}

/**
 * Hook para gerar relatórios financeiros
 */
export function useRelatorioFinanceiro(filtros?: RelatorioFinanceiroData) {
  return useQuery({
    queryKey: [RELATORIOS_QUERY_KEY, filtros],
    queryFn: () => gerarRelatorioFinanceiro(filtros),
    enabled: !!filtros?.data_inicio && !!filtros?.data_fim,
    staleTime: 1000 * 60 * 10, // 10 minutos (relatórios não mudam tão frequentemente)
  });
}

/**
 * Hook para obter estatísticas financeiras
 */
export function useEstatisticasFinanceiras(filtros?: EstatisticasFinanceirasData) {
  return useQuery({
    queryKey: [ESTATISTICAS_QUERY_KEY, filtros],
    queryFn: () => getEstatisticasFinanceiras(filtros),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 5, // Atualizar a cada 5 minutos automaticamente
  });
}

// =====================================================
// HOOKS ESPECIALIZADOS
// =====================================================

/**
 * Hook para movimentações do dia atual
 */
export function useMovimentacoesHoje(unidadeId?: string) {
  const hoje = new Date().toISOString().split('T')[0];

  return useMovimentacoes({
    page: 1,
    unidade_id: unidadeId,
    data_inicio: hoje,
    data_fim: hoje,
    ordenacao: 'criado_desc',
    limit: 100,
  });
}

/**
 * Hook para entradas do período
 */
export function useEntradasPeriodo(unidadeId?: string, dataInicio?: string, dataFim?: string) {
  return useMovimentacoes({
    page: 1,
    unidade_id: unidadeId,
    tipo: 'entrada',
    data_inicio: dataInicio,
    data_fim: dataFim,
    ordenacao: 'data_desc',
    limit: 100,
  });
}

/**
 * Hook para saídas do período
 */
export function useSaidasPeriodo(unidadeId?: string, dataInicio?: string, dataFim?: string) {
  return useMovimentacoes({
    page: 1,
    unidade_id: unidadeId,
    tipo: 'saida',
    data_inicio: dataInicio,
    data_fim: dataFim,
    ordenacao: 'data_desc',
    limit: 100,
  });
}

/**
 * Hook para movimentações por profissional
 */
export function useMovimentacoesProfissional(
  profissionalId: string,
  unidadeId?: string,
  dataInicio?: string,
  dataFim?: string,
) {
  return useMovimentacoes({
    page: 1,
    profissional_id: profissionalId,
    unidade_id: unidadeId,
    data_inicio: dataInicio,
    data_fim: dataFim,
    ordenacao: 'data_desc',
    limit: 50,
  });
}

/**
 * Hook para resumo financeiro do dia
 */
export function useResumoFinanceiroDia(unidadeId?: string) {
  return useEstatisticasFinanceiras({
    unidade_id: unidadeId,
    periodo: 'hoje',
    incluir_comparativo: true,
    incluir_metas: false,
  });
}

/**
 * Hook para resumo financeiro do mês
 */
export function useResumoFinanceiroMes(unidadeId?: string) {
  return useEstatisticasFinanceiras({
    unidade_id: unidadeId,
    periodo: 'mes',
    incluir_comparativo: true,
    incluir_metas: false,
  });
}

/**
 * Hook para resumo financeiro da semana
 */
export function useResumoFinanceiroSemana(unidadeId?: string) {
  return useEstatisticasFinanceiras({
    unidade_id: unidadeId,
    periodo: 'semana',
    incluir_comparativo: true,
    incluir_metas: false,
  });
}

/**
 * Hook para relatório por profissional
 */
export function useRelatorioPorProfissional(
  profissionalId: string,
  dataInicio: string,
  dataFim: string,
  unidadeId?: string,
) {
  return useRelatorioFinanceiro({
    tipo_relatorio: 'por_profissional',
    profissional_id: profissionalId,
    unidade_id: unidadeId,
    data_inicio: dataInicio,
    data_fim: dataFim,
    incluir_comissoes: true,
    incluir_impostos: false,
    formato: 'json',
  });
}

/**
 * Hook para relatório de fluxo de caixa
 */
export function useRelatorioFluxoCaixa(dataInicio: string, dataFim: string, unidadeId?: string) {
  return useRelatorioFinanceiro({
    tipo_relatorio: 'fluxo_caixa',
    unidade_id: unidadeId,
    data_inicio: dataInicio,
    data_fim: dataFim,
    incluir_comissoes: false,
    incluir_impostos: false,
    formato: 'json',
  });
}

/**
 * Hook para top origens de receita
 */
export function useTopOrigensReceita(
  unidadeId?: string,
  periodo: 'semana' | 'mes' | 'ano' = 'mes',
) {
  const estatisticas = useEstatisticasFinanceiras({
    unidade_id: unidadeId,
    periodo,
    incluir_comparativo: false,
    incluir_metas: false,
  });

  return {
    ...estatisticas,
    data:
      estatisticas.data?.success && estatisticas.data.data
        ? {
            ...estatisticas.data.data,
            top_origens: Object.entries(
              (estatisticas.data.data as EstatisticasFinanceirasResponse).origens_receita || {},
            )
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 5),
          }
        : null,
  };
}

/**
 * Hook para comissões do período
 */
export function useComissoesPeriodo(dataInicio: string, dataFim: string, unidadeId?: string) {
  return useMovimentacoes({
    page: 1,
    unidade_id: unidadeId,
    origem: 'comissao',
    data_inicio: dataInicio,
    data_fim: dataFim,
    ordenacao: 'data_desc',
    limit: 100,
  });
}

/**
 * Hook para estatísticas em tempo real (atualização frequente)
 */
export function useEstatisticasRealTime(unidadeId?: string) {
  return useQuery({
    queryKey: [ESTATISTICAS_QUERY_KEY, 'realtime', unidadeId],
    queryFn: () =>
      getEstatisticasFinanceiras({
        unidade_id: unidadeId,
        periodo: 'hoje',
      }),
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // 1 minuto
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para buscar movimentações com busca otimizada
 */
export function useBuscarMovimentacoes(termo: string, unidadeId?: string) {
  return useQuery({
    queryKey: [MOVIMENTACOES_QUERY_KEY, 'busca', termo, unidadeId],
    queryFn: () =>
      listMovimentacoes({
        page: 1,
        busca: termo,
        unidade_id: unidadeId,
        limit: 20,
        ordenacao: 'criado_desc',
      }),
    enabled: !!termo && termo.length >= 3,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para invalidar cache financeiro manualmente
 */
export function useInvalidateFinanceiro() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: [FINANCEIRO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MOVIMENTACOES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ESTATISTICAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RELATORIOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COMISSOES_QUERY_KEY] });
    },
    invalidateMovimentacoes: () => {
      queryClient.invalidateQueries({ queryKey: [MOVIMENTACOES_QUERY_KEY] });
    },
    invalidateEstatisticas: () => {
      queryClient.invalidateQueries({ queryKey: [ESTATISTICAS_QUERY_KEY] });
    },
    invalidateRelatorios: () => {
      queryClient.invalidateQueries({ queryKey: [RELATORIOS_QUERY_KEY] });
    },
  };
}
