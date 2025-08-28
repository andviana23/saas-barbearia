import * as React from 'react';

// QueryClient mock com APIs utilizadas nos testes
export class QueryClient {
  invalidateQueries = jest.fn();
  getQueryData = jest.fn();
  setQueryData = jest.fn();
}

const QueryClientContext = React.createContext<QueryClient | null>(null);

export const QueryClientProvider = ({
  children,
  client,
}: {
  children: React.ReactNode;
  client: QueryClient;
}): JSX.Element => {
  return React.createElement(QueryClientContext.Provider, { value: client }, children as any);
};

export function useQueryClient(): QueryClient {
  const ctx = React.useContext(QueryClientContext);
  if (!ctx) throw new Error('QueryClient não encontrado no contexto');
  return ctx;
}

type UseQueryOptions<TData> = {
  queryKey: unknown[];
  queryFn: () => Promise<TData> | TData;
};

export function useQuery<TData = any>(options: UseQueryOptions<TData>) {
  const { queryFn, queryKey } = options;
  const [state, setState] = React.useState<{
    data: TData | undefined;
    isSuccess: boolean;
    isLoading: boolean;
    error: unknown;
  }>({ data: undefined, isSuccess: false, isLoading: true, error: undefined });

  React.useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => queryFn())
      .then((data) => {
        if (!cancelled) setState({ data, isSuccess: true, isLoading: false, error: undefined });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ data: undefined, isSuccess: false, isLoading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(queryKey)]); // suficiente para testes

  return state;
}

type UseMutationOptions<TVariables, TData> = {
  mutationFn: (variables: TVariables) => Promise<TData> | TData;
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
};

export function useMutation<TVariables = any, TData = any>(
  options: UseMutationOptions<TVariables, TData>,
) {
  const { mutationFn, onSuccess, onError } = options;
  const [state, setState] = React.useState({ isSuccess: false, isError: false });

  function mutate(variables: TVariables) {
    Promise.resolve()
      .then(() => mutationFn(variables))
      .then((data) => {
        setState({ isSuccess: true, isError: false });
        onSuccess?.(data as TData);
      })
      .catch((err) => {
        setState({ isSuccess: false, isError: true });
        onError?.(err);
      });
  }

  return { mutate, ...state };
}
