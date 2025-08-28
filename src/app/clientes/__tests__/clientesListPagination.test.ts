import { listClientesAction } from '@/app/(protected)/clientes/_actions';

// Simulação de paginação opcional: adaptamos limit para ver se chamada ocorre com 200 (padrão).
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockLimit = jest.fn();

function buildChain() {
  return {
    select: () => {
      mockSelect();
      return {
        eq: (col: string, val: unknown) => {
          mockEq(col, val);
          return {
            limit: (n: number) => {
              mockLimit(n);
              return Promise.resolve({
                data: Array.from({ length: 2 }, (_, i) => ({ id: `c${i + 1}` })),
                error: null,
              });
            },
          };
        },
      };
    },
  };
}

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => ({
    from: () => buildChain(),
  }),
}));

describe('listClientesAction - paginação/limit', () => {
  it('aplica limit 200 e retorna dados', async () => {
    const res = await listClientesAction({ unidadeId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(res.success).toBe(true);
    expect(mockLimit).toHaveBeenCalledWith(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
