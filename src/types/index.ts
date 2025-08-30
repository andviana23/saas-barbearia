// =====================================================
// BARREL EXPORT - TIPOS CENTRALIZADOS DA API
// =====================================================

// Re-exportar todos os tipos principais da API
export * from './api';

// Re-exportar schemas Zod específicos (evitando conflitos de tipos)
export {
  // Schemas principais
  UnidadeSchema,
  ProfileSchema,
  ClienteSchema,
  ProfissionalSchema,
  ServicoSchema,
  AppointmentSchema,
  FilaAtendimentoSchema,
  TransacaoSchema,
  ProdutoSchema,
  AssinaturaSchema,
  NotificacaoSchema,
  
  // Schemas de criação
  CreateUnidadeSchema,
  CreateProfileSchema,
  CreateClienteSchema,
  CreateProfissionalSchema,
  CreateServicoSchema,
  CreateAppointmentSchema,
  CreateFilaSchema,
  CreateTransacaoSchema,
  CreateProdutoSchema,
  CreateAssinaturaSchema,
  CreateNotificacaoSchema,
  
  // Schemas de atualização
  UpdateUnidadeSchema,
  UpdateProfileSchema,
  UpdateClienteSchema,
  UpdateProfissionalSchema,
  UpdateServicoSchema,
  UpdateAppointmentSchema,
  UpdateFilaSchema,
  UpdateTransacaoSchema,
  UpdateProdutoSchema,
  UpdateAssinaturaSchema,
  UpdateNotificacaoSchema,
  
  // Schemas de filtros
  UnidadeFiltersSchema,
  ProfileFiltersSchema,
  ClienteFiltersSchema,
  ProfissionalFiltersSchema,
  ServicoFiltersSchema,
  AppointmentFiltersSchema,
  FilaFiltersSchema,
  TransacaoFiltersSchema,
  ProdutoFiltersSchema,
  AssinaturaFiltersSchema,
  NotificacaoFiltersSchema,
  
  // Schemas utilitários
  EntityIdSchema,
  TimestampSchema,
  PaginationParamsSchema,
  SearchParamsSchema,
  ApiResponseSchema,
  PaginatedResponseSchema,
  ApiErrorSchema,
  
  // Schemas de enum
  PapelUsuarioSchema,
  StatusAgendamentoSchema,
  StatusFilaSchema,
  TipoTransacaoSchema,
  StatusTransacaoSchema,
  FormaPagamentoSchema,
  StatusAssinaturaSchema,
  TipoAssinaturaSchema,
  TipoNotificacaoSchema,
  StatusNotificacaoSchema,
  
  // Tipos inferidos dos schemas com alias para evitar conflitos
  type UnidadeInput,
  type UnidadeUpdate,
  type ProfileInput,
  type ProfileUpdate,
  type ClienteInput,
  type ClienteUpdate,
  type ProfissionalInput,
  type ProfissionalUpdate,
  type ServicoInput,
  type ServicoUpdate,
  type AppointmentInput,
  type AppointmentUpdate,
  type FilaInput,
  type FilaUpdate,
  type TransacaoInput,
  type TransacaoUpdate,
  type ProdutoInput,
  type ProdutoUpdate,
  type AssinaturaInput,
  type AssinaturaUpdate,
  type NotificacaoInput,
  type NotificacaoUpdate,
} from '../schemas/api';

// Re-exportar tipos específicos do marketplace (evitando conflitos)
export type {
  MarketplaceServico,
  ReservaMarketplace,
  ConfiguracaoMarketplace,
  CatalogoPublico,
  MarketplaceFilters,
  MarketplacePagination,
  CatalogoPaginado,
  MarketplaceStats,
  UnidadeMarketplaceStats,
  ReservaMarketplaceDetalhada,
  HorarioFuncionamento,
  PoliticaReserva,
  ConfiguracaoMarketplaceCompleta,
  ComissaoMarketplace,
  RelatorioComissoes,
  ResultadoBusca,
  SugestaoBusca,
  NotificacaoMarketplace,
  AppointmentStatus,
  SortField,
  SortOrder,
  CreateMarketplaceServicoForm,
  CreateReservaMarketplaceForm,
  ConfiguracaoMarketplaceForm,
} from './marketplace';

// Re-exports específicos com alias para evitar conflitos
export type {
  PaginatedResponse as MarketplacePaginatedResponse,
  ActionResult as MarketplaceActionResult,
} from './marketplace';

// =====================================================
// ACTION TYPES - Padrões para Server Actions
// =====================================================

// Action Result Type - Padrão obrigatório para Server Actions
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: ValidationError[];
}

// Validation Error Type
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Action State para formulários
export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp?: number;
}

// Database Types - Base para Supabase/Neon
export interface Database {
  public: {
    Tables: {
      unidades: {
        Row: {
          id: string;
          nome: string;
          cnpj?: string;
          endereco?: string;
          telefone?: string;
          email?: string;
          ativo: boolean;
          config: Record<string, string | number | boolean | null>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string;
          endereco?: string;
          telefone?: string;
          email?: string;
          ativo?: boolean;
          config?: Record<string, string | number | boolean | null>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cnpj?: string;
          endereco?: string;
          telefone?: string;
          email?: string;
          ativo?: boolean;
          config?: Record<string, string | number | boolean | null>;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          email: string;
          telefone?: string;
          unidade_default_id?: string;
          papel: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          email: string;
          telefone?: string;
          unidade_default_id?: string;
          papel?: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          email?: string;
          telefone?: string;
          unidade_default_id?: string;
          papel?: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}

// Utility Types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Update<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
