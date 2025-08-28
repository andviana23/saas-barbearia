// =====================================================
// TIPOS PARA GESTÃO MULTI-UNIDADES
// =====================================================

// =====================================================
// 1. PERMISSÕES HIERÁRQUICAS
// =====================================================

export interface PermissaoHierarquica {
  id: string;
  papel: UserRole;
  nivel_hierarquico: number;
  permissoes: Record<string, any>;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'owner' | 'admin' | 'gerente' | 'profissional' | 'operador' | 'recepcao';

export interface PermissaoDetalhada {
  papel: UserRole;
  nivel: number;
  descricao: string;
  permissoes: {
    sistema: string[];
    unidade: string[];
    relatorios: string[];
    usuarios: string[];
    configuracoes: string[];
  };
}

// =====================================================
// 2. ACESSOS MULTI-UNIDADE
// =====================================================

export interface AcessoMultiUnidade {
  id: string;
  profile_id: string;
  unidade_id: string;
  papel_unidade: UserRole;
  permissoes_especificas: Record<string, any> | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcessoMultiUnidadeDetalhado extends AcessoMultiUnidade {
  profile: {
    nome: string;
    email: string;
    papel_principal: UserRole;
  };
  unidade: {
    nome: string;
    cnpj: string | null;
    endereco: string | null;
  };
}

// =====================================================
// 3. AUDITORIA DE ACESSOS
// =====================================================

export interface AuditoriaAcesso {
  id: string;
  profile_id: string | null;
  unidade_id: string | null;
  acao: string;
  recurso: string;
  dados_consultados: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditoriaAcessoDetalhado extends AuditoriaAcesso {
  profile?: {
    nome: string;
    email: string;
  };
  unidade?: {
    nome: string;
  };
}

// =====================================================
// 4. RELATÓRIOS CONSOLIDADOS
// =====================================================

export interface FaturamentoConsolidado {
  unidade_id: string;
  unidade_nome: string;
  total_agendamentos: number;
  agendamentos_concluidos: number;
  faturamento_total: number;
  ticket_medio: number;
  total_clientes: number;
  total_profissionais: number;
  mes_ano: string;
}

export interface ServicosConsolidado {
  unidade_id: string;
  unidade_nome: string;
  categoria: string | null;
  total_servicos: number;
  preco_medio: number;
  valor_total_catalogo: number;
  servicos_unicos: number;
}

export interface ProfissionaisConsolidado {
  unidade_id: string;
  unidade_nome: string;
  papel: string;
  total_profissionais: number;
  profissionais_ativos: number;
  profissionais_inativos: number;
}

// =====================================================
// 5. BENCHMARKS E COMPARAÇÕES
// =====================================================

export interface BenchmarkUnidade {
  unidade_id: string;
  unidade_nome: string;
  metricas: {
    faturamento_per_capita: number;
    servicos_por_profissional: number;
    clientes_por_profissional: number;
    ticket_medio: number;
    taxa_ocupacao: number;
    satisfacao_media: number;
  };
  ranking: {
    faturamento: number;
    eficiencia: number;
    qualidade: number;
    geral: number;
  };
}

export interface ComparativoUnidades {
  periodo: {
    inicio: string;
    fim: string;
  };
  unidades: BenchmarkUnidade[];
  resumo: {
    melhor_desempenho: string;
    pior_desempenho: string;
    media_geral: number;
    variacao: number;
  };
}

// =====================================================
// 6. FILTROS E PAGINAÇÃO
// =====================================================

export interface RelatorioConsolidadoFilters {
  unidade_id?: string;
  data_inicio?: string;
  data_fim?: string;
  categoria?: string;
  papel?: UserRole;
  ativo?: boolean;
}

export interface RelatorioPagination {
  page: number;
  limit: number;
  sort_by: 'unidade_nome' | 'total' | 'faturamento_total' | 'created_at';
  sort_order: 'asc' | 'desc';
}

// =====================================================
// 7. RESPOSTAS PAGINADAS
// =====================================================

export interface PermissoesHierarquicasResponse {
  data: PermissaoHierarquica[];
  total: number;
}

export interface AcessosMultiUnidadeResponse {
  data: AcessoMultiUnidadeDetalhado[];
  total: number;
}

export interface AuditoriaResponse {
  data: AuditoriaAcessoDetalhado[];
  total: number;
}

export interface RelatoriosConsolidadosResponse {
  faturamento: FaturamentoConsolidado[];
  servicos: ServicosConsolidado[];
  profissionais: ProfissionaisConsolidado[];
  total_unidades: number;
  periodo: {
    inicio: string;
    fim: string;
  };
}

// =====================================================
// 8. EXPORTAÇÃO E RELATÓRIOS
// =====================================================

export interface ExportacaoRelatorio {
  formato: 'csv' | 'json';
  tipo_relatorio: 'faturamento' | 'servicos' | 'profissionais' | 'completo';
  filtros: RelatorioConsolidadoFilters;
  colunas?: string[];
}

export interface RelatorioExportado {
  nome_arquivo: string;
  formato: string;
  tamanho_bytes: number;
  url_download: string;
  expira_em: string;
}

// =====================================================
// 9. CONFIGURAÇÕES DE PERMISSÕES
// =====================================================

export interface ConfiguracaoPermissoes {
  papel_origem: UserRole;
  papel_destino: UserRole;
  permissoes: string[];
  ativo: boolean;
}

export interface ConfiguracaoPermissoesResponse {
  data: ConfiguracaoPermissoes[];
  total: number;
}

// =====================================================
// 10. MATRIZ DE PERMISSÕES
// =====================================================

export interface MatrizPermissoes {
  papel: UserRole;
  nivel: number;
  permissoes: {
    sistema: {
      usuarios: boolean;
      configuracoes: boolean;
      relatorios: boolean;
      auditoria: boolean;
    };
    unidade: {
      visualizar: boolean;
      editar: boolean;
      excluir: boolean;
      usuarios: boolean;
      financeiro: boolean;
    };
    dados: {
      propria_unidade: boolean;
      outras_unidades: boolean;
      consolidado: boolean;
      exportar: boolean;
    };
  };
}

// =====================================================
// 11. ESTATÍSTICAS E MÉTRICAS
// =====================================================

export interface EstatisticasMultiUnidade {
  total_unidades: number;
  unidades_ativas: number;
  total_usuarios: number;
  usuarios_por_papel: Record<UserRole, number>;
  acessos_multi_unidade: number;
  relatorios_consultados: number;
  auditoria_entradas: number;
}

export interface MetricasPerformance {
  unidade_id: string;
  unidade_nome: string;
  indicadores: {
    faturamento_mensal: number;
    crescimento_mensal: number;
    eficiencia_operacional: number;
    satisfacao_cliente: number;
    retencao_profissionais: number;
  };
  tendencias: {
    faturamento: 'crescendo' | 'estavel' | 'decrescendo';
    clientes: 'crescendo' | 'estavel' | 'decrescendo';
    servicos: 'crescendo' | 'estavel' | 'decrescendo';
  };
}

// =====================================================
// 12. TIPOS DE UTILIDADE
// =====================================================

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// =====================================================
// 13. TIPOS PARA FORMULÁRIOS
// =====================================================

export interface CreatePermissaoHierarquicaForm {
  papel: UserRole;
  nivel_hierarquico: number;
  permissoes: Record<string, any>;
  descricao?: string;
  ativo: boolean;
}

export interface CreateAcessoMultiUnidadeForm {
  profile_id: string;
  unidade_id: string;
  papel_unidade: UserRole;
  permissoes_especificas?: Record<string, any>;
  ativo: boolean;
}

export interface ConfiguracaoPermissoesForm {
  papel_origem: UserRole;
  papel_destino: UserRole;
  permissoes: string[];
  ativo: boolean;
}

// =====================================================
// 14. TIPOS PARA DASHBOARD
// =====================================================

export interface DashboardMultiUnidade {
  resumo: {
    total_unidades: number;
    total_usuarios: number;
    faturamento_total: number;
    servicos_ativos: number;
  };
  top_unidades: {
    faturamento: Array<{ unidade: string; valor: number }>;
    servicos: Array<{ unidade: string; quantidade: number }>;
    clientes: Array<{ unidade: string; quantidade: number }>;
  };
  alertas: Array<{
    tipo: 'warning' | 'error' | 'info';
    mensagem: string;
    unidade_id?: string;
  }>;
  atividades_recentes: AuditoriaAcessoDetalhado[];
}
