import { entrarFilaAction, listarFilaAction } from '@/app/(protected)/fila/_actions';

const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();

function buildChain() {
  return {
    insert: <T extends Record<string, unknown>>(data: T) => {
      mockInsert(data);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'fila1', ...data }, error: null }),
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

describe('Fila actions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('entrarFilaAction sucesso', async () => {
    const fd = new FormData();
    fd.append('cliente_id', '550e8400-e29b-41d4-a716-446655440000');
    fd.append('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
    const res = await entrarFilaAction(fd);
    expect(res.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('entrarFilaAction inválido', async () => {
    const fd = new FormData();
    fd.append('cliente_id', 'x');
    fd.append('unidade_id', 'y');
    const res = await entrarFilaAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });

  it('listarFilaAction sucesso', async () => {
    const res = await listarFilaAction('550e8400-e29b-41d4-a716-446655440000');
    expect(res.success).toBe(true);
    expect(mockEq).toHaveBeenCalledWith('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
    expect(mockOrder).toHaveBeenCalled();
  });
});
