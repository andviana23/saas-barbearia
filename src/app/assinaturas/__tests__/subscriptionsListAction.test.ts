import { listSubscriptionsAction } from '@/app/(protected)/assinaturas/_actions';

const mockEq = jest.fn();
const mockLimit = jest.fn();

function buildChain() {
  return {
    select: () => ({
      eq: (col: string, val: unknown) => {
        mockEq(col, val);
        return {
          limit: (n: number) => {
            mockLimit(n);
            return Promise.resolve({ data: [], error: null });
          },
        };
      },
    }),
  };
}

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => ({
    from: () => buildChain(),
  }),
}));

describe('listSubscriptionsAction', () => {
  it('lista subscriptions válido', async () => {
    const res = await listSubscriptionsAction({ unitId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(res.success).toBe(true);
    expect(mockEq).toHaveBeenCalledWith('unit_id', '550e8400-e29b-41d4-a716-446655440000');
    expect(mockLimit).toHaveBeenCalledWith(100);
  });

  it('falha validação unitId inválido', async () => {
    const res = await listSubscriptionsAction({ unitId: 'invalid' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });
});
