import { z } from 'zod';

// =====================================================
// SCHEMAS PARA LGPD COMPLIANCE
// =====================================================

// Schema para tipos de consentimento
export const TipoConsentimentoSchema = z.enum([
  'marketing',
  'analytics',
  'compartilhamento',
  'cookies',
  'tratamento_dados',
  'comunicacao',
  'localizacao',
  'biometria',
]);

// Schema base para consentimentos LGPD (ZodObject puro)
export const LGPDConsentimentoBase = z.object({
  id: z.string().uuid().optional(),
  profile_id: z.string().uuid(),
  unidade_id: z.string().uuid(),
  tipo_consentimento: TipoConsentimentoSchema,
  finalidade: z.string().min(10, 'Finalidade deve ter pelo menos 10 caracteres'),
  consentimento_dado: z.boolean(),
  data_consentimento: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  versao_termos: z.string().default('1.0'),
  revogado: z.boolean().default(false),
  data_revogacao: z.string().optional(),
  origem: z.enum(['web', 'mobile', 'api']).default('web'),
  dados_adicionais: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const LGPDConsentimentoSchema = LGPDConsentimentoBase;

// Schema para criação de consentimento
// Versão para criação: relaxada para aceitar ausência de campos que recebem defaults no backend/tests
export const CreateLGPDConsentimentoSchema = LGPDConsentimentoBase.omit({
  id: true,
  data_consentimento: true,
  data_revogacao: true,
  created_at: true,
  updated_at: true,
}).extend({
  // Permite que testes omitam estes campos (defaults serão aplicados)
  versao_termos: LGPDConsentimentoBase.shape.versao_termos.optional(),
  origem: LGPDConsentimentoBase.shape.origem.optional(),
  revogado: LGPDConsentimentoBase.shape.revogado.optional(),
});

// Schema para atualização de consentimento
export const UpdateLGPDConsentimentoSchema = LGPDConsentimentoBase.partial().omit({
  id: true,
  profile_id: true,
  unidade_id: true,
  tipo_consentimento: true,
  created_at: true,
  updated_at: true,
});

// Schema para tipos de solicitação LGPD
export const TipoSolicitacaoLGPDSchema = z.enum([
  'portabilidade',
  'exclusao',
  'correcao',
  'acesso',
  'oposicao',
  'restricao',
  'informacao',
]);

// Schema para status de solicitação
export const StatusSolicitacaoSchema = z.enum([
  'pendente',
  'em_analise',
  'atendida',
  'recusada',
  'cancelada',
]);

// Schema base para solicitações LGPD (ZodObject puro)
export const LGPDSolicitacaoBase = z.object({
  id: z.string().uuid().optional(),
  profile_id: z.string().uuid(),
  unidade_id: z.string().uuid(),
  tipo_solicitacao: TipoSolicitacaoLGPDSchema,
  status: StatusSolicitacaoSchema.default('pendente'),
  motivo: z.string().optional(),
  dados_solicitados: z.record(z.any()).optional(),
  resposta: z.string().optional(),
  arquivo_resposta_url: z.string().url().optional(),
  data_solicitacao: z.string().optional(),
  data_resposta: z.string().optional(),
  prazo_limite: z.string(),
  atendente_id: z.string().uuid().optional(),
  observacoes_internas: z.string().optional(),
  ip_address: z.string().optional(),
  protocolo: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const LGPDSolicitacaoSchema = LGPDSolicitacaoBase;

// Schema para criação de solicitação
export const CreateLGPDSolicitacaoSchema = LGPDSolicitacaoBase.omit({
  id: true,
  data_solicitacao: true,
  data_resposta: true,
  protocolo: true,
  status: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualização de solicitação
export const UpdateLGPDSolicitacaoSchema = LGPDSolicitacaoBase.partial().omit({
  id: true,
  profile_id: true,
  unidade_id: true,
  data_solicitacao: true,
  protocolo: true,
  created_at: true,
  updated_at: true,
});

// Schema para tipos de exclusão
export const TipoExclusaoSchema = z.enum(['soft', 'hard']);

// Schema para motivos de exclusão
export const MotivoExclusaoSchema = z.enum([
  'solicitacao_titular',
  'fim_finalidade',
  'revogacao_consentimento',
  'inatividade',
  'correcao_dados',
]);

// Schema para exclusões LGPD
export const LGPDExclusaoSchema = z.object({
  id: z.string().uuid().optional(),
  solicitacao_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  unidade_id: z.string().uuid(),
  tabela: z.string().min(1),
  registro_id: z.string().uuid(),
  tipo_exclusao: TipoExclusaoSchema.default('soft'),
  dados_excluidos: z.record(z.any()),
  data_exclusao: z.string().optional(),
  motivo_exclusao: MotivoExclusaoSchema.default('solicitacao_titular'),
  executado_por: z.string().uuid().optional(),
  reversivel: z.boolean().default(true),
  data_limite_reversao: z.string().optional(),
  observacoes: z.string().optional(),
});

// Schema para termos e políticas
export const TipoTermoSchema = z.enum([
  'termos_uso',
  'politica_privacidade',
  'politica_cookies',
  'aviso_lgpd',
  'consentimento_marketing',
]);

// Schema base para termos LGPD (ZodObject puro)
export const LGPDTermoBase = z.object({
  id: z.string().uuid().optional(),
  tipo: TipoTermoSchema,
  versao: z.string().min(1),
  titulo: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  conteudo: z.string().min(50, 'Conteúdo deve ter pelo menos 50 caracteres'),
  data_vigencia: z.string(),
  data_expiracao: z.string().optional(),
  ativo: z.boolean().default(true),
  obrigatorio: z.boolean().default(true),
  aplicavel_a: z.record(z.any()).optional(),
  idioma: z.string().default('pt-BR'),
  checksum: z.string(),
  aprovado_por: z.string().uuid().optional(),
  data_aprovacao: z.string().optional(),
  observacoes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const LGPDTermoSchema = LGPDTermoBase;

// Schema para criação de termo
export const CreateLGPDTermoSchema = LGPDTermoBase.omit({
  id: true,
  checksum: true,
  data_aprovacao: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualização de termo
export const UpdateLGPDTermoSchema = LGPDTermoBase.partial().omit({
  id: true,
  checksum: true,
  created_at: true,
  updated_at: true,
});

// Schema para logs de acesso
export const OperacaoAcessoSchema = z.enum(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXPORT']);

export const BaseLegalSchema = z.enum([
  'consentimento',
  'execucao_contrato',
  'obrigacao_legal',
  'interesse_legitimo',
  'protecao_vida',
  'exercicio_direitos',
]);

// Schema base para logs de acesso LGPD (ZodObject puro)
export const LGPDLogAcessoBase = z.object({
  id: z.string().uuid().optional(),
  profile_id: z.string().uuid(),
  unidade_id: z.string().uuid(),
  tabela_acessada: z.string().min(1),
  registro_id: z.string().uuid().optional(),
  operacao: OperacaoAcessoSchema,
  campos_acessados: z.array(z.string()).optional(),
  finalidade: z.string().min(5, 'Finalidade deve ter pelo menos 5 caracteres'),
  usuario_responsavel: z.string().uuid().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  origem: z.enum(['sistema', 'api', 'relatorio', 'backup']).default('sistema'),
  data_acesso: z.string().optional(),
  consentimento_validado: z.boolean().default(false),
  base_legal: BaseLegalSchema,
  observacoes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const LGPDLogAcessoSchema = LGPDLogAcessoBase;

// Schema para registro de acesso
export const RegistrarAcessoSchema = LGPDLogAcessoBase.omit({
  id: true,
  data_acesso: true,
  ip_address: true,
  user_agent: true,
  usuario_responsavel: true,
  created_at: true,
  updated_at: true,
});

// Schema para filtros de relatórios LGPD
export const LGPDFiltrosSchema = z.object({
  profile_id: z.string().uuid().optional(),
  unidade_id: z.string().uuid().optional(),
  tipo_consentimento: TipoConsentimentoSchema.optional(),
  tipo_solicitacao: TipoSolicitacaoLGPDSchema.optional(),
  status: StatusSolicitacaoSchema.optional(),
  data_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),
  data_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),
  revogado: z.boolean().optional(),
  ativo: z.boolean().optional(),
});

// Schema para paginação
export const LGPDPaginationSchema = z
  .object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sort_by: z
      .enum([
        'data_consentimento',
        'data_solicitacao',
        'prazo_limite',
        'data_exclusao',
        'created_at',
      ])
      .optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
  })
  .transform((v) => ({
    ...v,
    sort_by: v.sort_by || 'created_at',
    sort_order: v.sort_order || 'desc',
  }));

// Schema base para formulário de consentimento (ZodObject puro)
export const FormularioConsentimentoBase = z.object({
  consentimentos: z.array(
    z.object({
      tipo: TipoConsentimentoSchema,
      finalidade: z.string(),
      obrigatorio: z.boolean(),
      consentimento: z.boolean(),
    }),
  ),
  aceite_termos: z.boolean(),
  aceite_privacidade: z.boolean(),
  versao_termos: z.string().default('1.0'),
});

// Schema principal com refinements
export const FormularioConsentimentoSchema = FormularioConsentimentoBase.refine(
  (data) => data.aceite_termos === true,
  {
    message: 'É obrigatório aceitar os termos de uso',
    path: ['aceite_termos'],
  },
).refine((data) => data.aceite_privacidade === true, {
  message: 'É obrigatório aceitar a política de privacidade',
  path: ['aceite_privacidade'],
});

// Schema para solicitação de portabilidade
export const SolicitacaoPortabilidadeSchema = z.object({
  formato: z.enum(['json', 'csv', 'xml']).default('json'),
  dados_solicitados: z
    .array(
      z.enum([
        'dados_pessoais',
        'agendamentos',
        'pagamentos',
        'preferencias',
        'historico_servicos',
        'comunicacoes',
        'consentimentos',
      ]),
    )
    .min(1, 'Selecione pelo menos um tipo de dados'),
  motivo: z.string().min(10, 'Explique brevemente o motivo da solicitação'),
  email_entrega: z.string().email('Email deve ser válido'),
});

// Schema base para solicitação de exclusão (ZodObject puro)
export const SolicitacaoExclusaoBase = z.object({
  tipo_exclusao: z.enum(['parcial', 'completa']),
  dados_manter: z.array(z.string()).optional(),
  motivo: z.string().min(20, 'Explique detalhadamente o motivo da exclusão'),
  confirmo_exclusao: z.boolean(),
  ciente_irreversibilidade: z.boolean(),
});

// Schema principal com refinements
export const SolicitacaoExclusaoSchema = SolicitacaoExclusaoBase.refine(
  (data) => data.confirmo_exclusao === true,
  {
    message: 'É necessário confirmar a solicitação de exclusão',
    path: ['confirmo_exclusao'],
  },
).refine((data) => data.ciente_irreversibilidade === true, {
  message: 'É necessário estar ciente da irreversibilidade',
  path: ['ciente_irreversibilidade'],
});

// Schema para resposta de solicitação
export const RespostaSolicitacaoSchema = z.object({
  status: StatusSolicitacaoSchema,
  resposta: z.string().min(10, 'Resposta deve ter pelo menos 10 caracteres'),
  arquivo_resposta_url: z.string().url().optional(),
  observacoes_internas: z.string().optional(),
});

// Schema para relatório de conformidade
export const RelatorioConformidadeSchema = z.object({
  periodo_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodo_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  incluir_consentimentos: z.boolean().default(true),
  incluir_solicitacoes: z.boolean().default(true),
  incluir_exclusoes: z.boolean().default(true),
  incluir_logs: z.boolean().default(false),
  formato: z.enum(['pdf', 'excel', 'json']).default('pdf'),
  unidade_id: z.string().uuid().optional(),
});

// Schema para auditoria LGPD
export const AuditoriaLGPDSchema = z.object({
  entidade: z.string(), // tabela ou processo auditado
  evento: z.string(), // tipo de evento auditado
  detalhes: z.record(z.any()),
  conformidade: z.boolean(),
  observacoes: z.string().optional(),
  recomendacoes: z.array(z.string()).optional(),
  data_auditoria: z.string().optional(),
  auditor: z.string().uuid().optional(),
});

// Schema para configurações LGPD por unidade
export const ConfiguracaoLGPDSchema = z.object({
  unidade_id: z.string().uuid(),
  dpo_nome: z.string().optional(),
  dpo_email: z.string().email().optional(),
  dpo_telefone: z.string().optional(),
  prazo_resposta_dias: z.number().int().min(1).max(30).default(15),
  notificar_solicitacoes: z.boolean().default(true),
  auto_aprovacao_acesso: z.boolean().default(false),
  retenao_logs_dias: z.number().int().min(30).max(2555).default(1095), // 3 anos
  backup_dados_excluidos: z.boolean().default(true),
  configuracoes_adicionais: z.record(z.any()).optional(),
});

// =====================================================
// TIPOS INFERIDOS DOS SCHEMAS
// =====================================================

export type LGPDConsentimento = z.infer<typeof LGPDConsentimentoSchema>;
export type CreateLGPDConsentimento = z.infer<typeof CreateLGPDConsentimentoSchema>;
export type UpdateLGPDConsentimento = z.infer<typeof UpdateLGPDConsentimentoSchema>;

export type LGPDSolicitacao = z.infer<typeof LGPDSolicitacaoSchema>;
export type CreateLGPDSolicitacao = z.infer<typeof CreateLGPDSolicitacaoSchema>;
export type UpdateLGPDSolicitacao = z.infer<typeof UpdateLGPDSolicitacaoSchema>;

export type LGPDExclusao = z.infer<typeof LGPDExclusaoSchema>;
export type LGPDTermo = z.infer<typeof LGPDTermoSchema>;
export type CreateLGPDTermo = z.infer<typeof CreateLGPDTermoSchema>;
export type UpdateLGPDTermo = z.infer<typeof UpdateLGPDTermoSchema>;

export type LGPDLogAcesso = z.infer<typeof LGPDLogAcessoSchema>;
export type RegistrarAcesso = z.infer<typeof RegistrarAcessoSchema>;

export type LGPDFiltros = z.infer<typeof LGPDFiltrosSchema>;
export type LGPDPagination = z.infer<typeof LGPDPaginationSchema>;

export type FormularioConsentimento = z.infer<typeof FormularioConsentimentoSchema>;
export type SolicitacaoPortabilidade = z.infer<typeof SolicitacaoPortabilidadeSchema>;
export type SolicitacaoExclusao = z.infer<typeof SolicitacaoExclusaoSchema>;
export type RespostaSolicitacao = z.infer<typeof RespostaSolicitacaoSchema>;

export type RelatorioConformidade = z.infer<typeof RelatorioConformidadeSchema>;
export type AuditoriaLGPD = z.infer<typeof AuditoriaLGPDSchema>;
export type ConfiguracaoLGPD = z.infer<typeof ConfiguracaoLGPDSchema>;

// Tipos para as views
export type ConsentimentoAtivo = {
  profile_id: string;
  titular_nome: string;
  titular_email: string;
  unidade_id: string;
  unidade_nome: string;
  tipo_consentimento: string;
  finalidade: string;
  consentimento_dado: boolean;
  data_consentimento: string;
  versao_termos: string;
  revogado: boolean;
  data_revogacao: string | null;
};

export type SolicitacaoPendente = {
  id: string;
  protocolo: string;
  profile_id: string;
  solicitante_nome: string;
  solicitante_email: string;
  unidade_id: string;
  unidade_nome: string;
  tipo_solicitacao: string;
  status: string;
  data_solicitacao: string;
  prazo_limite: string;
  situacao_prazo: 'VENCIDO' | 'URGENTE' | 'NO_PRAZO';
  atendente_id: string | null;
  atendente_nome: string | null;
};

export type ExclusaoAuditoria = {
  id: string;
  profile_id: string;
  titular_nome: string;
  unidade_id: string;
  unidade_nome: string;
  tabela: string;
  tipo_exclusao: 'soft' | 'hard';
  data_exclusao: string;
  motivo_exclusao: string;
  reversivel: boolean;
  data_limite_reversao: string | null;
  status_reversao: 'IRREVERSIVEL' | 'REVERSIVEL' | 'PERMANENTE';
  executado_por_nome: string | null;
  solicitacao_protocolo: string | null;
};

// Tipos de resposta das actions
export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};
