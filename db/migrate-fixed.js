#!/usr/bin/env node

/**
 * Sistema de Migração Corrigido para Supabase PostgreSQL
 *
 * Como usar:
 * node db/migrate-fixed.js                # Executar migrações pendentes
 * node db/migrate-fixed.js --status      # Ver status das migrações
 */

require('dotenv').config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local');
  process.exit(1);
}

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuração
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Executa SQL diretamente via consulta PostgreSQL
 */
async function executeSQLDirect(sql) {
  try {
    // Para migrações, vamos usar uma abordagem mais simples
    // Dividir o SQL em comandos individuais
    const commands = sql
      .split(';')
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith('--'))
      .filter((cmd) => !cmd.match(/^\s*$/));

    console.log(`   📝 Executando ${commands.length} comandos SQL...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (!command) continue;

      // Para comandos DDL, precisamos usar uma abordagem especial
      console.log(`   ⚠️  Comando ${i + 1}/${commands.length}: ${command.substring(0, 60)}...`);
      console.log(`   💡 Este comando precisa ser executado manualmente no SQL Editor do Supabase`);
    }

    return { success: true, message: 'Comandos listados para execução manual' };
  } catch (error) {
    return { success: false, error: error.message };
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
 * Verifica status das migrações (simulado)
 */
async function checkMigrationStatus() {
  try {
    // Tentar verificar se a tabela migrations existe
    const { data, error } = await supabase
      .from('migrations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (
        error.message.includes('relation "migrations" does not exist') ||
        error.message.includes('does not exist') ||
        error.message.includes('schema cache')
      ) {
        console.log('   ℹ️  Tabela migrations não existe ainda');
        return [];
      }
      throw error;
    }

    // Se chegou aqui, a tabela existe
    const { data: migrations, error: selectError } = await supabase
      .from('migrations')
      .select('*')
      .order('version');

    if (selectError) throw selectError;

    return migrations || [];
  } catch (error) {
    console.log('   ⚠️  Não foi possível verificar status das migrações');
    return [];
  }
}

/**
 * Executa uma migração
 */
async function runMigration(migration) {
  console.log(`\n⏳ Processando migração ${migration.version}: ${migration.name}`);

  try {
    // Ler conteúdo da migração
    const content = await fs.readFile(migration.path, 'utf-8');

    console.log(`   📄 Arquivo: ${migration.filename}`);
    console.log(`   📝 Conteúdo carregado (${content.length} caracteres)`);

    // Como não conseguimos executar DDL via API, vamos mostrar instruções
    console.log(`\n   💡 INSTRUÇÕES PARA EXECUTAR ESTA MIGRAÇÃO:`);
    console.log(`   1. Abra o SQL Editor do Supabase`);
    console.log(`   2. Cole o conteúdo do arquivo: ${migration.path}`);
    console.log(`   3. Execute com Ctrl+Enter ou clique em "Run"`);
    console.log(`   4. Verifique se não há erros na execução`);

    return { success: true, manual: true };
  } catch (error) {
    console.error(`   ❌ Erro ao processar migração ${migration.version}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Mostra status das migrações
 */
async function showStatus() {
  console.log('📊 Status das Migrações\n');

  const files = await getMigrationFiles();
  const dbMigrations = await checkMigrationStatus();

  if (files.length === 0) {
    console.log('ℹ️  Nenhum arquivo de migração encontrado');
    return;
  }

  console.log('┌─────────┬──────────────────────────────────┬──────────┬─────────────────────┐');
  console.log('│ Versão  │ Nome                             │ Status   │ Executado em        │');
  console.log('├─────────┼──────────────────────────────────┼──────────┼─────────────────────┤');

  files.forEach((file) => {
    const dbMigration = dbMigrations.find((m) => m.version === file.version);
    const status = dbMigration ? (dbMigration.success ? '✅ OK' : '❌ ERRO') : '⏳ Pendente';
    const executedAt = dbMigration
      ? new Date(dbMigration.executed_at).toLocaleString('pt-BR')
      : '-';

    const name = file.name.length > 32 ? file.name.substring(0, 29) + '...' : file.name;

    console.log(
      `│ ${file.version.padEnd(7)} │ ${name.padEnd(32)} │ ${status.padEnd(8)} │ ${executedAt.padEnd(19)} │`,
    );
  });

  console.log('└─────────┴──────────────────────────────────┴──────────┴─────────────────────┘');

  const pending = files.filter(
    (f) => !dbMigrations.find((m) => m.version === f.version && m.success),
  );

  if (pending.length > 0) {
    console.log(`\n⏳ ${pending.length} migração(ões) pendente(s)`);
  } else {
    console.log('\n🎉 Todas as migrações foram executadas!');
  }
}

/**
 * Executa migrações pendentes
 */
async function migrate() {
  console.log('🚀 Iniciando processamento de migrações\n');

  const files = await getMigrationFiles();

  if (files.length === 0) {
    console.log('ℹ️  Nenhum arquivo de migração encontrado');
    return;
  }

  console.log(`📝 Encontradas ${files.length} migração(ões)\n`);
  console.log('⚠️  IMPORTANTE: Como o Supabase não permite execução de DDL via API,');
  console.log('   as migrações precisam ser executadas manualmente no SQL Editor.\n');

  // Gerar arquivo consolidado automaticamente
  console.log('📄 Gerando arquivo SQL consolidado...');
  await generateConsolidatedSQL(files);

  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Abra o dashboard do Supabase');
  console.log('2. Vá para SQL Editor');
  console.log('3. Cole o conteúdo do arquivo: db/all-migrations.sql');
  console.log('4. Execute com Ctrl+Enter');
  console.log('5. Execute: npm run db:verify');
}

/**
 * Verifica se arquivo consolidado otimizado já existe
 */
async function checkExistingOptimizedSQL() {
  try {
    const outputFile = path.join(__dirname, 'all-migrations.sql');
    const stats = await fs.stat(outputFile);
    const content = await fs.readFile(outputFile, 'utf-8');

    // Verifica se é a versão otimizada (contém IF NOT EXISTS e DO $ blocks)
    const isOptimized = content.includes('IF NOT EXISTS') && content.includes('DO $');

    return {
      exists: true,
      isOptimized,
      size: stats.size,
      lastModified: stats.mtime,
    };
  } catch (error) {
    return { exists: false };
  }
}

/**
 * Gera arquivo SQL consolidado otimizado
 */
async function generateConsolidatedSQL(migrations) {
  try {
    // Verificar se já existe versão otimizada
    const existing = await checkExistingOptimizedSQL();

    if (existing.exists && existing.isOptimized) {
      console.log(
        `   ✅ Arquivo consolidado otimizado já existe (${Math.round(existing.size / 1024)}KB)`,
      );
      console.log(`   📅 Última modificação: ${existing.lastModified.toLocaleString('pt-BR')}`);
      console.log(`   💡 Usando arquivo otimizado existente`);
      return;
    }

    let combinedSQL = `-- =========================================================================
-- ARQUIVO CONSOLIDADO DE MIGRAÇÕES OTIMIZADO - SISTEMA BARBERSHOP SaaS
-- Data de geração: ${new Date().toISOString()}
-- Total de migrações: ${migrations.length}
-- VERSÃO IDEMPOTENTE: Pode ser executado múltiplas vezes sem erro
-- =========================================================================

`;

    for (const migration of migrations) {
      const content = await fs.readFile(migration.path, 'utf-8');

      // Aplicar otimizações básicas para tornar idempotente
      let optimizedContent = content
        // Adicionar IF NOT EXISTS para extensões (apenas se não existir)
        .replace(
          /CREATE EXTENSION (?!IF NOT EXISTS)([^;]+);/g,
          'CREATE EXTENSION IF NOT EXISTS $1;',
        )
        // Adicionar IF NOT EXISTS para esquemas (apenas se não existir)
        .replace(/CREATE SCHEMA (?!IF NOT EXISTS)([^;]+);/g, 'CREATE SCHEMA IF NOT EXISTS $1;')
        // Adicionar IF NOT EXISTS para tabelas (apenas se não existir)
        .replace(
          /CREATE TABLE (?!IF NOT EXISTS)([^\s\(]+)(\s*\()/g,
          'CREATE TABLE IF NOT EXISTS $1$2',
        )
        // Garantir CREATE OR REPLACE para funções
        .replace(/CREATE FUNCTION/g, 'CREATE OR REPLACE FUNCTION');

      combinedSQL += `
-- =========================================================================
-- MIGRAÇÃO ${migration.version.toUpperCase()}: ${migration.name.toUpperCase()}  
-- =========================================================================

${optimizedContent}

`;
    }

    // Adicionar bloco de finalização
    combinedSQL += `
-- =========================================================================
-- FINALIZAÇÃO E VERIFICAÇÕES
-- =========================================================================

-- Verificar se todas as extensões foram instaladas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    RAISE WARNING 'Extensão uuid-ossp não encontrada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    RAISE WARNING 'Extensão pgcrypto não encontrada';
  END IF;
END
$$;

-- Notificação de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migrações executadas com sucesso!';
  RAISE NOTICE 'Sistema pronto para uso.';
END
$$;
`;

    const outputFile = path.join(__dirname, 'all-migrations.sql');
    await fs.writeFile(outputFile, combinedSQL, 'utf-8');

    console.log(`   ✅ Arquivo consolidado otimizado criado: ${outputFile}`);
    console.log(`   📊 Tamanho: ${Math.round(combinedSQL.length / 1024)}KB`);
  } catch (error) {
    console.error(`   ❌ Erro ao gerar arquivo consolidado: ${error.message}`);
  }
}

/**
 * Função principal
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case '--status':
        await showStatus();
        break;

      case '--help':
      case '-h':
        console.log('🔧 Sistema de Migração Corrigido para Supabase');
        console.log('\nComandos:');
        console.log('  node migrate-fixed.js          Processar migrações');
        console.log('  node migrate-fixed.js --status Ver status das migrações');
        console.log('  node migrate-fixed.js --help   Mostrar esta ajuda');
        break;

      default:
        await migrate();
        break;
    }
  } catch (error) {
    console.error('❌ Erro na execução:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  getMigrationFiles,
  checkMigrationStatus,
  runMigration,
  showStatus,
  migrate,
};
