import { validateSchema } from '../server-actions';
import { ZodSchema } from 'zod';

describe('server-actions extra branches', () => {
  test('validateSchema lança erro não-Zod', async () => {
    const fakeSchema = {
      // força caminho de erro não-Zod
      parse: () => {
        throw new Error('custom-non-zod');
      },
    } as unknown as ZodSchema<unknown>;
    await expect(validateSchema(fakeSchema, {})).rejects.toThrow('custom-non-zod');
  });
});
