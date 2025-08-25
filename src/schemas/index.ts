import { z } from 'zod'

// Schema base para validações
export const BaseSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  created_at: z
    .string()
    .datetime('Data de criação deve ser um datetime válido'),
  updated_at: z
    .string()
    .datetime('Data de atualização deve ser um datetime válido'),
})

// Schema para unidade_id (multi-tenancy)
export const UnidadeSchema = z.object({
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
})

// Validação de telefone brasileiro
const telefoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)(\d{4,5}\-?\d{4})$/
export const TelefoneSchema = z
  .string()
  .regex(telefoneRegex, 'Telefone deve estar no formato brasileiro válido')
  .transform((val) => val.replace(/\D/g, ''))

// Validação de CNPJ
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/
export const CNPJSchema = z
  .string()
  .regex(cnpjRegex, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
  .transform((val) => val.replace(/\D/g, ''))

// Schema para Unidade
export const CreateUnidadeSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cnpj: CNPJSchema.optional(),
  endereco: z
    .string()
    .max(255, 'Endereço deve ter no máximo 255 caracteres')
    .optional(),
  telefone: TelefoneSchema.optional(),
  email: z.string().email('Email deve ser válido').toLowerCase().optional(),
  config: z.record(z.any()).default({}),
  ativo: z.boolean().default(true),
})

export const UpdateUnidadeSchema = CreateUnidadeSchema.partial()

// Schema para Profile
export const CreateProfileSchema = z.object({
  user_id: z.string().uuid('ID do usuário deve ser um UUID válido'),
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email deve ser válido').toLowerCase(),
  telefone: TelefoneSchema.optional(),
  unidade_default_id: z
    .string()
    .uuid('ID da unidade padrão deve ser um UUID válido')
    .optional(),
  papel: z
    .enum(['admin', 'gestor', 'profissional', 'recepcao'], {
      errorMap: () => ({
        message: 'Papel deve ser admin, gestor, profissional ou recepcao',
      }),
    })
    .default('profissional'),
  ativo: z.boolean().default(true),
})

export const UpdateProfileSchema = CreateProfileSchema.partial().omit({
  user_id: true,
})

// Schema para Client (será usado no sistema)
export const CreateClientSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email deve ser válido').toLowerCase().optional(),
  telefone: TelefoneSchema,
  data_nascimento: z
    .string()
    .datetime('Data de nascimento deve ser válida')
    .optional(),
  observacoes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  ativo: z.boolean().default(true),
})

export const UpdateClientSchema = CreateClientSchema.partial().omit({
  unidade_id: true,
})

// Schema para busca/filtros
export const SearchSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Schema com valores padrão aplicados (para uso em casos onde defaults são obrigatórios)
export const SearchSchemaWithDefaults = SearchSchema.required({
  page: true,
  limit: true,
  order: true,
})

// Schema para filtros específicos
export const UnidadeFilterSchema = SearchSchemaWithDefaults.extend({
  ativo: z.coerce.boolean().optional(),
})

export const ProfileFilterSchema = SearchSchemaWithDefaults.extend({
  papel: z.enum(['admin', 'gestor', 'profissional', 'recepcao']).optional(),
  ativo: z.coerce.boolean().optional(),
  unidade_id: z.string().uuid().optional(),
})

// Tipos inferidos dos schemas
export type CreateUnidadeData = z.infer<typeof CreateUnidadeSchema>
export type UpdateUnidadeData = z.infer<typeof UpdateUnidadeSchema>
export type CreateProfileData = z.infer<typeof CreateProfileSchema>
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>
export type CreateClientData = z.infer<typeof CreateClientSchema>
export type UpdateClientData = z.infer<typeof UpdateClientSchema>
// Schema para Produto
export const CreateProdutoSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  preco: z
    .number()
    .min(0, 'Preço deve ser maior ou igual a zero')
    .max(99999.99, 'Preço deve ser menor que 100.000'),
  estoque: z
    .number()
    .int('Estoque deve ser um número inteiro')
    .min(0, 'Estoque não pode ser negativo')
    .default(0),
  ativo: z.boolean().default(true),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
})

export const UpdateProdutoSchema = CreateProdutoSchema.partial().omit({
  unidade_id: true,
})

// Schema para Venda
export const CreateVendaSchema = z.object({
  cliente_id: z
    .string()
    .uuid('ID do cliente deve ser um UUID válido')
    .optional(),
  profissional_id: z
    .string()
    .uuid('ID do profissional deve ser um UUID válido')
    .optional(),
  valor_total: z
    .number()
    .min(0, 'Valor total deve ser maior ou igual a zero')
    .default(0),
  status: z
    .enum(['aberta', 'paga', 'cancelada'], {
      errorMap: () => ({
        message: 'Status deve ser aberta, paga ou cancelada',
      }),
    })
    .default('aberta'),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
})

