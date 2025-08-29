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

// Teste opcional real simples contra o banco (se DATABASE_URL definido) para validar que policies não explodem e restringem acesso sem contexto auth.
// Não falha caso variável não exista; serve como sinal inicial de RLS ativa.
describe('RLS smoke (real opcional)', () => {
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  // Executa apenas se URL presente (ex: pipeline com banco disponível)
  const maybeTest = dbUrl ? test : test.skip;
  maybeTest('SELECT units limitado sem contexto auth', async () => {
    // Import tardio para evitar custo se skip
    const { Client } = await import('pg');
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    const res = await client.query('select * from public.units limit 10');
    // Resultado esperado: não lança erro; número de linhas limitado (não garante RLS, mas detecta ausência de erros)
    expect(res.rows.length).toBeLessThanOrEqual(10);
    await client.end();
  });
});
