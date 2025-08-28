import { logActionSuccess, logActionError, withActionLogging } from '@/lib/logging/actionLogger';

describe('actionLogger', () => {
  const originalLog = console.log;
  const originalError = console.error;
  let logs: string[] = [];
  let errors: string[] = [];

  beforeEach(() => {
    logs = [];
    errors = [];
    console.log = (msg?: unknown) => {
      if (typeof msg === 'string') logs.push(msg);
    };
    console.error = (msg?: unknown) => {
      if (typeof msg === 'string') errors.push(msg);
    };
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  it('logActionSuccess registra payload JSON', () => {
    logActionSuccess({ action: 'test_action', userId: 'u1', unitId: 'un1' });
    expect(logs.length).toBe(1);
    const payload = JSON.parse(logs[0]);
    expect(payload.type).toBe('action.success');
    expect(payload.action).toBe('test_action');
  });

  it('logActionError registra payload de erro', () => {
    logActionError({ action: 'fail_action', error: 'boom' });
    expect(errors.length).toBe(1);
    const payload = JSON.parse(errors[0]);
    expect(payload.type).toBe('action.error');
    expect(payload.error).toBe('boom');
  });

  it('withActionLogging registra sucesso e erro e redige entrada longa', async () => {
    const longInput: { secretToken: string; big: string } = {
      secretToken: '123',
      big: 'x'.repeat(500),
    }; // secretToken deve ser removido
    await withActionLogging('ok_action', async () => 'result', { input: longInput });
    expect(logs.length).toBe(1);
    const successPayload = JSON.parse(logs[0]);
    expect(successPayload.inputRedacted.big.endsWith('…')).toBe(true);
    expect(successPayload.inputRedacted.secretToken).toBeUndefined();

    await expect(
      withActionLogging(
        'err_action',
        async () => {
          throw new Error('failure');
        },
        { input: { a: 1 } },
      ),
    ).rejects.toThrow('failure');
    expect(errors.length).toBe(1);
    const errorPayload = JSON.parse(errors[0]);
    expect(errorPayload.action).toBe('err_action');
    expect(errorPayload.error).toBe('failure');
  });
});