export const UpdateVendaSchema = CreateVendaSchema.partial().omit({
  unidade_id: true,
})

// Schema para Item de Venda
export const CreateVendaItemSchema = z.object({
  venda_id: z.string().uuid('ID da venda deve ser um UUID válido'),
  produto_id: z.string().uuid('ID do produto deve ser um UUID válido'),
  quantidade: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade deve ser pelo menos 1'),
  preco_unitario: z
    .number()
    .min(0, 'Preço unitário deve ser maior ou igual a zero'),
})

export const UpdateVendaItemSchema = CreateVendaItemSchema.partial()

// Filtros específicos para produtos
export const ProdutoFilterSchema = SearchSchemaWithDefaults.extend({
  ativo: z.coerce.boolean().optional(),
  unidade_id: z.string().uuid().optional(),
  preco_min: z.coerce.number().min(0).optional(),
  preco_max: z.coerce.number().min(0).optional(),
})

// Filtros específicos para vendas
export const VendaFilterSchema = SearchSchemaWithDefaults.extend({
  status: z.enum(['aberta', 'paga', 'cancelada']).optional(),
  unidade_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
  profissional_id: z.string().uuid().optional(),
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional(),
})

// Tipos inferidos dos schemas
export type CreateProdutoData = z.infer<typeof CreateProdutoSchema>
export type UpdateProdutoData = z.infer<typeof UpdateProdutoSchema>
export type CreateVendaData = z.infer<typeof CreateVendaSchema>
export type UpdateVendaData = z.infer<typeof UpdateVendaSchema>
export type CreateVendaItemData = z.infer<typeof CreateVendaItemSchema>
export type UpdateVendaItemData = z.infer<typeof UpdateVendaItemSchema>
export type ProdutoFilterData = z.infer<typeof ProdutoFilterSchema>
export type VendaFilterData = z.infer<typeof VendaFilterSchema>
export type SearchData = z.infer<typeof SearchSchema>
export type UnidadeFilterData = z.infer<typeof UnidadeFilterSchema>
export type ProfileFilterData = z.infer<typeof ProfileFilterSchema>

// ========================================
// SCHEMAS PARA PROFISSIONAIS
// ========================================

// Schema para criar profissional
export const CreateProfissionalSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  papel: z
    .string()
    .min(2, 'Papel deve ter pelo menos 2 caracteres')
    .max(50, 'Papel deve ter no máximo 50 caracteres'),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  ativo: z.boolean().default(true),
  comissao_regra: z
    .object({
      tipo: z.enum(['fixo', 'percentual', 'hibrido']),
      valor: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      percentual: z.number().min(0).max(100).optional(),
      valor_minimo: z.number().min(0).optional(),
    })
    .optional(),
})

export const UpdateProfissionalSchema = CreateProfissionalSchema.partial().omit(
  {
    unidade_id: true,
  }
)

// Schema para horários de trabalho dos profissionais
export const CreateHorarioProfissionalSchema = z
  .object({
    profissional_id: z
      .string()
      .uuid('ID do profissional deve ser um UUID válido'),
    dia_semana: z
      .number()
      .int('Dia da semana deve ser um número inteiro')
      .min(0, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)')
      .max(6, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)'),
    hora_inicio: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Hora de início deve estar no formato HH:MM'
      ),
    hora_fim: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Hora de fim deve estar no formato HH:MM'
      ),
    intervalo_inicio: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Hora de início do intervalo deve estar no formato HH:MM'
      )
      .optional(),
    intervalo_fim: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Hora de fim do intervalo deve estar no formato HH:MM'
      )
      .optional(),
    ativo: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Validar que hora_fim é maior que hora_inicio
      const inicio = data.hora_inicio.split(':').map(Number)
      const fim = data.hora_fim.split(':').map(Number)
      const inicioMinutos = inicio[0] * 60 + inicio[1]
      const fimMinutos = fim[0] * 60 + fim[1]

      return fimMinutos > inicioMinutos
    },
    {
      message: 'Hora de fim deve ser posterior à hora de início',
      path: ['hora_fim'],
    }
  )
  .refine(
    (data) => {
      // Validar intervalo se fornecido
      if (data.intervalo_inicio && data.intervalo_fim) {
        const intervaloInicio = data.intervalo_inicio.split(':').map(Number)
        const intervaloFim = data.intervalo_fim.split(':').map(Number)
        const intervaloInicioMinutos =
          intervaloInicio[0] * 60 + intervaloInicio[1]
        const intervaloFimMinutos = intervaloFim[0] * 60 + intervaloFim[1]

        return intervaloFimMinutos > intervaloInicioMinutos
      }
      return true
    },
    {
      message:
        'Hora de fim do intervalo deve ser posterior à hora de início do intervalo',
      path: ['intervalo_fim'],
    }
  )

