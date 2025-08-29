#!/usr/bin/env node
/**
 * Gera um relatório simples de divergências entre:
 *  - coverage/rls-expected.json (decisões humanas allowed true/false)
 *  - coverage/rls-matrix.json (derivado das policies atuais)
 * Fase inicial: como ainda não executamos operações reais, usamos somente presença de operação na matriz.
 * Regras:
 *  - Se expected.allowed=true mas não existe operação correspondente na matriz => mismatch (policy ausente ou não expandiu)
 *  - Se expected.allowed=false mas existe operação => ok (assumimos deny via policy conditions ou falta de granting - granular real virá depois)
 *  - Futuro: incorporar execução real (scripts/jest/rls-crud-run) e marcar allowedReal.
 */
const fs = require('fs');
const path = require('path');

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

const coverageDir = path.join(process.cwd(), 'coverage');
const expectedPath = path.join(coverageDir, 'rls-expected.json');
const matrixPath = path.join(coverageDir, 'rls-matrix.json');

if (!fs.existsSync(expectedPath) || !fs.existsSync(matrixPath)) {
  console.error(
    '[rls:report] Arquivos necessários ausentes. Rode rls:generate e rls:expected:sync.',
  );
  process.exit(1);
}

const expected = loadJSON(expectedPath);
const matrix = loadJSON(matrixPath);

// Index matrix operations
const matrixIndex = new Set();
for (const t of matrix.tables || []) {
  for (const op of t.operations || []) {
    matrixIndex.add(`${t.table}|${op.role}|${op.operation}`);
  }
}

const divergencias = [];
for (const e of expected) {
  if (e.allowed === null) continue; // ignorar indecisos
  const key = `${e.table}|${e.role}|${e.operation}`;
  const inMatrix = matrixIndex.has(key);
  if (e.allowed === true && !inMatrix) {
    divergencias.push({ type: 'MISSING_POLICY_FOR_ALLOWED', ...e });
  }
  // Se já temos execução real (campo allowedReal presente), comparar:
  if (Object.prototype.hasOwnProperty.call(e, 'allowedReal') && e.allowedReal !== null) {
    if (e.allowed === true && e.allowedReal === false) {
      divergencias.push({ type: 'EXPECT_TRUE_BUT_DENIED', ...e });
    }
    if (e.allowed === false && e.allowedReal === true) {
      divergencias.push({ type: 'EXPECT_FALSE_BUT_ALLOWED', ...e });
    }
  }
}

console.log('=== RLS REPORT (fase heurística) ===');
const decided = expected.filter((e) => e.allowed !== null).length;
const withReal = expected.filter((e) => e.allowedReal !== undefined).length;
console.log('Total expected decididas:', decided);
console.log('Entradas com campo allowedReal presente:', withReal);
console.log('Divergências encontradas:', divergencias.length);
// Geração de artefatos (JSON + Markdown)
try {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(process.cwd(), 'coverage');
  fs.mkdirSync(dir, { recursive: true });
  const reportData = {
    generatedAt: new Date().toISOString(),
    decided,
    withReal,
    divergences: divergencias,
  };
  fs.writeFileSync(path.join(dir, 'rls-report.json'), JSON.stringify(reportData, null, 2));
  // Markdown
  let md = `# RLS Report\n\nGerado em: ${reportData.generatedAt}  \nEntradas decididas: ${decided}  \nCom allowedReal: ${withReal}  \nDivergências: ${divergencias.length}\n\n`;
  if (divergencias.length) {
    md += `## Divergências\n\n| Tipo | Tabela | Role | Operação | allowed | allowedReal |\n|------|--------|------|----------|---------|------------|\n`;
    for (const d of divergencias) {
      md += `| ${d.type} | ${d.table} | ${d.role} | ${d.operation} | ${d.allowed} | ${'allowedReal' in d ? d.allowedReal : ''} |\n`;
    }
    const byType = divergencias.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {});
    md += `\n### Resumo por Tipo\n\n`;
    for (const [t, c] of Object.entries(byType)) md += `- ${t}: ${c}\n`;
  } else {
    md += 'Nenhuma divergência.\n';
  }
  fs.writeFileSync(path.join(dir, 'rls-report.md'), md);
} catch (e) {
  // não falha se não conseguir gerar artefatos
}

if (divergencias.length) {
  console.log('\nTipo, Tabela, Role, Operação');
  for (const d of divergencias) {
    console.log(`${d.type}, ${d.table}, ${d.role}, ${d.operation}`);
  }
  console.log('\nRelatórios salvos em coverage/rls-report.(json|md)');
  process.exitCode = 1; // falha em divergência
} else {
  console.log('Nenhuma divergência detectada nesta fase. Relatórios salvos.');
}
