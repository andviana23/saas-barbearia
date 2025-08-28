/* eslint-disable @typescript-eslint/no-explicit-any */
import { processAsaasWebhook } from './webhook';
import type { AsaasWebhookEvent } from './webhookTypes';

function makeEvent(partial: Partial<AsaasWebhookEvent> = {}): AsaasWebhookEvent {
  return {
    id: partial.id || 'evt_test_1',
    event: partial.event || 'SUBSCRIPTION_CREATED',
    dateCreated: new Date().toISOString(),
    subscription: partial.subscription,
    payment: partial.payment,
  } as AsaasWebhookEvent;
}

function supabaseFactory(behaviour: 'success' | 'duplicate' | 'routerFail' | 'reprocess') {
  const inserts: any[] = [];
  const updates: any[] = [];
  const selectSingles: any[] = [];

  const tableObj: any = {
    insert: (data: any) => {
      inserts.push(data);
      return {
        select: () => ({
          single: async () => {
            if (behaviour === 'duplicate') {
              return {
                error: { code: '23505', message: 'duplicate key value violates unique constraint' },
              };
            }
            return { data: { id: 'row_new' }, error: null };
          },
        }),
      };
    },
    update: (data: any) => {
      updates.push(data);
      return { eq: async () => ({ data: {}, error: null }) };
    },
    select: () => ({
      eq: (col: string, val: any) => ({
        single: async () => {
          // usamos col/val apenas para satisfazer lint se necessário
          void col;
          void val;
          if (behaviour === 'reprocess') {
            const res = { data: { id: 'row_existing' }, error: null };
            selectSingles.push(res);
            return res;
          }
          if (behaviour === 'routerFail') {
            const res = { data: { id: 'row_new' }, error: null };
            selectSingles.push(res);
            return res;
          }
          const res = { data: { id: 'row_new' }, error: null };
          selectSingles.push(res);
          return res;
        },
      }),
    }),
  };

  const supabase = { from: () => tableObj } as any;
  return { supabase, inserts, updates, selectSingles };
}

describe('processAsaasWebhook', () => {
  test('processa novo evento com sucesso', async () => {
    const { supabase, inserts, updates } = supabaseFactory('success');
    const router = jest.fn().mockResolvedValue(undefined);
    const evt = makeEvent({ subscription: { id: 'sub_a' } });
    const res = await processAsaasWebhook(evt, { supabase, router });
    expect(res.success).toBe(true);
    expect(res.alreadyProcessed).toBeUndefined();
    expect(inserts.length).toBeGreaterThan(0);
    const processedUpdate = updates.find((u) => u.status === 'processed');
    expect(processedUpdate).toBeDefined();
    expect(processedUpdate.processing_time_ms).toBeGreaterThanOrEqual(0);
    expect(router).toHaveBeenCalledWith('SUBSCRIPTION_CREATED', evt, supabase);
  });

  test('retorna alreadyProcessed em evento duplicado (erro 23505)', async () => {
    const { supabase, inserts, updates } = supabaseFactory('duplicate');
    const router = jest.fn();
    const evt = makeEvent();
    const res = await processAsaasWebhook(evt, { supabase, router });
    expect(res.success).toBe(true);
    expect(res.alreadyProcessed).toBe(true);
    expect(router).not.toHaveBeenCalled();
    expect(inserts.length).toBe(1);
    expect(updates.length).toBe(0);
  });

  test('marca como failed quando router lança erro', async () => {
    const { supabase, inserts, updates } = supabaseFactory('routerFail');
    const router = jest.fn().mockRejectedValue(new Error('boom'));
    const evt = makeEvent();
    const res = await processAsaasWebhook(evt, { supabase, router });
    expect(res.success).toBe(false);
    expect(res.error).toBe('boom');
    expect(inserts.length).toBe(1);
    const failedUpdate = updates.find((u) => u.status === 'failed');
    expect(failedUpdate).toBeDefined();
    expect(failedUpdate.last_error).toBe('boom');
  });

  test('reprocessExisting busca registro e processa', async () => {
    const { supabase, updates } = supabaseFactory('reprocess');
    const router = jest.fn().mockResolvedValue(undefined);
    const evt = makeEvent({ id: 'evt_reprocess', event: 'CONFIRMED', payment: { id: 'pay1' } });
    const res = await processAsaasWebhook(evt, { supabase, router }, { reprocessExisting: true });
    expect(res.success).toBe(true);
    expect(res.alreadyProcessed).toBeUndefined();
    const processedUpdate = updates.find((u) => u.status === 'processed');
    expect(processedUpdate).toBeDefined();
  });

  test('deduplicação corrida: segunda tentativa retorna alreadyProcessed sem router', async () => {
    // Simular supabase onde a primeira insert retorna sucesso e a segunda retorna erro 23505
    let callCount = 0;
    const tableObj: any = {
      insert: () => ({
        select: () => ({
          single: async () => {
            callCount++;
            if (callCount === 1) return { data: { id: 'row_ok' }, error: null };
            return {
              error: {
                code: '23505',
                message: 'duplicate key value violates unique constraint',
              },
            };
          },
        }),
      }),
      update: () => ({ eq: async () => ({ data: {}, error: null }) }),
      select: () => ({
        eq: () => ({ single: async () => ({ data: { id: 'row_ok' }, error: null }) }),
      }),
    };
    const supabase: any = { from: () => tableObj }; // eslint-disable-line @typescript-eslint/no-explicit-any
    const router = jest.fn().mockResolvedValue(undefined);
    const evt = makeEvent({ id: 'evt_race', subscription: { id: 'sub_race' } });
    // Disparar duas quase simultâneas (Promise.all)
    const [r1, r2] = await Promise.all([
      processAsaasWebhook(evt, { supabase, router }),
      processAsaasWebhook(evt, { supabase, router }),
    ]);
    // Uma deve ser sucesso normal, outra alreadyProcessed
    expect([r1.success, r2.success].filter(Boolean).length).toBeGreaterThanOrEqual(1);
    const already = [r1, r2].find((r) => r.alreadyProcessed);
    expect(already).toBeDefined();
    // Router deve ter sido chamado apenas uma vez
    expect(router.mock.calls.length).toBeLessThanOrEqual(1);
  });
});
