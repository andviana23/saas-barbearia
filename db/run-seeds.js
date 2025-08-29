#!/usr/bin/env node
/**
 * Runner de seeds usando node-postgres (sem dependência de psql instalado).
 * Mantém a tabela public.seed_history e aplica arquivos em db/seeds em ordem alfanumérica.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

function md5(c) {
  return crypto.createHash('md5').update(c).digest('hex');
}
function log(m) {
  console.log(`[seed] ${m}`);
}

async function ensureTable(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS public.seed_history (
    id bigserial PRIMARY KEY,
    filename text NOT NULL UNIQUE,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now(),
    execution_time_ms integer NULL,
    success boolean NOT NULL DEFAULT false,
    error_message text NULL
  );`);
}

async function run() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('Defina DATABASE_URL ou SUPABASE_DB_URL');
    process.exit(1);
  }
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await ensureTable(client);

  const seedsDir = path.join(__dirname, 'seeds');
  if (!fs.existsSync(seedsDir)) {
    log('Diretório db/seeds inexistente.');
    await client.end();
    return;
  }
  const files = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  if (!files.length) {
    log('Sem arquivos .sql.');
    await client.end();
    return;
  }
  log(`Processando ${files.length} seed(s)...`);

  const startAll = Date.now();
  const applied = [];
  const skippedAlready = [];
  const skippedGuard = [];
  let failed = null;

  // Guard de produção: pular seeds demo/sample sem ALLOW_DEMO_SEEDS=1
  const prodLike = process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';
  const allowDemo = process.env.ALLOW_DEMO_SEEDS === '1';
  const demoPattern = /demo|sample/i;

  for (const file of files) {
    const full = path.join(seedsDir, file);
    const sql = fs.readFileSync(full, 'utf8');
    const checksum = md5(sql);
    if (prodLike && !allowDemo && demoPattern.test(file)) {
      log(`GUARD-SKIP ${file} (demo em produção)`);
      skippedGuard.push(file);
      continue;
    }
    const { rows } = await client.query(
      'SELECT checksum, success FROM public.seed_history WHERE filename=$1',
      [file],
    );
    if (rows.length && rows[0].success && rows[0].checksum === checksum) {
      log(`SKIP ${file} (já aplicado)`);
      skippedAlready.push(file);
      continue;
    }
    const mode = rows.length ? 'REAPLICANDO' : 'APLICANDO';
    log(`${mode} ${file}`);
    const start = Date.now();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO public.seed_history(filename, checksum, success) VALUES ($1,$2,false)
        ON CONFLICT (filename) DO UPDATE SET checksum=EXCLUDED.checksum, applied_at=now(), success=false, error_message=NULL`,
        [file, checksum],
      );
      await client.query(sql);
      const elapsed = Date.now() - start;
      await client.query(
        'UPDATE public.seed_history SET success=true, execution_time_ms=$1 WHERE filename=$2',
        [elapsed, file],
      );
      await client.query('COMMIT');
      log(`OK ${file}`);
      applied.push({ file, elapsed });
    } catch (err) {
      await client.query('ROLLBACK');
      const elapsed = Date.now() - start;
      await client.query(
        'UPDATE public.seed_history SET success=false, execution_time_ms=$1, error_message=$2 WHERE filename=$3',
        [elapsed, err.message || 'erro', file],
      );
      console.error(`FALHA seed ${file}:`, err.message);
      failed = { file, error: err.message };
      await client.end();
      break;
    }
  }
  const totalMs = Date.now() - startAll;
  const summary = {
    totalFiles: files.length,
    applied: applied.length,
    skippedAlready: skippedAlready.length,
    skippedGuard: skippedGuard.length,
    failed: failed ? 1 : 0,
    durationMs: totalMs,
    prodLike,
  };
  log(`Resumo: ${JSON.stringify(summary)}`);
  try {
    const coverageDir = path.join(process.cwd(), 'coverage');
    fs.mkdirSync(coverageDir, { recursive: true });
    fs.writeFileSync(
      path.join(coverageDir, 'seed-summary.json'),
      JSON.stringify({ ...summary, appliedDetail: applied.slice(0, 50) }, null, 2),
    );
  } catch (_) {}
  await client.end();
  if (failed) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