export const UpdateHorarioProfissionalSchema = z
  .object({
    dia_semana: z
      .number()
      .int('Dia da semana deve ser um número inteiro')
      .min(0, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)')
      .max(6, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)')
      .optional(),
    hora_inicio: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Hora de início deve estar no formato HH:MM'
      )
      .optional(),
    hora_fim: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Hora de fim deve estar no formato HH:MM'
      )
      .optional(),
    intervalo_inicio: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Hora de início do intervalo deve estar no formato HH:MM'
      )
      .optional(),
    intervalo_fim: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Hora de fim do intervalo deve estar no formato HH:MM'
      )
      .optional(),
    ativo: z.boolean().optional(),
  })
  .optional()

// Filtros específicos para profissionais
export const ProfissionalFilterSchema = SearchSchemaWithDefaults.extend({
  ativo: z.coerce.boolean().optional(),
  unidade_id: z.string().uuid().optional(),
  papel: z.string().optional(),
})

// Filtros para horários
export const HorarioProfissionalFilterSchema = SearchSchemaWithDefaults.extend({
  profissional_id: z.string().uuid().optional(),
  dia_semana: z.coerce.number().min(0).max(6).optional(),
  ativo: z.coerce.boolean().optional(),
})

// Tipos inferidos dos schemas
export type CreateProfissionalData = z.infer<typeof CreateProfissionalSchema>
export type UpdateProfissionalData = z.infer<typeof UpdateProfissionalSchema>
export type CreateHorarioProfissionalData = z.infer<
  typeof CreateHorarioProfissionalSchema
>
export type UpdateHorarioProfissionalData = z.infer<
  typeof UpdateHorarioProfissionalSchema
>
export type ProfissionalFilterData = z.infer<typeof ProfissionalFilterSchema>
export type HorarioProfissionalFilterData = z.infer<
  typeof HorarioProfissionalFilterSchema
>

// ========================================
// SCHEMAS PARA CLIENTES
// ========================================

// Schema para criação de cliente
export const CreateClienteSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email deve ser válido').toLowerCase().optional(),
  telefone: TelefoneSchema.optional(),
  data_nascimento: z.string().optional().or(z.literal('')),
  observacoes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
  ativo: z.boolean().default(true),
})

export const UpdateClienteSchema = CreateClienteSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

// Tipos inferidos
export type CreateClienteData = z.infer<typeof CreateClienteSchema>
export type UpdateClienteData = z.infer<typeof UpdateClienteSchema>

// ========================================
// SCHEMAS COMPLEMENTARES PARA CLIENTES
// ========================================

// Filtros específicos para clientes
export const ClientFilterSchema = SearchSchemaWithDefaults.extend({
  ativo: z.coerce.boolean().optional(),
  unidade_id: z.string().uuid().optional(),
  data_nascimento_inicio: z.string().datetime().optional(),
  data_nascimento_fim: z.string().datetime().optional(),
  tem_email: z.coerce.boolean().optional(), // Filtrar clientes com/sem email
})

// Schema para histórico de atendimentos
export const HistoricoClienteFilterSchema = SearchSchemaWithDefaults.extend({
  cliente_id: z.string().uuid('ID do cliente deve ser um UUID válido'),
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional(),
  profissional_id: z.string().uuid().optional(),
  status: z
    .enum([
      'criado',
      'confirmado',
      'em_atendimento',
      'concluido',
      'cancelado',
      'faltou',
    ])
    .optional(),
})

// Schema para importação CSV de clientes
export const ImportClientCSVSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  data_nascimento: z.string().optional().or(z.literal('')),
  observacoes: z.string().max(500).optional().or(z.literal('')),
})

// Schema para preferências do cliente
export const ClientPreferenceSchema = z.object({
  profissional_preferido_id: z.string().uuid().optional(),
  servicos_favoritos: z.array(z.string().uuid()).default([]),
  horario_preferido: z.enum(['manha', 'tarde', 'noite']).optional(),
  dia_semana_preferido: z.number().min(0).max(6).optional(),
  observacoes_preferencias: z.string().max(300).optional(),
})

