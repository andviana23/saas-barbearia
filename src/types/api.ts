// =====================================================
// TYPES CENTRALIZADOS DA API - SISTEMA BARBEARIA
// =====================================================
// Arquivo: src/types/api.ts
// Última atualização: Fase 3 - Contratos & Tipos
// Descrição: Definições TypeScript centralizadas para todas entidades da API

// =====================================================
// UNIDADE - Sistema de Franquias/Filiais
// =====================================================

export interface Unidade {
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
}

export interface CreateUnidadeDTO {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  config?: Record<string, string | number | boolean | null>;
}

export interface UpdateUnidadeDTO {
  nome?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  config?: Record<string, string | number | boolean | null>;
}

export interface UnidadeFilters {
  nome?: string;
  ativo?: boolean;
  cnpj?: string;
  cidade?: string;
}

// =====================================================
// PROFILE - Usuários do Sistema
// =====================================================

export type PapelUsuario = 'admin' | 'gestor' | 'profissional' | 'recepcao';

export interface Profile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone?: string;
  unidade_default_id?: string;
  papel: PapelUsuario;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileDTO {
  user_id: string;
  nome: string;
  email: string;
  telefone?: string;
  unidade_default_id?: string;
  papel?: PapelUsuario;
  ativo?: boolean;
}

export interface UpdateProfileDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  unidade_default_id?: string;
  papel?: PapelUsuario;
  ativo?: boolean;
}

export interface ProfileFilters {
  nome?: string;
  email?: string;
  papel?: PapelUsuario;
  ativo?: boolean;
  unidade_id?: string;
}

// =====================================================
// CLIENTE - Gestão de Clientes
// =====================================================

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cpf?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  unidade_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClienteDTO {
  nome: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cpf?: string;
  endereco?: string;
  observacoes?: string;
  ativo?: boolean;
  unidade_id: string;
}

export interface UpdateClienteDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cpf?: string;
  endereco?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface ClienteFilters {
  nome?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
  unidade_id?: string;
  data_nascimento_inicio?: string;
  data_nascimento_fim?: string;
}

// =====================================================
// PROFISSIONAL - Gestão de Profissionais
// =====================================================

export interface Profissional {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  especialidades: string[];
  comissao_padrao: number;
  ativo: boolean;
  unidade_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfissionalDTO {
  nome: string;
  email?: string;
  telefone?: string;
  especialidades?: string[];
  comissao_padrao?: number;
  ativo?: boolean;
  unidade_id: string;
  user_id?: string;
}

export interface UpdateProfissionalDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  especialidades?: string[];
  comissao_padrao?: number;
  ativo?: boolean;
  user_id?: string;
}

export interface ProfissionalFilters {
  nome?: string;
  ativo?: boolean;
  unidade_id?: string;
  especialidade?: string;
  comissao_min?: number;
  comissao_max?: number;
}

// =====================================================
// SERVIÇO - Catálogo de Serviços
// =====================================================

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number; // em minutos
  categoria?: string;
  ativo: boolean;
  unidade_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServicoDTO {
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
  categoria?: string;
  ativo?: boolean;
  unidade_id: string;
}

export interface UpdateServicoDTO {
  nome?: string;
  descricao?: string;
  preco?: number;
  duracao?: number;
  categoria?: string;
  ativo?: boolean;
}

export interface ServicoFilters {
  nome?: string;
  categoria?: string;
  ativo?: boolean;
  unidade_id?: string;
  preco_min?: number;
  preco_max?: number;
  duracao_min?: number;
  duracao_max?: number;
}

// =====================================================
// AGENDAMENTO - Sistema de Appointments
// =====================================================

export type StatusAgendamento =
  | 'agendado'
  | 'confirmado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'nao_compareceu';

