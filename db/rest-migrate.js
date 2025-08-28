#!/usr/bin/env node

/**
 * Migração via API REST do Supabase
 * Executa comandos SQL usando a API REST /rest/v1/rpc
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');

// Configuração
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

/**
 * Executa SQL via API REST do Supabase
 */
async function executeSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Erro na execução SQL: ${error.message}`);
  }
}

/**
 * Lista arquivos de migração
 */
async function getMigrationFiles() {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR);
    return files
      .filter((file) => file.endsWith('.sql'))
      .sort()
      .map((file) => ({
        version: file.split('_')[0],
        name: file.replace(/^\d+_(.+)\.sql$/, '$1').replace(/_/g, ' '),
        filename: file,
        path: path.join(MIGRATIONS_DIR, file),
      }));
  } catch (error) {
    console.error('❌ Erro ao ler diretório de migrações:', error.message);
    return [];
  }
}

/**
 * Executa uma migração
 */
async function executeMigration(migration) {
  console.log(`⏳ Executando migração ${migration.version}: ${migration.name}`);

  try {
    // Ler conteúdo da migração
    const content = await fs.readFile(migration.path, 'utf-8');

    console.log(`   🔧 Executando SQL da migração...`);

    // Tentar executar o SQL completo
    await executeSQL(content);

    console.log(`   ✅ Migração ${migration.version} executada com sucesso`);
    return { success: true };
  } catch (error) {
    console.error(`   ❌ Erro na migração ${migration.version}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando migrações via API REST do Supabase\n');

  const migrations = await getMigrationFiles();

  if (migrations.length === 0) {
    console.log('ℹ️  Nenhum arquivo de migração encontrado');
    return;
  }

  console.log(`📝 Encontradas ${migrations.length} migração(ões)\n`);

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const result = await executeMigration(migration);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
      console.log('⚠️  Parando execução devido a falha\n');
      break;
    }

    console.log('');
  }

  console.log('📊 Resumo da Execução:');
  console.log(`   ✅ Sucessos: ${successCount}`);
  console.log(`   ❌ Falhas: ${failCount}`);

  if (failCount > 0) {
    console.log('\n⚠️  Execução interrompida devido a falhas');
    console.log('   💡 Consulte o manual-migration-guide.md para instruções');
  } else {
    console.log('\n🎉 Todas as migrações foram executadas com sucesso!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Erro na execução:', error.message);
    process.exit(1);
  });
}
