#!/usr/bin/env node
/**
 * Gera matriz RLS detalhada usando pg_catalog: policies, roles e comandos.
 * Saída: JSON em coverage/rls-matrix.json
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('[rls:matrix] Defina DATABASE_URL ou SUPABASE_DB_URL');
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
    // ignore
  }
  const client = new Client(clientConfig);
  await client.connect();
  // pg_policies: schemaname, tablename, policyname, roles, cmd, qual, with_check
  const { rows } = await client.query(`
    SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname NOT IN ('pg_catalog','information_schema')
    ORDER BY schemaname, tablename, policyname;
  `);
  await client.end();
  const grouped = {};
  for (const r of rows) {
    const key = `${r.schemaname}.${r.tablename}`;
    grouped[key] = grouped[key] || { table: key, policies: [], operations: [] };
    // Normaliza lista de roles (pg_policies.roles pode vir como string formatada ex: "{role1,role2}" ou null => public)
    let rolesArr = [];
    if (!r.roles) {
      rolesArr = ['public'];
    } else if (Array.isArray(r.roles)) {
      rolesArr = r.roles;
    } else if (typeof r.roles === 'string') {
      const trimmed = r.roles.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        rolesArr = trimmed
          .substring(1, trimmed.length - 1)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        rolesArr = trimmed.split(',').map((s) => s.trim());
      }
    }

    const command = r.cmd.toLowerCase(); // SELECT | INSERT | UPDATE | DELETE | ALL
    // Extrai roles semânticos adicionais de using/check (ex: has_role(unit_id, ARRAY['admin','manager']))
    const extraRoles = new Set();
    const sources = [r.qual, r.with_check].filter(Boolean).join('\n');
    const hasRoleRegex = /has_role\([^,]+,\s*ARRAY\[(.+?)\]\)/gi;
    let hrMatch;
    while ((hrMatch = hasRoleRegex.exec(sources)) !== null) {
      const inside = hrMatch[1];
      inside
        .split(',')
        .map((s) => s.replace(/::text/gi, '').replace(/['\s]/g, ''))
        .filter(Boolean)
        .forEach((role) => extraRoles.add(role));
    }
    const codeRegex = /r\.code\s*=\s*'([a-z_]+)'/gi;
    let cMatch;
    while ((cMatch = codeRegex.exec(sources)) !== null) {
      extraRoles.add(cMatch[1]);
    }
    for (const er of extraRoles) {
      if (!rolesArr.includes(er)) rolesArr.push(er);
    }
    const policyRecord = {
      name: r.policyname,
      roles: rolesArr,
      command,
      using: r.qual,
      check: r.with_check,
      extractedRoles: Array.from(extraRoles),
    };
    grouped[key].policies.push(policyRecord);

    // Deriva operações (expand ALL em select/insert/update/delete)
    const ops = command === 'all' ? ['select', 'insert', 'update', 'delete'] : [command];
    for (const role of rolesArr) {
      for (const op of ops) {
        if (!grouped[key].operations.find((o) => o.role === role && o.operation === op)) {
          grouped[key].operations.push({ role, operation: op, sourcePolicy: r.policyname });
        } else {
          // já existe - ignorar (futuro: anexar origin policies)
        }
      }
    }
  }
  const out = { generatedAt: new Date().toISOString(), tables: Object.values(grouped) };
  const outDir = path.join(process.cwd(), 'coverage');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'rls-matrix.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('[rls:matrix] Gerado em', outPath, 'tabelas:', out.tables.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
