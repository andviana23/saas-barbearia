// =====================================================
// SCHEMAS ZOD CENTRALIZADOS - VALIDAÇÃO DA API
// =====================================================
// Arquivo: src/schemas/api.ts
// Última atualização: Fase 3 - Contratos & Tipos
// Descrição: Validação Zod para todas entidades da API

import { z } from 'zod';

// =====================================================
// SCHEMAS UTILITÁRIOS
// =====================================================

export const EntityIdSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime();

// =====================================================
// UNIDADE - Validação de Franquias/Filiais
// =====================================================

export const UnidadeSchema = z.object({
  id: EntityIdSchema,
  nome: z.string().min(2).max(100),
  cnpj: z.string().optional(),
  endereco: z.string().max(255).optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  ativo: z.boolean(),
  config: z.record(z.unknown()),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateUnidadeSchema = z.object({
  nome: z.string().min(2).max(100),
  cnpj: z.string().optional(),
  endereco: z.string().max(255).optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  ativo: z.boolean().default(true),
  config: z.record(z.unknown()).default({}),
});

export const UpdateUnidadeSchema = CreateUnidadeSchema.partial();

export const UnidadeFiltersSchema = z.object({
  nome: z.string().optional(),
  ativo: z.boolean().optional(),
  cnpj: z.string().optional(),
  cidade: z.string().optional(),
});

// =====================================================
// PROFILE - Validação de Usuários
// =====================================================

export const PapelUsuarioSchema = z.enum(['admin', 'gestor', 'profissional', 'recepcao']);

export const ProfileSchema = z.object({
  id: EntityIdSchema,
  user_id: EntityIdSchema,
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  telefone: z.string().optional(),
  unidade_default_id: EntityIdSchema.optional(),
  papel: PapelUsuarioSchema,
  ativo: z.boolean(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateProfileSchema = z.object({
  user_id: EntityIdSchema,
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  telefone: z.string().optional(),
  unidade_default_id: EntityIdSchema.optional(),
  papel: PapelUsuarioSchema.default('recepcao'),
  ativo: z.boolean().default(true),
});

export const UpdateProfileSchema = CreateProfileSchema.omit({ user_id: true }).partial();

export const ProfileFiltersSchema = z.object({
  nome: z.string().optional(),
  email: z.string().optional(),
  papel: PapelUsuarioSchema.optional(),
  ativo: z.boolean().optional(),
  unidade_id: EntityIdSchema.optional(),
});

// =====================================================
// CLIENTE - Validação de Clientes
// =====================================================

export const ClienteSchema = z.object({
  id: EntityIdSchema,
  nome: z.string().min(2).max(100),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  data_nascimento: z.string().date().optional(),
  cpf: z.string().optional(),
  endereco: z.string().max(255).optional(),
  observacoes: z.string().max(500).optional(),
  ativo: z.boolean(),
  unidade_id: EntityIdSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateClienteSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  data_nascimento: z.string().date().optional(),
  cpf: z.string().optional(),
  endereco: z.string().max(255).optional(),
  observacoes: z.string().max(500).optional(),
  ativo: z.boolean().default(true),
  unidade_id: EntityIdSchema,
});

export const UpdateClienteSchema = CreateClienteSchema.omit({ unidade_id: true }).partial();

export const ClienteFiltersSchema = z.object({
  nome: z.string().optional(),
  email: z.string().optional(),
  telefone: z.string().optional(),
  ativo: z.boolean().optional(),
  unidade_id: EntityIdSchema.optional(),
  data_nascimento_inicio: z.string().date().optional(),
  data_nascimento_fim: z.string().date().optional(),
});

// =====================================================
// PROFISSIONAL - Validação de Profissionais
// =====================================================

export const ProfissionalSchema = z.object({
  id: EntityIdSchema,
  nome: z.string().min(2).max(100),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  especialidades: z.array(z.string()),
  comissao_padrao: z.number().min(0).max(100),
  ativo: z.boolean(),
  unidade_id: EntityIdSchema,
  user_id: EntityIdSchema.optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateProfissionalSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  especialidades: z.array(z.string()).default([]),
  comissao_padrao: z.number().min(0).max(100).default(30),
  ativo: z.boolean().default(true),
  unidade_id: EntityIdSchema,
  user_id: EntityIdSchema.optional(),
});

export const UpdateProfissionalSchema = CreateProfissionalSchema.omit({
  unidade_id: true,
}).partial();

export const ProfissionalFiltersSchema = z.object({
  nome: z.string().optional(),
  ativo: z.boolean().optional(),
  unidade_id: EntityIdSchema.optional(),
  especialidade: z.string().optional(),
  comissao_min: z.number().optional(),
  comissao_max: z.number().optional(),
});

// =====================================================
// SERVIÇO - Validação de Catálogo
// =====================================================

export const ServicoSchema = z.object({
  id: EntityIdSchema,
  nome: z.string().min(2).max(100),
  descricao: z.string().max(500).optional(),
  preco: z.number().min(0),
  duracao: z.number().min(5), // minutos
  categoria: z.string().optional(),
  ativo: z.boolean(),
  unidade_id: EntityIdSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateServicoSchema = z.object({
  nome: z.string().min(2).max(100),
  descricao: z.string().max(500).optional(),
  preco: z.number().min(0),
  duracao: z.number().min(5),
  categoria: z.string().optional(),
  ativo: z.boolean().default(true),
  unidade_id: EntityIdSchema,
});

export const UpdateServicoSchema = CreateServicoSchema.omit({ unidade_id: true }).partial();

export const ServicoFiltersSchema = z.object({
  nome: z.string().optional(),
  categoria: z.string().optional(),
  ativo: z.boolean().optional(),
  unidade_id: EntityIdSchema.optional(),
  preco_min: z.number().optional(),
  preco_max: z.number().optional(),
  duracao_min: z.number().optional(),
  duracao_max: z.number().optional(),
});

// =====================================================
// AGENDAMENTO - Validação de Appointments
// =====================================================

export const StatusAgendamentoSchema = z.enum([
  'agendado',
  'confirmado',
  'em_andamento',
  'concluido',
  'cancelado',
  'nao_compareceu',
]);

export const AppointmentSchema = z.object({
  id: EntityIdSchema,
  cliente_id: EntityIdSchema,
  profissional_id: EntityIdSchema,
  servico_id: EntityIdSchema,
  unidade_id: EntityIdSchema,
  data_hora: TimestampSchema,
  status: StatusAgendamentoSchema,
  observacoes: z.string().max(500).optional(),
  valor_servico: z.number().min(0),
  valor_final: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateAppointmentSchema = z.object({
  cliente_id: EntityIdSchema,
  profissional_id: EntityIdSchema,
  servico_id: EntityIdSchema,
  unidade_id: EntityIdSchema,
  data_hora: TimestampSchema,
  observacoes: z.string().max(500).optional(),
  valor_servico: z.number().min(0),
  valor_final: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
});

export const UpdateAppointmentSchema = z.object({
  cliente_id: EntityIdSchema.optional(),
  profissional_id: EntityIdSchema.optional(),
  servico_id: EntityIdSchema.optional(),
  data_hora: TimestampSchema.optional(),
  status: StatusAgendamentoSchema.optional(),
  observacoes: z.string().max(500).optional(),
  valor_servico: z.number().min(0).optional(),
  valor_final: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
});

export const AppointmentFiltersSchema = z.object({
  cliente_id: EntityIdSchema.optional(),
  profissional_id: EntityIdSchema.optional(),
  servico_id: EntityIdSchema.optional(),
  unidade_id: EntityIdSchema.optional(),
  status: StatusAgendamentoSchema.optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
  valor_min: z.number().optional(),
  valor_max: z.number().optional(),
});

// =====================================================
// FILA DE ATENDIMENTO - Validação
// =====================================================

export const StatusFilaSchema = z.enum([
  'aguardando',
  'chamado',
  'em_atendimento',
  'concluido',
  'cancelado',
]);

export const FilaAtendimentoSchema = z.object({
  id: EntityIdSchema,
  cliente_id: EntityIdSchema,
  unidade_id: EntityIdSchema,
  profissional_id: EntityIdSchema.optional(),
  servico_id: EntityIdSchema.optional(),
  posicao: z.number().min(1),
  status: StatusFilaSchema,
  data_entrada: TimestampSchema,
  data_chamada: TimestampSchema.optional(),
  data_inicio: TimestampSchema.optional(),
  data_fim: TimestampSchema.optional(),
  observacoes: z.string().max(500).optional(),
});

export const CreateFilaSchema = z.object({
  cliente_id: EntityIdSchema,
  unidade_id: EntityIdSchema,
  profissional_id: EntityIdSchema.optional(),
  servico_id: EntityIdSchema.optional(),
  observacoes: z.string().max(500).optional(),
});

export const UpdateFilaSchema = z.object({
  profissional_id: EntityIdSchema.optional(),
  servico_id: EntityIdSchema.optional(),
  status: StatusFilaSchema.optional(),
  data_chamada: TimestampSchema.optional(),
  data_inicio: TimestampSchema.optional(),
  data_fim: TimestampSchema.optional(),
  observacoes: z.string().max(500).optional(),
});

export const FilaFiltersSchema = z.object({
  unidade_id: EntityIdSchema.optional(),
  status: StatusFilaSchema.optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
  profissional_id: EntityIdSchema.optional(),
});

// =====================================================
// TRANSAÇÕES FINANCEIRAS - Validação
// =====================================================

export const TipoTransacaoSchema = z.enum(['receita', 'despesa']);
export const StatusTransacaoSchema = z.enum(['pendente', 'pago', 'cancelado', 'estornado']);
export const FormaPagamentoSchema = z.enum([
  'dinheiro',
  'cartao_credito',
  'cartao_debito',
  'pix',
  'transferencia',
]);

export const TransacaoSchema = z.object({
  id: EntityIdSchema,
  tipo: TipoTransacaoSchema,
  valor: z.number().min(0),
  descricao: z.string().min(2).max(255),
  categoria: z.string().optional(),
  forma_pagamento: FormaPagamentoSchema.optional(),
  status: StatusTransacaoSchema,
  data_vencimento: z.string().date(),
  data_pagamento: z.string().date().optional(),
  appointment_id: EntityIdSchema.optional(),
  cliente_id: EntityIdSchema.optional(),
  profissional_id: EntityIdSchema.optional(),
  unidade_id: EntityIdSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateTransacaoSchema = z.object({
  tipo: TipoTransacaoSchema,
  valor: z.number().min(0),
  descricao: z.string().min(2).max(255),
  categoria: z.string().optional(),
  forma_pagamento: FormaPagamentoSchema.optional(),
  status: StatusTransacaoSchema.default('pendente'),
  data_vencimento: z.string().date(),
  data_pagamento: z.string().date().optional(),
  appointment_id: EntityIdSchema.optional(),
  cliente_id: EntityIdSchema.optional(),
  profissional_id: EntityIdSchema.optional(),
  unidade_id: EntityIdSchema,
});

export const UpdateTransacaoSchema = z.object({
  valor: z.number().min(0).optional(),
  descricao: z.string().min(2).max(255).optional(),
  categoria: z.string().optional(),
  forma_pagamento: FormaPagamentoSchema.optional(),
  status: StatusTransacaoSchema.optional(),
  data_vencimento: z.string().date().optional(),
  data_pagamento: z.string().date().optional(),
});

export const TransacaoFiltersSchema = z.object({
  tipo: TipoTransacaoSchema.optional(),
  status: StatusTransacaoSchema.optional(),
  forma_pagamento: FormaPagamentoSchema.optional(),
  unidade_id: EntityIdSchema.optional(),
  cliente_id: EntityIdSchema.optional(),
  profissional_id: EntityIdSchema.optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
  valor_min: z.number().optional(),
  valor_max: z.number().optional(),
  categoria: z.string().optional(),
});

// =====================================================
// PRODUTOS - Validação de Estoque
// =====================================================

export const ProdutoSchema = z.object({
  id: EntityIdSchema,
  nome: z.string().min(2).max(100),
  descricao: z.string().max(500).optional(),
  preco: z.number().min(0),
  categoria: z.string().optional(),
  estoque_atual: z.number().min(0),
  estoque_minimo: z.number().min(0),
  codigo_barras: z.string().optional(),
  ativo: z.boolean(),
  unidade_id: EntityIdSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateProdutoSchema = z.object({
  nome: z.string().min(2).max(100),
  descricao: z.string().max(500).optional(),
  preco: z.number().min(0),
  categoria: z.string().optional(),
  estoque_atual: z.number().min(0).default(0),
  estoque_minimo: z.number().min(0).default(1),
  codigo_barras: z.string().optional(),
  ativo: z.boolean().default(true),
  unidade_id: EntityIdSchema,
});

export const UpdateProdutoSchema = CreateProdutoSchema.omit({ unidade_id: true }).partial();

export const ProdutoFiltersSchema = z.object({
  nome: z.string().optional(),
  categoria: z.string().optional(),
  ativo: z.boolean().optional(),
  unidade_id: EntityIdSchema.optional(),
  estoque_baixo: z.boolean().optional(),
  preco_min: z.number().optional(),
  preco_max: z.number().optional(),
});

// =====================================================
// ASSINATURAS - Validação de Recorrência
// =====================================================

export const StatusAssinaturaSchema = z.enum(['ativa', 'pausada', 'cancelada', 'vencida']);
export const TipoAssinaturaSchema = z.enum(['mensal', 'trimestral', 'semestral', 'anual']);

export const AssinaturaSchema = z.object({
  id: EntityIdSchema,
  cliente_id: EntityIdSchema,
  plano_nome: z.string().min(2).max(100),
  valor: z.number().min(0),
  tipo: TipoAssinaturaSchema,
  status: StatusAssinaturaSchema,
  data_inicio: z.string().date(),
  data_fim: z.string().date().optional(),
  data_proximo_pagamento: z.string().date(),
  servicos_inclusos: z.array(z.string()),
  limite_servicos: z.number().min(0).optional(),
  unidade_id: EntityIdSchema,
  asaas_subscription_id: z.string().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateAssinaturaSchema = z.object({
  cliente_id: EntityIdSchema,
  plano_nome: z.string().min(2).max(100),
  valor: z.number().min(0),
  tipo: TipoAssinaturaSchema,
  data_inicio: z.string().date(),
  data_fim: z.string().date().optional(),
  servicos_inclusos: z.array(z.string()),
  limite_servicos: z.number().min(0).optional(),
  unidade_id: EntityIdSchema,
});

export const UpdateAssinaturaSchema = z.object({
  plano_nome: z.string().min(2).max(100).optional(),
  valor: z.number().min(0).optional(),
  tipo: TipoAssinaturaSchema.optional(),
  status: StatusAssinaturaSchema.optional(),
  data_fim: z.string().date().optional(),
  data_proximo_pagamento: z.string().date().optional(),
  servicos_inclusos: z.array(z.string()).optional(),
  limite_servicos: z.number().min(0).optional(),
});

export const AssinaturaFiltersSchema = z.object({
  cliente_id: EntityIdSchema.optional(),
  status: StatusAssinaturaSchema.optional(),
  tipo: TipoAssinaturaSchema.optional(),
  unidade_id: EntityIdSchema.optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
  valor_min: z.number().optional(),
  valor_max: z.number().optional(),
});

// =====================================================
// NOTIFICAÇÕES - Validação
// =====================================================

export const TipoNotificacaoSchema = z.enum([
  'agendamento',
  'pagamento',
  'sistema',
  'marketing',
  'lembrete',
]);

export const StatusNotificacaoSchema = z.enum(['pendente', 'enviada', 'lida', 'erro']);

export const NotificacaoSchema = z.object({
  id: EntityIdSchema,
  tipo: TipoNotificacaoSchema,
  titulo: z.string().min(2).max(100),
  mensagem: z.string().min(2).max(500),
  destinatario_id: EntityIdSchema,
  status: StatusNotificacaoSchema,
  data_envio: TimestampSchema.optional(),
  data_leitura: TimestampSchema.optional(),
  dados_extras: z.record(z.unknown()).optional(),
  unidade_id: EntityIdSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const CreateNotificacaoSchema = z.object({
  tipo: TipoNotificacaoSchema,
  titulo: z.string().min(2).max(100),
  mensagem: z.string().min(2).max(500),
  destinatario_id: EntityIdSchema,
  status: StatusNotificacaoSchema.default('pendente'),
  dados_extras: z.record(z.unknown()).optional(),
  unidade_id: EntityIdSchema,
});

export const UpdateNotificacaoSchema = z.object({
  status: StatusNotificacaoSchema.optional(),
  data_envio: TimestampSchema.optional(),
  data_leitura: TimestampSchema.optional(),
});

export const NotificacaoFiltersSchema = z.object({
  tipo: TipoNotificacaoSchema.optional(),
  status: StatusNotificacaoSchema.optional(),
  destinatario_id: EntityIdSchema.optional(),
  unidade_id: EntityIdSchema.optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
});

// =====================================================
// SCHEMAS DE RESPOSTA DA API
// =====================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  meta: z
    .object({
      total: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      totalPages: z.number().optional(),
    })
    .optional(),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  }),
});

export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  details: z.record(z.unknown()).optional(),
});

// =====================================================
// SCHEMAS UTILITÁRIOS DE PAGINAÇÃO
// =====================================================

export const PaginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const SearchParamsSchema = PaginationParamsSchema.extend({
  search: z.string().optional(),
  filters: z.record(z.unknown()).optional(),
});

// =====================================================
// TIPOS INFERIDOS DOS SCHEMAS
// =====================================================

// Inferir tipos TypeScript dos schemas Zod
export type UnidadeInput = z.infer<typeof CreateUnidadeSchema>;
export type UnidadeUpdate = z.infer<typeof UpdateUnidadeSchema>;
export type UnidadeFilters = z.infer<typeof UnidadeFiltersSchema>;

export type ProfileInput = z.infer<typeof CreateProfileSchema>;
export type ProfileUpdate = z.infer<typeof UpdateProfileSchema>;
export type ProfileFilters = z.infer<typeof ProfileFiltersSchema>;

export type ClienteInput = z.infer<typeof CreateClienteSchema>;
export type ClienteUpdate = z.infer<typeof UpdateClienteSchema>;
export type ClienteFilters = z.infer<typeof ClienteFiltersSchema>;

export type ProfissionalInput = z.infer<typeof CreateProfissionalSchema>;
export type ProfissionalUpdate = z.infer<typeof UpdateProfissionalSchema>;
export type ProfissionalFilters = z.infer<typeof ProfissionalFiltersSchema>;

export type ServicoInput = z.infer<typeof CreateServicoSchema>;
export type ServicoUpdate = z.infer<typeof UpdateServicoSchema>;
export type ServicoFilters = z.infer<typeof ServicoFiltersSchema>;

export type AppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type AppointmentUpdate = z.infer<typeof UpdateAppointmentSchema>;
export type AppointmentFilters = z.infer<typeof AppointmentFiltersSchema>;

export type FilaInput = z.infer<typeof CreateFilaSchema>;
export type FilaUpdate = z.infer<typeof UpdateFilaSchema>;
export type FilaFilters = z.infer<typeof FilaFiltersSchema>;

export type TransacaoInput = z.infer<typeof CreateTransacaoSchema>;
export type TransacaoUpdate = z.infer<typeof UpdateTransacaoSchema>;
export type TransacaoFilters = z.infer<typeof TransacaoFiltersSchema>;

export type ProdutoInput = z.infer<typeof CreateProdutoSchema>;
export type ProdutoUpdate = z.infer<typeof UpdateProdutoSchema>;
export type ProdutoFilters = z.infer<typeof ProdutoFiltersSchema>;

export type AssinaturaInput = z.infer<typeof CreateAssinaturaSchema>;
export type AssinaturaUpdate = z.infer<typeof UpdateAssinaturaSchema>;
export type AssinaturaFilters = z.infer<typeof AssinaturaFiltersSchema>;

export type NotificacaoInput = z.infer<typeof CreateNotificacaoSchema>;
export type NotificacaoUpdate = z.infer<typeof UpdateNotificacaoSchema>;
export type NotificacaoFilters = z.infer<typeof NotificacaoFiltersSchema>;

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type SearchParams = z.infer<typeof SearchParamsSchema>;
