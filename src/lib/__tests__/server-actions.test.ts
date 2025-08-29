import { z } from 'zod';
import {
  validateSchema,
  createActionResult,
  handleActionError,
  withValidation,
  withValidationSchema,
  withValidationSchemaLogged,
} from '../server-actions';
import { logActionError } from '@/lib/logging/actionLogger';

jest.mock('@/lib/logging/actionLogger', () => ({
  logActionError: jest.fn(),
  withActionLogging: async (_name: string, fn: () => Promise<unknown> | unknown) => fn(),
}));

describe('server-actions helpers', () => {
  const TestSchema = z.object({ id: z.string().uuid(), count: z.number().int().positive() });
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'; // UUID v4 estático para testes

  test('validateSchema sucesso', async () => {
    const data = { id: VALID_UUID, count: 3 };
    const result = await validateSchema(TestSchema, data);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(data);
  });

  test('validateSchema falha', async () => {
    const result = await validateSchema(TestSchema, { id: 'not-uuid', count: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toHaveLength(2);
      const fields = result.errors.map((e) => e.field).sort();
      expect(fields).toEqual(['count', 'id']);
    }
  });

  test('createActionResult compõe campos', () => {
    const r = createActionResult(true, { ok: 1 }, undefined, 'msg');
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ ok: 1 });
    expect(r.message).toBe('msg');
  });

  test('handleActionError converte Error', () => {
    const r = handleActionError(new Error('boom'));
    expect(r.success).toBe(false);
    expect(r.error).toBe('boom');
    expect(logActionError).toHaveBeenCalled();
  });

  test('withValidation retorna erro de validação', async () => {
    const res = await withValidation(TestSchema, { id: 'x', count: 0 }, async () => ({ n: 1 }));
    expect(res.success).toBe(false);
    expect(res.errors?.length).toBe(2);
  });

  test('withValidation executa action em sucesso', async () => {
    const valid = { id: VALID_UUID, count: 5 };
    const res = await withValidation(TestSchema, valid, async (v) => ({ echo: v.count }));
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ echo: 5 });
  });

  test('withValidationSchema wrapper', async () => {
    const fn = withValidationSchema(TestSchema, async (v) => v.count * 2);
    const bad = await fn({ id: 'nope', count: 1 });
    expect(bad.success).toBe(false);
    const good = await fn({ id: VALID_UUID, count: 2 });
    expect(good.success).toBe(true);
    expect(good.data).toBe(4);
  });

  test('withValidationSchemaLogged registra erro de validação e sucesso', async () => {
    const fn = withValidationSchemaLogged('testAction', TestSchema, async (v) => v.count + 1, {
      userId: 'u1',
      unitId: 'uni',
    });
    const bad = await fn({ id: 'bad', count: -2 });
    expect(bad.success).toBe(false);
    const ok = await fn({ id: VALID_UUID, count: 9 });
    expect(ok.success).toBe(true);
    expect(ok.data).toBe(10);
  });

  test('withValidationSchemaLogged trata exceção interna', async () => {
    const fn = withValidationSchemaLogged('failing', TestSchema, async () => {
      throw new Error('internal');
    });
    const good = await fn({ id: VALID_UUID, count: 1 });
    expect(good.success).toBe(false);
    expect(good.error).toBe('internal');
  });
});
