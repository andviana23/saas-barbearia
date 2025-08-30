import {
  criarLancamentoAction,
  listarLancamentosAction,
} from '@/app/(protected)/financeiro/_actions';

const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

function buildChain() {
  return {
    insert: <T extends Record<string, unknown>>(data: T) => {
      mockInsert(data);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'lan1', ...data }, error: null }),
        }),
      };
    },
    select: () => {
      mockSelect();
      return {
        eq: (col: string, val: unknown) => {
          mockEq(col, val);
          return {
            order: () => {
              mockOrder();
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
    },
    order: () => ({
      limit: (n: number) => {
        mockLimit(n);
        return Promise.resolve({ data: [], error: null });
      },
    }),
  };
}

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => ({
    from: () => buildChain(),
  }),
}));

describe('Financeiro actions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria lançamento válido', async () => {
    const fd = new FormData();
    fd.append('descricao', 'Venda produto');
    fd.append('valor', '100');
    fd.append('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
    const res = await criarLancamentoAction(fd);
    expect(res.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('falha em lançamento inválido', async () => {
    const fd = new FormData();
    fd.append('descricao', 'X');
    fd.append('valor', '-5');
    fd.append('unidade_id', 'invalid');
    const res = await criarLancamentoAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });

  it('lista lançamentos com ordenação e limite', async () => {
    const res = await listarLancamentosAction('550e8400-e29b-41d4-a716-446655440000');
    expect(res.success).toBe(true);
    expect(mockEq).toHaveBeenCalledWith('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
  });
});
