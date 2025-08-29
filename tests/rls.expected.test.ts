/**
 * Valida arquivo coverage/rls-expected.json (se existir) para não deixar combinações sem decisão.
 * Use `npm run rls:expected:sync` para gerar/atualizar.
 */
import fs from 'fs';
import path from 'path';

describe('RLS Expected Permissions', () => {
  const p = path.join(process.cwd(), 'coverage', 'rls-expected.json');
  const strict = process.env.RLS_EXPECTED_STRICT === '1';
  if (!fs.existsSync(p)) {
    it('arquivo inexistente', () => {
      if (strict) {
        throw new Error(
          'RLS_EXPECTED_STRICT=1 mas coverage/rls-expected.json não existe. Rode `npm run rls:expected:sync` e classifique allowed.',
        );
      }
      expect(true).toBe(true);
    });
    return;
  }
  interface ExpectedEntry {
    table: string;
    role: string;
    operation: string;
    allowed: boolean | null;
  }
  const data: ExpectedEntry[] = JSON.parse(fs.readFileSync(p, 'utf-8'));
  it('expectativas definidas e sem pendências em modo estrito', () => {
    if (!Array.isArray(data)) throw new Error('Formato inválido em rls-expected.json');
    if (!data.length) {
      if (strict)
        throw new Error(
          'Arquivo rls-expected.json vazio em modo estrito – gere matriz e sincronize.',
        );
      expect(true).toBe(true);
      return;
    }
    const pendentes = data.filter((e) => e.allowed === null);
    if (pendentes.length) {
      console.warn('[RLS expected] combinações pendentes:', pendentes.length);
      if (strict) {
        const sample = pendentes
          .slice(0, 5)
          .map((p) => `${p.table}|${p.role}|${p.operation}`)
          .join(', ');
        throw new Error(
          `Há ${pendentes.length} combinações RLS sem decisão (allowed=null). Ex: ${sample}${pendentes.length > 5 ? '...' : ''}`,
        );
      }
    }
    expect(true).toBe(true);
  });
});
