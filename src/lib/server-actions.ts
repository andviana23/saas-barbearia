import { ActionResult, ValidationError } from '@/types';
import { logActionError } from '@/lib/logging/actionLogger';
import { withActionLogging } from '@/lib/logging/actionLogger';
import { ZodError, ZodSchema } from 'zod';

export async function validateSchema<T>(
  schema: ZodSchema<T>,
  data: unknown,
): Promise<{ success: true; data: T } | { success: false; errors: ValidationError[] }> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      return { success: false, errors };
    }
    throw error;
  }
}

export function createActionResult<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  errors?: ValidationError[],
): ActionResult<T> {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(error && { error }),
    ...(message && { message }),
    ...(errors && { errors }),
  };
}

export function handleActionError(error: unknown): ActionResult {
  const errMsg = error instanceof Error ? error.message : 'Erro interno do servidor';
  logActionError({ action: 'unknown', error: errMsg });
  return createActionResult(false, undefined, errMsg);
}

export async function withValidation<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  data: unknown,
  action: (validatedData: TInput) => Promise<TOutput>,
): Promise<ActionResult<TOutput>> {
  try {
    const validation = await validateSchema(schema, data);

    if (!validation.success) {
      return createActionResult(
        false,
        undefined,
        'Dados inválidos',
        undefined,
        validation.errors,
      ) as ActionResult<TOutput>;
    }

    const result = await action(validation.data);
    return createActionResult(true, result, undefined, 'Operação realizada com sucesso');
  } catch (error) {
    return handleActionError(error) as ActionResult<TOutput>;
  }
}

// Versão para compatibilidade com uso de 2 argumentos (schema + action)
export function withValidationSchema<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  action: (data: TInput) => Promise<TOutput>,
) {
  return async (data: unknown): Promise<ActionResult<TOutput>> => {
    return withValidation(schema, data, action);
  };
}

// Wrapper com logging estruturado (usar em novas actions gradualmente)
export function withValidationSchemaLogged<TInput, TOutput>(
  actionName: string,
  schema: ZodSchema<TInput>,
  action: (data: TInput) => Promise<TOutput>,
  ctx: { userId?: string; unitId?: string } = {},
) {
  return async (data: unknown): Promise<ActionResult<TOutput>> => {
    const start = Date.now();
    const validation = await validateSchema(schema, data);
    if (!validation.success) {
      logActionError({
        action: actionName,
        error: 'Dados inválidos',
        unitId: ctx.unitId,
        userId: ctx.userId,
        durationMs: Date.now() - start,
        inputRedacted: data,
        meta: { validationErrors: validation.errors.length },
      });
      return createActionResult(
        false,
        undefined,
        'Dados inválidos',
        undefined,
        validation.errors,
      ) as ActionResult<TOutput>;
    }
    try {
      const result = await withActionLogging(actionName, () => action(validation.data), {
        userId: ctx.userId,
        unitId: ctx.unitId,
        input: data,
      });
      return createActionResult(true, result, undefined, 'Operação realizada com sucesso');
    } catch (error) {
      return handleActionError(error) as ActionResult<TOutput>;
    }
  };
}
