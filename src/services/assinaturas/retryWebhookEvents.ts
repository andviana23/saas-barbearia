import { processAsaasWebhook, AsaasWebhookEvent, ProcessWebhookDeps } from './webhook';

interface RetryOptions {
  maxBatch?: number;
  maxRetryCount?: number;
}

type SupabaseClientLike = NonNullable<ProcessWebhookDeps['supabase']>;

export async function retryAsaasWebhookEvents(
  supabase: SupabaseClientLike,
  opts: RetryOptions = {},
) {
  const maxBatch = opts.maxBatch ?? 25;
  const maxRetry = opts.maxRetryCount ?? 5;
  const start = Date.now();

  // Buscar eventos pendentes ou falhos abaixo do limite de retry
  // Interface simplificada: assumimos que select + filtro manual
  const listRes = await supabase
    .from('asaas_webhook_events')
    .select('event_id, payload, retry_count, status');
  const rawData = (listRes as unknown as { data?: Array<Record<string, unknown>> }).data || [];
  const rows = rawData
    .filter((r) => ['failed', 'pending'].includes(String(r.status)))
    .slice(0, maxBatch)
    .map((r) => ({
      event_id: String(r.event_id),
      payload: r.payload as unknown,
      retry_count: Number(r.retry_count ?? 0),
      status: String(r.status),
    }));

  let processed = 0;
  let succeeded = 0;
  const errors: Array<{ eventId: string; error: string }> = [];

  for (const row of rows) {
    processed++;
    const payload: AsaasWebhookEvent =
      typeof row.payload === 'string'
        ? (JSON.parse(row.payload) as AsaasWebhookEvent)
        : (row.payload as AsaasWebhookEvent);
    const res = await processAsaasWebhook(payload, { supabase }, { reprocessExisting: true });
    if (res.success) {
      succeeded++;
      // incrementar retry_count apenas se estava failed e agora sucesso
      if (row.status === 'failed') {
        await supabase
          .from('asaas_webhook_events')
          .update({ retry_count: row.retry_count + 1 })
          .eq('event_id', row.event_id);
      }
    } else {
      errors.push({ eventId: row.event_id, error: res.error || 'unknown' });
      await supabase
        .from('asaas_webhook_events')
        .update({
          retry_count: row.retry_count + 1,
          last_error: res.error,
          status: row.retry_count + 1 >= maxRetry ? 'failed' : 'pending',
        })
        .eq('event_id', row.event_id);
    }
  }

  return {
    processed,
    succeeded,
    failed: processed - succeeded,
    durationMs: Date.now() - start,
    errors,
  };
}
