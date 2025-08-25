'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addToQueue,
  updateQueueItem,
  callNextFromQueue,
  startService,
  finishService,
  removeFromQueue,
  listQueueItems,
  getQueueStatus,
  calculateWaitTime,
  getQueueStats,
} from '@/actions/fila'
import type { FilaFilterData, FilaStatsData } from '@/schemas'

// Query keys para o sistema de fila
export const FILA_QUERY_KEY = 'fila'
export const FILA_STATUS_QUERY_KEY = 'fila-status'
export const FILA_STATS_QUERY_KEY = 'fila-stats'

// =====================================================
// REACT QUERY HOOKS PARA SISTEMA DE FILA (EP8)
// =====================================================

/**
 * Hook para listar itens da fila com filtros
 */
export function useFila(filters: FilaFilterData) {
  return useQuery({
    queryKey: [FILA_QUERY_KEY, filters],
    queryFn: () => listQueueItems(filters),
    staleTime: 1000 * 30, // 30 segundos
    gcTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para obter status atual da fila
 */
export function useFilaStatus(unidadeId: string) {
  return useQuery({
    queryKey: [FILA_STATUS_QUERY_KEY, unidadeId],
    queryFn: () => getQueueStatus(unidadeId),
    staleTime: 1000 * 15, // 15 segundos (mais frequente para status)
    gcTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 30, // Atualizar a cada 30 segundos
    enabled: !!unidadeId,
  })
}

/**
 * Hook para obter estatísticas da fila
 */
export function useFilaStats(filters: FilaStatsData) {
  return useQuery({
    queryKey: [FILA_STATS_QUERY_KEY, filters],
    queryFn: () => getQueueStats(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  })
}

/**
 * Hook para adicionar cliente à fila
 */
export function useAddToQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await addToQueue(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache da fila
        queryClient.invalidateQueries({ queryKey: [FILA_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATUS_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATS_QUERY_KEY] })
      }
    },
    onError: (error) => {
      console.error('Erro ao adicionar à fila:', error)
    },
  })
}

/**
 * Hook para atualizar item da fila
 */
export function useUpdateQueueItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateQueueItem(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache da fila
        queryClient.invalidateQueries({ queryKey: [FILA_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATUS_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATS_QUERY_KEY] })
      }
    },
    onError: (error) => {
      console.error('Erro ao atualizar item da fila:', error)
    },
  })
}

/**
 * Hook para chamar próximo cliente da fila
 */
export function useCallNextFromQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await callNextFromQueue(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache da fila
        queryClient.invalidateQueries({ queryKey: [FILA_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATUS_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATS_QUERY_KEY] })
      }
    },
    onError: (error) => {
      console.error('Erro ao chamar próximo cliente:', error)
    },
  })
}

/**
 * Hook para iniciar atendimento
 */
export function useStartService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await startService(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache da fila
        queryClient.invalidateQueries({ queryKey: [FILA_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATUS_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATS_QUERY_KEY] })
      }
    },
    onError: (error) => {
      console.error('Erro ao iniciar atendimento:', error)
    },
  })
}

/**
 * Hook para finalizar atendimento
 */
export function useFinishService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await finishService(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache da fila
        queryClient.invalidateQueries({ queryKey: [FILA_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATUS_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATS_QUERY_KEY] })
      }
    },
    onError: (error) => {
      console.error('Erro ao finalizar atendimento:', error)
    },
  })
}

/**
 * Hook para remover cliente da fila
 */
export function useRemoveFromQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await removeFromQueue(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache da fila
        queryClient.invalidateQueries({ queryKey: [FILA_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATUS_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: [FILA_STATS_QUERY_KEY] })
      }
    },
    onError: (error) => {
      console.error('Erro ao remover da fila:', error)
    },
  })
}

/**
 * Hook para calcular estimativa de espera
 */
export function useCalculateWaitTime() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await calculateWaitTime(formData)
    },
    onError: (error) => {
      console.error('Erro ao calcular tempo de espera:', error)
    },
  })
}

// =====================================================
// HOOKS ESPECIALIZADOS PARA CASOS DE USO COMUNS
// =====================================================

/**
 * Hook para obter fila ativa (aguardando + chamado + em atendimento)
 */
export function useFilaAtiva(unidadeId: string) {
  return useQuery({
    queryKey: [FILA_QUERY_KEY, 'ativa', unidadeId],
    queryFn: () =>
      listQueueItems({
        unidade_id: unidadeId,
        status: ['aguardando', 'chamado', 'em_atendimento'],
        ordenacao: 'posicao_asc',
        page: 1,
        limit: 100,
      }),
    staleTime: 1000 * 20, // 20 segundos
    gcTime: 1000 * 60 * 3, // 3 minutos
    refetchInterval: 1000 * 45, // Atualizar a cada 45 segundos
    enabled: !!unidadeId,
  })
}

/**
 * Hook para obter próximo cliente da fila
 */
export function useProximoCliente(unidadeId: string) {
  return useQuery({
    queryKey: [FILA_QUERY_KEY, 'proximo', unidadeId],
    queryFn: async () => {
      const result = await getQueueStatus(unidadeId)
      if (result.success && result.data) {
        return (result.data as any).proximo || null
      }
      return null
    },
    staleTime: 1000 * 10, // 10 segundos
    gcTime: 1000 * 60 * 1, // 1 minuto
    refetchInterval: 1000 * 20, // Atualizar a cada 20 segundos
    enabled: !!unidadeId,
  })
}

/**
 * Hook para obter estatísticas em tempo real
 */
export function useFilaStatsRealTime(unidadeId: string) {
  return useQuery({
    queryKey: [FILA_STATS_QUERY_KEY, 'real-time', unidadeId],
    queryFn: () =>
      getQueueStats({
        unidade_id: unidadeId,
        periodo: 'hoje',
      }),
    staleTime: 1000 * 30, // 30 segundos
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60, // Atualizar a cada 1 minuto
    enabled: !!unidadeId,
  })
}

/**
 * Hook para obter fila por prioridade
 */
export function useFilaPorPrioridade(
  unidadeId: string,
  prioridade: 'normal' | 'prioritaria' | 'urgente'
) {
  return useQuery({
    queryKey: [FILA_QUERY_KEY, 'prioridade', unidadeId, prioridade],
    queryFn: () =>
      listQueueItems({
        unidade_id: unidadeId,
        prioridade: [prioridade],
        status: ['aguardando', 'chamado'],
        ordenacao: 'posicao_asc',
        page: 1,
        limit: 50,
      }),
    staleTime: 1000 * 25, // 25 segundos
    gcTime: 1000 * 60 * 4, // 4 minutos
    enabled: !!unidadeId && !!prioridade,
  })
}

/**
 * Hook para busca na fila
 */
export function useBuscaFila(unidadeId: string, termo: string) {
  return useQuery({
    queryKey: [FILA_QUERY_KEY, 'busca', unidadeId, termo],
    queryFn: () =>
      listQueueItems({
        unidade_id: unidadeId,
        busca: termo,
        ordenacao: 'posicao_asc',
        page: 1,
        limit: 20,
      }),
    staleTime: 1000 * 60, // 1 minuto
    gcTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!unidadeId && termo.length >= 2,
  })
}
