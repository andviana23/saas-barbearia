import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduto,
  updateProduto,
  deleteProduto,
  listProdutos,
  getProduto,
  updateEstoqueProduto,
  baixarEstoqueProduto,
} from '@/actions/produtos';
import type { ActionResult } from '@/types';
import type { ProdutoFilterData } from '@/schemas';

// Interfaces para tipagem dos dados de produtos
interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  estoque: number;
  estoque_minimo: number;
  codigo_barras?: string;
  ativo: boolean;
  unidade_id: string;
  created_at: string;
  updated_at: string;
}

interface ListProdutosResponse {
  produtos: Produto[];
  total: number;
  page: number;
  limit: number;
}

// Query Keys
export const PRODUTOS_QUERY_KEY = ['produtos'] as const;

// Hook para listar produtos
export function useProdutos(filters: ProdutoFilterData = { page: 1, limit: 20, order: 'desc' }) {
  return useQuery({
    queryKey: [...PRODUTOS_QUERY_KEY, 'list', filters],
    queryFn: () => listProdutos(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar produto específico
export function useProduto(id: string) {
  return useQuery({
    queryKey: [...PRODUTOS_QUERY_KEY, 'detail', id],
    queryFn: () => getProduto(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para criar produto
export function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createProduto(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar lista de produtos
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'list'],
        });
      }
    },
  });
}

// Hook para atualizar produto
export function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }): Promise<ActionResult> => {
      return await updateProduto(id, formData);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar lista de produtos
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'list'],
        });
        // Invalidar produto específico
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'detail', variables.id],
        });
      }
    },
  });
}

// Hook para deletar produto
export function useDeleteProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deleteProduto(id);
    },
    onSuccess: (result, id) => {
      if (result.success) {
        // Invalidar lista de produtos
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'list'],
        });
        // Remover produto específico do cache
        queryClient.removeQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'detail', id],
        });
      }
    },
  });
}

// Hook para atualizar estoque
export function useUpdateEstoqueProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      novoEstoque,
    }: {
      id: string;
      novoEstoque: number;
    }): Promise<ActionResult> => {
      return await updateEstoqueProduto(id, novoEstoque);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar lista de produtos
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'list'],
        });
        // Invalidar produto específico
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'detail', variables.id],
        });
      }
    },
  });
}

// Hook para baixar estoque (usado internamente em vendas)
export function useBaixarEstoqueProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      quantidade,
    }: {
      id: string;
      quantidade: number;
    }): Promise<ActionResult> => {
      return await baixarEstoqueProduto(id, quantidade);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar lista de produtos
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'list'],
        });
        // Invalidar produto específico
        queryClient.invalidateQueries({
          queryKey: [...PRODUTOS_QUERY_KEY, 'detail', variables.id],
        });
      }
    },
  });
}

// Hook otimista para produtos mais consultados
export function useProdutosPopulares(unidade_id?: string) {
  return useQuery({
    queryKey: [...PRODUTOS_QUERY_KEY, 'populares', unidade_id],
    queryFn: () =>
      listProdutos({
        page: 1,
        unidade_id,
        ativo: true,
        limit: 10,
        sort: 'nome',
        order: 'asc',
      }),
    staleTime: 10 * 60 * 1000, // 10 minutos - dados menos voláteis
    enabled: !!unidade_id,
  });
}

// Hook para produtos com estoque baixo
export function useProdutosEstoqueBaixo(unidade_id?: string, limite = 10) {
  return useQuery({
    queryKey: [...PRODUTOS_QUERY_KEY, 'estoque-baixo', unidade_id, limite],
    queryFn: async (): Promise<ActionResult> => {
      const result = await listProdutos({
        page: 1,
        unidade_id,
        ativo: true,
        limit: 100, // Buscar mais para filtrar localmente
        order: 'desc',
      });

      if (result.success && result.data) {
        const produtosData = result.data as ListProdutosResponse;

        if (produtosData.produtos) {
          // Filtrar produtos com estoque <= limite
          const produtosBaixoEstoque = produtosData.produtos.filter(
            (produto: Produto) => produto.estoque <= limite,
          );

          return {
            ...result,
            data: {
              ...produtosData,
              produtos: produtosBaixoEstoque,
            },
          };
        }
      }

      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos - dados mais críticos
    enabled: !!unidade_id,
  });
}

// Utilidades de validação para forms
export const produtoValidation = {
  isValidPreco: (preco: string) => {
    const num = parseFloat(preco);
    return !isNaN(num) && num >= 0 && num <= 99999.99;
  },

  isValidEstoque: (estoque: string) => {
    const num = parseInt(estoque);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
  },

  formatPreco: (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  },

  formatEstoque: (estoque: number) => {
    return `${estoque} ${estoque === 1 ? 'unidade' : 'unidades'}`;
  },
};