// Tipos inferidos dos schemas
export type ClientFilterData = z.infer<typeof ClientFilterSchema>
export type HistoricoClienteFilterData = z.infer<
  typeof HistoricoClienteFilterSchema
>
export type ImportClientCSVData = z.infer<typeof ImportClientCSVSchema>
export type ClientPreferenceData = z.infer<typeof ClientPreferenceSchema>

// ========================================
// SCHEMAS PARA SERVIÇOS E CATEGORIAS
// ========================================

// Schema para categoria de serviços
export const CreateCategoriaServicoSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  cor: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'Cor deve estar no formato hexadecimal (#RRGGBB)'
    )
    .optional(),
  icone: z
    .string()
    .max(50, 'Nome do ícone deve ter no máximo 50 caracteres')
    .optional(),
  ordem: z
    .number()
    .int('Ordem deve ser um número inteiro')
    .min(0, 'Ordem deve ser maior ou igual a zero')
    .default(0),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  ativo: z.boolean().default(true),
})

export const UpdateCategoriaServicoSchema =
  CreateCategoriaServicoSchema.partial().omit({
    unidade_id: true,
  })

// Schema para serviços
export const CreateServicoSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  categoria: z
    .string()
    .min(2, 'Categoria deve ter pelo menos 2 caracteres')
    .max(50, 'Categoria deve ter no máximo 50 caracteres')
    .optional(),
  categoria_id: z
    .string()
    .uuid('ID da categoria deve ser um UUID válido')
    .optional(),
  preco: z
    .number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(99999.99, 'Preço deve ser menor que 100.000'),
  duracao_min: z
    .number()
    .int('Duração deve ser um número inteiro')
    .min(1, 'Duração deve ser pelo menos 1 minuto')
    .max(1440, 'Duração deve ser no máximo 24 horas (1440 min)'),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  ativo: z.boolean().default(true),
})

export const UpdateServicoSchema = CreateServicoSchema.partial().omit({
  unidade_id: true,
})

// Schema para preços customizados por profissional
export const CreatePrecoCustomizadoSchema = z.object({
  servico_id: z.string().uuid('ID do serviço deve ser um UUID válido'),
  profissional_id: z
    .string()
    .uuid('ID do profissional deve ser um UUID válido'),
  preco_customizado: z
    .number()
    .min(0.01, 'Preço customizado deve ser maior que zero')
    .max(99999.99, 'Preço deve ser menor que 100.000'),
  duracao_customizada: z
    .number()
    .int('Duração customizada deve ser um número inteiro')
    .min(1, 'Duração deve ser pelo menos 1 minuto')
    .max(1440, 'Duração deve ser no máximo 24 horas (1440 min)')
    .optional(),
  ativo: z.boolean().default(true),
})

export const UpdatePrecoCustomizadoSchema =
  CreatePrecoCustomizadoSchema.partial().omit({
    servico_id: true,
    profissional_id: true,
  })

// Filtros específicos para serviços
export const ServicoFilterSchema = SearchSchemaWithDefaults.extend({
  ativo: z.coerce.boolean().optional(),
  unidade_id: z.string().uuid().optional(),
  categoria: z.string().optional(),
  categoria_id: z.string().uuid().optional(),
  preco_min: z.coerce.number().min(0).optional(),
  preco_max: z.coerce.number().min(0).optional(),
  duracao_min: z.coerce.number().min(1).optional(),
  duracao_max: z.coerce.number().min(1).optional(),
})

// Filtros para categorias de serviços
export const CategoriaServicoFilterSchema = SearchSchemaWithDefaults.extend({
  ativo: z.coerce.boolean().optional(),
  unidade_id: z.string().uuid().optional(),
})

// Filtros para preços customizados
export const PrecoCustomizadoFilterSchema = SearchSchemaWithDefaults.extend({
  servico_id: z.string().uuid().optional(),
  profissional_id: z.string().uuid().optional(),
  ativo: z.coerce.boolean().optional(),
})

// Schema para aplicação de serviço em agendamento (histórico)
export const ServicoAplicadoSchema = z.object({
  servico_id: z.string().uuid('ID do serviço deve ser um UUID válido'),
  preco_aplicado: z
    .number()
    .min(0.01, 'Preço aplicado deve ser maior que zero'),
  duracao_aplicada: z
    .number()
    .int('Duração aplicada deve ser um número inteiro')
    .min(1, 'Duração deve ser pelo menos 1 minuto'),
})

