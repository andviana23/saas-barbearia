'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUnit } from './use-current-unit';
import {
  createTransacao,
  updateTransacao,
  getTransacoes,
  getTiposPagamento,
  getResumoFinanceiro,
  getDashboardFinanceiro,
  type CreateTransacaoData,
  type UpdateTransacaoData,
  type TransacaoFilters,
} from '@/actions/transacoes';

// ===== KEYS =====
const TRANSACOES_KEYS = {
  all: ['transacoes'] as const,
  lists: () => [...TRANSACOES_KEYS.all, 'list'] as const,
  list: (unidadeId: string, filters?: TransacaoFilters) =>
    [...TRANSACOES_KEYS.lists(), unidadeId, filters] as const,
  tipos: () => [...TRANSACOES_KEYS.all, 'tipos'] as const,
  resumo: (unidadeId: string, dataInicio: string, dataFim: string) =>
    [...TRANSACOES_KEYS.all, 'resumo', unidadeId, dataInicio, dataFim] as const,
  dashboard: (unidadeId: string) => [...TRANSACOES_KEYS.all, 'dashboard', unidadeId] as const,
};

// ===== HOOKS =====

export function useTransacoes(filters: TransacaoFilters = {}) {
  const { currentUnit } = useCurrentUnit();

  return useQuery({
    queryKey: TRANSACOES_KEYS.list(currentUnit?.id || '', filters),
    queryFn: () => getTransacoes(currentUnit?.id || '', filters),
    enabled: !!currentUnit?.id,
    staleTime: 30000, // 30 segundos
  });
}

export function useTiposPagamento() {
  return useQuery({
    queryKey: TRANSACOES_KEYS.tipos(),
    queryFn: getTiposPagamento,
    staleTime: 300000, // 5 minutos (tipos não mudam frequentemente)
  });
}

export function useResumoFinanceiro(dataInicio: string, dataFim: string) {
  const { currentUnit } = useCurrentUnit();

  return useQuery({
    queryKey: TRANSACOES_KEYS.resumo(currentUnit?.id || '', dataInicio, dataFim),
    queryFn: () => getResumoFinanceiro(currentUnit?.id || '', dataInicio, dataFim),
    enabled: !!currentUnit?.id && !!dataInicio && !!dataFim,
    staleTime: 60000, // 1 minuto
  });
}

export function useDashboardFinanceiro() {
  const { currentUnit } = useCurrentUnit();

  return useQuery({
    queryKey: TRANSACOES_KEYS.dashboard(currentUnit?.id || ''),
    queryFn: () => getDashboardFinanceiro(currentUnit?.id || ''),
    enabled: !!currentUnit?.id,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Atualizar a cada minuto
  });
}

// ===== MUTATIONS =====

export function useCreateTransacao() {
  const queryClient = useQueryClient();
  const { currentUnit } = useCurrentUnit();

  return useMutation({
    mutationFn: createTransacao,
    onSuccess: () => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: TRANSACOES_KEYS.all });
    },
  });
}

export function useUpdateTransacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransacaoData }) =>
      updateTransacao(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACOES_KEYS.all });
    },
  });
}

// ===== HELPERS =====

export function useTransacaoHelpers() {
  const { data: tiposPagamento } = useTiposPagamento();

  const getTipoPagamentoPorCodigo = (codigo: string) => {
    return tiposPagamento?.data?.find((tipo) => tipo.codigo === codigo);
  };

  const getTiposExternos = () => {
    return tiposPagamento?.data?.filter((tipo) => !tipo.requer_asaas) || [];
  };

  const getTiposAsaas = () => {
    return tiposPagamento?.data?.filter((tipo) => tipo.requer_asaas) || [];
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calcularTicketMedio = (transacoes: any[]) => {
    if (!transacoes || transacoes.length === 0) return 0;
    const total = transacoes.reduce((sum, t) => sum + Number(t.valor), 0);
    return total / transacoes.length;
  };

  return {
    getTipoPagamentoPorCodigo,
    getTiposExternos,
    getTiposAsaas,
    formatarValor,
    formatarData,
    calcularTicketMedio,
  };
}
