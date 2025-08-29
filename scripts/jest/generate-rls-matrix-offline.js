#!/usr/bin/env node
/**
 * Geração OFFLINE da matriz RLS a partir das migrations SQL.
 * Útil quando não há acesso ao banco ou credenciais válidas.
 * Limitações: não avalia policies dinâmicas já alteradas diretamente no banco.
 */
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.error('[rls:matrix:offline] Diretório db/migrations não encontrado');
  process.exit(1);
}

// Regex simplificada para capturar blocos CREATE POLICY ... ;
// Depois parseamos campos básicos (nome, tabela, comando, roles)
function extractPolicies(sql) {
  const policies = [];
  const regex =
    /create\s+policy\s+([^\s]+)\s+on\s+([a-zA-Z0-9_."]+)\s+for\s+(select|insert|update|delete|all)/gi;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const nameRaw = match[1];
    const tableRaw = match[2];
    const command = match[3].toLowerCase();
    // Procura trecho a partir do índice atual até ponto-e-vírgula para extrair TO / USING / WITH CHECK
    const tail = sql.slice(match.index, sql.indexOf(';', match.index) + 1);
    // Roles: TO role1, role2 | TO PUBLIC
    let roles = ['public'];
    const toMatch = /\bto\s+([^;\n]+)/i.exec(tail);
    if (toMatch) {
      const toSegment = toMatch[1].split(/using|with\s+check|for\s+/i)[0];
      if (/public/i.test(toSegment)) {
        roles = ['public'];
      } else {
        roles = toSegment
          .split(',')
          .map((r) => r.replace(/"/g, '').trim())
          .filter(Boolean);
      }
    }
    // USING (qual)
    let using = null;
    const usingMatch = /using\s*\(([^)]*)\)/i.exec(tail);
    if (usingMatch) using = usingMatch[1].trim();
    // WITH CHECK (expr)
    let withCheck = null;
    const checkMatch = /with\s+check\s*\(([^)]*)\)/i.exec(tail);
    if (checkMatch) withCheck = checkMatch[1].trim();

    // Normaliza tabela schema.table
    let table = tableRaw.replace(/"/g, '');
    if (!table.includes('.')) {
      table = 'public.' + table;
    }
    policies.push({
      name: nameRaw.replace(/"/g, ''),
      table,
      command,
      roles,
      using,
      check: withCheck,
    });
  }
  return policies;
}

const allPolicies = [];
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
for (const f of files) {
  const full = path.join(migrationsDir, f);
  const content = fs.readFileSync(full, 'utf-8');
  const policies = extractPolicies(content);
  if (policies.length) {
    allPolicies.push(...policies);
  }
}

const grouped = {};
for (const p of allPolicies) {
  grouped[p.table] = grouped[p.table] || { table: p.table, policies: [], operations: [] };
  grouped[p.table].policies.push({
    name: p.name,
    roles: p.roles,
    command: p.command,
    using: p.using,
    check: p.check,
  });
  const ops = p.command === 'all' ? ['select', 'insert', 'update', 'delete'] : [p.command];
  for (const role of p.roles) {
    for (const op of ops) {
      if (!grouped[p.table].operations.find((o) => o.role === role && o.operation === op)) {
        grouped[p.table].operations.push({ role, operation: op, sourcePolicy: p.name });
      }
    }
  }
}

const outDir = path.join(process.cwd(), 'coverage');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'rls-matrix.json');
const out = { generatedAt: new Date().toISOString(), tables: Object.values(grouped) };
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('[rls:matrix:offline] Gerado em', outPath, 'tabelas:', out.tables.length);
if (!out.tables.length) {
  console.warn(
    '[rls:matrix:offline] Nenhuma policy encontrada nas migrations. Verifique se CREATE POLICY existe.',
  );
}
