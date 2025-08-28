import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { ActionResult } from '@/types';
import { invalidatePatterns, QueryKeyEntity } from './keys';

/**
 * Configurações padrão para mutations
 */
export const mutationDefaults = {
  retry: 1,
  networkMode: 'online' as const,
};

// Tipos para dados genéricos
export type MutationData = unknown;
export type MutationVariables = Record<string, unknown>;

// Tipo para QueryClient
export type QueryClientType = {
  invalidateQueries: (options: { queryKey: readonly unknown[] }) => Promise<void>;
  removeQueries: (options: { queryKey: readonly unknown[] }) => void;
  setQueryData: <T>(queryKey: readonly unknown[], updater: (oldData: T | undefined) => T) => void;
};

// Tipo para dados de lista paginada
export type ListData<T> = {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
};

/**
 * Hook personalizado para mutations com invalidação automática
 */
export function useStandardMutation<TData = MutationData, TVariables = MutationVariables>(
  mutationFn: (variables: TVariables) => Promise<ActionResult<TData>>,
  options: {
    // Entidades para invalidar após sucesso
    invalidateEntities?: QueryKeyEntity[];
    // Keys específicas para invalidar
    invalidateKeys?: readonly unknown[][];
    // Callback personalizado de sucesso
    onSuccess?: (result: ActionResult<TData>, variables: TVariables) => void;
    // Callback de erro
    onError?: (error: Error, variables: TVariables) => void;
    // Outras opções do React Query
    mutationOptions?: Partial<UseMutationOptions<ActionResult<TData>, Error, TVariables>>;
  } = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...mutationDefaults,

    onSuccess: (result, variables) => {
      // Só invalida se a mutation foi bem-sucedida
      if (result.success) {
        // Invalida entidades especificadas
        if (options.invalidateEntities) {
          invalidatePatterns.multiple(queryClient, options.invalidateEntities);
        }

        // Invalida keys específicas
        if (options.invalidateKeys) {
          options.invalidateKeys.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      }

      // Chama callback personalizado
      options.onSuccess?.(result, variables);
    },

    onError: (error, variables) => {
      console.error('Mutation error:', error);
      options.onError?.(error, variables);
    },

    ...options.mutationOptions,
  });
}

/**
 * Hook para mutations que criam recursos
 */
export function useCreateMutation<TData = MutationData, TVariables = MutationVariables>(
  mutationFn: (variables: TVariables) => Promise<ActionResult<TData>>,
  entity: QueryKeyEntity,
  options?: {
    onSuccess?: (result: ActionResult<TData>, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  },
) {
  return useStandardMutation(mutationFn, {
    invalidateEntities: [entity],
    ...options,
  });
}

/**
 * Hook para mutations que atualizam recursos
 */
export function useUpdateMutation<TData = MutationData, TVariables = MutationVariables>(
  mutationFn: (variables: TVariables) => Promise<ActionResult<TData>>,
  entity: QueryKeyEntity,
  getId?: (variables: TVariables) => string,
  options?: {
    onSuccess?: (result: ActionResult<TData>, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  },
) {
  const queryClient = useQueryClient();

  return useStandardMutation(mutationFn, {
    invalidateEntities: [entity],
    onSuccess: (result, variables) => {
      // Invalida o item específico se ID for fornecido
      if (result.success && getId) {
        const id = getId(variables);
        invalidatePatterns.detail(queryClient, entity, id);
      }

      options?.onSuccess?.(result, variables);
    },
    onError: options?.onError,
  });
}

/**
 * Hook para mutations que deletam recursos
 */
export function useDeleteMutation<TVariables = MutationVariables>(
  mutationFn: (variables: TVariables) => Promise<ActionResult>,
  entity: QueryKeyEntity,
  getId?: (variables: TVariables) => string,
  options?: {
    onSuccess?: (result: ActionResult, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  },
) {
  const queryClient = useQueryClient();

  return useStandardMutation(mutationFn, {
    invalidateEntities: [entity],
    onSuccess: (result, variables) => {
      // Remove o item específico do cache se ID for fornecido
      if (result.success && getId) {
        const id = getId(variables);
        try {
          invalidatePatterns.detail(queryClient, entity, id);
        } catch (error) {
          // Falhar silenciosamente se a entidade não suportar detail
          console.warn(`Não foi possível invalidar detail para ${entity}`);
        }
      }

      options?.onSuccess?.(result, variables);
    },
    onError: options?.onError,
  });
}

/**
 * Utilitários para otimistic updates
 */
export const optimisticUpdates = {
  /**
   * Atualizar item em lista
   */
  updateInList<T>(
    queryClient: QueryClientType,
    queryKey: readonly unknown[],
    itemId: string,
    updateFn: (item: T) => T,
    getItemId: (item: T) => string = (item: T) => (item as { id: string }).id,
  ) {
    queryClient.setQueryData(queryKey, (oldData: ListData<T> | undefined): ListData<T> => {
      if (!oldData?.data) return { data: [] } as ListData<T>;

      return {
        ...oldData,
        data: oldData.data.map((item: T) => (getItemId(item) === itemId ? updateFn(item) : item)),
      };
    });
  },

  /**
   * Adicionar item em lista
   */
  addToList<T>(
    queryClient: QueryClientType,
    queryKey: readonly unknown[],
    newItem: T,
    prepend = false,
  ) {
    queryClient.setQueryData(queryKey, (oldData: ListData<T> | undefined): ListData<T> => {
      if (!oldData?.data) return { data: [newItem] } as ListData<T>;

      return {
        ...oldData,
        data: prepend ? [newItem, ...oldData.data] : [...oldData.data, newItem],
      };
    });
  },

  /**
   * Remover item da lista
   */
  removeFromList<T>(
    queryClient: QueryClientType,
    queryKey: readonly unknown[],
    itemId: string,
    getItemId: (item: T) => string = (item: T) => (item as { id: string }).id,
  ) {
    queryClient.setQueryData(queryKey, (oldData: ListData<T> | undefined): ListData<T> => {
      if (!oldData?.data) return { data: [] } as ListData<T>;

      return {
        ...oldData,
        data: oldData.data.filter((item: T) => getItemId(item) !== itemId),
      };
    });
  },
};

/**
 * Estados padrão para loading/error
 */
export const mutationStates = {
  isLoading: (mutation: UseMutationResult<ActionResult, Error, unknown>) => mutation.isPending,
  isError: (mutation: UseMutationResult<ActionResult, Error, unknown>) => mutation.isError,
  isSuccess: (mutation: UseMutationResult<ActionResult, Error, unknown>) =>
    mutation.isSuccess && mutation.data?.success,
  hasValidationErrors: (mutation: UseMutationResult<ActionResult, Error, unknown>) =>
    mutation.data && !mutation.data.success && (mutation.data.errors?.length ?? 0) > 0,

  getErrorMessage: (mutation: UseMutationResult<ActionResult, Error, unknown>): string => {
    if (mutation.isError) {
      return mutation.error?.message || 'Erro desconhecido';
    }

    if (mutation.data && !mutation.data.success) {
      return mutation.data.message || 'Operação falhou';
    }

    return '';
  },

  getValidationErrors: (mutation: UseMutationResult<ActionResult, Error, unknown>) => {
    return mutation.data?.errors || [];
  },
};
