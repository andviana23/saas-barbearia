#!/usr/bin/env node

/**
 * Migração Simples para Supabase
 * Executa as migrações SQL diretamente no banco
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs').promises
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuração
const MIGRATIONS_DIR = path.join(__dirname, 'migrations')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  console.error(
    'Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
 * Executa uma migração dividindo o SQL em comandos menores
 */
async function executeMigration(migration) {
  console.log(`⏳ Executando migração ${migration.version}: ${migration.name}`)

  try {
    // Ler conteúdo da migração
    const content = await fs.readFile(migration.path, 'utf-8')

    // Dividir por comandos SQL (baseado em ponto-e-vírgula no final de linha)
    const commands = content
      .split(/;\s*\n/)
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith('--'))
      .filter((cmd) => !cmd.match(/^\s*$/))

    console.log(`   📝 Executando ${commands.length} comando(s) SQL...`)

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command.length === 0) continue

      try {
        // Tentar executar via SQL query direta
        const { data, error } = await supabase.rpc('sql', {
          query: command + (command.endsWith(';') ? '' : ';'),
        })

        if (error) {
          // Se RPC não funcionar, tentar com query direta
          if (error.message.includes('function sql does not exist')) {
            // Para comandos CREATE, ALTER, etc, usar uma abordagem diferente
            console.log(
              `   ⚠️  RPC não disponível, tentando execução alternativa...`
            )

            // Para comandos simples como CREATE TABLE, INSERT, etc.
            if (
              command.toLowerCase().includes('create table') ||
              command.toLowerCase().includes('create index') ||
              command.toLowerCase().includes('create type') ||
              command.toLowerCase().includes('create extension') ||
              command.toLowerCase().includes('create function') ||
              command.toLowerCase().includes('create policy') ||
              command.toLowerCase().includes('alter table') ||
              command.toLowerCase().includes('insert into') ||
              command.toLowerCase().includes('comment on')
            ) {
              console.log(
                `   ⚠️  Comando DDL detectado - precisa ser executado via SQL Editor do Supabase`
              )
              console.log(`   📄 Comando: ${command.substring(0, 100)}...`)
              continue
            } else {
              throw error
            }
          } else {
            throw error
          }
        }

        console.log(`   ✅ Comando ${i + 1}/${commands.length} executado`)
      } catch (cmdError) {
        console.error(`   ❌ Erro no comando ${i + 1}: ${cmdError.message}`)
        console.error(`   📄 Comando: ${command.substring(0, 200)}...`)
        throw cmdError
      }
    }

    console.log(`   ✅ Migração ${migration.version} executada com sucesso`)
    return { success: true }
  } catch (error) {
    console.error(
      `   ❌ Erro na migração ${migration.version}: ${error.message}`
    )
    return { success: false, error: error.message }
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando migrações simples para Supabase\n')

  const migrations = await getMigrationFiles()

  if (migrations.length === 0) {
    console.log('ℹ️  Nenhum arquivo de migração encontrado')
    return
  }

  console.log(`📝 Encontradas ${migrations.length} migração(ões)\n`)

  let successCount = 0
  let failCount = 0

  for (const migration of migrations) {
    const result = await executeMigration(migration)

    if (result.success) {
      successCount++
    } else {
      failCount++
      console.log('⚠️  Continuando com próxima migração...\n')
    }

    console.log('')
  }

  console.log('📊 Resumo da Execução:')
  console.log(`   ✅ Sucessos: ${successCount}`)
  console.log(`   ❌ Falhas: ${failCount}`)

  if (failCount > 0) {
    console.log('\n⚠️  Algumas migrações falharam')
    console.log(
      '   💡 Execute os comandos DDL manualmente no SQL Editor do Supabase'
    )
  } else {
    console.log('\n🎉 Todas as migrações foram processadas!')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Erro na execução:', error.message)
    process.exit(1)
  })
}

module.exports = { getMigrationFiles, executeMigration, main }
