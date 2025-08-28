import { getAsaasWebhookMetrics } from '../asaas-webhook-metrics';

// Mock dinâmico de supabase
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => ({
    from: () => ({
      select: () => ({
        data: [
          { status: 'processed', processing_time_ms: 120, processed_at: new Date().toISOString() },
          {
            status: 'processed',
            processing_time_ms: 80,
            processed_at: new Date(Date.now() - 3_600_000).toISOString(),
          },
          { status: 'failed', processing_time_ms: 200, processed_at: new Date().toISOString() },
          { status: 'pending', processing_time_ms: null },
        ],
        error: null,
      }),
    }),
  }),
}));

describe('getAsaasWebhookMetrics', () => {
  it('calcula métricas básicas corretamente', async () => {
    const res = await getAsaasWebhookMetrics();
    expect(res.success).toBe(true);
    expect(res.data?.total).toBe(4);
    expect(res.data?.processed).toBe(2);
    expect(res.data?.failed).toBe(1);
    expect(res.data?.pending).toBe(1);
    expect(res.data?.avg_processing_ms).toBeGreaterThan(0);
    expect(res.data?.p95_processing_ms).toBeGreaterThan(0);
    expect(res.data?.last24h.processed).toBeGreaterThan(0);
  });
});
