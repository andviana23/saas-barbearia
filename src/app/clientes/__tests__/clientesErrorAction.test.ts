import { createClienteAction } from '@/app/(protected)/clientes/_actions';

// Simula erro de banco no insert
const failingInsert = jest.fn();

function buildFailingChain() {
  return {
    insert: <T extends Record<string, unknown>>(data: T) => {
      failingInsert(data);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'insert failed' } }),
        }),
      };
    },
  };
}

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => ({
    from: () => buildFailingChain(),
  }),
}));

describe('createClienteAction - erro banco', () => {
  it('retorna ActionResult de erro quando insert falha', async () => {
    const fd = new FormData();
    fd.append('nome', 'Cliente X');
    fd.append('telefone', '11999999999');
    fd.append('unidade_id', '550e8400-e29b-41d4-a716-446655440000');

    const res = await createClienteAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('insert failed');
  });
});
