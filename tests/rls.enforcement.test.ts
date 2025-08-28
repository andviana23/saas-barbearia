/*
  Teste de enforcement lógico de filtro por unidade.
  Objetivo: se a action aplicar corretamente o .eq('unidade_id', unidadeId),
  um mock que devolve registros de múltiplas unidades deve resultar em filtragem
  (neste mock, emulamos que o método eq efetivamente filtra). Se alguém remover o eq,
  o teste falha pois retornará registros "de outra unidade".
*/
import { listClientesAction } from '@/app/(protected)/clientes/_actions';

jest.mock('@/lib/supabase/server', () => {
  return {
    createServerSupabase: () => {
      return {
        from: (table: string) => {
          const dataset = [
            { id: 'c1', nome: 'A', unidade_id: '550e8400-e29b-41d4-a716-446655440000' },
            { id: 'c2', nome: 'B', unidade_id: '11111111-1111-1111-1111-111111111111' },
          ];
          return {
            select: () => ({
              eq: (col: string, val: string) => {
                if (table !== 'clientes') return Promise.resolve({ data: [], error: null });
                const filtered = dataset.filter((r) => (r as any)[col] === val); // eslint-disable-line @typescript-eslint/no-explicit-any
                return {
                  limit: (/* n: number */) => Promise.resolve({ data: filtered, error: null }),
                };
              },
              // Se alguém remover .eq na action, cairá neste caminho retornando todos => teste falha
              limit: () => Promise.resolve({ data: dataset, error: null }),
            }),
          } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        },
      } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  };
});

describe('RLS enforcement lógico (filtro unidade)', () => {
  it('retorna somente registros da unidade solicitada', async () => {
    const unidadeId = '550e8400-e29b-41d4-a716-446655440000';
    const result = await listClientesAction({ unidadeId });
    expect(result.success).toBe(true);
    const data = (result.data || []) as Array<{ unidade_id: string }>;
    expect(data.every((r) => r.unidade_id === unidadeId)).toBe(true);
    expect(data.length).toBe(1);
  });
});
