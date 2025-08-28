#!/usr/bin/env node
/**
 * Runner simples de seeds: executa cada arquivo .sql em db/seeds na ordem alfanumérica.
 * Requer variáveis de ambiente PGHOST / PGPORT / PGUSER / PGPASSWORD / PGDATABASE, ou DATABASE_URL.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

function log(msg) {
  console.log(`[seed] ${msg}`);
}

function md5(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

const seedsDir = path.join(__dirname, 'seeds');
if (!fs.existsSync(seedsDir)) {
  log('Nenhum diretório db/seeds encontrado. Abortando.');
  process.exit(0);
}

// Verifica psql
const which = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['psql']);
if (which.status !== 0) {
  console.error('psql não encontrado no PATH. Instale o cliente PostgreSQL.');
  process.exit(1);
}

const files = fs
  .readdirSync(seedsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (!files.length) {
  log('Nenhum arquivo .sql de seed encontrado.');
  process.exit(0);
}

log(`Verificando/aplicando ${files.length} seed(s)...`);

function runPsql(sql, capture = false) {
  return spawnSync('psql', ['--no-psqlrc', '-v', 'ON_ERROR_STOP=1'], {
    input: sql,
    stdio: capture ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'inherit', 'inherit'],
    encoding: 'utf8',
  });
}

// Garante existência de seed_history (caso migrations ainda não tenham rodado)
runPsql(
  `CREATE TABLE IF NOT EXISTS public.seed_history (
    id bigserial PRIMARY KEY,
    filename text NOT NULL UNIQUE,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now(),
    execution_time_ms integer NULL,
    success boolean NOT NULL DEFAULT false,
    error_message text NULL
  );`,
);

for (const file of files) {
  const full = path.join(seedsDir, file);
  const sql = fs.readFileSync(full, 'utf8');
  const hash = md5(sql);

  // Verifica se já foi aplicado com mesmo checksum
  const check = runPsql(
    `\pset format=unaligned\nSELECT checksum FROM public.seed_history WHERE filename='${file.replace(/'/g, "''")}' AND success = true;`,
    true,
  );
  if (check.status === 0 && check.stdout) {
    const lines = check.stdout.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length) {
      const existingChecksum = lines[lines.length - 1].trim();
      if (existingChecksum === hash) {
        log(`SKIP ${file} (já aplicado, checksum igual)`);
        continue;
      } else {
        log(`REAPLICAR ${file} (checksum divergente: ${existingChecksum} -> ${hash})`);
      }
    }
  }

  log(`Aplicando seed: ${file}`);
  const start = Date.now();
  // Registra tentativa (success=false inicialmente)
  runPsql(
    `INSERT INTO public.seed_history(filename, checksum, success) VALUES ('${file.replace(/'/g, "''")}', '${hash}', false) ON CONFLICT (filename) DO UPDATE SET checksum='${hash}', applied_at=now(), success=false, error_message=NULL;`,
  );
  const proc = runPsql(sql);
  const elapsed = Date.now() - start;
  if (proc.status !== 0) {
    log(`Falha ao executar seed ${file}`);
    runPsql(
      `UPDATE public.seed_history SET success=false, execution_time_ms=${elapsed}, error_message='Falha ao executar seed' WHERE filename='${file.replace(/'/g, "''")}';`,
    );
    process.exit(proc.status || 1);
  }
  runPsql(
    `UPDATE public.seed_history SET success=true, execution_time_ms=${elapsed}, error_message=NULL WHERE filename='${file.replace(/'/g, "''")}';`,
  );
  log(`OK ${file} (${elapsed}ms)`);
}

log('Seeds processadas.');
