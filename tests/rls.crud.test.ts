/**
 * Teste CRUD RLS placeholder.
 * Lê coverage/rls-expected.json e tenta executar operações simuladas.
 * Futuro: substituir executeCrud por chamadas reais a Postgres.
 */
import fs from 'fs';
import path from 'path';
import { executeCrud } from './utils/rlsCrudRunner';

interface ExpectedEntry {
  table: string;
  role: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  allowed: boolean | null;
}

describe('RLS CRUD Placeholder', () => {
  const expectedPath = path.join(process.cwd(), 'coverage', 'rls-expected.json');
  if (!fs.existsSync(expectedPath)) {
    it('sem rls-expected.json ainda', () => {
      expect(true).toBe(true);
    });
    return;
  }
  const entries: ExpectedEntry[] = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
  const decididas = entries.filter((e) => e.allowed !== null);
  if (!decididas.length) {
    it('nenhuma combinação decidida ainda', () => {
      expect(true).toBe(true);
    });
    return;
  }
  it.each(decididas.map((e) => [e.table, e.role, e.operation, e.allowed]))(
    '%s %s %s -> allowed=%s',
    async (table, role, operation, allowed) => {
      const res = await executeCrud({ table, role, operation });
      expect(res.success).toBe(allowed);
    },
  );
});
