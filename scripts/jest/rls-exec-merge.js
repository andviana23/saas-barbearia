#!/usr/bin/env node
/**
 * Consolida execuções reais gravadas em coverage/rls-exec-log.jsonl dentro de coverage/rls-expected.json
 * Adicionando/atualizando campo allowedReal para cada combinação (último resultado ou agregação).
 * Estratégia: se qualquer execução teve success=true marcamos allowedReal=true, caso contrário false.
 */
const fs = require('fs');
const path = require('path');

const coverageDir = path.join(process.cwd(), 'coverage');
const expectedPath = path.join(coverageDir, 'rls-expected.json');
const logPath = path.join(coverageDir, 'rls-exec-log.jsonl');

if (!fs.existsSync(expectedPath)) {
  console.error('[rls:exec:merge] expected não encontrado');
  process.exit(1);
}
if (!fs.existsSync(logPath)) {
  console.error('[rls:exec:merge] log de execuções não encontrado');
  process.exit(1);
}

const expectedOriginal = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
// Clonar para permitir dry-run sem mutar array original
const expected = JSON.parse(JSON.stringify(expectedOriginal));
const lines = fs.readFileSync(logPath, 'utf-8').trim().split(/\n+/).filter(Boolean);
const agg = new Map();
for (const line of lines) {
  try {
    const rec = JSON.parse(line);
    const key = `${rec.table}|${rec.role}|${rec.operation}`;
    const cur = agg.get(key) || {
      anySuccess: false,
      anyFailure: false,
      successCount: 0,
      failureCount: 0,
      totalDuration: 0,
      samples: 0,
    };
    if (rec.success) cur.anySuccess = true;
    else cur.anyFailure = true;
    if (rec.success) {
      cur.successCount++;
    } else {
      cur.failureCount++;
    }
    if (typeof rec.durationMs === 'number') {
      cur.totalDuration += rec.durationMs;
      cur.samples++;
    }
    agg.set(key, cur);
  } catch (e) {
    // ignora linha inválida
  }
}
let updated = 0;
let enriched = 0;
for (const e of expected) {
  const key = `${e.table}|${e.role}|${e.operation}`;
  if (agg.has(key)) {
    const summary = agg.get(key);
    const newVal = summary.anySuccess ? true : false; // se nunca sucesso, assume false
    if (e.allowedReal !== newVal) {
      e.allowedReal = newVal;
      updated++;
    }
    const avg = summary.samples ? summary.totalDuration / summary.samples : null;
    e.realStats = {
      successCount: summary.successCount,
      failureCount: summary.failureCount,
      avgDurationMs: avg,
      lastMergedAt: new Date().toISOString(),
    };
    enriched++;
  }
}
const argvDry = process.argv.includes('--dry-run');
const dryEnv = (process.env.RLS_EXEC_MERGE_DRY || '').toLowerCase() === '1';
const isDry = argvDry || dryEnv;
if (isDry) {
  console.log('[rls:exec:merge] DRY-RUN: nenhuma escrita em arquivo. Resumo:');
} else {
  fs.writeFileSync(expectedPath, JSON.stringify(expected, null, 2));
}
console.log(
  '[rls:exec:merge] Atualizações em allowedReal:',
  updated,
  'Entradas enriquecidas:',
  enriched,
  isDry ? '(dry-run)' : '',
);
if (isDry && updated) {
  // Mostrar primeiras diferenças para inspeção
  let shown = 0;
  for (let i = 0; i < expected.length && shown < 10; i++) {
    const after = expected[i];
    const before = expectedOriginal.find(
      (b) => b.table === after.table && b.role === after.role && b.operation === after.operation,
    );
    if (!before) continue;
    if (before.allowedReal !== after.allowedReal) {
      console.log(
        `diff ${after.table} ${after.role} ${after.operation}: ${before.allowedReal} -> ${after.allowedReal}`,
      );
      shown++;
    }
  }
}
