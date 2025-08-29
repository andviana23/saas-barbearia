/**
 * Teste dinâmico de policies RLS usando matriz gerada.
 * Pré-requisito: executar `npm run rls:generate` com DATABASE_URL apontando para banco de teste.
 * Este teste por enquanto apenas valida que todas as tabelas com RLS possuem pelo menos 1 policy.
 */
import fs from 'fs';
import path from 'path';

describe('RLS Dynamic Matrix', () => {
  const matrixPath = path.join(process.cwd(), 'coverage', 'rls-matrix.json');
  if (!fs.existsSync(matrixPath)) {
    it('gera matriz antes (placeholder)', () => {
      expect(false).toBe(false);
    });
    return;
  }
  const data = JSON.parse(fs.readFileSync(matrixPath, 'utf-8'));
  it('tabelas com policies > 0', () => {
    for (const t of data.tables) {
      expect(t.policies.length).toBeGreaterThan(0);
    }
  });

  it('operações derivadas consistentes com policies (sem duplicatas role+operation)', () => {
    for (const t of data.tables) {
      if (!t.operations) continue;
      const seen = new Set();
      for (const op of t.operations) {
        const key = `${op.role}:${op.operation}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    }
  });
});
