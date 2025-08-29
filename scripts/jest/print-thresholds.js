#!/usr/bin/env node
/** Lê coverage/coverage-summary.json e imprime comparação com thresholds configurados. */
const fs = require('fs');
const path = require('path');
(async () => {
  const cfgExport = require('../../jest.config.js');
  const resolved = typeof cfgExport === 'function' ? await cfgExport() : cfgExport;
  const thresholds = resolved.coverageThreshold?.global || {};
  const summaryPath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.error(
      '[coverage:thresholds] coverage-summary.json não encontrado. Rode testes com --coverage.',
    );
    process.exit(1);
  }
  const total = JSON.parse(fs.readFileSync(summaryPath, 'utf-8')).total;
  const metrics = {
    lines: total.lines.pct,
    statements: total.statements.pct,
    functions: total.functions.pct,
    branches: total.branches.pct,
  };
  console.log('[coverage:thresholds] thresholds configurados:', thresholds);
  console.log('[coverage:thresholds] métricas atuais:', metrics);
  const status = Object.entries(thresholds).map(([k, v]) => ({
    metric: k,
    required: v,
    current: metrics[k],
  }));
  status.forEach((s) =>
    console.log(
      ` - ${s.metric}: ${s.current.toFixed(2)}% (min ${s.required}%) ${
        s.current >= s.required ? 'OK' : 'FAIL'
      }`,
    ),
  );
})();