// Schema para cálculo de preço e duração final
export const CalculoServicoSchema = z.object({
  servico_id: z.string().uuid('ID do serviço deve ser um UUID válido'),
  profissional_id: z
    .string()
    .uuid('ID do profissional deve ser um UUID válido'),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
})

// Tipos inferidos dos schemas
export type CreateCategoriaServicoData = z.infer<
  typeof CreateCategoriaServicoSchema
>
export type UpdateCategoriaServicoData = z.infer<
  typeof UpdateCategoriaServicoSchema
>
export type CreateServicoData = z.infer<typeof CreateServicoSchema>
export type UpdateServicoData = z.infer<typeof UpdateServicoSchema>
export type CreatePrecoCustomizadoData = z.infer<
  typeof CreatePrecoCustomizadoSchema
>
export type UpdatePrecoCustomizadoData = z.infer<
  typeof UpdatePrecoCustomizadoSchema
>
export type ServicoFilterData = z.infer<typeof ServicoFilterSchema>
export type CategoriaServicoFilterData = z.infer<
  typeof CategoriaServicoFilterSchema
>
export type PrecoCustomizadoFilterData = z.infer<
  typeof PrecoCustomizadoFilterSchema
>
export type ServicoAplicadoData = z.infer<typeof ServicoAplicadoSchema>
export type CalculoServicoData = z.infer<typeof CalculoServicoSchema>

// ========================================
// SCHEMAS PARA AGENDAMENTOS
// ========================================

// Enum para status de agendamento
export const AppointmentStatusSchema = z.enum([
  'criado',
  'confirmado',
  'em_atendimento',
  'concluido',
  'cancelado',
  'faltou',
])

// Schema para servico do agendamento
export const AppointmentServicoSchema = z.object({
  servico_id: z.string().uuid('ID do serviço deve ser um UUID válido'),
  preco_aplicado: z
    .number()
    .min(0.01, 'Preço aplicado deve ser maior que zero')
    .max(99999.99, 'Preço aplicado muito alto'),
  duracao_aplicada: z
    .number()
    .int('Duração deve ser um número inteiro')
    .min(1, 'Duração deve ser pelo menos 1 minuto')
    .max(1440, 'Duração não pode exceder 24 horas'),
})

// Schema para criar agendamento
export const CreateAppointmentSchema = z
  .object({
    cliente_id: z.string().uuid('ID do cliente deve ser um UUID válido'),
    profissional_id: z
      .string()
      .uuid('ID do profissional deve ser um UUID válido'),
    unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
    inicio: z.date({
      errorMap: () => ({ message: 'Data/hora de início é obrigatória' }),
    }),
    servicos: z
      .array(AppointmentServicoSchema)
      .min(1, 'Pelo menos um serviço deve ser selecionado')
      .max(10, 'Máximo de 10 serviços por agendamento'),
    notas: z
      .string()
      .max(1000, 'Notas devem ter no máximo 1000 caracteres')
      .optional(),
  })
  .refine(
    (data) => {
      // Validar se a data/hora de início é no futuro (pelo menos 5 minutos)
      const agora = new Date()
      const cincoPaciatoMinutos = new Date(agora.getTime() + 5 * 60 * 1000)
      return data.inicio >= cincoPaciatoMinutos
    },
    {
      message:
        'Agendamento deve ser feito com pelo menos 5 minutos de antecedência',
      path: ['inicio'],
    }
  )
  .refine(
    (data) => {
      // Validar horário de funcionamento (6h às 22h)
      const hora = data.inicio.getHours()
      return hora >= 6 && hora < 22
    },
    {
      message: 'Agendamento deve ser entre 6h e 22h',
      path: ['inicio'],
    }
  )

// Schema para reagendar agendamento
export const RescheduleAppointmentSchema = z
  .object({
    id: z.string().uuid('ID do agendamento deve ser um UUID válido'),
    novo_inicio: z.date({
      errorMap: () => ({ message: 'Nova data/hora de início é obrigatória' }),
    }),
    profissional_id: z
      .string()
      .uuid('ID do profissional deve ser um UUID válido')
      .optional(),
    notas_reagendamento: z
      .string()
      .max(500, 'Notas do reagendamento devem ter no máximo 500 caracteres')
      .optional(),
  })
  .refine(
    (data) => {
      // Validar se a nova data/hora é no futuro (pelo menos 5 minutos)
      const agora = new Date()
      const cincoMinutos = new Date(agora.getTime() + 5 * 60 * 1000)
      return data.novo_inicio >= cincoMinutos
    },
    {
      message:
        'Reagendamento deve ser feito com pelo menos 5 minutos de antecedência',
      path: ['novo_inicio'],
    }
  )

