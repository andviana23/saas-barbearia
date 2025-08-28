import { createClienteAction, listClientesAction } from '@/app/(protected)/clientes/_actions';

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
          single: () => Promise.resolve({ data: { id: 'c1', ...data }, error: null }),
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
              return Promise.resolve({ data: [] as Record<string, unknown>[], error: null });
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

describe('createClienteAction', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria cliente válido', async () => {
    const fd = new FormData();
    fd.append('nome', 'Cliente X');
    fd.append('telefone', '11999999999');
    fd.append('unidade_id', '550e8400-e29b-41d4-a716-446655440000');

    const res = await createClienteAction(fd);
    expect(res.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('falha com dados inválidos', async () => {
    const fd = new FormData();
    fd.append('nome', 'A');
    fd.append('unidade_id', 'invalid');
    const res = await createClienteAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });
});

describe('listClientesAction', () => {
  it('lista clientes com validação', async () => {
    const res = await listClientesAction({ unidadeId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(res.success).toBe(true);
  });

  it('retorna erro de validação para unidadeId inválido', async () => {
    const res = await listClientesAction({ unidadeId: 'x' } as unknown as { unidadeId: string });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });
});
