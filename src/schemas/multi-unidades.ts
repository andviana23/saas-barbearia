import { z } from 'zod';

// =====================================================
// SCHEMAS PARA GESTÃO MULTI-UNIDADES
// =====================================================

// Schema base para permissões hierárquicas (ZodObject puro)
export const PermissaoHierarquicaBase = z.object({
  id: z.string().uuid().optional(),
  papel: z.enum(['owner', 'admin', 'gerente', 'profissional', 'operador', 'recepcao']),
  nivel_hierarquico: z.number().int().min(1).max(10),
  permissoes: z.record(z.string(), z.unknown()).default({}),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const PermissaoHierarquicaSchema = PermissaoHierarquicaBase;

// Schema para criação de permissão hierárquica
export const CreatePermissaoHierarquicaSchema = PermissaoHierarquicaBase.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualização de permissão hierárquica
export const UpdatePermissaoHierarquicaSchema = PermissaoHierarquicaBase.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema base para acessos multi-unidade (ZodObject puro)
export const AcessoMultiUnidadeBase = z.object({
  id: z.string().uuid().optional(),
  profile_id: z.string().uuid(),
  unidade_id: z.string().uuid(),
  papel_unidade: z.enum(['owner', 'admin', 'gerente', 'profissional', 'operador', 'recepcao']),
  permissoes_especificas: z.record(z.string(), z.unknown()).optional(),
  ativo: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const AcessoMultiUnidadeSchema = AcessoMultiUnidadeBase;

// Schema para criação de acesso multi-unidade
export const CreateAcessoMultiUnidadeSchema = AcessoMultiUnidadeBase.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualização de acesso multi-unidade
export const UpdateAcessoMultiUnidadeSchema = AcessoMultiUnidadeBase.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema base para auditoria de acessos (ZodObject puro)
export const AuditoriaAcessoBase = z.object({
  id: z.string().uuid().optional(),
  profile_id: z.string().uuid().optional(),
  unidade_id: z.string().uuid().optional(),
  acao: z.string().min(2, 'Ação deve ter pelo menos 2 caracteres'),
  recurso: z.string().min(2, 'Recurso deve ter pelo menos 2 caracteres'),
  dados_consultados: z.record(z.string(), z.unknown()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const AuditoriaAcessoSchema = AuditoriaAcessoBase;

// Schema para filtros de relatórios consolidados
export const RelatorioConsolidadoFiltersSchema = z.object({
  unidade_id: z.string().uuid().optional(),
  data_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),
  data_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),
  categoria: z.string().optional(),
  papel: z.enum(['owner', 'admin', 'gerente', 'profissional', 'operador', 'recepcao']).optional(),
  ativo: z.boolean().optional(),
});

// Schema para paginação de relatórios
export const RelatorioPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z
    .enum(['unidade_nome', 'total', 'faturamento_total', 'created_at'])
    .default('unidade_nome'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// Schema para resposta de faturamento consolidado
export const FaturamentoConsolidadoSchema = z.object({
  unidade_id: z.string().uuid(),
  unidade_nome: z.string(),
  total_agendamentos: z.number(),
  agendamentos_concluidos: z.number(),
  faturamento_total: z.number(),
  ticket_medio: z.number(),
  total_clientes: z.number(),
  total_profissionais: z.number(),
  mes_ano: z.string(),
});

// Schema para resposta de serviços consolidados
export const ServicosConsolidadoSchema = z.object({
  unidade_id: z.string().uuid(),
  unidade_nome: z.string(),
  categoria: z.string().nullable(),
  total_servicos: z.number(),
  preco_medio: z.number(),
  valor_total_catalogo: z.number(),
  servicos_unicos: z.number(),
});

// Schema para resposta de profissionais consolidados
export const ProfissionaisConsolidadoSchema = z.object({
  unidade_id: z.string().uuid(),
  unidade_nome: z.string(),
  papel: z.string(),
  total_profissionais: z.number(),
  profissionais_ativos: z.number(),
  profissionais_inativos: z.number(),
});

// Schema para resposta de permissões hierárquicas
export const PermissoesHierarquicasResponseSchema = z.object({
  data: z.array(PermissaoHierarquicaSchema),
  total: z.number(),
});

// Schema para resposta de acessos multi-unidade
export const AcessosMultiUnidadeResponseSchema = z.object({
  data: z.array(AcessoMultiUnidadeSchema),
  total: z.number(),
});

// Schema para resposta de auditoria
export const AuditoriaResponseSchema = z.object({
  data: z.array(AuditoriaAcessoSchema),
  total: z.number(),
});

// Schema para resposta de relatórios consolidados
export const RelatoriosConsolidadosResponseSchema = z.object({
  faturamento: z.array(FaturamentoConsolidadoSchema),
  servicos: z.array(ServicosConsolidadoSchema),
  profissionais: z.array(ProfissionaisConsolidadoSchema),
  total_unidades: z.number(),
  periodo: z.object({
    inicio: z.string(),
    fim: z.string(),
  }),
});

// Schema para exportação de dados
export const ExportacaoRelatorioSchema = z.object({
  formato: z.enum(['csv', 'json']),
  tipo_relatorio: z.enum(['faturamento', 'servicos', 'profissionais', 'completo']),
  filtros: RelatorioConsolidadoFiltersSchema,
  colunas: z.array(z.string()).optional(),
});

// Schema para configuração de permissões
export const ConfiguracaoPermissoesSchema = z.object({
  papel_origem: z.enum(['owner', 'admin', 'gerente', 'profissional', 'operador', 'recepcao']),
  papel_destino: z.enum(['owner', 'admin', 'gerente', 'profissional', 'operador', 'recepcao']),
  permissoes: z.array(z.string()),
  ativo: z.boolean().default(true),
});

// Schema para resposta de configuração de permissões
export const ConfiguracaoPermissoesResponseSchema = z.object({
  data: z.array(ConfiguracaoPermissoesSchema),
  total: z.number(),
});

// =====================================================
// TIPOS INFERIDOS DOS SCHEMAS
// =====================================================

export type PermissaoHierarquica = z.infer<typeof PermissaoHierarquicaSchema>;
export type CreatePermissaoHierarquica = z.infer<typeof CreatePermissaoHierarquicaSchema>;
export type UpdatePermissaoHierarquica = z.infer<typeof UpdatePermissaoHierarquicaSchema>;
export type AcessoMultiUnidade = z.infer<typeof AcessoMultiUnidadeSchema>;
export type CreateAcessoMultiUnidade = z.infer<typeof CreateAcessoMultiUnidadeSchema>;
export type UpdateAcessoMultiUnidade = z.infer<typeof UpdateAcessoMultiUnidadeSchema>;
export type AuditoriaAcesso = z.infer<typeof AuditoriaAcessoSchema>;
export type RelatorioConsolidadoFilters = z.infer<typeof RelatorioConsolidadoFiltersSchema>;
export type RelatorioPagination = z.infer<typeof RelatorioPaginationSchema>;
export type FaturamentoConsolidado = z.infer<typeof FaturamentoConsolidadoSchema>;
export type ServicosConsolidado = z.infer<typeof ServicosConsolidadoSchema>;
export type ProfissionaisConsolidado = z.infer<typeof ProfissionaisConsolidadoSchema>;
export type PermissoesHierarquicasResponse = z.infer<typeof PermissoesHierarquicasResponseSchema>;
export type AcessosMultiUnidadeResponse = z.infer<typeof AcessosMultiUnidadeResponseSchema>;
export type AuditoriaResponse = z.infer<typeof AuditoriaResponseSchema>;
export type RelatoriosConsolidadosResponse = z.infer<typeof RelatoriosConsolidadosResponseSchema>;
export type ExportacaoRelatorio = z.infer<typeof ExportacaoRelatorioSchema>;
export type ConfiguracaoPermissoes = z.infer<typeof ConfiguracaoPermissoesSchema>;
export type ConfiguracaoPermissoesResponse = z.infer<typeof ConfiguracaoPermissoesResponseSchema>;
