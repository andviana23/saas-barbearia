import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVenda,
  updateVenda,
  addItemVenda,
  removeItemVenda,
  finalizarVenda,
  cancelarVenda,
  listVendas,
  getVenda,
} from '@/actions/vendas'
import type { ActionResult } from '@/types'
import type { VendaFilterData } from '@/schemas'
import { PRODUTOS_QUERY_KEY } from './use-produtos'

// Query Keys
export const VENDAS_QUERY_KEY = ['vendas'] as const

// Hook para listar vendas
export function useVendas(
  filters: VendaFilterData = {
    page: 0,
    limit: 10,
    order: 'desc',
  }
) {
  return useQuery({
    queryKey: [...VENDAS_QUERY_KEY, 'list', filters],
    queryFn: () => listVendas(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// Hook para buscar venda específica
export function useVenda(id: string) {
  return useQuery({
    queryKey: [...VENDAS_QUERY_KEY, 'detail', id],
    queryFn: () => getVenda(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados mais voláteis
  })
}

// Hook para criar venda
export function useCreateVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createVenda(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar lista de vendas
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'list'],
        })
      }
    },
  })
}

// Hook para atualizar venda
export function useUpdateVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string
      formData: FormData
    }): Promise<ActionResult> => {
      return await updateVenda(id, formData)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar lista de vendas
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'list'],
        })
        // Invalidar venda específica
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'detail', variables.id],
        })
      }
    },
  })
}

// Hook para adicionar item à venda
export function useAddItemVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await addItemVenda(formData)
    },
    onSuccess: (result, formData) => {
      if (result.success) {
        const vendaId = formData.get('venda_id') as string

        // Invalidar venda específica
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'detail', vendaId],
        })
        // Invalidar lista de vendas
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'list'],
        })
        // Invalidar produtos (por causa do estoque)
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'list'],
        })
      }
    },
  })
}

// Hook para remover item da venda
export function useRemoveItemVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string): Promise<ActionResult> => {
      return await removeItemVenda(itemId)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar todas as vendas e produtos
        queryClient.invalidateQueries({ queryKey: [...VENDAS_QUERY_KEY] })
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'list'],
        })
      }
    },
  })
}

// Hook para finalizar venda
export function useFinalizarVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vendaId: string): Promise<ActionResult> => {
      return await finalizarVenda(vendaId)
    },
    onSuccess: (result, vendaId) => {
      if (result.success) {
        // Invalidar lista de vendas
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'list'],
        })
        // Invalidar venda específica
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'detail', vendaId],
        })
      }
    },
  })
}

// Hook para cancelar venda
export function useCancelarVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vendaId: string): Promise<ActionResult> => {
      return await cancelarVenda(vendaId)
    },
    onSuccess: (result, vendaId) => {
      if (result.success) {
        // Invalidar lista de vendas
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'list'],
        })
        // Invalidar venda específica
        queryClient.invalidateQueries({
          queryKey: [...VENDAS_QUERY_KEY, 'detail', vendaId],
        })
        // Invalidar produtos (estoque foi devolvido)
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'list'],
        })
      }
    },
  })
}

// Hook para vendas em aberto
export function useVendasAbertas(unidade_id?: string) {
  return useQuery({
    queryKey: [...VENDAS_QUERY_KEY, 'abertas', unidade_id],
    queryFn: () =>
      listVendas({
        status: 'aberta',
        unidade_id,
        limit: 50,
        sort: 'created_at',
        order: 'desc',
        page: 0,
      }),
    staleTime: 30 * 1000, // 30 segundos - dados bem voláteis
    enabled: !!unidade_id,
  })
}

// Hook para relatório de vendas do dia
export function useVendasDia(unidade_id?: string, data?: string) {
  const dataInicio = data
    ? `${data}T00:00:00.000Z`
    : new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'
  const dataFim = data
    ? `${data}T23:59:59.999Z`
    : new Date().toISOString().split('T')[0] + 'T23:59:59.999Z'

  return useQuery({
    queryKey: [...VENDAS_QUERY_KEY, 'dia', unidade_id, data],
    queryFn: () =>
      listVendas({
        unidade_id,
        data_inicio: dataInicio,
        data_fim: dataFim,
        limit: 100,
        page: 0,
        order: 'desc',
      }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!unidade_id,
  })
}

// Hook para vendas por profissional
export function useVendasPorProfissional(profissional_id?: string) {
  return useQuery({
    queryKey: [...VENDAS_QUERY_KEY, 'profissional', profissional_id],
    queryFn: () =>
      listVendas({
        profissional_id,
        limit: 50,
        sort: 'created_at',
        order: 'desc',
        page: 0,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!profissional_id,
  })
}

// Utilidades de formatação e validação
export const vendaUtils = {
  formatStatus: (status: string) => {
    const statusMap = {
      aberta: 'Em Aberto',
      paga: 'Paga',
      cancelada: 'Cancelada',
    }
    return statusMap[status as keyof typeof statusMap] || status
  },

  getStatusColor: (status: string) => {
    const colorMap = {
      aberta: 'warning',
      paga: 'success',
      cancelada: 'error',
    }
    return colorMap[status as keyof typeof colorMap] || 'default'
  },

  formatValor: (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  },

  formatData: (data: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(data))
  },

  calcularTotalItens: (
    itens: Array<{ subtotal?: number; [key: string]: unknown }>
  ) => {
    return itens.reduce((total, item) => total + (item.subtotal || 0), 0)
  },

  validarItemVenda: (
    produto_id: string,
    quantidade: number,
    preco_unitario: number
  ) => {
    const errors = []

    if (!produto_id) errors.push('Produto é obrigatório')
    if (quantidade <= 0) errors.push('Quantidade deve ser maior que zero')
    if (preco_unitario < 0) errors.push('Preço unitário não pode ser negativo')

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
}
