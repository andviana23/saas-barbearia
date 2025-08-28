import { describe, it, expect } from '@jest/globals';
import type { AsaasWebhookEvent } from '../../src/services/assinaturas/webhook';

interface InsertResult {
  error?: { code?: string; message: string };
  data?: { id: string; status: string };
}
interface UpdateResult {
  error?: { message: string };
}

interface SupabaseMockTable {
  insert: (data: Record<string, unknown>) => {
    select: (_cols: string) => { single: () => Promise<InsertResult> };
  };
  update: (_data: Record<string, unknown>) => {
    eq: (_col: string, _val: unknown) => Promise<UpdateResult>;
  };
}
interface SupabaseMock {
  from: (_t: string) => SupabaseMockTable;
}

// Testa que duas execuções do mesmo evento retornam alreadyProcessed na segunda
describe('ASAAS webhook idempotência', () => {
  it('deve marcar segunda chamada como alreadyProcessed', async () => {
    const event: AsaasWebhookEvent = {
      id: 'evt_test_123',
      event: 'SUBSCRIPTION_CREATED',
      dateCreated: new Date().toISOString(),
    };

    const rows: { event_id: string }[] = [];
    const supabaseMock: SupabaseMock = {
      from: () => ({
        insert: (data: Record<string, unknown>) => ({
          select: () => ({
            single: async (): Promise<InsertResult> => {
              const exists = rows.find((r) => r.event_id === data.event_id);
              if (exists) {
                return {
                  error: {
                    code: '23505',
                    message: 'duplicate key value violates unique constraint',
                  },
                };
              }
              rows.push({ event_id: String(data.event_id) });
              return { data: { id: `row_${rows.length}`, status: 'pending' } };
            },
          }),
        }),
        update: () => ({
          eq: async () => ({}) as UpdateResult,
        }),
      }),
    };

    const { processAsaasWebhook } = await import('../../src/services/assinaturas/webhook');
    const first = await processAsaasWebhook(event, { supabase: supabaseMock as unknown as never });
    expect(first.success).toBe(true);
    expect(first.alreadyProcessed).toBeUndefined();

    const second = await processAsaasWebhook(event, { supabase: supabaseMock as unknown as never });
    expect(second.success).toBe(true);
    expect(second.alreadyProcessed).toBe(true);
  });
});
