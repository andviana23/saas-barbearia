#!/usr/bin/env node
/*
 * Verifica que a cobertura atual não está abaixo do baseline salvo.
 * Uso: após executar `jest --coverage` (gera coverage/coverage-summary.json)
 * - Se `scripts/coverage-baseline.json` não existir, cria com métricas atuais.
 * - Se existir, falha (exit 1) caso qualquer métrica global (statements, lines, branches, functions)
 *   caia mais que 0.01 ponto percentual.
 */
const fs = require('fs');
const path = require('path');

const summaryPath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
const baselinePath = path.join(process.cwd(), 'scripts', 'coverage-baseline.json');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

if (!fs.existsSync(summaryPath)) {
  console.error(
    '[coverage:verify] Arquivo coverage-summary.json não encontrado. Rode os testes com --coverage antes.',
  );
  process.exit(1);
}

const current = readJson(summaryPath).total;
const metrics = {
  statements: current.statements.pct,
  lines: current.lines.pct,
  branches: current.branches.pct,
  functions: current.functions.pct,
};

if (!fs.existsSync(baselinePath)) {
  fs.writeFileSync(
    baselinePath,
    JSON.stringify({ createdAt: new Date().toISOString(), metrics }, null, 2),
  );
  console.log('[coverage:verify] Baseline criado:', metrics);
  process.exit(0);
}

const baseline = readJson(baselinePath).metrics;
const regressions = [];
const tolerance = 0.01; // 1 centésimo de ponto percentual
for (const k of Object.keys(metrics)) {
  if (metrics[k] + tolerance < baseline[k]) {
    regressions.push({ metric: k, baseline: baseline[k], current: metrics[k] });
  }
}

if (regressions.length) {
  console.error('[coverage:verify] Regressões detectadas:');
  regressions.forEach((r) =>
    console.error(` - ${r.metric}: baseline ${r.baseline}% -> atual ${r.current}%`),
  );
  process.exit(1);
}

// Atualiza baseline se houve melhora (estratégia opcional; pode comentar se quiser aprovação manual)
let improved = false;
for (const k of Object.keys(metrics)) {
  if (metrics[k] > baseline[k]) improved = true;
}
if (improved) {
  fs.writeFileSync(
    baselinePath,
    JSON.stringify({ updatedAt: new Date().toISOString(), metrics }, null, 2),
  );
  console.log('[coverage:verify] Melhoria detectada. Baseline atualizado:', metrics);
} else {
  console.log('[coverage:verify] Cobertura mantida ou igual ao baseline.');
}
