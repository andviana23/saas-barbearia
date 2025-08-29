#!/usr/bin/env node
/**
 * Lista os maiores arquivos (por linhas) com 0% de statements a partir de coverage-summary (lcov ou json).
 * Uso: node scripts/coverage/list-zero-coverage.js coverage/coverage-summary.json
 */
const fs = require('fs');

const summaryPath = process.argv[2] || 'coverage/coverage-summary.json';
if (!fs.existsSync(summaryPath)) {
  console.error('Arquivo de summary não encontrado:', summaryPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const entries = Object.entries(data).filter(
  ([file]) => file.endsWith('.ts') || file.endsWith('.tsx'),
);

const zero = entries
  .filter(([, m]) => m.statements.pct === 0)
  .map(([file, m]) => ({ file, lines: m.lines.total }))
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 20);

console.log('\nTop arquivos 0% cobertura (limite 20):');
zero.forEach((e, i) => console.log(`${i + 1}. ${e.file} (${e.lines} linhas)`));

if (!zero.length) console.log('Nenhum arquivo com 0% encontrado.');
