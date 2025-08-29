#!/usr/bin/env node
/**
 * Gera baseline coverage/rls-expected.json diretamente de supabase/migrations
 * sem depender de conexão ao banco. Marca allowed=null inicialmente.
 */
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.error('[rls:baseline] Diretório supabase/migrations não encontrado');
  process.exit(1);
}

function extractPolicies(sql) {
  const policies = [];
  const regex =
    /create\s+policy\s+([\w"._]+)\s+on\s+([a-zA-Z0-9_."']+)\s+for\s+(select|insert|update|delete|all)/gi;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const name = match[1].replace(/"/g, '');
    let table = match[2].replace(/"/g, '');
    if (!table.includes('.')) table = 'public.' + table;
    const command = match[3].toLowerCase();
    const tail = sql.slice(match.index, sql.indexOf(';', match.index) + 1);
    let roles = ['public'];
    const toMatch = /\bto\s+([^;\n]+)/i.exec(tail);
    if (toMatch) {
      const seg = toMatch[1].split(/using|with\s+check|for\s+/i)[0];
      if (/public/i.test(seg)) {
        roles = ['public'];
      } else {
        roles = seg
          .split(',')
          .map((r) => r.replace(/"/g, '').trim())
          .filter(Boolean);
      }
    }
    policies.push({ name, table, command, roles });
  }
  return policies;
}

const policies = [];
for (const f of fs.readdirSync(migrationsDir)) {
  if (!f.endsWith('.sql')) continue;
  const content = fs.readFileSync(path.join(migrationsDir, f), 'utf-8');
  const extracted = extractPolicies(content);
  if (extracted.length) policies.push(...extracted);
}

const grouped = {};
for (const p of policies) {
  grouped[p.table] = grouped[p.table] || { table: p.table, operations: [] };
  const ops = p.command === 'all' ? ['select', 'insert', 'update', 'delete'] : [p.command];
  for (const role of p.roles) {
    for (const op of ops) {
      if (!grouped[p.table].operations.find((o) => o.role === role && o.operation === op)) {
        grouped[p.table].operations.push({ role, operation: op });
      }
    }
  }
}

const expected = [];
for (const g of Object.values(grouped)) {
  for (const op of g.operations) {
    expected.push({ table: g.table, role: op.role, operation: op.operation, allowed: null });
  }
}

expected.sort(
  (a, b) =>
    a.table.localeCompare(b.table) ||
    a.role.localeCompare(b.role) ||
    a.operation.localeCompare(b.operation),
);

fs.mkdirSync(path.join(process.cwd(), 'coverage'), { recursive: true });
const outPath = path.join(process.cwd(), 'coverage', 'rls-expected.json');
fs.writeFileSync(outPath, JSON.stringify(expected, null, 2));
console.log('[rls:baseline] Gerado', outPath, 'entries:', expected.length);
if (!expected.length) console.warn('[rls:baseline] Nenhuma policy encontrada.');
