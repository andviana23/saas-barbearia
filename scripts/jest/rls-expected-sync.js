#!/usr/bin/env node
/**
 * Sincroniza arquivo de expectativas de permissões RLS baseado na matriz gerada.
 * Uso: npm run rls:generate && node scripts/jest/rls-expected-sync.js
 * - Lê coverage/rls-matrix.json
 * - Gera (se não existir) coverage/rls-expected.json com entries {table, role, operation, allowed|null}
 *   onde allowed=null indica que precisa decidir manualmente.
 * - Se já existir, preserva valores allowed definidos e adiciona novas combinações ausentes.
 */
const fs = require('fs');
const path = require('path');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

const matrixPath = path.join(process.cwd(), 'coverage', 'rls-matrix.json');
if (!fs.existsSync(matrixPath)) {
  console.error('[rls:expected] Matriz não encontrada. Rode npm run rls:generate primeiro.');
  process.exit(1);
}
const matrix = loadJson(matrixPath);
const expectedPath = path.join(process.cwd(), 'coverage', 'rls-expected.json');

let expected = [];
if (fs.existsSync(expectedPath)) {
  expected = loadJson(expectedPath);
}

// Index existente para lookup
const index = new Map();
for (const e of expected) {
  index.set(`${e.table}|${e.role}|${e.operation}`, e);
}

let added = 0;
for (const t of matrix.tables) {
  const ops = t.operations || [];
  for (const op of ops) {
    const key = `${t.table}|${op.role}|${op.operation}`;
    if (!index.has(key)) {
      const entry = { table: t.table, role: op.role, operation: op.operation, allowed: null };
      expected.push(entry);
      index.set(key, entry);
      added++;
    }
  }
}

expected.sort(
  (a, b) =>
    a.table.localeCompare(b.table) ||
    a.role.localeCompare(b.role) ||
    a.operation.localeCompare(b.operation),
);
fs.writeFileSync(expectedPath, JSON.stringify(expected, null, 2));
console.log('[rls:expected] Salvo em coverage/rls-expected.json. Novas combinações:', added);
if (added) {
  console.log('Defina allowed=true/false para novas linhas (allowed=null).');
}
