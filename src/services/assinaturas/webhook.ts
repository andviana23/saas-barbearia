/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AsaasWebhookEvent, WebhookProcessResult } from './webhookTypes';
// Import dinâmico para compatibilizar ambiente Next (bundler) e Jest (node) sem extensão fixa
import { routeAsaasEventSafely, SupabaseMinimal } from './webhookRouter';

// Tipagem mínima para operações usadas (evita dependência total do client gerado)
type SupabaseQueryResult = {
  data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: { code?: string; message: string };
};

// TODO: Quando lint geral for priorizado, substituir 'any' por tipos derivando de definição de tabela gerada

// Interface mínima porém compatível estruturalmente com SupabaseTableRef (router)
type SupabaseMinimalLike = SupabaseMinimal;

export interface ProcessWebhookDeps {
  supabase?: SupabaseMinimalLike;
  router?: (
    eventType: string,
    payload: AsaasWebhookEvent,
    supabase: SupabaseMinimalLike,
  ) => Promise<void>;
}

export async function processAsaasWebhook(
  event: AsaasWebhookEvent,
  deps: ProcessWebhookDeps = {},
  opts: { reprocessExisting?: boolean } = {},
): Promise<WebhookProcessResult> {
  // Validação leve de sanidade
  if (!event || typeof event !== 'object' || !event.id || !event.event) {
    return { success: false, error: 'Invalid webhook payload' };
  }
  const { id: eventId, event: eventType } = event;
  const started = Date.now();
  try {
    let supabase = deps.supabase;
    if (!supabase) {
      const { createServerSupabase } = await import('@/lib/supabase/server');
      supabase = createServerSupabase() as unknown as SupabaseMinimalLike;
    }
    const externalId = event.subscription?.id || event.payment?.id || event.id;

    let eventRowId: string | null = null;
    if (!opts.reprocessExisting) {
      const insertRes: SupabaseQueryResult = await (supabase as any)
        .from('asaas_webhook_events')
        .insert({
          event_id: eventId,
          event_type: eventType,
          external_id: externalId,
          payload: event,
          status: 'pending',
        })
        .select('id, status')
        .single();
      if (insertRes?.error) {
        const msg = insertRes.error.message || '';
        if (insertRes.error.code === '23505' || msg.includes('duplicate key')) {
          return { success: true, alreadyProcessed: true };
        }
        return { success: false, error: insertRes.error.message };
      }
      eventRowId = insertRes?.data?.id ?? null;
    } else {
      const existing: SupabaseQueryResult = await (supabase as any)
        .from('asaas_webhook_events')
        .select('id')
        .eq('event_id', eventId)
        .single();
      if (existing.error) return { success: false, error: existing.error.message };
      eventRowId = existing.data?.id ?? null;
    }
    if (!eventRowId) return { success: false, error: 'Failed to persist event row' };

    try {
      const router = deps.router ?? routeAsaasEventSafely;
      await router(eventType, event, supabase);
      const processingTime = Date.now() - started;
      const updateRes: SupabaseQueryResult = await (supabase as any)
        .from('asaas_webhook_events')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          processing_time_ms: processingTime,
          last_error: null,
        })
        .eq('id', eventRowId);
      if (updateRes?.error) return { success: false, error: updateRes.error.message };
      return { success: true };
    } catch (routerErr) {
      const processingTime = Date.now() - started;
      await (supabase as any)
        .from('asaas_webhook_events')
        .update({
          status: 'failed',
          last_error: (routerErr as Error).message,
          processed_at: new Date().toISOString(),
          processing_time_ms: processingTime,
          retry_count: opts.reprocessExisting ? undefined : 0,
        })
        .eq('id', eventRowId);
      return { success: false, error: (routerErr as Error).message };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// Re-export para consumidores externos (tests, rotas) evitarem importar diretamente de webhookTypes
export type { AsaasWebhookEvent, WebhookProcessResult } from './webhookTypes';
