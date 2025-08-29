#!/usr/bin/env node
/**
 * Gera resumo agregado de coverage/rls-expected.json
 */
const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'coverage', 'rls-expected.json');
if (!fs.existsSync(p)) {
  console.error('Arquivo não encontrado:', p);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
const perTable = new Map();
for (const e of data) {
  const t = perTable.get(e.table) || {
    table: e.table,
    total: 0,
    decided: 0,
    allowedTrue: 0,
    allowedFalse: 0,
  };
  t.total++;
  if (e.allowed !== null) {
    t.decided++;
    if (e.allowed) {
      t.allowedTrue++;
    } else {
      t.allowedFalse++;
    }
  }
  perTable.set(e.table, t);
}
const rows = Array.from(perTable.values()).sort((a, b) => a.table.localeCompare(b.table));
console.log('Tabela, total, decididas, allowed=true, allowed=false');
for (const r of rows) {
  console.log(`${r.table}, ${r.total}, ${r.decided}, ${r.allowedTrue}, ${r.allowedFalse}`);
}
const pending = data.filter((d) => d.allowed === null).length;
console.log('\nResumo Geral:');
console.log('Entradas totais:', data.length);
console.log('Pendentes:', pending);
console.log('Decididas:', data.length - pending);
