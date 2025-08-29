#!/usr/bin/env node
/**
 * Carrega variáveis de um arquivo .env (formato chave=valor) e executa um comando.
 * Uso: node scripts/run-with-env.js .env.test "npm run rls:real:cycle:imp"
 * Observação: Implementação leve para evitar dependência externa.
 */
const fs = require('fs');
const { spawn } = require('child_process');

function loadEnvFile(file) {
  if (!fs.existsSync(file)) {
    console.error(`[run-with-env] Arquivo não encontrado: ${file}`);
    process.exit(1);
  }
  const content = fs.readFileSync(file, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  const [, , envFile, ...commandParts] = process.argv;
  if (!envFile || commandParts.length === 0) {
    console.error('Uso: node scripts/run-with-env.js <arquivo-env> <comando...>');
    process.exit(1);
  }
  loadEnvFile(envFile);
  const command = commandParts.join(' ');
  console.log(`[run-with-env] Executando: ${command} (com variáveis de ${envFile})`);
  const child = spawn(command, { shell: true, stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code));
}

main();
