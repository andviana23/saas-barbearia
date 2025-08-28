/* eslint-disable @typescript-eslint/no-explicit-any */
import { routeAsaasEventSafely } from './webhookRouter';
import type { AsaasWebhookEvent } from './webhookTypes';

function makeBaseEvent(partial: Partial<AsaasWebhookEvent>): AsaasWebhookEvent {
  return {
    id: 'evt_abc',
    event: 'SUBSCRIPTION_CREATED',
    dateCreated: new Date().toISOString(),
    ...partial,
  } as AsaasWebhookEvent;
}

// Mocks supabase mínimo com espiões
function createSupabaseSpy() {
  const insertCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const updateCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const upsertCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const selectSingleMock = jest.fn();
  const eqReturn = { single: selectSingleMock };
  const eqMock = jest.fn().mockReturnValue(eqReturn);

  const tableObj: any = {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    insert: (data: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      insertCalls.push(data);
      return {
        select: () => ({
          single: jest.fn().mockResolvedValue({ data: { id: 'rowX' } }),
        }),
      };
    },
    update: (data: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      updateCalls.push(data);
      return { eq: jest.fn().mockResolvedValue({}) };
    },
    select: () => ({ eq: eqMock }),
    upsert: (data: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      upsertCalls.push(data);
      return {
        select: () => ({ single: jest.fn().mockResolvedValue({ data: { id: 'assinatura1' } }) }),
      };
    },
  };

  const supabase = { from: () => tableObj } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  return { supabase, insertCalls, upsertCalls, updateCalls, selectSingleMock, eqMock };
}

