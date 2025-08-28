import { createServerSupabase } from '@/lib/supabase/server';
import type { ActionResult } from '@/types';

export interface WebhookMetrics {
  total: number;
  processed: number;
  failed: number;
  pending: number;
  alreadyProcessed?: number; // opcional se futuro status
  avg_processing_ms: number;
  p50_processing_ms: number;
  p95_processing_ms: number;
  last24h: {
    processed: number;
    failed: number;
  };
  generated_at: string;
}

// Nota: usando agregações simples para evitar dependência de extensões estatísticas.
export async function getAsaasWebhookMetrics(): Promise<ActionResult<WebhookMetrics>> {
  try {
    const supabase = createServerSupabase();
    // Buscar todas as linhas relevantes (poderia ser otimizado para COUNT(*) group by no futuro)
    const { data, error } = await supabase
      .from('asaas_webhook_events')
      .select('status, processing_time_ms, processed_at');
    if (error) return { success: false, error: error.message };
    const rows = data || [];
    const now = Date.now();
    let processed = 0;
    let failed = 0;
    let pending = 0;
    const times: number[] = [];
    let last24hProcessed = 0;
    let last24hFailed = 0;
    const cutoff = now - 24 * 60 * 60 * 1000;
    type Row = { status?: unknown; processing_time_ms?: unknown; processed_at?: unknown };
    for (const r of rows as Row[]) {
      const status = String(r.status || '').toLowerCase();
      if (status === 'processed') processed++;
      else if (status === 'failed') failed++;
      else pending++;
      const pt = typeof r.processing_time_ms === 'number' ? r.processing_time_ms : undefined;
      if (pt && pt > 0) times.push(pt);
      const processedAt = typeof r.processed_at === 'string' ? Date.parse(r.processed_at) : null;
      if (processedAt && processedAt >= cutoff) {
        if (status === 'processed') last24hProcessed++;
        else if (status === 'failed') last24hFailed++;
      }
    }
    const total = rows.length;
    times.sort((a, b) => a - b);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const p50Index = times.length ? Math.min(times.length - 1, Math.floor(times.length * 0.5)) : 0;
    const p95Index = times.length ? Math.min(times.length - 1, Math.floor(times.length * 0.95)) : 0;
    const p50 = times.length ? times[p50Index] : 0;
    const p95 = times.length ? times[p95Index] : 0;
    return {
      success: true,
      data: {
        total,
        processed,
        failed,
        pending,
        avg_processing_ms: avg,
        p50_processing_ms: p50,
        p95_processing_ms: p95,
        last24h: { processed: last24hProcessed, failed: last24hFailed },
        generated_at: new Date().toISOString(),
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
