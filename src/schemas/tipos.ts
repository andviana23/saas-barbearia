import { z } from 'zod';

// Schema base para todos os tipos
const baseTypeSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
  ordem: z.number().int().min(0, 'Ordem deve ser um número positivo').default(0),
});

// Tipos de Pagamento
export const tipoPagamentoSchema = baseTypeSchema.extend({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  taxa_percentual: z
    .number()
    .min(0, 'Taxa não pode ser negativa')
    .max(100, 'Taxa não pode ser maior que 100%'),
  taxa_fixa: z.number().min(0, 'Taxa fixa não pode ser negativa'),
  aceita_parcelamento: z.boolean(),
  max_parcelas: z
    .number()
    .int()
    .min(1, 'Máximo de parcelas deve ser pelo menos 1')
    .max(24, 'Máximo de 24 parcelas'),
  requer_autorizacao: z.boolean(),
  icon: z.string().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal')
    .optional(),
});

export const createTipoPagamentoSchema = tipoPagamentoSchema.omit({
  ordem: true,
});

export const updateTipoPagamentoSchema = tipoPagamentoSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Bandeiras de Cartão
export const tipoBandeiraSchema = baseTypeSchema.extend({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  taxa_percentual: z
    .number()
    .min(0, 'Taxa não pode ser negativa')
    .max(100, 'Taxa não pode ser maior que 100%')
    .default(0),
  logo_url: z.string().url('URL do logo inválida').optional(),
  cor_primaria: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal')
    .optional(),
  prefixo_cartao: z.string().optional(), // Ex: "4" para Visa, "5" para Mastercard
  comprimento_cartao: z.number().int().min(13).max(19).optional(),
});

export const createTipoBandeiraSchema = tipoBandeiraSchema.omit({
  ordem: true,
});

export const updateTipoBandeiraSchema = tipoBandeiraSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Categorias de Despesas
export const tipoDespesaSchema = baseTypeSchema.extend({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  categoria_pai_id: z.string().uuid().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal')
    .optional(),
  icon: z.string().optional(),
  centro_custo: z.string().max(50).optional(),
  obrigatoria: z.boolean().default(false),
  limite_mensal: z.number().min(0).optional(),
});

export const createTipoDespesaSchema = tipoDespesaSchema.omit({
  ordem: true,
});

export const updateTipoDespesaSchema = tipoDespesaSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Categorias de Receitas
export const tipoReceitaSchema = baseTypeSchema.extend({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  categoria_pai_id: z.string().uuid().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal')
    .optional(),
  icon: z.string().optional(),
  centro_resultado: z.string().max(50).optional(),
  meta_mensal: z.number().min(0).optional(),
  comissionavel: z.boolean().default(true),
  percentual_comissao: z
    .number()
    .min(0, 'Percentual não pode ser negativo')
    .max(100, 'Percentual não pode ser maior que 100%')
    .default(0),
});

export const createTipoReceitaSchema = tipoReceitaSchema.omit({
  ordem: true,
});

export const updateTipoReceitaSchema = tipoReceitaSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Categorias Gerais
export const tipoCategoriaSchema = baseTypeSchema.extend({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  tipo: z.enum(['CLIENTE', 'PRODUTO', 'SERVICO', 'PROFISSIONAL', 'GERAL']),
  categoria_pai_id: z.string().uuid().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal')
    .optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).default([]),
  configuracoes: z.record(z.string(), z.unknown()).default({}),
});

export const createTipoCategoriaSchema = tipoCategoriaSchema.omit({
  ordem: true,
});

export const updateTipoCategoriaSchema = tipoCategoriaSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Tipos de Conta
export const tipoContaSchema = baseTypeSchema.extend({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  tipo: z.enum(['BANCO', 'CARTEIRA', 'INVESTIMENTO', 'POUPANCA', 'CREDITO']),
  instituicao: z.string().max(100).optional(),
  agencia: z.string().max(10).optional(),
  conta: z.string().max(20).optional(),
  digito: z.string().max(2).optional(),
  saldo_inicial: z.number().default(0),
  limite_credito: z.number().min(0).default(0),
  permite_saldo_negativo: z.boolean().default(false),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal')
    .optional(),
  icon: z.string().optional(),
});

export const createTipoContaSchema = tipoContaSchema.omit({
  ordem: true,
  saldo_inicial: true,
});

export const updateTipoContaSchema = tipoContaSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Types TypeScript
export type TipoPagamento = z.infer<typeof tipoPagamentoSchema>;
export type CreateTipoPagamento = z.infer<typeof createTipoPagamentoSchema>;
export type UpdateTipoPagamento = z.infer<typeof updateTipoPagamentoSchema>;

export type TipoBandeira = z.infer<typeof tipoBandeiraSchema>;
export type CreateTipoBandeira = z.infer<typeof createTipoBandeiraSchema>;
export type UpdateTipoBandeira = z.infer<typeof updateTipoBandeiraSchema>;

export type TipoDespesa = z.infer<typeof tipoDespesaSchema>;
export type CreateTipoDespesa = z.infer<typeof createTipoDespesaSchema>;
export type UpdateTipoDespesa = z.infer<typeof updateTipoDespesaSchema>;

export type TipoReceita = z.infer<typeof tipoReceitaSchema>;
export type CreateTipoReceita = z.infer<typeof createTipoReceitaSchema>;
export type UpdateTipoReceita = z.infer<typeof updateTipoReceitaSchema>;

export type TipoCategoria = z.infer<typeof tipoCategoriaSchema>;
export type CreateTipoCategoria = z.infer<typeof createTipoCategoriaSchema>;
export type UpdateTipoCategoria = z.infer<typeof updateTipoCategoriaSchema>;

export type TipoConta = z.infer<typeof tipoContaSchema>;
export type CreateTipoConta = z.infer<typeof createTipoContaSchema>;
export type UpdateTipoConta = z.infer<typeof updateTipoContaSchema>;

// Schemas para listagem com filtros
export const listTiposFilterSchema = z.object({
  ativo: z.boolean().optional(),
  search: z.string().optional(),
  tipo: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type ListTiposFilter = z.infer<typeof listTiposFilterSchema>;
