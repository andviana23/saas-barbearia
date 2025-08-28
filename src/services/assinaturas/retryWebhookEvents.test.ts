/* eslint-disable @typescript-eslint/no-explicit-any */
import { retryAsaasWebhookEvents } from './retryWebhookEvents';

// Mock processAsaasWebhook para controlar resultados
const processMock = jest.fn();
jest.mock('./webhook', () => ({
  processAsaasWebhook: (...args: any[]) => processMock(...args),
}));

function makeSupabase(rows: any[]) {
  const updates: any[] = [];
  return {
    updates,
    from: () => ({
      select: () => ({ data: rows, error: null }),
      update: (data: any) => ({
        eq: () => {
          updates.push(data);
          return { data: {}, error: null };
        },
      }),
    }),
  } as any;
}

describe('retryAsaasWebhookEvents', () => {
  beforeEach(() => {
    processMock.mockReset();
  });

  test('reprocessa eventos (sucesso em failed incrementa retry_count)', async () => {
    const rows = [
      {
        event_id: 'evt_ok',
        payload: { id: 'evt_ok', event: 'SUBSCRIPTION_CREATED' },
        retry_count: 0,
        status: 'failed',
      },
    ];
    processMock.mockResolvedValueOnce({ success: true });
    const supabase = makeSupabase(rows);
    const res = await retryAsaasWebhookEvents(supabase, { maxBatch: 10 });
    expect(res.processed).toBe(1);
    expect(res.succeeded).toBe(1);
    expect(supabase.updates.length).toBe(1); // incremento retry_count registrado
    expect(supabase.updates[0].retry_count).toBe(1);
  });

  test('falha incrementa retry e marca failed ao atingir maxRetry', async () => {
    const rows = [
      {
        event_id: 'evt_fail',
        payload: { id: 'evt_fail', event: 'CONFIRMED' },
        retry_count: 2,
        status: 'pending',
      },
    ];
    // maxRetryCount = 3 => retry_count 2 + 1 => 3 (atinge limite)
    processMock.mockResolvedValueOnce({ success: false, error: 'boom' });
    const supabase = makeSupabase(rows);
    const res = await retryAsaasWebhookEvents(supabase, { maxRetryCount: 3 });
    expect(res.processed).toBe(1);
    expect(res.failed).toBe(1);
    expect(supabase.updates[0]).toMatchObject({
      retry_count: 3,
      status: 'failed',
      last_error: 'boom',
    });
  });

  test('respeita maxBatch e processa apenas subset', async () => {
    const rows = [
      { event_id: 'evt1', payload: { id: 'evt1', event: 'A' }, retry_count: 0, status: 'pending' },
      { event_id: 'evt2', payload: { id: 'evt2', event: 'A' }, retry_count: 0, status: 'pending' },
      { event_id: 'evt3', payload: { id: 'evt3', event: 'A' }, retry_count: 0, status: 'pending' },
    ];
    processMock.mockResolvedValue({ success: true });
    const supabase = makeSupabase(rows);
    const res = await retryAsaasWebhookEvents(supabase, { maxBatch: 2 });
    expect(res.processed).toBe(2);
    expect(res.succeeded).toBe(2);
  });
});