export interface Appointment {
  id: string;
  cliente_id: string;
  profissional_id: string;
  servico_id: string;
  unidade_id: string;
  data_hora: string;
  status: StatusAgendamento;
  observacoes?: string;
  valor_servico: number;
  valor_final?: number;
  desconto?: number;
  created_at: string;
  updated_at: string;
  // Relacionamentos populados
  cliente?: Cliente;
  profissional?: Profissional;
  servico?: Servico;
}

export interface CreateAppointmentDTO {
  cliente_id: string;
  profissional_id: string;
  servico_id: string;
  unidade_id: string;
  data_hora: string;
  observacoes?: string;
  valor_servico: number;
  valor_final?: number;
  desconto?: number;
}

export interface UpdateAppointmentDTO {
  cliente_id?: string;
  profissional_id?: string;
  servico_id?: string;
  data_hora?: string;
  status?: StatusAgendamento;
  observacoes?: string;
  valor_servico?: number;
  valor_final?: number;
  desconto?: number;
}

export interface AppointmentFilters {
  cliente_id?: string;
  profissional_id?: string;
  servico_id?: string;
  unidade_id?: string;
  status?: StatusAgendamento;
  data_inicio?: string;
  data_fim?: string;
  valor_min?: number;
  valor_max?: number;
}

// =====================================================
// FILA DE ATENDIMENTO - Queue Management
// =====================================================

export type StatusFila = 'aguardando' | 'chamado' | 'em_atendimento' | 'concluido' | 'cancelado';

export interface FilaAtendimento {
  id: string;
  cliente_id: string;
  unidade_id: string;
  profissional_id?: string;
  servico_id?: string;
  posicao: number;
  status: StatusFila;
  data_entrada: string;
  data_chamada?: string;
  data_inicio?: string;
  data_fim?: string;
  observacoes?: string;
  // Relacionamentos
  cliente?: Cliente;
  profissional?: Profissional;
  servico?: Servico;
}

export interface CreateFilaDTO {
  cliente_id: string;
  unidade_id: string;
  profissional_id?: string;
  servico_id?: string;
  observacoes?: string;
}

export interface UpdateFilaDTO {
  profissional_id?: string;
  servico_id?: string;
  status?: StatusFila;
  data_chamada?: string;
  data_inicio?: string;
  data_fim?: string;
  observacoes?: string;
}

export interface FilaFilters {
  unidade_id?: string;
  status?: StatusFila;
  data_inicio?: string;
  data_fim?: string;
  profissional_id?: string;
}

// =====================================================
// TRANSAÇÕES FINANCEIRAS
// =====================================================

export type TipoTransacao = 'receita' | 'despesa';
export type StatusTransacao = 'pendente' | 'pago' | 'cancelado' | 'estornado';
export type FormaPagamento =
  | 'dinheiro'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'pix'
  | 'transferencia';

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  categoria?: string;
  forma_pagamento?: FormaPagamento;
  status: StatusTransacao;
  data_vencimento: string;
  data_pagamento?: string;
  appointment_id?: string;
  cliente_id?: string;
  profissional_id?: string;
  unidade_id: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  appointment?: Appointment;
  cliente?: Cliente;
  profissional?: Profissional;
}

export interface CreateTransacaoDTO {
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  categoria?: string;
  forma_pagamento?: FormaPagamento;
  status?: StatusTransacao;
  data_vencimento: string;
  data_pagamento?: string;
  appointment_id?: string;
  cliente_id?: string;
  profissional_id?: string;
  unidade_id: string;
}

export interface UpdateTransacaoDTO {
  valor?: number;
  descricao?: string;
  categoria?: string;
  forma_pagamento?: FormaPagamento;
  status?: StatusTransacao;
  data_vencimento?: string;
  data_pagamento?: string;
}

export interface TransacaoFilters {
  tipo?: TipoTransacao;
  status?: StatusTransacao;
  forma_pagamento?: FormaPagamento;
  unidade_id?: string;
  cliente_id?: string;
  profissional_id?: string;
  data_inicio?: string;
  data_fim?: string;
  valor_min?: number;
  valor_max?: number;
  categoria?: string;
}

