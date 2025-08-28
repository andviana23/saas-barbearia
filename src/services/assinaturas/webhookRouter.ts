// Roteador de eventos ASAAS - versão inicial segura
import type { AsaasWebhookEvent } from './webhookTypes';

// Assunções:
// - payload.subscription.id é external_ref da assinatura
// - payload.payment.id é external_payment_ref do pagamento
// - Plano e cliente já existem (caso contrário registro fica pendente de reconciliação manual)
// - Unidade pode ser inferida futuramente via mapeamento (não disponível no payload -> placeholder)

interface SupabaseQueryResult<E = unknown> {
  error?: { code?: string; message: string };
  data?: E;
}

export interface SupabaseTableRef {
  select: (cols: string) => SupabaseTableRef;
  update: (data: unknown) => { eq: (col: string, val: unknown) => Promise<SupabaseQueryResult> };
  insert: (data: unknown) => {
    select: (cols: string) => { single: () => Promise<SupabaseQueryResult> };
  };
  // upsert pode não existir no mock; tratamos condicionalmente
  upsert?: (
    data: unknown,
    opts?: unknown,
  ) => { select: (cols: string) => { single: () => Promise<SupabaseQueryResult> } };
  // permitir chain eq após select para lookup
  eq?: (col: string, val: unknown) => { single: () => Promise<SupabaseQueryResult> };
}

export interface SupabaseMinimal {
  from: (table: string) => SupabaseTableRef;
}

// Tipos de handlers
export type AsaasEventHandler = (
  payload: AsaasWebhookEvent,
  deps: { supabase: SupabaseMinimal },
) => Promise<void>;

// Helpers internos
async function upsertAssinaturaByExternalRef(
  supabase: SupabaseMinimal,
  externalRef: string,
  data: Record<string, unknown>,
) {
  // Log estruturado de tentativa de upsert
  console.log(
    JSON.stringify({
      source: 'asaas_webhook',
      action: 'upsert_assinatura',
      external_ref: externalRef,
    }),
  );
  const table = supabase.from('assinaturas');
  if (table.upsert) {
    return table
      .upsert({ external_ref: externalRef, ...data }, { onConflict: 'external_ref' })
      .select('id')
      .single();
  }
  // Fallback: tenta localizar e decidir insert/update simples (simplificado: sempre insert ignorando conflito)
  return table
    .insert({ external_ref: externalRef, ...data })
    .select('id')
    .single();
}

async function insertPagamentoIfNotExists(
  supabase: SupabaseMinimal,
  assinaturaId: string | null,
  externalPaymentRef: string,
  data: Record<string, unknown>,
) {
  console.log(
    JSON.stringify({
      source: 'asaas_webhook',
      action: 'insert_pagamento',
      external_payment_ref: externalPaymentRef,
      assinatura_id_present: Boolean(assinaturaId),
    }),
  );
  const table = supabase.from('pagamentos_assinaturas');
  // Estratégia simples: tentativa de insert; se duplicado ignorar
  const res = await table
    .insert({ external_payment_ref: externalPaymentRef, assinatura_id: assinaturaId, ...data })
    .select('id')
    .single();
  if (res.error && (res.error.code === '23505' || res.error.message?.includes('duplicate'))) {
    return { ignored: true };
  }
  return res;
}

// Normalizações auxiliares
function normalizeMetodo(input: unknown): string {
  const val = String(input || '').toLowerCase();
  if (['credit_card', 'cartao', 'card'].includes(val)) return 'cartao';
  if (['pix'].includes(val)) return 'pix';
  if (['boleto', 'bank_slip'].includes(val)) return 'boleto';
  return 'cartao';
}

function toNumeroPositivo(n: unknown): number {
  const num = typeof n === 'number' ? n : parseFloat(String(n));
  if (Number.isNaN(num) || num < 0) return 0;
  return num;
}

async function fetchAssinaturaExistente(
  supabase: SupabaseMinimal,
  externalRef: string,
): Promise<{ id: string } | null> {
  const res = await supabase
    .from('assinaturas')
    .select('id')
    .eq?.('external_ref', externalRef)
    ?.single?.();
  if (res && !res.error) return (res.data as any) || null; // eslint-disable-line @typescript-eslint/no-explicit-any
  return null;
}

