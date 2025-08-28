import { createServicoAction, listServicosAction } from '@/app/(protected)/servicos/_actions';

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
          single: () => Promise.resolve({ data: { id: 's1', ...data }, error: null }),
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

describe('Servicos actions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria serviço válido', async () => {
    const fd = new FormData();
    fd.append('nome', 'Corte');
    fd.append('preco', '50');
    fd.append('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
    const res = await createServicoAction(fd);
    expect(res.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('falha com dados inválidos (preco negativo, uuid inválido)', async () => {
    const fd = new FormData();
    fd.append('nome', 'Corte');
    fd.append('preco', '-10');
    fd.append('unidade_id', 'x');
    const res = await createServicoAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });

  it('falha com nome muito curto', async () => {
    const fd = new FormData();
    fd.append('nome', 'A');
    fd.append('preco', '10');
    fd.append('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
    const res = await createServicoAction(fd);
    expect(res.success).toBe(false);
  });

  it('lista serviços com validação e aplica limit', async () => {
    const res = await listServicosAction({ unidadeId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(res.success).toBe(true);
    expect(mockLimit).toHaveBeenCalledWith(200);
  });

  it('retorna erro de validação para unidadeId inválido em list', async () => {
    const res = await listServicosAction({ unidadeId: 'invalid' } as unknown as {
      unidadeId: string;
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });
});
