import { ping } from '../ping';

describe('ping action coverage POC', () => {
  test('retorna pong', async () => {
    const r = await ping('test');
    expect(r).toBe('pong:test');
  });

  test('erro em vazio', async () => {
    await expect(ping('')).rejects.toThrow('valor vazio');
  });
});
