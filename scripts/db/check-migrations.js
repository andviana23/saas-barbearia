#!/usr/bin/env node
/**
 * Verifica divergências ou pendências de migrações.
 * Exit codes: 0 OK, 1 Pendentes, 2 Divergentes, 3 Erro geral.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

function md5(c) {
  return crypto.createHash('md5').update(c).digest('hex');
}
function log(m) {
  console.log(`[migrate:check] ${m}`);
}

(async () => {
  const dir = path.join(process.cwd(), 'supabase', 'migrations');
  if (!fs.existsSync(dir)) {
    console.error('Diretório supabase/migrations não encontrado');
    process.exit(3);
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('Defina DATABASE_URL');
    process.exit(3);
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(`CREATE TABLE IF NOT EXISTS public.migrations_history (
      id bigserial PRIMARY KEY,
      filename text NOT NULL UNIQUE,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now(),
      execution_time_ms integer,
      success boolean NOT NULL DEFAULT false,
      error_message text
    );`);
    const { rows } = await client.query(
      'SELECT filename, checksum, success FROM public.migrations_history',
    );
    const map = new Map(rows.map((r) => [r.filename, r]));
    const pendentes = [];
    const divergentes = [];
    for (const f of files) {
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      const sum = md5(sql);
      const hist = map.get(f);
      if (!hist) {
        pendentes.push(f);
        continue;
      }
      if (hist.checksum !== sum) {
        divergentes.push(f);
      }
    }
    if (pendentes.length) log('Pendentes: ' + pendentes.join(', '));
    if (divergentes.length) log('Divergentes: ' + divergentes.join(', '));
    if (!pendentes.length && !divergentes.length) {
      log('OK - sem pendências ou divergência.');
      process.exit(0);
    } else if (divergentes.length) {
      process.exit(2);
    } else {
      process.exit(1);
    }
  } catch (e) {
    console.error('Erro verificação:', e.message);
    process.exit(3);
  } finally {
    try {
      await client.end();
    } catch (e) {
      /* noop */
    }
  }
})();