// Schema para atualizar status do agendamento
export const UpdateAppointmentStatusSchema = z.object({
  id: z.string().uuid('ID do agendamento deve ser um UUID válido'),
  status: AppointmentStatusSchema,
  notas_status: z
    .string()
    .max(500, 'Notas do status devem ter no máximo 500 caracteres')
    .optional(),
})

// Schema para cancelar agendamento
export const CancelAppointmentSchema = z.object({
  id: z.string().uuid('ID do agendamento deve ser um UUID válido'),
  motivo_cancelamento: z
    .string()
    .min(3, 'Motivo deve ter pelo menos 3 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres'),
  cancelado_por: z.enum(['cliente', 'barbeiro', 'sistema']),
})

// Schema para filtrar agendamentos
export const AppointmentFilterSchema = z.object({
  unidade_id: z.string().uuid().optional(),
  profissional_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
  status: z.array(AppointmentStatusSchema).optional(),
  data_inicio: z.date().optional(),
  data_fim: z.date().optional(),
  busca: z.string().optional(), // busca no nome do cliente ou observações
  ordenacao: z.enum(['inicio_asc', 'inicio_desc', 'criado_desc']),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
})

// Schema para verificar disponibilidade
export const CheckDisponibilidadeSchema = z.object({
  profissional_id: z
    .string()
    .uuid('ID do profissional deve ser um UUID válido'),
  data: z.date({
    errorMap: () => ({ message: 'Data é obrigatória' }),
  }),
  duracao_minutos: z
    .number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima de 15 minutos')
    .max(480, 'Duração máxima de 8 horas'),
  agendamento_id: z.string().uuid().optional(), // Para excluir ao reagendar
})

// Schema para horários disponíveis
export const HorarioDisponivelSchema = z.object({
  inicio: z.date(),
  fim: z.date(),
  disponivel: z.boolean(),
})

// Schema para estatísticas de agendamentos
export const AgendamentoStatsSchema = z.object({
  periodo: z.enum(['hoje', 'semana', 'mes', 'ano']),
  unidade_id: z.string().uuid().optional(),
  profissional_id: z.string().uuid().optional(),
})

// Tipos inferidos dos schemas
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>
export type AppointmentServicoData = z.infer<typeof AppointmentServicoSchema>
export type CreateAppointmentData = z.infer<typeof CreateAppointmentSchema>
export type RescheduleAppointmentData = z.infer<
  typeof RescheduleAppointmentSchema
>
export type UpdateAppointmentStatusData = z.infer<
  typeof UpdateAppointmentStatusSchema
>
export type CancelAppointmentData = z.infer<typeof CancelAppointmentSchema>
export type AppointmentFilterData = z.infer<typeof AppointmentFilterSchema>
export type CheckDisponibilidadeData = z.infer<
  typeof CheckDisponibilidadeSchema
>
export type HorarioDisponivelData = z.infer<typeof HorarioDisponivelSchema>
export type AgendamentoStatsData = z.infer<typeof AgendamentoStatsSchema>

// =====================================================
// SCHEMAS PARA SISTEMA DE FILA (EP8)
// =====================================================

// Schema para status da fila
export const QueueStatusSchema = z.enum(
  ['aguardando', 'chamado', 'em_atendimento', 'concluido', 'desistiu'],
  {
    errorMap: () => ({
      message:
        'Status deve ser aguardando, chamado, em_atendimento, concluido ou desistiu',
    }),
  }
)

// Schema para prioridade da fila
export const QueuePrioritySchema = z.enum(
  ['normal', 'prioritaria', 'urgente'],
  {
    errorMap: () => ({
      message: 'Prioridade deve ser normal, prioritaria ou urgente',
    }),
  }
)

// Schema para criar item na fila
export const CreateFilaSchema = z.object({
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  cliente_id: z.string().uuid('ID do cliente deve ser um UUID válido'),
  prioridade: QueuePrioritySchema.default('normal'),
  estimativa_min: z
    .number()
    .int('Estimativa deve ser um número inteiro')
    .min(0, 'Estimativa deve ser maior ou igual a 0')
    .max(480, 'Estimativa máxima de 8 horas')
    .optional(),
  observacoes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
})

// Schema para atualizar item da fila
export const UpdateFilaSchema = z.object({
  id: z.string().uuid('ID da fila deve ser um UUID válido'),
  status: QueueStatusSchema.optional(),
  prioridade: QueuePrioritySchema.optional(),
  estimativa_min: z
    .number()
    .int('Estimativa deve ser um número inteiro')
    .min(0, 'Estimativa deve ser maior ou igual a 0')
    .max(480, 'Estimativa máxima de 8 horas')
    .optional(),
  observacoes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
})

