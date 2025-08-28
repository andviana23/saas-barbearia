import { describe, it, expect } from '@jest/globals';

// Placeholder - futura importação real da server action

describe('agenda actions smoke', () => {
  it('createAppointmentAction exists', async () => {
    // Usando import dinâmico para evitar cache incorreto
    const mod = await import('../../src/app/(protected)/agenda/_actions');
    expect(typeof mod.createAppointmentAction).toBe('function');
  });
});
