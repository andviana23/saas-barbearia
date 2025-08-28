/**
 * Padrões padronizados para React Query Keys
 *
 * CONVENÇÃO:
 * - Usar arrays para consistência
 * - Primeiro elemento sempre o escopo (entidade)
 * - Segundo elemento a operação
 * - Parâmetros subsequentes para identificação específica
 *
 * Exemplos:
 * - ['clientes'] - Lista todos os clientes
 * - ['clientes', 'list', filters] - Lista filtrada
 * - ['clientes', 'detail', id] - Cliente específico
 * - ['clientes', 'stats'] - Estatísticas de clientes
 */

// Tipos para filtros
export type FilterParams = Record<string, string | number | boolean | undefined>;

// Tipo para QueryClient
export type QueryClientType = {
  invalidateQueries: (options: { queryKey: readonly unknown[] }) => Promise<void>;
};

export const queryKeys = {
  // Clientes
  clientes: {
    all: ['clientes'] as const,
    lists: () => ['clientes', 'list'] as const,
    list: (filters?: FilterParams) => ['clientes', 'list', filters] as const,
    details: () => ['clientes', 'detail'] as const,
    detail: (id: string) => ['clientes', 'detail', id] as const,
    stats: () => ['clientes', 'stats'] as const,
    historico: (id: string) => ['clientes', 'historico', id] as const,
    search: (query: string) => ['clientes', 'search', query] as const,
  },

  // Profissionais
  profissionais: {
    all: ['profissionais'] as const,
    lists: () => ['profissionais', 'list'] as const,
    list: (filters?: FilterParams) => ['profissionais', 'list', filters] as const,
    details: () => ['profissionais', 'detail'] as const,
    detail: (id: string) => ['profissionais', 'detail', id] as const,
    horarios: (id: string) => ['profissionais', 'horarios', id] as const,
    stats: () => ['profissionais', 'stats'] as const,
  },

  // Serviços
  servicos: {
    all: ['servicos'] as const,
    lists: () => ['servicos', 'list'] as const,
    list: (filters?: FilterParams) => ['servicos', 'list', filters] as const,
    details: () => ['servicos', 'detail'] as const,
    detail: (id: string) => ['servicos', 'detail', id] as const,
    categorias: () => ['servicos', 'categorias'] as const,
    popular: () => ['servicos', 'popular'] as const,
    precos: (profissionalId: string) => ['servicos', 'precos', profissionalId] as const,
  },

  // Agendamentos
  agendamentos: {
    all: ['agendamentos'] as const,
    lists: () => ['agendamentos', 'list'] as const,
    list: (filters?: FilterParams) => ['agendamentos', 'list', filters] as const,
    details: () => ['agendamentos', 'detail'] as const,
    detail: (id: string) => ['agendamentos', 'detail', id] as const,
    disponibilidade: (profissionalId: string, data: string) =>
      ['agendamentos', 'disponibilidade', profissionalId, data] as const,
    stats: () => ['agendamentos', 'stats'] as const,
  },

  // Fila
  fila: {
    all: ['fila'] as const,
    status: () => ['fila', 'status'] as const,
    list: (filters?: FilterParams) => ['fila', 'list', filters] as const,
    stats: () => ['fila', 'stats'] as const,
    estimativa: (posicao: number) => ['fila', 'estimativa', posicao] as const,
  },

  // Financeiro
  financeiro: {
    all: ['financeiro'] as const,
    movimentacoes: () => ['financeiro', 'movimentacoes'] as const,
    movimentacao: (filters?: FilterParams) => ['financeiro', 'movimentacoes', filters] as const,
    estatisticas: () => ['financeiro', 'estatisticas'] as const,
    relatorios: (tipo: string, periodo?: string) =>
      ['financeiro', 'relatorios', tipo, periodo] as const,
    comissoes: (profissionalId?: string) => ['financeiro', 'comissoes', profissionalId] as const,
  },

  // Produtos e Vendas
  produtos: {
    all: ['produtos'] as const,
    lists: () => ['produtos', 'list'] as const,
    list: (filters?: FilterParams) => ['produtos', 'list', filters] as const,
    detail: (id: string) => ['produtos', 'detail', id] as const,
    estoque: () => ['produtos', 'estoque'] as const,
    popular: () => ['produtos', 'popular'] as const,
  },

  vendas: {
    all: ['vendas'] as const,
    lists: () => ['vendas', 'list'] as const,
    list: (filters?: FilterParams) => ['vendas', 'list', filters] as const,
    detail: (id: string) => ['vendas', 'detail', id] as const,
    abertas: () => ['vendas', 'abertas'] as const,
    stats: () => ['vendas', 'stats'] as const,
  },

  // Auth e Unidades
  auth: {
    user: () => ['auth', 'user'] as const,
    profile: () => ['auth', 'profile'] as const,
  },

  unidades: {
    all: ['unidades'] as const,
    current: () => ['unidades', 'current'] as const,
    detail: (id: string) => ['unidades', 'detail', id] as const,
  },
} as const;

/**
 * Utilities para invalidação de cache
 */
export const invalidatePatterns = {
  // Invalida tudo de uma entidade
  entity: (queryClient: QueryClientType, entity: keyof typeof queryKeys) => {
    const entityKeys = queryKeys[entity] as any;
    if (entityKeys && entityKeys.all) {
      return queryClient.invalidateQueries({
        queryKey: entityKeys.all,
      });
    }
    return Promise.resolve();
  },

  // Invalida listas de uma entidade
  lists: (queryClient: QueryClientType, entity: keyof typeof queryKeys) => {
    const entityKeys = queryKeys[entity] as { lists: () => readonly unknown[] };
    return queryClient.invalidateQueries({
      queryKey: entityKeys.lists(),
    });
  },

  // Invalida detalhe específico
  detail: (queryClient: QueryClientType, entity: keyof typeof queryKeys, id: string) => {
    const entityKeys = queryKeys[entity] as {
      detail: (id: string) => readonly unknown[];
    };
    return queryClient.invalidateQueries({
      queryKey: entityKeys.detail(id),
    });
  },

  // Invalida múltiplas entidades (para relacionamentos)
  multiple: (queryClient: QueryClientType, entities: Array<keyof typeof queryKeys>) => {
    entities.forEach((entity) => {
      const entityKeys = queryKeys[entity] as any;
      if (entityKeys && entityKeys.all) {
        queryClient.invalidateQueries({
          queryKey: entityKeys.all,
        });
      }
    });
  },
};

/**
 * Tipos para TypeScript
 */
export type QueryKey = typeof queryKeys;
export type QueryKeyEntity = keyof typeof queryKeys;
