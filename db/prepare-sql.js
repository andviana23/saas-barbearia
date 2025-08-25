#!/usr/bin/env node

/**
 * Prepara arquivos SQL para execução manual no Supabase
 * Combina todas as migrações em um único arquivo SQL
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs').promises
const path = require('path')

// Configuração
const MIGRATIONS_DIR = path.join(__dirname, 'migrations')
const OUTPUT_FILE = path.join(__dirname, 'all-migrations.sql')

/**
 * Lista arquivos de migração
 */
async function getMigrationFiles() {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR)
    return files
      .filter((file) => file.endsWith('.sql'))
      .sort()
      .map((file) => ({
        version: file.split('_')[0],
        name: file.replace(/^\d+_(.+)\.sql$/, '$1').replace(/_/g, ' '),
        filename: file,
        path: path.join(MIGRATIONS_DIR, file),
      }))
  } catch (error) {
    console.error('❌ Erro ao ler diretório de migrações:', error.message)
    return []
  }
}

/**
 * Verifica se já existe arquivo otimizado
 */
async function checkExistingOptimizedSQL() {
  try {
    const content = await fs.readFile(OUTPUT_FILE, 'utf-8')
    const isOptimized =
      content.includes('IF NOT EXISTS') && content.includes('DO $')
    const stats = await fs.stat(OUTPUT_FILE)

    return {
      exists: true,
      isOptimized,
      size: stats.size,
      lastModified: stats.mtime,
    }
  } catch (error) {
    return { exists: false }
  }
}

/**
 * Combina todas as migrações em um arquivo otimizado
 */
async function combineAllMigrations() {
  console.log('🔧 Preparando arquivo SQL consolidado...\n')

  // Verificar se já existe versão otimizada
  const existing = await checkExistingOptimizedSQL()

  if (existing.exists && existing.isOptimized) {
    console.log(
      `   ✅ Arquivo consolidado otimizado já existe (${Math.round(existing.size / 1024)}KB)`
    )
    console.log(
      `   📅 Última modificação: ${existing.lastModified.toLocaleString('pt-BR')}`
    )
    console.log(`   💡 Usando arquivo otimizado existente`)
    console.log(
      '\n📋 Para forçar nova geração, delete o arquivo all-migrations.sql'
    )
    return
  }

  const migrations = await getMigrationFiles()

  if (migrations.length === 0) {
    console.log('ℹ️  Nenhum arquivo de migração encontrado')
    return
  }

  let combinedSQL = `-- =========================================================================
-- ARQUIVO CONSOLIDADO DE MIGRAÇÕES OTIMIZADO - SISTEMA BARBERSHOP SaaS
-- Data de geração: ${new Date().toISOString()}
-- Total de migrações: ${migrations.length}
-- VERSÃO IDEMPOTENTE: Pode ser executado múltiplas vezes sem erro
-- 
-- INSTRUÇÕES:
-- 1. Acesse o SQL Editor do Supabase
-- 2. Cole este conteúdo completo
-- 3. Execute com Ctrl+Enter ou clique em "Run"
-- 4. Verifique se não há erros na saída
-- 5. Execute: npm run db:verify
-- =========================================================================

`

  for (const migration of migrations) {
    console.log(
      `   📄 Processando migração ${migration.version}: ${migration.name}`
    )

    try {
      const content = await fs.readFile(migration.path, 'utf-8')

      // Aplicar otimizações para tornar idempotente
      let optimizedContent = content
        // Adicionar IF NOT EXISTS para extensões (apenas se não existir)
        .replace(
          /CREATE EXTENSION (?!IF NOT EXISTS)([^;]+);/g,
          'CREATE EXTENSION IF NOT EXISTS $1;'
        )
        // Adicionar IF NOT EXISTS para esquemas (apenas se não existir)
        .replace(
          /CREATE SCHEMA (?!IF NOT EXISTS)([^;]+);/g,
          'CREATE SCHEMA IF NOT EXISTS $1;'
        )
        // Tipos ENUM já estão corretos nos arquivos de migração originais
        // Adicionar IF NOT EXISTS para tabelas (apenas se não existir)
        .replace(
          /CREATE TABLE (?!IF NOT EXISTS)([^\s\(]+)(\s*\()/g,
          'CREATE TABLE IF NOT EXISTS $1$2'
        )
        // Garantir CREATE OR REPLACE para funções
        .replace(/CREATE FUNCTION/g, 'CREATE OR REPLACE FUNCTION')

      combinedSQL += `
-- =========================================================================
-- MIGRAÇÃO ${migration.version.toUpperCase()}: ${migration.name.toUpperCase()}
-- =========================================================================

${optimizedContent}

-- =========================================================================
-- FIM DA MIGRAÇÃO ${migration.version.toUpperCase()}
-- =========================================================================

`
    } catch (error) {
      console.error(`   ❌ Erro ao ler ${migration.filename}: ${error.message}`)
    }
  }

  // Adicionar verificação final
  combinedSQL += `
-- =========================================================================
-- VERIFICAÇÃO FINAL - EXECUTE PARA CONFIRMAR QUE TUDO FOI CRIADO
-- =========================================================================

-- Verificar tabelas criadas
SELECT 'Tabelas criadas:' as info;
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'migrations', 'unidades', 'profiles', 'profissionais', 
  'clientes', 'servicos', 'appointments', 'appointments_servicos', 
  'fila', 'financeiro_mov'
)
ORDER BY tablename;

-- Verificar tipos enumerados
SELECT 'Tipos enumerados criados:' as info;
SELECT typname FROM pg_type WHERE typname IN (
  'user_role', 'appointment_status', 'queue_status', 
  'queue_priority', 'movimento_tipo'
);

-- Verificar funções de segurança
SELECT 'Funções de segurança criadas:' as info;
SELECT proname FROM pg_proc WHERE proname IN (
  'current_user_id', 'current_unidade_id', 'has_unit_access', 'is_admin'
);

-- Verificar RLS ativo
SELECT 'RLS Status:' as info;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('unidades', 'profiles', 'clientes', 'appointments')
ORDER BY tablename;

-- =========================================================================
-- PARABÉNS! SE CHEGOU ATÉ AQUI SEM ERROS, SUAS MIGRAÇÕES FORAM APLICADAS!
-- =========================================================================
`

  // Salvar arquivo combinado
  await fs.writeFile(OUTPUT_FILE, combinedSQL, 'utf-8')

  console.log(`\n✅ Arquivo SQL consolidado criado: ${OUTPUT_FILE}`)
  console.log('\n📋 Próximos passos:')
  console.log('1. Acesse o SQL Editor do seu projeto Supabase')
  console.log('2. Cole o conteúdo do arquivo all-migrations.sql')
  console.log('3. Execute com Ctrl+Enter ou "Run"')
  console.log('4. Verifique se a execução ocorreu sem erros')
  console.log('\n🎯 Após execução, execute: npm run db:verify')
}

/**
 * Função principal
 */
async function main() {
  await combineAllMigrations()
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Erro na execução:', error.message)
    process.exit(1)
  })
}
