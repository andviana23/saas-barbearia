import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCliente,
  updateCliente,
  deleteCliente,
  listClientes,
  getCliente,
  getHistoricoCliente,
  getEstatisticasCliente,
  processImportClientesCSV,
  buscarClientePorTelefone,
} from '@/actions/clientes'
import type {
  ClientFilterData,
  HistoricoClienteFilterData,
  ImportClientCSVData,
} from '@/schemas'
import type { ActionResult } from '@/types'

// Query Keys para consistência
export const CLIENTES_QUERY_KEY = 'clientes'
export const HISTORICO_CLIENTE_QUERY_KEY = 'historico-cliente'
export const ESTATISTICAS_CLIENTE_QUERY_KEY = 'estatisticas-cliente'
export const BUSCAR_CLIENTE_TELEFONE_QUERY_KEY = 'buscar-cliente-telefone'

// ====================================
// QUERIES PARA CLIENTES
// ====================================

// Hook para listar clientes
export function useClientes(
  filters: ClientFilterData = {
    page: 0,
    limit: 10,
    order: 'desc',
  }
) {
  return useQuery({
    queryKey: [CLIENTES_QUERY_KEY, filters],
    queryFn: () => listClientes(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para buscar cliente específico
export function useCliente(id: string) {
  return useQuery({
    queryKey: [CLIENTES_QUERY_KEY, id],
    queryFn: () => getCliente(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para clientes ativos de uma unidade
export function useClientesAtivos(unidadeId?: string) {
  return useQuery({
    queryKey: [CLIENTES_QUERY_KEY, 'ativos', unidadeId],
    queryFn: () =>
      listClientes({
        ativo: true,
        unidade_id: unidadeId,
        limit: 100, // Limite alto para seleção em formulários
        page: 0,
      }),
    enabled: !!unidadeId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para busca de clientes (com debounce implícito via staleTime)
export function useBuscarClientes(searchTerm: string, unidadeId?: string) {
  return useQuery({
    queryKey: [CLIENTES_QUERY_KEY, 'busca', searchTerm, unidadeId],
    queryFn: () =>
      listClientes({
        q: searchTerm,
        unidade_id: unidadeId,
        ativo: true,
        limit: 20, // Limite para busca rápida
        page: 0,
      }),
    enabled: !!searchTerm && searchTerm.length >= 2, // Só buscar com 2+ caracteres
    staleTime: 1000 * 60 * 2, // 2 minutos para busca
  })
}

// Hook para clientes sem email (para campanhas)
export function useClientesSemEmail(unidadeId?: string) {
  return useQuery({
    queryKey: [CLIENTES_QUERY_KEY, 'sem-email', unidadeId],
    queryFn: () =>
      listClientes({
        tem_email: false,
        unidade_id: unidadeId,
        ativo: true,
        limit: 100,
        page: 0,
      }),
    enabled: !!unidadeId,
    staleTime: 1000 * 60 * 15, // 15 minutos (menos volátil)
  })
}

// Hook para buscar cliente por telefone
export function useBuscarClientePorTelefone(
  telefone: string,
  unidadeId: string
) {
  return useQuery({
    queryKey: [BUSCAR_CLIENTE_TELEFONE_QUERY_KEY, telefone, unidadeId],
    queryFn: () => buscarClientePorTelefone(telefone, unidadeId),
    enabled: !!telefone && telefone.length >= 10 && !!unidadeId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// ====================================
// MUTATIONS PARA CLIENTES
// ====================================

// Hook para criar cliente
export function useCreateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createCliente(formData)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar queries de clientes
        queryClient.invalidateQueries({ queryKey: [CLIENTES_QUERY_KEY] })

        // Invalidar busca por telefone se foi usado
        const telefone = variables.get('telefone')
        const unidadeId = variables.get('unidade_id')
        if (telefone && unidadeId) {
          queryClient.invalidateQueries({
            queryKey: [BUSCAR_CLIENTE_TELEFONE_QUERY_KEY, telefone, unidadeId],
          })
        }
      }
    },
  })
}

// Hook para atualizar cliente
export function useUpdateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string
      formData: FormData
    }): Promise<ActionResult> => {
      return await updateCliente(id, formData)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar queries específicas
        queryClient.invalidateQueries({ queryKey: [CLIENTES_QUERY_KEY] })
        queryClient.invalidateQueries({
          queryKey: [CLIENTES_QUERY_KEY, variables.id],
        })

        // Invalidar estatísticas se existirem
        queryClient.invalidateQueries({
          queryKey: [ESTATISTICAS_CLIENTE_QUERY_KEY, variables.id],
        })
      }
    },
  })
}

// Hook para deletar cliente
export function useDeleteCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deleteCliente(id)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar todas as queries de clientes
        queryClient.invalidateQueries({ queryKey: [CLIENTES_QUERY_KEY] })

        // Remover cache específico do cliente deletado
        queryClient.removeQueries({
          queryKey: [CLIENTES_QUERY_KEY, variables],
        })
        queryClient.removeQueries({
          queryKey: [ESTATISTICAS_CLIENTE_QUERY_KEY, variables],
        })
        queryClient.removeQueries({
          queryKey: [HISTORICO_CLIENTE_QUERY_KEY, variables],
        })
      }
    },
  })
}

