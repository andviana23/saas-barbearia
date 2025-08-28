import { z } from 'zod';

// =====================================================
// SCHEMAS PARA MARKETPLACE DE SERVIÇOS
// =====================================================

// Schema base para serviço do marketplace (ZodObject puro)
export const MarketplaceServicoBase = z.object({
  id: z.string().uuid().optional(),
  servico_id: z.string().uuid(),
  unidade_id: z.string().uuid(),
  nome_publico: z.string().min(2, 'Nome público deve ter pelo menos 2 caracteres'),
  descricao_publica: z.string().optional(),
  categoria_publica: z.string().min(2, 'Categoria deve ter pelo menos 2 caracteres').optional(),
  preco_publico: z.number().positive('Preço deve ser positivo'),
  duracao_min: z.number().int().positive('Duração deve ser um número inteiro positivo'),
  disponivel: z.boolean().default(true),
  destaque: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  imagem_url: z.string().url('URL da imagem deve ser válida').optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const MarketplaceServicoSchema = MarketplaceServicoBase;

// Schema para criação de serviço no marketplace
export const CreateMarketplaceServicoSchema = MarketplaceServicoBase.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualização de serviço no marketplace
export const UpdateMarketplaceServicoSchema = MarketplaceServicoBase.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema base para reserva do marketplace (ZodObject puro)
export const ReservaMarketplaceBase = z.object({
  id: z.string().uuid().optional(),
  servico_marketplace_id: z.string().uuid(),
  unidade_origem_id: z.string().uuid(),
  unidade_destino_id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  profissional_id: z.string().uuid().optional(),
  data_reserva: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  hora_reserva: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM'),
  status: z
    .enum(['criado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'faltou'])
    .default('criado'),
  observacoes: z.string().optional(),
  comissao_marketplace: z.number().min(0).max(100).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const ReservaMarketplaceSchema = ReservaMarketplaceBase;

// Schema para criação de reserva
export const CreateReservaMarketplaceSchema = ReservaMarketplaceBase.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualização de reserva
export const UpdateReservaMarketplaceSchema = ReservaMarketplaceBase.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema base para configurações do marketplace (ZodObject puro)
export const ConfiguracaoMarketplaceBase = z.object({
  id: z.string().uuid().optional(),
  unidade_id: z.string().uuid(),
  ativo: z.boolean().default(true),
  comissao_padrao: z.number().min(0).max(100).default(5.0),
  permitir_reservas_cross_unit: z.boolean().default(true),
  horario_funcionamento: z.record(z.any()).optional(),
  politicas_reserva: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const ConfiguracaoMarketplaceSchema = ConfiguracaoMarketplaceBase;

// Schema para criação de configuração
export const CreateConfiguracaoMarketplaceSchema = ConfiguracaoMarketplaceBase.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualização de configuração
export const UpdateConfiguracaoMarketplaceSchema = ConfiguracaoMarketplaceBase.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema para filtros de busca do marketplace
export const MarketplaceFiltersSchema = z.object({
  categoria: z.string().optional(),
  preco_min: z.number().min(0).optional(),
  preco_max: z.number().min(0).optional(),
  duracao_max: z.number().int().positive().optional(),
  unidade_id: z.string().uuid().optional(),
  destaque: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  disponivel: z.boolean().default(true),
});

// Schema para paginação do marketplace
export const MarketplacePaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z
    .enum(['nome_publico', 'preco_publico', 'duracao_min', 'created_at'])
    .default('nome_publico'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// Schema para resposta do catálogo público
export const CatalogoPublicoSchema = z.object({
  id: z.string().uuid(),
  nome_publico: z.string(),
  descricao_publica: z.string().nullable(),
  categoria_publica: z.string().nullable(),
  preco_publico: z.number(),
  duracao_min: z.number(),
  disponivel: z.boolean(),
  destaque: z.boolean(),
  tags: z.array(z.string()).nullable(),
  imagem_url: z.string().nullable(),
  unidade_nome: z.string(),
  unidade_endereco: z.string().nullable(),
  unidade_telefone: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Schema para resposta paginada do catálogo
export const CatalogoPaginadoSchema = z.object({
  data: z.array(CatalogoPublicoSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    total_pages: z.number(),
  }),
});

// =====================================================
// TIPOS INFERIDOS DOS SCHEMAS
// =====================================================

export type MarketplaceServico = z.infer<typeof MarketplaceServicoSchema>;
export type CreateMarketplaceServico = z.infer<typeof CreateMarketplaceServicoSchema>;
export type UpdateMarketplaceServico = z.infer<typeof UpdateMarketplaceServicoSchema>;
export type ReservaMarketplace = z.infer<typeof ReservaMarketplaceSchema>;
export type CreateReservaMarketplace = z.infer<typeof CreateReservaMarketplaceSchema>;
export type UpdateReservaMarketplace = z.infer<typeof UpdateReservaMarketplaceSchema>;
export type ConfiguracaoMarketplace = z.infer<typeof ConfiguracaoMarketplaceSchema>;
export type CreateConfiguracaoMarketplace = z.infer<typeof CreateConfiguracaoMarketplaceSchema>;
export type UpdateConfiguracaoMarketplace = z.infer<typeof UpdateConfiguracaoMarketplaceSchema>;
export type MarketplaceFilters = z.infer<typeof MarketplaceFiltersSchema>;
export type MarketplacePagination = z.infer<typeof MarketplacePaginationSchema>;
export type CatalogoPublico = z.infer<typeof CatalogoPublicoSchema>;
export type CatalogoPaginado = z.infer<typeof CatalogoPaginadoSchema>;
