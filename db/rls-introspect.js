#!/usr/bin/env node
/**
 * Introspecção inicial simples de policies: gera JSON com lista de tabelas que possuem RLS habilitado.
 * Futuro: consultar pg_policies para detalhar permissões.
 */
const { Client } = require('pg');

(async () => {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('[rls:introspect] Defina DATABASE_URL ou SUPABASE_DB_URL.');
    process.exit(1);
  }
  let clientConfig = { connectionString: url };
  try {
    const host = new URL(url).hostname;
    const needsSSL =
      /supabase\.co(m)?$/.test(host) ||
      process.env.RLS_SSL === '1' ||
      process.env.PGSSLMODE === 'require';
    if (needsSSL) {
      clientConfig.ssl = { rejectUnauthorized: false };
    }
  } catch (_) {
    // ignore parse errors
  }
  const client = new Client(clientConfig);
  await client.connect();
  const tables = await client.query(`
    SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname NOT IN ('pg_catalog','information_schema')
    ORDER BY 1,2;
  `);
  const withRls = tables.rows.filter((r) => r.rls_enabled);
  const out = {
    generatedAt: new Date().toISOString(),
    total: tables.rows.length,
    rlsEnabled: withRls,
  };
  console.log(JSON.stringify(out, null, 2));
  await client.end();
})();