describe('webhookRouter handlers', () => {
  test('SUBSCRIPTION_CREATED registra evento e faz upsert de assinatura', async () => {
    const { supabase, insertCalls, upsertCalls } = createSupabaseSpy();
    const evt = makeBaseEvent({
      event: 'SUBSCRIPTION_CREATED',
      subscription: { id: 'sub_ext_1' },
    });

    await routeAsaasEventSafely(evt.event, evt, supabase);

    // Primeiro insert = registro do evento webhook; segundo (se houver) = upsert/insert da assinatura
    expect(insertCalls[0]).toHaveProperty('event_type', 'SUBSCRIPTION_CREATED');
    // Verifica se houve upsert com external_ref correto
    const assinaturaUpsert = upsertCalls.find((c) => c.external_ref === 'sub_ext_1');
    expect(assinaturaUpsert).toBeDefined();
  });

  test('CONFIRMED registra evento, pagamento e tenta atualizar assinatura', async () => {
    const { supabase, insertCalls, eqMock } = createSupabaseSpy();
    const evt = makeBaseEvent({
      event: 'CONFIRMED',
      payment: { id: 'pay_123' },
      subscription: { id: 'sub_ext_2' },
    });

    await routeAsaasEventSafely(evt.event, evt, supabase);

    // Primeiro insert é o evento; algum insert subsequente contem o pagamento
    expect(insertCalls[0]).toHaveProperty('event_type', 'CONFIRMED');
    expect(insertCalls.some((c) => c.external_payment_ref === 'pay_123')).toBe(true);
    // Busca de assinatura realizada (select -> eq)
    expect(eqMock).toHaveBeenCalledWith('external_ref', 'sub_ext_2');
  });

  test('evento desconhecido não quebra', async () => {
    const { supabase } = createSupabaseSpy();
    const evt = makeBaseEvent({ event: 'UNKNOWN_EVT' });
    await expect(routeAsaasEventSafely(evt.event, evt, supabase)).resolves.toBeUndefined();
  });

  test('SUBSCRIPTION_CREATED não recria assinatura existente (idempotência)', async () => {
    const { supabase, insertCalls, selectSingleMock } = createSupabaseSpy();
    // Simula assinatura já existente
    selectSingleMock.mockResolvedValue({ data: { id: 'existing1' } });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const evt = makeBaseEvent({
      event: 'SUBSCRIPTION_CREATED',
      subscription: { id: 'sub_ext_exist' },
    });
    await routeAsaasEventSafely(evt.event, evt, supabase);

    // Nenhum insert de assinatura efetuado
    expect(insertCalls.find((c) => c.external_ref === 'sub_ext_exist')).toBeUndefined();
    // Log de assinatura existente presente
    const logged = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(logged).toContain('assinatura_existente');
    consoleSpy.mockRestore();
  });

  test('CONFIRMED normaliza metodo e valor do pagamento e gera log', async () => {
    const { supabase, insertCalls, eqMock, selectSingleMock } = createSupabaseSpy();
    // Simula assinatura encontrada para atualizar status
    selectSingleMock.mockResolvedValue({ data: { id: 'ass_123' } });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const evt = makeBaseEvent({
      event: 'CONFIRMED',
      payment: { id: 'pay_norm_1' },
      subscription: { id: 'sub_ext_norm' },
      value: '10.50',
      method: 'credit_card',
    });

    await routeAsaasEventSafely(evt.event, evt, supabase);

    // Verifica busca de assinatura
    expect(eqMock).toHaveBeenCalledWith('external_ref', 'sub_ext_norm');
    // Localiza registro de pagamento
    const pagamento = insertCalls.find((c) => c.external_payment_ref === 'pay_norm_1');
    expect(pagamento).toBeDefined();
    expect(pagamento.metodo).toBe('cartao');
    expect(pagamento.valor).toBe(10.5);
    // Logs incluem insert_pagamento
    const logged = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(logged).toContain('insert_pagamento');
    consoleSpy.mockRestore();
  });

  test('CONFIRMED não atualiza status se já ativa', async () => {
    const { supabase, selectSingleMock, updateCalls } = createSupabaseSpy() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    // assinatura já ativa
    selectSingleMock.mockResolvedValue({ data: { id: 'ass_act', status: 'ativa' } });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const evt = makeBaseEvent({
      event: 'CONFIRMED',
      payment: { id: 'pay_skip_active' },
      subscription: { id: 'sub_ext_active' },
    });
    await routeAsaasEventSafely(evt.event, evt, supabase);

    // Nenhuma atualização de status (update com status ativa não deve ocorrer)
    expect(updateCalls.filter((c: any) => c.status === 'ativa').length).toBe(0); // eslint-disable-line @typescript-eslint/no-explicit-any
    const logged = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(logged).toContain('skip_update_status');
    consoleSpy.mockRestore();
  });

  test('CONFIRMED reativa assinatura expirada', async () => {
    const { supabase, selectSingleMock, updateCalls } = createSupabaseSpy() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    selectSingleMock.mockResolvedValue({ data: { id: 'ass_exp', status: 'expirada' } });
    const evt = makeBaseEvent({
      event: 'CONFIRMED',
      payment: { id: 'pay_react' },
      subscription: { id: 'sub_ext_exp' },
    });
    await routeAsaasEventSafely(evt.event, evt, supabase);
    expect(updateCalls.some((c: any) => c.status === 'ativa')).toBe(true); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  test('CONFIRMED não reativa assinatura cancelada', async () => {
    const { supabase, selectSingleMock, updateCalls } = createSupabaseSpy() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    selectSingleMock.mockResolvedValue({ data: { id: 'ass_cancel', status: 'cancelada' } });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const evt = makeBaseEvent({
      event: 'CONFIRMED',
      payment: { id: 'pay_cancel' },
      subscription: { id: 'sub_ext_cancel' },
    });
    await routeAsaasEventSafely(evt.event, evt, supabase);
    expect(updateCalls.some((c: any) => c.status === 'ativa')).toBe(false); // eslint-disable-line @typescript-eslint/no-explicit-any
    const logged = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(logged).toContain('assinatura_cancelada');
    consoleSpy.mockRestore();
  });
});
