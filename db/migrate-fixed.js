#!/usr/bin/env node
/**
 * Migration runner simples para aplicar arquivos em `supabase/migrations` usando node-postgres.
 * - Cria tabela public.migrations_history se não existir
 * - Ordena arquivos por nome e aplica apenas os ainda não aplicados (por filename)
 * - Valida checksum (md5); se checksum diferente de registro anterior, avisa e exige flag --force para reaplicar
 * Uso:
 *   node db/migrate-fixed.js            -> aplica pendentes
 *   node db/migrate-fixed.js --status   -> lista status
 *   node db/migrate-fixed.js --force    -> permite reaplicar divergentes (re-insere registro)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

function md5(c) {
  return crypto.createHash('md5').update(c).digest('hex');
}
function log(msg) {
  console.log(`[migrate] ${msg}`);
}

const args = process.argv.slice(2);
const showStatusOnly = args.includes('--status');
const force = args.includes('--force');
const baselineMode = args.includes('--baseline');

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations');
if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error('Diretório supabase/migrations não encontrado.');
  process.exit(1);
}

const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

async function ensureTable(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS public.migrations_history (
    id bigserial PRIMARY KEY,
    filename text NOT NULL UNIQUE,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now(),
    execution_time_ms integer,
    success boolean NOT NULL DEFAULT false,
    error_message text
  );`);
}

async function getHistory(client) {
  const { rows } = await client.query(
    'SELECT filename, checksum, success FROM public.migrations_history ORDER BY filename',
  );
  return rows;
}

async function run() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('Defina DATABASE_URL ou SUPABASE_DB_URL');
    process.exit(1);
  }
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }, // Supabase/produções normalmente requer SSL
  });
  await client.connect();
  await ensureTable(client);
  const history = await getHistory(client);
  const historyMap = new Map(history.map((h) => [h.filename, h]));

  if (baselineMode) {
    log('Modo baseline: registrando arquivos como aplicados (sem executar SQL).');
    for (const file of files) {
      const full = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(full, 'utf8');
      const checksum = md5(sql);
      const existing = historyMap.get(file);
      if (existing && existing.success && existing.checksum === checksum) {
        log(`SKIP baseline ${file} (já registrado)`);
        continue;
      }
      await client.query(
        `INSERT INTO public.migrations_history(filename, checksum, success) VALUES ($1,$2,true)
        ON CONFLICT (filename) DO UPDATE SET checksum=EXCLUDED.checksum, applied_at=now(), success=true, error_message=NULL`,
        [file, checksum],
      );
      log(`Baseline marcado: ${file}`);
    }
    await client.end();
    log('Baseline concluído.');
    return;
  }

  if (showStatusOnly) {
    log('Status das migrações:');
    for (const f of files) {
      const h = historyMap.get(f);
      if (h) {
        log(`${f} - ${h.success ? 'APLICADA' : 'ERRO'} (checksum ${h.checksum.slice(0, 8)})`);
      } else {
        log(`${f} - PENDENTE`);
      }
    }
    await client.end();
    return;
  }

  const startAll = Date.now();
  const applied = [];
  const skipped = [];
  const divergent = [];
  let failed = null;
  for (const file of files) {
    const full = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(full, 'utf8');
    const checksum = md5(sql);
    const existing = historyMap.get(file);
    if (existing && existing.success) {
      if (existing.checksum === checksum) {
        log(`SKIP ${file} (já aplicado)`);
        skipped.push(file);
        continue;
      } else if (!force) {
        log(`DIVERGENTE ${file} (checksum mudou). Use --force para reaplicar.`);
        divergent.push(file);
        continue;
      } else {
        log(`REAPLICANDO (force) ${file}`);
      }
    } else {
      log(`APLICANDO ${file}`);
    }
    const start = Date.now();
    await client.query('BEGIN');
    try {
      // Inserir/atualizar registro (marca success=false até concluir)
      await client.query(
        `INSERT INTO public.migrations_history(filename, checksum, success) VALUES ($1,$2,false)
        ON CONFLICT (filename) DO UPDATE SET checksum=EXCLUDED.checksum, applied_at=now(), success=false, error_message=NULL`,
        [file, checksum],
      );
      await client.query(sql);
      const elapsed = Date.now() - start;
      await client.query(
        'UPDATE public.migrations_history SET success=true, execution_time_ms=$1 WHERE filename=$2',
        [elapsed, file],
      );
      await client.query('COMMIT');
      log(`OK ${file}`);
      applied.push({ file, elapsed });
    } catch (err) {
      await client.query('ROLLBACK');
      const elapsed = Date.now() - start;
      await client.query(
        'UPDATE public.migrations_history SET success=false, execution_time_ms=$1, error_message=$2 WHERE filename=$3',
        [elapsed, err.message || 'erro', file],
      );
      console.error(`FALHA ${file}:`, err.message);
      failed = { file, error: err.message };
      break;
    }
  }

  const totalMs = Date.now() - startAll;
  const summary = {
    totalFiles: files.length,
    applied: applied.length,
    skipped: skipped.length,
    divergent: divergent.length,
    failed: failed ? 1 : 0,
    durationMs: totalMs,
    force,
  };
  log(`Resumo: ${JSON.stringify(summary)}`);
  try {
    const fs = require('fs');
    const path = require('path');
    const coverageDir = path.join(process.cwd(), 'coverage');
    fs.mkdirSync(coverageDir, { recursive: true });
    fs.writeFileSync(
      path.join(coverageDir, 'migrate-summary.json'),
      JSON.stringify({ ...summary, appliedDetail: applied.slice(0, 50) }, null, 2),
    );
  } catch (_) {}
  await client.end();
  if (failed) process.exit(1);
  else log('Migrações concluídas.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
