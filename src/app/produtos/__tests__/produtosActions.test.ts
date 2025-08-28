import { createProdutoAction, listProdutosAction } from '@/app/(protected)/produtos/_actions';

const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockLimit = jest.fn();

function buildChain() {
  return {
    insert: <T extends Record<string, unknown>>(data: T) => {
      mockInsert(data);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'prod1', ...data }, error: null }),
        }),
      };
    },
    select: () => {
      mockSelect();
      return {
        eq: (col: string, val: unknown) => {
          mockEq(col, val);
          return {
            limit: (n: number) => {
              mockLimit(n);
              return Promise.resolve({ data: [], error: null });
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

describe('Produtos actions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria produto válido', async () => {
    const fd = new FormData();
    fd.append('nome', 'Pomada');
    fd.append('preco', '25');
    fd.append('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
    const res = await createProdutoAction(fd);
    expect(res.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('falha com dados inválidos', async () => {
    const fd = new FormData();
    fd.append('nome', 'A');
    fd.append('preco', '-1');
    fd.append('unidade_id', 'invalid');
    const res = await createProdutoAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });

  it('lista produtos com limite', async () => {
    const res = await listProdutosAction('550e8400-e29b-41d4-a716-446655440000');
    expect(res.success).toBe(true);
    expect(mockEq).toHaveBeenCalledWith('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
    expect(mockLimit).toHaveBeenCalledWith(200);
  });
});
