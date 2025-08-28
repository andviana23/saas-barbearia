import { describe, it, expect } from '@jest/globals';

describe('webhook ASAAS route smoke', () => {
  it('route module loads', async () => {
    const mod = await import('../../src/app/api/asaas/webhook/route');
    expect(typeof mod.POST).toBe('function');
  });
});
