import { processAsaasWebhook } from './webhook';
import type { AsaasWebhookEvent } from './webhookTypes';

// Helper para criar evento base
function makeEvent(overrides: Partial<AsaasWebhookEvent> = {}): AsaasWebhookEvent {
  return {
    id: 'evt_1',
    event: 'SUBSCRIPTION_CREATED',
    dateCreated: new Date().toISOString(),
    subscription: { id: 'sub_1' },
    ...overrides,
  } as AsaasWebhookEvent;
}

// Cria mock mínimo do supabase utilizado pelo serviço
function createSupabaseMock() {
  const insertSingleMock = jest.fn();
  const existingSingleMock = jest.fn();
  const updateEqMock = jest.fn();
  const updateMock = jest.fn().mockImplementation((data: Record<string, unknown>) => ({
    eq: () => updateEqMock(data),
  }));

  const supabase = {
    from: jest.fn().mockImplementation(() => ({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: insertSingleMock }),
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ single: existingSingleMock }),
      }),
      update: updateMock,
    })),
  } as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  return { supabase, insertSingleMock, existingSingleMock, updateEqMock };
}

describe('processAsaasWebhook', () => {
  test('retorna erro para payload inválido', async () => {
    const res = await processAsaasWebhook({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(res.success).toBe(false);
    expect(res.error).toBe('Invalid webhook payload');
  });

  test('processa novo evento com sucesso', async () => {
    const { supabase, insertSingleMock, updateEqMock } = createSupabaseMock();
    insertSingleMock.mockResolvedValue({ data: { id: 'row1' } });
    updateEqMock.mockResolvedValue({});
    const router = jest.fn().mockResolvedValue(undefined);

    const res = await processAsaasWebhook(makeEvent(), { supabase, router });

    expect(res).toEqual({ success: true });
    expect(router).toHaveBeenCalledTimes(1);
    expect(updateEqMock).toHaveBeenCalledTimes(1);
    const updateArgs = updateEqMock.mock.calls[0][0];
    expect(updateArgs.status).toBe('processed');
  });

  test('retorna alreadyProcessed em erro de duplicidade', async () => {
    const { supabase, insertSingleMock } = createSupabaseMock();
    insertSingleMock.mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value' },
    });

    const res = await processAsaasWebhook(makeEvent(), { supabase });
    expect(res.success).toBe(true);
    expect(res.alreadyProcessed).toBe(true);
  });

  test('reprocessExisting busca row e atualiza', async () => {
    const { supabase, existingSingleMock, updateEqMock } = createSupabaseMock();
    existingSingleMock.mockResolvedValue({ data: { id: 'row_re' } });
    updateEqMock.mockResolvedValue({});
    const router = jest.fn().mockResolvedValue(undefined);

    const res = await processAsaasWebhook(
      makeEvent(),
      { supabase, router },
      { reprocessExisting: true },
    );

    expect(res.success).toBe(true);
    expect(router).toHaveBeenCalledTimes(1);
  });

  test('caminho de erro no router marca failed', async () => {
    const { supabase, insertSingleMock, updateEqMock } = createSupabaseMock();
    insertSingleMock.mockResolvedValue({ data: { id: 'row_err' } });
    updateEqMock.mockResolvedValue({});
    const router = jest.fn().mockRejectedValue(new Error('boom'));

    const res = await processAsaasWebhook(makeEvent(), { supabase, router });

    expect(res.success).toBe(false);
    expect(res.error).toBe('boom');
    // primeira (e única) atualização deve ser status failed
    const updateArgs = updateEqMock.mock.calls[0][0];
    expect(updateArgs.status).toBe('failed');
    expect(updateArgs.last_error).toBe('boom');
  });

  test('erro ao atualizar status processed retorna falha', async () => {
    const { supabase, insertSingleMock, updateEqMock } = createSupabaseMock();
    // insert ok
    insertSingleMock.mockResolvedValue({ data: { id: 'row_upd_err' } });
    // update devolve erro
    updateEqMock.mockResolvedValue({ error: { message: 'update fail' } });
    const router = jest.fn().mockResolvedValue(undefined);

    const res = await processAsaasWebhook(makeEvent(), { supabase, router });

    expect(res.success).toBe(false);
    expect(res.error).toBe('update fail');
  });

  test('erro de insert não duplicado retorna falha', async () => {
    const { supabase, insertSingleMock } = createSupabaseMock();
    insertSingleMock.mockResolvedValue({ error: { code: '500', message: 'db fail' } });

    const res = await processAsaasWebhook(makeEvent(), { supabase });
    expect(res.success).toBe(false);
    expect(res.error).toBe('db fail');
  });

  test('falha ao persistir (sem id retornado) retorna erro específico', async () => {
    const { supabase, insertSingleMock } = createSupabaseMock();
    insertSingleMock.mockResolvedValue({ data: {} });

    const res = await processAsaasWebhook(makeEvent(), { supabase });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Failed to persist event row');
  });
});
