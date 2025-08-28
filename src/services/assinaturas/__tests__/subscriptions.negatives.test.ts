import {
  createSubscriptionExternal,
  updateSubscription,
  cancelSubscription,
} from '../../assinaturas/subscriptions';

// Mocks
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => ({
    from: () => ({
      insert: () => ({ select: () => ({ single: () => ({ data: { id: '1' }, error: null }) }) }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ data: { id: '1' }, error: null }),
          }),
        }),
      }),
      // cancel path uses update igualmente
    }),
  }),
}));

jest.mock('../../assinaturas/mappers', () => ({
  mapDbSubscriptionToDomain: (row: unknown) => row,
}));

describe('subscriptions negative flows', () => {
  it('createSubscriptionExternal retorna erro de validação', async () => {
    const fd = new FormData(); // vazio => inválido
    const res = await createSubscriptionExternal(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });

  it('updateSubscription retorna erro de validação em payload inválido', async () => {
    const fd = new FormData();
    fd.append('plan_id', 'not-a-uuid'); // inválido => schema parcial com uuid, deve falhar
    const res = await updateSubscription('any-id', fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Dados inválidos');
  });

  it('cancelSubscription sucesso básico (caminho feliz coberto para aumentar cobertura)', async () => {
    const res = await cancelSubscription('abc');
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
  });
});