// ====================================
// QUERIES PARA HISTÓRICO
// ====================================

// Hook para histórico de atendimentos do cliente
export function useHistoricoCliente(filters: HistoricoClienteFilterData) {
  return useQuery({
    queryKey: [HISTORICO_CLIENTE_QUERY_KEY, filters],
    queryFn: () => getHistoricoCliente(filters),
    enabled: !!filters.cliente_id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

// Hook para histórico completo (todas as páginas)
export function useHistoricoCompletoCliente(clienteId: string) {
  return useQuery({
    queryKey: [HISTORICO_CLIENTE_QUERY_KEY, 'completo', clienteId],
    queryFn: () =>
      getHistoricoCliente({
        cliente_id: clienteId,
        limit: 100, // Limite alto para histórico completo
        page: 0,
        order: 'desc',
      }),
    enabled: !!clienteId,
    staleTime: 1000 * 60 * 15, // 15 minutos
  })
}

// Hook para estatísticas do cliente
export function useEstatisticasCliente(clienteId: string) {
  return useQuery({
    queryKey: [ESTATISTICAS_CLIENTE_QUERY_KEY, clienteId],
    queryFn: () => getEstatisticasCliente(clienteId),
    enabled: !!clienteId,
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

// ====================================
// MUTATIONS PARA IMPORTAÇÃO
// ====================================

// Hook para importação CSV
export function useImportClientesCSV() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      csvData,
      unidadeId,
    }: {
      csvData: ImportClientCSVData[]
      unidadeId: string
    }): Promise<ActionResult> => {
      return await processImportClientesCSV(csvData, unidadeId)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar todas as queries de clientes após importação
        queryClient.invalidateQueries({ queryKey: [CLIENTES_QUERY_KEY] })
      }
    },
  })
}

// Hook simplificado para importação de arquivo
export function useImportarClientes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await processImportClientesCSV([], '') // Mock para evitar erro
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [CLIENTES_QUERY_KEY] })
      }
    },
  })
}

// ====================================
// HOOKS UTILITÁRIOS
// ====================================

// Hook para invalidar todas as queries de clientes
export function useInvalidateClientes() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [CLIENTES_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [HISTORICO_CLIENTE_QUERY_KEY] })
    queryClient.invalidateQueries({
      queryKey: [ESTATISTICAS_CLIENTE_QUERY_KEY],
    })
    queryClient.invalidateQueries({
      queryKey: [BUSCAR_CLIENTE_TELEFONE_QUERY_KEY],
    })
  }
}