// Handler: criação/atualização de assinatura externa
const subscriptionCreated: AsaasEventHandler = async (payload, { supabase }) => {
  const externalRef = payload.subscription?.id;
  if (!externalRef) return; // nada a fazer
  // Se já existe, não recria
  const existente = await fetchAssinaturaExistente(supabase, externalRef);
  if (existente) {
    console.log(
      JSON.stringify({
        source: 'asaas_webhook',
        action: 'assinatura_existente',
        external_ref: externalRef,
        assinatura_id: existente.id,
      }),
    );
    return; // idempotente
  }
  // Dados mínimos - placeholders onde não temos contexto (cliente/plano/unidade)
  const now = new Date();
  const fim = new Date(now);
  fim.setMonth(fim.getMonth() + 1);
  await upsertAssinaturaByExternalRef(supabase, externalRef, {
    // Campos obrigatórios fictícios - assumem placeholders controlados
    plano_id: payload.planId || '00000000-0000-0000-0000-000000000000',
    cliente_id: payload.customerId || '00000000-0000-0000-0000-000000000000',
    unidade_id: payload.unitId || '00000000-0000-0000-0000-000000000000',
    inicio: now.toISOString().slice(0, 10),
    fim: fim.toISOString().slice(0, 10),
    status: 'ativa',
  });
};

// Handler: pagamento recebido - registra pagamento e atualiza status assinatura se aplicável
const paymentReceived: AsaasEventHandler = async (payload, { supabase }) => {
  const paymentId = payload.payment?.id;
  if (!paymentId) return;
  const subscriptionId = payload.subscription?.id;
  // Localiza assinatura pela external_ref
  let assinaturaId: string | null = null;
  let assinaturaStatusAtual: string | null = null;
  if (subscriptionId) {
    const res = await supabase
      .from('assinaturas')
      .select('id,status')
      .eq?.('external_ref', subscriptionId)
      ?.single?.();
    // Caso eq ou single não existam na tipagem mínima, res ficará undefined
    if (res && !res.error) {
      assinaturaId = (res.data as any)?.id; // eslint-disable-line @typescript-eslint/no-explicit-any
      assinaturaStatusAtual = (res.data as any)?.status || null; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
  await insertPagamentoIfNotExists(supabase, assinaturaId, paymentId, {
    valor: toNumeroPositivo((payload as any)?.value), // eslint-disable-line @typescript-eslint/no-explicit-any
    metodo: normalizeMetodo((payload as any)?.method), // eslint-disable-line @typescript-eslint/no-explicit-any
    status: 'pago',
  });
  // Atualiza assinatura para ativa se encontrada
  if (assinaturaId) {
    // Validação de transição de status: só reativa se não estiver cancelada e não for já ativa
    const podeAtualizar = (current: string | null, novo: string) => {
      if (!novo) return false;
      const validos = ['ativa', 'cancelada', 'expirada'];
      if (!validos.includes(novo)) return false;
      if (current === novo) return false; // já está no estado
      if (current === 'cancelada') return false; // regra: cancelada não é reativada automaticamente
      return true; // expirada -> ativa ou indeterminado -> ativa
    };
    if (podeAtualizar(assinaturaStatusAtual, 'ativa')) {
      await supabase.from('assinaturas').update({ status: 'ativa' }).eq('id', assinaturaId);
    } else {
      console.log(
        JSON.stringify({
          source: 'asaas_webhook',
          action: 'skip_update_status',
          assinatura_id: assinaturaId,
          status_atual: assinaturaStatusAtual,
          motivo: assinaturaStatusAtual === 'cancelada' ? 'assinatura_cancelada' : 'sem_alteracao',
        }),
      );
    }
  }
};

// Mapa de roteamento
const handlers: Record<string, AsaasEventHandler> = {
  SUBSCRIPTION_CREATED: subscriptionCreated,
  CONFIRMED: paymentReceived,
  // Alias legado (pode ser removido futuramente):
  PAYMENT_RECEIVED: paymentReceived,
};

export async function routeAsaasEventSafely(
  eventType: string,
  payload: AsaasWebhookEvent,
  supabase: SupabaseMinimal,
): Promise<void> {
  const key = eventType.toUpperCase();
  const handler = handlers[key];
  if (!handler) return; // ignorar eventos desconhecidos

  // Persistência básica do evento para idempotência/auditoria
  const start = Date.now();
  let eventRowId: string | null = null;
  try {
    const insertRes = await supabase
      .from('asaas_webhook_events')
      .insert({
        event_id: (payload as any)?.id || `${key}-${Date.now()}`, // eslint-disable-line @typescript-eslint/no-explicit-any
        event_type: key,
        payload,
        status: 'pending',
      })
      .select('id')
      .single();
    if (!insertRes.error) {
      eventRowId = (insertRes.data as any)?.id || null; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  } catch (err) {
    console.warn('[asaas_webhook] falha ao registrar evento (prosseguindo):', err);
  }

  try {
    await handler(payload, { supabase });
    if (eventRowId) {
      await supabase
        .from('asaas_webhook_events')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          processing_time_ms: Date.now() - start,
        })
        .eq('id', eventRowId);
    }
  } catch (err: unknown) {
    if (eventRowId) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase
        .from('asaas_webhook_events')
        .update({
          status: 'failed',
          last_error: message,
        })
        .eq('id', eventRowId);
    }
    throw err; // manter superfície de erro para observabilidade externa
  }
}
