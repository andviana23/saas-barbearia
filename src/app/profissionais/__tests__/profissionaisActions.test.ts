import {
  createProfissionalAction,
  listProfissionaisAction,
} from '@/app/(protected)/profissionais/_actions';

// Mocks de cadeia Supabase
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
          single: () => Promise.resolve({ data: { id: 'p1', ...data }, error: null }),
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

describe('Profissionais actions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria profissional válido', async () => {
    const fd = new FormData();
    fd.append('nome', 'Profissional X');
    fd.append('unidade_id', '550e8400-e29b-41d4-a716-446655440000');
    const res = await createProfissionalAction(fd);
    expect(res.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('falha com dados inválidos (nome curto e uuid inválido)', async () => {
    const fd = new FormData();
    fd.append('nome', 'A');
    fd.append('unidade_id', 'x');
    const res = await createProfissionalAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
    expect(res.errors?.length).toBeGreaterThan(0);
  });

  it('lista profissionais com validação e aplica limit', async () => {
    const res = await listProfissionaisAction({
      unidadeId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(res.success).toBe(true);
    expect(mockLimit).toHaveBeenCalledWith(200);
  });

  it('retorna erro de validação para unidadeId inválido em list', async () => {
    const res = await listProfissionaisAction({ unidadeId: 'invalid' } as unknown as {
      unidadeId: string;
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });
});