// =====================================================
// PRODUTOS - Sistema de Vendas
// =====================================================

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  estoque_atual: number;
  estoque_minimo: number;
  codigo_barras?: string;
  ativo: boolean;
  unidade_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProdutoDTO {
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  estoque_atual?: number;
  estoque_minimo?: number;
  codigo_barras?: string;
  ativo?: boolean;
  unidade_id: string;
}

export interface UpdateProdutoDTO {
  nome?: string;
  descricao?: string;
  preco?: number;
  categoria?: string;
  estoque_atual?: number;
  estoque_minimo?: number;
  codigo_barras?: string;
  ativo?: boolean;
}

export interface ProdutoFilters {
  nome?: string;
  categoria?: string;
  ativo?: boolean;
  unidade_id?: string;
  estoque_baixo?: boolean;
  preco_min?: number;
  preco_max?: number;
}

// =====================================================
// ASSINATURAS - Sistema de Recorrência
// =====================================================

export type StatusAssinatura = 'ativa' | 'pausada' | 'cancelada' | 'vencida';
export type TipoAssinatura = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface Assinatura {
  id: string;
  cliente_id: string;
  plano_nome: string;
  valor: number;
  tipo: TipoAssinatura;
  status: StatusAssinatura;
  data_inicio: string;
  data_fim?: string;
  data_proximo_pagamento: string;
  servicos_inclusos: string[];
  limite_servicos?: number;
  unidade_id: string;
  asaas_subscription_id?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  cliente?: Cliente;
}

export interface CreateAssinaturaDTO {
  cliente_id: string;
  plano_nome: string;
  valor: number;
  tipo: TipoAssinatura;
  data_inicio: string;
  data_fim?: string;
  servicos_inclusos: string[];
  limite_servicos?: number;
  unidade_id: string;
}

export interface UpdateAssinaturaDTO {
  plano_nome?: string;
  valor?: number;
  tipo?: TipoAssinatura;
  status?: StatusAssinatura;
  data_fim?: string;
  data_proximo_pagamento?: string;
  servicos_inclusos?: string[];
  limite_servicos?: number;
}

export interface AssinaturaFilters {
  cliente_id?: string;
  status?: StatusAssinatura;
  tipo?: TipoAssinatura;
  unidade_id?: string;
  data_inicio?: string;
  data_fim?: string;
  valor_min?: number;
  valor_max?: number;
}

// =====================================================
// NOTIFICAÇÕES - Sistema de Alertas
// =====================================================

export type TipoNotificacao = 'agendamento' | 'pagamento' | 'sistema' | 'marketing' | 'lembrete';
export type StatusNotificacao = 'pendente' | 'enviada' | 'lida' | 'erro';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  destinatario_id: string;
  status: StatusNotificacao;
  data_envio?: string;
  data_leitura?: string;
  dados_extras?: Record<string, unknown>;
  unidade_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificacaoDTO {
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  destinatario_id: string;
  status?: StatusNotificacao;
  dados_extras?: Record<string, unknown>;
  unidade_id: string;
}

export interface UpdateNotificacaoDTO {
  status?: StatusNotificacao;
  data_envio?: string;
  data_leitura?: string;
}

export interface NotificacaoFilters {
  tipo?: TipoNotificacao;
  status?: StatusNotificacao;
  destinatario_id?: string;
  unidade_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

// =====================================================
// TIPOS DE RESPOSTA DA API
// =====================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// =====================================================
// TIPOS UTILITÁRIOS
// =====================================================

export type EntityId = string;
export type TimestampString = string;

export interface BaseEntity {
  id: EntityId;
  created_at: TimestampString;
  updated_at: TimestampString;
}

export interface UnidadeBasedEntity extends BaseEntity {
  unidade_id: EntityId;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, unknown>;
}