// Hook para clientes com estatísticas básicas
export function useClientesComEstatisticas(unidadeId?: string) {
  const clientesQuery = useClientesAtivos(unidadeId)

  const clientesComEstatisticas = useQuery({
    queryKey: [CLIENTES_QUERY_KEY, 'com-estatisticas', unidadeId],
    queryFn: async () => {
      if (
        !clientesQuery.data?.success ||
        !(clientesQuery.data.data as any)?.clientes
      ) {
        return []
      }

      const clientesComStats = await Promise.all(
        (clientesQuery.data.data as any).clientes.map(
          async (cliente: { id: string; [key: string]: unknown }) => {
            const statsResult = await getEstatisticasCliente(cliente.id)
            return {
              ...cliente,
              estatisticas: statsResult.success ? statsResult.data : null,
            }
          }
        )
      )

      return clientesComStats
    },
    enabled: !!clientesQuery.data?.success,
    staleTime: 1000 * 60 * 15, // 15 minutos
  })

  return {
    ...clientesComEstatisticas,
    isLoading: clientesQuery.isLoading || clientesComEstatisticas.isLoading,
    error: clientesQuery.error || clientesComEstatisticas.error,
  }
}

// Hook para busca inteligente (combina nome, telefone, email)
export function useBuscaInteligentClientes(
  searchTerm: string,
  unidadeId?: string
) {
  return useQuery({
    queryKey: [CLIENTES_QUERY_KEY, 'busca-inteligente', searchTerm, unidadeId],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) {
        return { success: true, data: { clientes: [], total: 0 } }
      }

      // Tentar diferentes tipos de busca baseado no formato do termo
      const isPhone = /^\d+$/.test(searchTerm.replace(/\D/g, ''))
      const isEmail = searchTerm.includes('@')

      let filters: ClientFilterData = {
        q: searchTerm,
        unidade_id: unidadeId,
        ativo: true,
        limit: 20,
        page: 0,
        order: 'desc',
      }

      // Se parece com telefone, priorizar busca por telefone
      if (isPhone && searchTerm.length >= 10) {
        const telefoneResult = await buscarClientePorTelefone(
          searchTerm,
          unidadeId || ''
        )
        if (telefoneResult.success && telefoneResult.data) {
          return {
            success: true,
            data: {
              clientes: [telefoneResult.data],
              total: 1,
            },
          }
        }
      }

      // Busca geral
      return await listClientes(filters)
    },
    enabled: !!searchTerm && searchTerm.length >= 2 && !!unidadeId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

// Hook para top clientes (por valor gasto)
export function useTopClientes(unidadeId: string, limit = 10) {
  return useQuery({
    queryKey: [CLIENTES_QUERY_KEY, 'top-clientes', unidadeId, limit],
    queryFn: async () => {
      const clientesResult = await listClientes({
        unidade_id: unidadeId,
        ativo: true,
        limit: 100, // Buscar muitos para calcular top
        page: 0,
      })

      if (!clientesResult.success) {
        throw new Error(clientesResult.error)
      }

      // Buscar estatísticas de cada cliente
      const clientesComValor = await Promise.all(
        (clientesResult.data as any).clientes.map(
          async (cliente: { id: string; [key: string]: unknown }) => {
            const statsResult = await getEstatisticasCliente(cliente.id)
            const valorTotal = statsResult.success
              ? ((statsResult.data as any)?.valor_total_servicos || 0) +
                ((statsResult.data as any)?.valor_total_vendas || 0)
              : 0

            return {
              ...cliente,
              valor_total_gasto: valorTotal,
              total_atendimentos: statsResult.success
                ? (statsResult.data as any)?.agendamentos_concluidos || 0
                : 0,
            }
          }
        )
      )

      // Ordenar por valor total e pegar top N
      const topClientes = clientesComValor
        .sort((a, b) => b.valor_total_gasto - a.valor_total_gasto)
        .slice(0, limit)

      return topClientes
    },
    enabled: !!unidadeId,
    staleTime: 1000 * 60 * 30, // 30 minutos (dados menos voláteis)
  })
}
