#!/usr/bin/env node

/**
 * Verificação do estado do banco após migrações
 */

require('dotenv').config({ path: process.env.ENV_PATH || '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  console.error(
    '   NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Testa conexão básica com Supabase (checando catálogo pg_tables)
 */
async function testConnection() {
  try {
    const { error } = await supabase
      .from('pg_tables') // catálogo do Postgres
      .select('tablename', { head: true })
      .limit(1)

    return { success: !error, error: error?.message }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Verifica se uma tabela existe
 */
async function checkTable(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count(*)', { head: true })
    return !error
  } catch {
    return false
  }
}

/**
 * Verifica se tipos customizados existem via catálogo pg_type
 */
async function checkCustomTypes() {
  const expectedTypes = [
    'user_role',
    'appointment_status',
    'fila_status',
    'payment_status',
    'mov_type',
  ]

  console.log('🔧 Verificando tipos customizados...')

  let typesOK = 0
  let typesFailed = 0

  for (const typeName of expectedTypes) {
    try {
      const { data, error } = await supabase.rpc('check_type_exists', {
        type_name: typeName,
      })

      const exists = data === true && !error
      const status = exists ? '✅' : '❌'
      console.log(`   ${status} ${typeName}`)

      if (exists) typesOK++
      else typesFailed++
    } catch {
      console.log(`   ❌ ${typeName}`)
      typesFailed++
    }
  }

  return { typesOK, typesFailed, total: expectedTypes.length }
}

/**
 * Verificação principal
 */
async function verify() {
  console.log('🔍 Verificando estado do banco de dados...\n')

  console.log('🔗 Testando conexão com Supabase...')
  const connectionTest = await testConnection()

  if (!connectionTest.success) {
    console.log('❌ Falha na conexão com Supabase')
    console.log(`   Erro: ${connectionTest.error}`)
    return
  }

  console.log('✅ Conexão com Supabase estabelecida\n')

  const expectedTables = [
    'unidades',
    'profiles',
    'profissionais',
    'clientes',
    'servicos',
    'appointments',
    'appointments_servicos',
    'fila',
    'financeiro_mov',
  ]

  console.log('📊 Verificando tabelas...')

  let tablesOK = 0
  let tablesFailed = 0

  for (const tableName of expectedTables) {
    const exists = await checkTable(tableName)
    console.log(`   ${exists ? '✅' : '❌'} ${tableName}`)
    exists ? tablesOK++ : tablesFailed++
  }

  console.log('')
  const typesResult = await checkCustomTypes()

  console.log('\n📋 Resumo da Verificação:')
  console.log(`   ✅ Tabelas encontradas: ${tablesOK}/${expectedTables.length}`)
  console.log(
    `   ✅ Tipos customizados: ${typesResult.typesOK}/${typesResult.total}`
  )
  console.log(`   ❌ Itens faltando: ${tablesFailed + typesResult.typesFailed}`)

  const totalIssues = tablesFailed + typesResult.typesFailed

  if (totalIssues === 0) {
    console.log('\n🎉 Banco de dados completamente configurado!')
  } else {
    console.log('\n⚠️  Configuração do banco incompleta')
    console.log('💡 Execute novamente as migrações e rode `npm run db:verify`')
  }
}

if (require.main === module) {
  verify().catch((error) => {
    console.error('❌ Erro na execução:', error.message)
    process.exit(1)
  })
}
