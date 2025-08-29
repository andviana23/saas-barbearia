#!/usr/bin/env node
/**
 * Classificação automática heurística de allowed em coverage/rls-expected.json.
 * Heurística inicial:
 *  - role === 'public' => allowed=false (exigir decisão explícita depois se necessário)
 *  - demais roles derivados de policies => allowed=true para operações listadas
 *  - não altera entries já decididas (true/false)
 */
const fs = require('fs');
const path = require('path');

const expectedPath = path.join(process.cwd(), 'coverage', 'rls-expected.json');
if (!fs.existsSync(expectedPath)) {
  console.error('[rls:auto] coverage/rls-expected.json não encontrado. Rode sync primeiro.');
  process.exit(1);
}
let data = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
let changed = 0;
for (const e of data) {
  if (e.allowed === null) {
    if (e.role === 'public') {
      e.allowed = false;
    } else {
      e.allowed = true;
    }
    changed++;
  }
}
fs.writeFileSync(expectedPath, JSON.stringify(data, null, 2));
console.log(
  '[rls:auto] Atualizado',
  changed,
  'entradas (heurística). Revise posteriormente para exceções.',
);
