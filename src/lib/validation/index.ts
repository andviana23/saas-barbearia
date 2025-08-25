import { ZodSchema } from 'zod'

/**
 * Resultado de validação padronizado
 */
export interface ValidationResult<T = unknown> {
  success: boolean
  data?: T
  errors?: ValidationError[]
  message?: string
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Utilitário para validação segura com Zod
 */
export function safeValidate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data)

    if (result.success) {
      return {
        success: true,
        data: result.data,
      }
    }

    return {
      success: false,
      errors: result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
      message: 'Dados inválidos. Verifique os campos em destaque.',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro interno de validação.',
      errors: [
        {
          field: 'root',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      ],
    }
  }
}

/**
 * Utilitário para validação com throw de erro
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))

    throw new ValidationException('Dados inválidos', errors)
  }

  return result.data
}

/**
 * Exception customizada para validação
 */
export class ValidationException extends Error {
  public readonly errors: ValidationError[]

  constructor(message: string, errors: ValidationError[]) {
    super(message)
    this.name = 'ValidationException'
    this.errors = errors
  }
}

/**
 * Hook para validação em formulários
 */
export function useFormValidation<T extends Record<string, unknown>>(
  schema: ZodSchema<T>
) {
  const validate = (data: unknown): ValidationResult<T> => {
    return safeValidate(schema, data)
  }

  const validateField = (
    field: keyof T,
    value: unknown
  ): ValidationError | null => {
    try {
      // Extrai apenas o campo específico do schema
      const fieldSchema = (
        schema.shape as Record<string, ZodSchema<unknown>>
      )?.[field as string]
      if (!fieldSchema) return null

      const result = fieldSchema.safeParse(value)

      if (result.success) {
        return null
      }

      return {
        field: field as string,
        message: result.error.errors[0]?.message || 'Campo inválido',
        code: result.error.errors[0]?.code,
      }
    } catch {
      return {
        field: field as string,
        message: 'Erro na validação do campo',
      }
    }
  }

  return {
    validate,
    validateField,
  }
}

/**
 * Utilitários para mensagens de erro amigáveis
 */
export const errorMessages = {
  required: 'Este campo é obrigatório',
  email: 'Digite um email válido',
  min: (min: number) => `Mínimo de ${min} caracteres`,
  max: (max: number) => `Máximo de ${max} caracteres`,
  pattern: 'Formato inválido',
  numeric: 'Digite apenas números',
  positive: 'Digite um valor positivo',
  telefone: 'Digite um telefone válido (ex: 11 99999-9999)',
  cnpj: 'Digite um CNPJ válido (ex: 00.000.000/0000-00)',
  cpf: 'Digite um CPF válido (ex: 000.000.000-00)',
  cep: 'Digite um CEP válido (ex: 00000-000)',
  date: 'Digite uma data válida',
  time: 'Digite um horário válido',
  url: 'Digite uma URL válida',
}

/**
 * Helper para customizar mensagens do Zod
 */
export function customZodMessages() {
  return {
    required_error: errorMessages.required,
    invalid_type_error: 'Tipo de dado inválido',
  }
}

/**
 * Formatadores para exibição de erros
 */
export const errorFormatters = {
  /**
   * Converte erros de validação em formato para exibição em formulário
   */
  toFormErrors: (errors: ValidationError[]): Record<string, string> => {
    return errors.reduce(
      (acc, error) => {
        acc[error.field] = error.message
        return acc
      },
      {} as Record<string, string>
    )
  },

  /**
   * Agrupa erros por campo para exibição em lista
   */
  groupByField: (
    errors: ValidationError[]
  ): Record<string, ValidationError[]> => {
    return errors.reduce(
      (acc, error) => {
        if (!acc[error.field]) {
          acc[error.field] = []
        }
        acc[error.field].push(error)
        return acc
      },
      {} as Record<string, ValidationError[]>
    )
  },

  /**
   * Converte para mensagem de texto simples
   */
  toStringList: (errors: ValidationError[]): string[] => {
    return errors.map((error) => `${error.field}: ${error.message}`)
  },

  /**
   * Primeira mensagem de erro de cada campo
   */
  firstErrorPerField: (errors: ValidationError[]): Record<string, string> => {
    const grouped = errorFormatters.groupByField(errors)
    return Object.entries(grouped).reduce(
      (acc, [field, fieldErrors]) => {
        acc[field] = fieldErrors[0].message
        return acc
      },
      {} as Record<string, string>
    )
  },
}

/**
 * Constantes para configuração
 */
export const validationConfig = {
  // Tempo limite para validação assíncrona
  asyncTimeout: 5000,

  // Debounce para validação em tempo real
  debounceMs: 300,

  // Limite de tentativas para validação
  maxRetries: 3,
} as const
