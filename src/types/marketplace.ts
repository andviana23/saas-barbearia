// =====================================================
// TIPOS PARA MARKETPLACE DE SERVIÇOS
// =====================================================

// =====================================================
// 1. ENTIDADES PRINCIPAIS
// =====================================================

export interface MarketplaceServico {
  id: string;
  servico_id: string;
  unidade_id: string;
  nome_publico: string;
  descricao_publica: string | null;
  categoria_publica: string | null;
  preco_publico: number;
  duracao_min: number;
  disponivel: boolean;
  destaque: boolean;
  tags: string[] | null;
  imagem_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservaMarketplace {
  id: string;
  servico_marketplace_id: string;
  unidade_origem_id: string;
  unidade_destino_id: string;
  cliente_id: string;
  profissional_id: string | null;
  data_reserva: string;
  hora_reserva: string;
  status: AppointmentStatus;
  observacoes: string | null;
  comissao_marketplace: number | null;
  created_at: string;
  updated_at: string;
}

export interface ConfiguracaoMarketplace {
  id: string;
  unidade_id: string;
  ativo: boolean;
  comissao_padrao: number;
  permitir_reservas_cross_unit: boolean;
  horario_funcionamento: Record<string, any> | null;
  politicas_reserva: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// 2. CATÁLOGO PÚBLICO
// =====================================================

export interface CatalogoPublico {
  id: string;
  nome_publico: string;
  descricao_publica: string | null;
  categoria_publica: string | null;
  preco_publico: number;
  duracao_min: number;
  disponivel: boolean;
  destaque: boolean;
  tags: string[] | null;
  imagem_url: string | null;
  unidade_nome: string;
  unidade_endereco: string | null;
  unidade_telefone: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// 3. FILTROS E PAGINAÇÃO
// =====================================================

export interface MarketplaceFilters {
  categoria?: string;
  preco_min?: number;
  preco_max?: number;
  duracao_max?: number;
  unidade_id?: string;
  destaque?: boolean;
  tags?: string[];
  disponivel?: boolean;
}

export interface MarketplacePagination {
  page: number;
  limit: number;
  sort_by: 'nome_publico' | 'preco_publico' | 'duracao_min' | 'created_at';
  sort_order: 'asc' | 'desc';
}

// =====================================================
// 4. RESPOSTAS PAGINADAS
// =====================================================

export interface CatalogoPaginado {
  data: CatalogoPublico[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// =====================================================
// 5. ESTATÍSTICAS E MÉTRICAS
// =====================================================

export interface MarketplaceStats {
  total_servicos: number;
  total_unidades: number;
  servicos_destaque: number;
  categorias_disponiveis: string[];
  faixa_precos: {
    min: number;
    max: number;
    media: number;
  };
  servicos_por_categoria: Record<string, number>;
}

export interface UnidadeMarketplaceStats {
  unidade_id: string;
  unidade_nome: string;
  total_servicos: number;
  servicos_destaque: number;
  faturamento_estimado: number;
  total_reservas: number;
  avaliacao_media: number;
}

// =====================================================
// 6. RESERVAS E AGENDAMENTOS
// =====================================================

export interface ReservaMarketplaceDetalhada extends ReservaMarketplace {
  servico: {
    nome_publico: string;
    categoria_publica: string;
    preco_publico: number;
    duracao_min: number;
  };
  unidade_origem: {
    nome: string;
    endereco: string | null;
  };
  unidade_destino: {
    nome: string;
    endereco: string | null;
    telefone: string | null;
  };
  cliente: {
    nome: string;
    email: string | null;
    telefone: string | null;
  };
  profissional?: {
    nome: string;
    papel: string;
  };
}

// =====================================================
// 7. CONFIGURAÇÕES E POLÍTICAS
// =====================================================

export interface HorarioFuncionamento {
  dia_semana: number; // 0-6 (domingo-sábado)
  horario_inicio: string; // HH:MM
  horario_fim: string; // HH:MM
  ativo: boolean;
}

export interface PoliticaReserva {
  antecedencia_minima_horas: number;
  cancelamento_maximo_horas: number;
  reembolso_percentual: number;
  permitir_remarcacao: boolean;
  limite_reservas_por_cliente: number;
}

export interface ConfiguracaoMarketplaceCompleta extends ConfiguracaoMarketplace {
  horario_funcionamento: HorarioFuncionamento[];
  politicas_reserva: PoliticaReserva;
}

// =====================================================
// 8. COMISSÕES E FINANCEIRO
// =====================================================

export interface ComissaoMarketplace {
  unidade_id: string;
  unidade_nome: string;
  percentual_comissao: number;
  valor_total_servicos: number;
  valor_comissao: number;
  periodo: {
    inicio: string;
    fim: string;
  };
}

export interface RelatorioComissoes {
  periodo: {
    inicio: string;
    fim: string;
  };
  total_comissoes: number;
  comissoes_por_unidade: ComissaoMarketplace[];
  resumo: {
    total_unidades: number;
    media_comissao: number;
    maior_comissao: number;
    menor_comissao: number;
  };
}

// =====================================================
// 9. BUSCA E DESCOBERTA
// =====================================================

export interface ResultadoBusca {
  servicos: CatalogoPublico[];
  unidades: {
    id: string;
    nome: string;
    endereco: string | null;
    total_servicos: number;
  }[];
  categorias: {
    nome: string;
    total_servicos: number;
  }[];
  total_resultados: number;
}

export interface SugestaoBusca {
  termo: string;
  frequencia: number;
  categoria: string | null;
}

// =====================================================
// 10. NOTIFICAÇÕES E COMUNICAÇÃO
// =====================================================

export interface NotificacaoMarketplace {
  id: string;
  tipo: 'nova_reserva' | 'confirmacao_reserva' | 'cancelamento_reserva' | 'lembrete_reserva';
  reserva_id: string;
  destinatario_id: string;
  destinatario_tipo: 'cliente' | 'profissional' | 'unidade';
  mensagem: string;
  lida: boolean;
  created_at: string;
}

// =====================================================
// 11. TIPOS DE ENUMERAÇÃO
// =====================================================

export type AppointmentStatus =
  | 'criado'
  | 'confirmado'
  | 'em_atendimento'
  | 'concluido'
  | 'cancelado'
  | 'faltou';

export type SortField = 'nome_publico' | 'preco_publico' | 'duracao_min' | 'created_at';
export type SortOrder = 'asc' | 'desc';

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

export interface CreateMarketplaceServicoForm {
  servico_id: string;
  nome_publico: string;
  descricao_publica?: string;
  categoria_publica?: string;
  preco_publico: number;
  duracao_min: number;
  disponivel: boolean;
  destaque: boolean;
  tags?: string[];
  imagem_url?: string;
}

export interface CreateReservaMarketplaceForm {
  servico_marketplace_id: string;
  unidade_destino_id: string;
  cliente_id: string;
  profissional_id?: string;
  data_reserva: string;
  hora_reserva: string;
  observacoes?: string;
}

export interface ConfiguracaoMarketplaceForm {
  ativo: boolean;
  comissao_padrao: number;
  permitir_reservas_cross_unit: boolean;
  horario_funcionamento: HorarioFuncionamento[];
  politicas_reserva: PoliticaReserva;
}
