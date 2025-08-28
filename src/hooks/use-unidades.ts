import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActionResult } from '@/types';
import { createUnidade, updateUnidade, deleteUnidade } from '@/actions/unidades';
import { UnidadeFilterData } from '@/schemas';

export const UNIDADES_QUERY_KEY = 'unidades';

export function useUnidades(filters?: UnidadeFilterData) {
  return useQuery({
    queryKey: [UNIDADES_QUERY_KEY, filters],
    queryFn: async () => {
      // Simulação de busca no banco de dados
      // TODO: Implementar integração com Neon/Supabase

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Dados mockados para desenvolvimento
      return {
        data: [
          {
            id: '1',
            nome: 'Barbearia Central',
            cnpj: '12.345.678/0001-90',
            endereco: 'Rua das Flores, 123',
            telefone: '11987654321',
            email: 'central@barbearia.com',
            ativo: true,
            config: {},
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            nome: 'Barbearia Norte',
            cnpj: '98.765.432/0001-10',
            endereco: 'Av. Principal, 456',
            telefone: '11123456789',
            email: 'norte@barbearia.com',
            ativo: true,
            config: {},
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
        page: filters?.page || 0,
        limit: filters?.limit || 10,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useUnidade(id: string) {
  return useQuery({
    queryKey: [UNIDADES_QUERY_KEY, id],
    queryFn: async () => {
      // Simulação de busca por ID no banco de dados
      // TODO: Implementar integração com Neon/Supabase

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Dados mockados para desenvolvimento
      return {
        id,
        nome: 'Barbearia Central',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua das Flores, 123',
        telefone: '11987654321',
        email: 'central@barbearia.com',
        ativo: true,
        config: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCreateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createUnidade(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [UNIDADES_QUERY_KEY] });
      }
    },
  });
}

export function useUpdateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }): Promise<ActionResult> => {
      return await updateUnidade(id, formData);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [UNIDADES_QUERY_KEY] });
        queryClient.invalidateQueries({
          queryKey: [UNIDADES_QUERY_KEY, variables.id],
        });
      }
    },
  });
}

export function useDeleteUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deleteUnidade(id);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [UNIDADES_QUERY_KEY] });
      }
    },
  });
}

export function useActiveUnidades() {
  return useQuery({
    queryKey: [UNIDADES_QUERY_KEY, 'active'],
    queryFn: async () => {
      // TODO: Implementar integração real com Supabase
      // Por enquanto, usar dados mockados para desenvolvimento

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Dados mockados para desenvolvimento
      return [
        {
          id: '8e3a67cb-de45-47aa-bb29-867412947aa1',
          nome: 'Trato de Barbados',
          cnpj: '12345678000190',
          endereco: 'Rua das Flores, 123',
          telefone: '11987654321',
          email: 'contato@tratodebarbados.com',
          ativo: true,
          config: {},
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: '1',
          nome: 'Barbearia Central',
          cnpj: '12.345.678/0001-90',
          endereco: 'Rua das Flores, 123',
          telefone: '11987654321',
          email: 'central@barbearia.com',
          ativo: true,
          config: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          nome: 'Barbearia Norte',
          cnpj: '98.765.432/0001-10',
          endereco: 'Av. Principal, 456',
          telefone: '11123456789',
          email: 'norte@barbearia.com',
          ativo: true,
          config: {},
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
