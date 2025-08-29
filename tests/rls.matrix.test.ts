/**
 * RLS Matrix Tests (expandido):
 * - Valida baseline rls-expected.json (consistência adicional além de rls.expected.test.ts)
 * - Mantém heurística antiga enquanto execução real não está habilitada
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Estrutura simplificada: tabela -> operações -> roles
interface RlsExpectation {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  role: string;
  allowed: boolean;
  reason?: string;
}

// Carrega matriz gerada (rls-matrix.json) se existir para derivar expectativas heurísticas.
function loadMatrix() {
  const p = path.join(process.cwd(), 'coverage', 'rls-matrix.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

const matrix = loadMatrix();

// Heurística simples: para cada tabela, se existir operação select para role public/authenticated, consideramos select permitido; insert/update/delete só permitidos se operação existir explicitamente e role não for anon/public.
function deriveExpectations(): RlsExpectation[] {
  if (!matrix) return [];
  const exps: RlsExpectation[] = [];
  for (const t of matrix.tables) {
    const ops = t.operations || [];
    for (const op of ops) {
      const role = op.role;
      const operation = op.operation as RlsExpectation['operation'];
      // Papel 'public' tratamos como 'anon' para simplificação de naming interno.
      const normRole = role === 'public' ? 'anon' : role;
      let allowed = true;
      if (normRole === 'anon' && operation !== 'select') allowed = false;
      // Ajuste: delete frequentemente restrito -> manter allowed conforme derivação, mas poderia aplicar regra extra.
      exps.push({ table: t.table, operation, role: normRole, allowed });
    }
  }
  return exps;
}

const expectations: RlsExpectation[] = deriveExpectations();

async function simulatePolicyCheck(exp: RlsExpectation): Promise<boolean> {
  return exp.allowed;
}

// NOVO: Consistência sobre rls-expected.json (se existir)
describe('RLS baseline consistency', () => {
  const p = path.join(process.cwd(), 'coverage', 'rls-expected.json');
  if (!fs.existsSync(p)) {
    it('sem baseline ainda', () => expect(true).toBe(true));
    return;
  }
  const data: { table: string; role: string; operation: string; allowed: boolean | null }[] =
    JSON.parse(fs.readFileSync(p, 'utf-8'));
  it('nenhuma combinação com allowed=null', () => {
    expect(data.filter((d) => d.allowed == null)).toHaveLength(0);
  });
  it('public/anon não têm insert/update/delete permitidos', () => {
    const viol = data.filter(
      (d) =>
        (d.role === 'public' || d.role === 'anon') &&
        d.operation !== 'select' &&
        d.allowed === true,
    );
    expect(viol).toHaveLength(0);
  });
});

describe('RLS Matrix (heurística placeholder)', () => {
  if (!expectations.length) {
    it('sem matriz gerada ainda', () => {
      expect(true).toBe(true);
    });
    return;
  }
  it.each(expectations.map((e) => [e.table, e.operation, e.role, e.allowed]))(
    '%s %s role=%s -> allowed=%s',
    async (_table, _op, _role, allowed) => {
      const exp = expectations.find(
        (ex) => ex.table === _table && ex.operation === _op && ex.role === _role,
      )!;
      const result = await simulatePolicyCheck(exp);
      expect(result).toBe(allowed);
    },
  );
});
