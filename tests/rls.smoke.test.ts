/* eslint-disable @typescript-eslint/no-explicit-any */
import { listClientesAction } from '@/app/(protected)/clientes/_actions';
import { listarLancamentosAction } from '@/app/(protected)/financeiro/_actions';
import { listProdutosAction } from '@/app/(protected)/produtos/_actions';
import { listarFilaAction } from '@/app/(protected)/fila/_actions';
import { listSubscriptionsAction } from '@/app/(protected)/assinaturas/_actions';

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => ({
    from: (table: string) => {
      const eqCalls: any[] = [];
      const chain: any = {
        select: () => ({
          eq: (col: string, val: any) => {
            eqCalls.push([table, col, val]);
            return {
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
              }),
              limit: () => Promise.resolve({ data: [], error: null }),
              single: () => Promise.resolve({ data: null, error: null }),
            };
          },
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => ({ single: () => Promise.resolve({ data: { id: 'x' }, error: null }) }),
        }),
      };
      (chain as any)._eqCalls = eqCalls;
      return chain;
    },
  }),
}));

describe('RLS smoke (simulado)', () => {
  test('actions aplicam filtros de unidade sem erro', async () => {
    const unidadeId = '550e8400-e29b-41d4-a716-446655440000';
    await listClientesAction(unidadeId);
    await listarLancamentosAction(unidadeId);
    await listProdutosAction(unidadeId);
    await listarFilaAction(unidadeId);
    await listSubscriptionsAction({ unitId: unidadeId });
    expect(true).toBe(true);
  });
});
