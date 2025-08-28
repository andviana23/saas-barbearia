import { z, type ZodObject, type ZodRawShape, type ZodTypeAny, type ZodSchema } from 'zod';

/* =========================================================================
 * Tipos base
 * =======================================================================*/

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/* =========================================================================
 * Utils principais (safe / throw)
 * =======================================================================*/

export function safeValidate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      errors: result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: (err as any).code, // code não está em todas as issues do Zod, tratamos como opcional
      })),
      message: 'Dados inválidos. Verifique os campos em destaque.',
    };
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
    };
  }
}

export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: ValidationError[] = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: (err as any).code,
    }));

    throw new ValidationException('Dados inválidos', errors);
  }

  return result.data;
}

export class ValidationException extends Error {
  public readonly errors: ValidationError[];

  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = 'ValidationException';
    this.errors = errors;
  }
}

/* =========================================================================
 * Helpers específicos para ZodObject
 * =======================================================================*/

/**
 * Narrowing de runtime para garantir acesso ao `.shape`.
 */
function isZodObject(s: unknown): s is ZodObject<ZodRawShape> {
  return s instanceof z.ZodObject;
}

/**
 * Retorna o schema de um campo específico, caso o schema seja um ZodObject.
 */
function getFieldSchema<Shape extends ZodRawShape, Key extends keyof Shape & string>(
  schema: ZodObject<Shape>,
  field: Key,
): Shape[Key] | undefined {
  return schema.shape?.[field] as Shape[Key] | undefined;
}

/* =========================================================================
 * Hook utilitário para formular aplicação com ZodObject
 * =======================================================================*/

/**
 * useFormValidation
 * - Aceita apenas ZodObject (porque só ele tem `.shape`)
 * - Fornece `validate` (objeto inteiro) e `validateField` (campo isolado)
 * - Inferência forte de tipos por campo (DX 👑)
 */
export function useFormValidation<Shape extends ZodRawShape>(schema: ZodObject<Shape>) {
  const validate = (data: unknown): ValidationResult<z.infer<typeof schema>> => {
    return safeValidate(schema, data);
  };

  const validateField = <Key extends keyof Shape & string>(
    field: Key,
    value: unknown,
  ): ValidationError | null => {
    try {
      const fieldSchema = getFieldSchema(schema, field);
      if (!fieldSchema) {
        // Campo não existe no schema — devolvemos null para não travar UX
        // Se quiser tratar como erro de dev, pode lançar/registrar aqui.
        return null;
      }

      // Alguns campos podem ser refinados/transformados — normalizamos como ZodTypeAny
      const zodField = fieldSchema as unknown as ZodTypeAny;
      const result = zodField.safeParse(value);

      if (result.success) return null;

      const first = result.error.errors[0];
      return {
        field,
        message: first?.message ?? 'Campo inválido',
        code: (first as any)?.code,
      };
    } catch (e) {
      return {
        field,
        message: 'Erro na validação do campo',
      };
    }
  };

  return { validate, validateField };
}

/* =========================================================================
 * Mensagens padrão e customizações
 * =======================================================================*/

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
} as const;

export function customZodMessages() {
  return {
    required_error: errorMessages.required,
    invalid_type_error: 'Tipo de dado inválido',
  };
}

/* =========================================================================
 * Formatadores de erro para UI
 * =======================================================================*/

export const errorFormatters = {
  toFormErrors: (errors: ValidationError[]): Record<string, string> => {
    return errors.reduce(
      (acc, error) => {
        acc[error.field] = error.message;
        return acc;
      },
      {} as Record<string, string>,
    );
  },

  groupByField: (errors: ValidationError[]): Record<string, ValidationError[]> => {
    return errors.reduce(
      (acc, error) => {
        if (!acc[error.field]) acc[error.field] = [];
        acc[error.field].push(error);
        return acc;
      },
      {} as Record<string, ValidationError[]>,
    );
  },

  toStringList: (errors: ValidationError[]): string[] => {
    return errors.map((e) => `${e.field}: ${e.message}`);
  },

  firstErrorPerField: (errors: ValidationError[]): Record<string, string> => {
    const grouped = errorFormatters.groupByField(errors);
    return Object.entries(grouped).reduce(
      (acc, [field, fieldErrors]) => {
        acc[field] = fieldErrors[0].message;
        return acc;
      },
      {} as Record<string, string>,
    );
  },
};

/* =========================================================================
 * Config padrão
 * =======================================================================*/

export const validationConfig = {
  asyncTimeout: 5000, // ms
  debounceMs: 300,
  maxRetries: 3,
} as const;

/* =========================================================================
 * Exemplos rápidos (remova se não quiser exemplos no bundle)
 * =======================================================================*/
// Exemplo de schema com mensagens custom
// export const exemploSchema = z.object({
//   nome: z.string(customZodMessages()).min(2, errorMessages.min(2)),
//   email: z.string(customZodMessages()).email(errorMessages.email),
// });
