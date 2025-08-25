import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ActionResult } from '@/types'
import { createProfile, updateProfile, deleteProfile } from '@/actions/profiles'
import { ProfileFilterData } from '@/schemas'

export const PROFILES_QUERY_KEY = 'profiles'

export function useProfiles(filters?: ProfileFilterData) {
  return useQuery({
    queryKey: [PROFILES_QUERY_KEY, filters],
    queryFn: async () => {
      // Simulação de busca no banco de dados
      // TODO: Implementar integração com Neon/Supabase

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Dados mockados para desenvolvimento
      return {
        data: [
          {
            id: '1',
            user_id: 'user-1',
            nome: 'João Silva',
            email: 'joao@barbearia.com',
            telefone: '11987654321',
            unidade_default_id: '1',
            papel: 'admin' as const,
            ativo: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            user_id: 'user-2',
            nome: 'Maria Santos',
            email: 'maria@barbearia.com',
            telefone: '11123456789',
            unidade_default_id: '1',
            papel: 'profissional' as const,
            ativo: true,
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
        page: filters?.page || 0,
        limit: filters?.limit || 10,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: [PROFILES_QUERY_KEY, id],
    queryFn: async () => {
      // Simulação de busca por ID no banco de dados
      // TODO: Implementar integração com Neon/Supabase

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Dados mockados para desenvolvimento
      return {
        id,
        user_id: 'user-1',
        nome: 'João Silva',
        email: 'joao@barbearia.com',
        telefone: '11987654321',
        unidade_default_id: '1',
        papel: 'admin' as const,
        ativo: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createProfile(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [PROFILES_QUERY_KEY] })
      }
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string
      formData: FormData
    }): Promise<ActionResult> => {
      return await updateProfile(id, formData)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [PROFILES_QUERY_KEY] })
        queryClient.invalidateQueries({
          queryKey: [PROFILES_QUERY_KEY, variables.id],
        })
      }
    },
  })
}

export function useDeleteProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<ActionResult> => {
      return await deleteProfile(id)
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [PROFILES_QUERY_KEY] })
      }
    },
  })
}