// Schema para filtrar itens da fila
export const FilaFilterSchema = z.object({
  unidade_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
  status: z.array(QueueStatusSchema).optional(),
  prioridade: z.array(QueuePrioritySchema).optional(),
  busca: z.string().optional(), // busca no nome do cliente
  ordenacao: z
    .enum(['posicao_asc', 'posicao_desc', 'prioridade_desc', 'criado_desc'])
    .default('posicao_asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Schema para chamar próximo da fila
export const ChamarProximoFilaSchema = z.object({
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  profissional_id: z
    .string()
    .uuid('ID do profissional deve ser um UUID válido'),
})

// Schema para remover da fila
export const RemoverFilaSchema = z.object({
  id: z.string().uuid('ID da fila deve ser um UUID válido'),
  motivo: z
    .string()
    .min(3, 'Motivo deve ter pelo menos 3 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres'),
  removido_por: z
    .enum(['cliente', 'profissional', 'recepcao', 'sistema'])
    .default('sistema'),
})

// Schema para estimativa de espera
export const EstimativaEsperaSchema = z.object({
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  cliente_id: z.string().uuid('ID do cliente deve ser um UUID válido'),
})

// Schema para estatísticas da fila
export const FilaStatsSchema = z.object({
  unidade_id: z.string().uuid().optional(),
  periodo: z.enum(['hoje', 'semana', 'mes']).default('hoje'),
})

// Tipos para sistema de fila
export type QueueStatus = z.infer<typeof QueueStatusSchema>
export type QueuePriority = z.infer<typeof QueuePrioritySchema>
export type CreateFilaData = z.infer<typeof CreateFilaSchema>
export type UpdateFilaData = z.infer<typeof UpdateFilaSchema>
export type FilaFilterData = z.infer<typeof FilaFilterSchema>
export type ChamarProximoFilaData = z.infer<typeof ChamarProximoFilaSchema>
export type RemoverFilaData = z.infer<typeof RemoverFilaSchema>
export type EstimativaEsperaData = z.infer<typeof EstimativaEsperaSchema>
export type FilaStatsData = z.infer<typeof FilaStatsSchema>

// =====================================================
// SCHEMAS PARA GESTÃO FINANCEIRA (EP9)
// =====================================================

// Schema para tipo de movimento
export const MovimentoTipoSchema = z.enum(['entrada', 'saida'], {
  errorMap: () => ({
    message: 'Tipo deve ser entrada ou saida',
  }),
})

// Schema para origem do movimento
export const MovimentoOrigemSchema = z.enum(
  [
    'venda_produto',
    'agendamento',
    'servico_avulso',
    'comissao',
    'despesa_geral',
    'taxa_cartao',
    'pix',
    'dinheiro',
    'cartao_credito',
    'cartao_debito',
    'transferencia',
    'estorno',
    'ajuste',
    'outros',
  ],
  {
    errorMap: () => ({
      message: 'Origem do movimento inválida',
    }),
  }
)

// Schema para criar movimentação financeira
export const CreateMovimentacaoSchema = z.object({
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  tipo: MovimentoTipoSchema,
  valor: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor não pode exceder R$ 999.999,99')
    .transform((val) => Number(val.toFixed(2))),
  origem: MovimentoOrigemSchema,
  referencia_id: z.string().uuid().optional(),
  data_mov: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional()
    .default(() => new Date().toISOString().split('T')[0]),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  profissional_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
  categoria: z.string().max(100).optional(),
  meio_pagamento: z
    .enum([
      'dinheiro',
      'pix',
      'cartao_credito',
      'cartao_debito',
      'transferencia',
    ])
    .optional(),
})

// Schema para atualizar movimentação
export const UpdateMovimentacaoSchema = CreateMovimentacaoSchema.partial().omit(
  {
    unidade_id: true,
  }
)

// Schema para filtros de movimentação
export const MovimentacaoFilterSchema = z.object({
  unidade_id: z.string().uuid().optional(),
  tipo: MovimentoTipoSchema.optional(),
  origem: MovimentoOrigemSchema.optional(),
  data_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  data_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  profissional_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
  referencia_id: z.string().uuid().optional(),
  categoria: z.string().optional(),
  meio_pagamento: z.string().optional(),
  valor_min: z.number().nonnegative().optional(),
  valor_max: z.number().positive().optional(),
  busca: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  ordenacao: z
    .enum([
      'data_desc',
      'data_asc',
      'valor_desc',
      'valor_asc',
      'criado_desc',
      'criado_asc',
    ])
    .default('data_desc'),
})

// Schema para fechamento de caixa
export const FechamentoCaixaSchema = z.object({
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  data_fechamento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  total_dinheiro: z.number().nonnegative().default(0),
  total_pix: z.number().nonnegative().default(0),
  total_cartao_credito: z.number().nonnegative().default(0),
  total_cartao_debito: z.number().nonnegative().default(0),
  total_transferencia: z.number().nonnegative().default(0),
  observacoes: z.string().max(1000).optional(),
  responsavel_id: z.string().uuid('ID do responsável deve ser um UUID válido'),
})

// Schema para regras de comissão
export const ComissaoRegraSchema = z.object({
  profissional_id: z
    .string()
    .uuid('ID do profissional deve ser um UUID válido'),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  tipo: z.enum(['percentual', 'fixo', 'misto'], {
    errorMap: () => ({
      message: 'Tipo de comissão deve ser percentual, fixo ou misto',
    }),
  }),
  valor_percentual: z
    .number()
    .min(0, 'Percentual não pode ser negativo')
    .max(100, 'Percentual não pode exceder 100%')
    .optional(),
  valor_fixo: z
    .number()
    .nonnegative('Valor fixo não pode ser negativo')
    .optional(),
  servico_id: z.string().uuid().optional(),
  categoria_servico: z.string().optional(),
  ativo: z.boolean().default(true),
})

// Schema para calcular comissão
export const CalcularComissaoSchema = z.object({
  profissional_id: z
    .string()
    .uuid('ID do profissional deve ser um UUID válido'),
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  valor_base: z.number().positive('Valor base deve ser positivo'),
  servico_id: z.string().uuid().optional(),
  agendamento_id: z.string().uuid().optional(),
  venda_id: z.string().uuid().optional(),
})

// Schema para relatórios financeiros
export const RelatorioFinanceiroSchema = z.object({
  unidade_id: z.string().uuid().optional(),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tipo_relatorio: z.enum([
    'resumo_diario',
    'resumo_mensal',
    'por_profissional',
    'por_servico',
    'comissoes',
    'fluxo_caixa',
    'comparativo',
  ]),
  profissional_id: z.string().uuid().optional(),
  agrupar_por: z
    .enum(['dia', 'semana', 'mes', 'profissional', 'servico', 'categoria'])
    .optional(),
  incluir_comissoes: z.boolean().default(true),
  incluir_impostos: z.boolean().default(false),
  formato: z.enum(['json', 'csv', 'pdf']).default('json'),
})

// Schema para lançamento rápido
export const LancamentoRapidoSchema = z.object({
  unidade_id: z.string().uuid('ID da unidade deve ser um UUID válido'),
  tipo: MovimentoTipoSchema,
  valor: z.number().positive('Valor deve ser positivo'),
  origem: MovimentoOrigemSchema,
  descricao: z.string().min(1, 'Descrição é obrigatória').max(200),
  meio_pagamento: z.enum([
    'dinheiro',
    'pix',
    'cartao_credito',
    'cartao_debito',
    'transferencia',
  ]),
  categoria: z.string().max(100).optional(),
})

// Schema para estatísticas financeiras
export const EstatisticasFinanceirasSchema = z.object({
  unidade_id: z.string().uuid().optional(),
  periodo: z.enum(['hoje', 'semana', 'mes', 'trimestre', 'ano']).default('mes'),
  incluir_comparativo: z.boolean().default(true),
  incluir_metas: z.boolean().default(false),
})

// Tipos para gestão financeira
export type MovimentoTipo = z.infer<typeof MovimentoTipoSchema>
export type MovimentoOrigem = z.infer<typeof MovimentoOrigemSchema>
export type CreateMovimentacaoData = z.infer<typeof CreateMovimentacaoSchema>
export type UpdateMovimentacaoData = z.infer<typeof UpdateMovimentacaoSchema>
export type MovimentacaoFilterData = z.infer<typeof MovimentacaoFilterSchema>
export type FechamentoCaixaData = z.infer<typeof FechamentoCaixaSchema>
export type ComissaoRegraData = z.infer<typeof ComissaoRegraSchema>
export type CalcularComissaoData = z.infer<typeof CalcularComissaoSchema>
export type RelatorioFinanceiroData = z.infer<typeof RelatorioFinanceiroSchema>
export type LancamentoRapidoData = z.infer<typeof LancamentoRapidoSchema>
export type EstatisticasFinanceirasData = z.infer<
  typeof EstatisticasFinanceirasSchema
>
