#!/usr/bin/env node
/**
 * Prepara banco de teste Supabase isolado:
 * 1. Aguarda conexão
 * 2. Aplica migrações (migrate-fixed)
 * 3. Injeta stubs auth e roles (test-supabase-stubs.sql)
 * 4. (Opcional) Executa seeds base sem demo (skip arquivos demo/sample)
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

async function waitReady(url, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const c = new Client({ connectionString: url });
      await c.connect();
      await c.query('select 1');
      await c.end();
      return;
    } catch (_) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('Timeout aguardando banco de teste');
}

async function applySql(url, file) {
  const sql = fs.readFileSync(file, 'utf-8');
  const c = new Client({ connectionString: url });
  await c.connect();
  await c.query(sql);
  await c.end();
}

async function main() {
  const url =
    process.env.TEST_SUPABASE_DB_URL || 'postgresql://postgres:postgres@localhost:54329/postgres';
  console.log('[supabase-test] aguardando banco...');
  await waitReady(url);
  console.log('[supabase-test] aplicando migrações');
  process.env.DATABASE_URL = url;
  const r = spawnSync('node', ['db/migrate-fixed.js'], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
  console.log('[supabase-test] aplicando stubs');
  await applySql(url, path.join('db', 'test-supabase-stubs.sql'));
  if (process.env.APPLY_SEEDS === '1') {
    console.log('[supabase-test] aplicando seeds base (sem demo)');
    process.env.ALLOW_DEMO_SEEDS = '0';
    const rs = spawnSync('node', ['db/run-seeds.js'], { stdio: 'inherit', env: process.env });
    if (rs.status !== 0) process.exit(rs.status || 1);
  }
  console.log('[supabase-test] pronto');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
