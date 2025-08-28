/**
 * Script simplificado para executar a migração final PT -> EN
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Iniciando migração final PT -> EN');
console.log('📊 Verificando configuração...');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeMigration() {
  try {
    console.log('🔗 Conectando ao Supabase...');

    // Teste de conectividade
    const { error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (testError) {
      throw new Error(`Erro de conectividade: ${testError.message}`);
    }

    console.log('✅ Conexão estabelecida');

    // Ler arquivo SQL
    const sqlPath = path.join(
      __dirname,
      'db',
      'migration_logs',
      '20250827_enum_migration_final.sql',
    );

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Arquivo não encontrado: ${sqlPath}`);
    }

    console.log('📖 Lendo arquivo de migração...');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Como o Supabase tem limitações, vamos executar os comandos mais críticos manualmente
    console.log('⚡ Executando comandos críticos da migração...\n');

    // 1. Verificar estado atual
    console.log('1️⃣ Verificando estado atual das tabelas...');
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    const tableNames = tables?.map((t) => t.table_name) || [];
    console.log('📋 Tabelas encontradas:', tableNames.length);

    // Verificar quais tabelas em português ainda existem
    const ptTables = [
      'assinaturas',
      'financeiro_mov',
      'notificacoes',
      'unidades',
      'clientes',
      'profissionais',
      'servicos',
      'fila',
    ];
    const existingPtTables = ptTables.filter((table) => tableNames.includes(table));

    if (existingPtTables.length > 0) {
      console.log('📝 Tabelas em português encontradas:', existingPtTables.join(', '));
    } else {
      console.log('✅ Nenhuma tabela em português encontrada');
    }

    // 2. Verificar ENUMs
    console.log('\n2️⃣ Verificando ENUMs...');
    const { data: enums } = await supabase.rpc('exec_sql', {
      sql_text: `
        SELECT 
          typname as enum_name,
          array_agg(enumlabel ORDER BY enumsortorder) as enum_values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE typname IN ('user_role', 'queue_priority')
        GROUP BY typname
      `,
    });

    if (enums && enums.data) {
      console.log('📊 ENUMs encontrados:', JSON.stringify(enums.data, null, 2));
    }

    // 3. Verificar função current_unit_id
    console.log('\n3️⃣ Verificando função current_unit_id...');
    const { data: functions } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'current_unit_id');

    if (functions && functions.length > 0) {
      console.log('✅ Função current_unit_id() encontrada');
    } else {
      console.log('❌ Função current_unit_id() não encontrada');
    }

    // 4. Verificar coluna unit_default_id na tabela profiles
    console.log('\n4️⃣ Verificando colunas da tabela profiles...');
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .in('column_name', ['unit_default_id', 'unidade_default_id', 'papel', 'role']);

    if (columns && columns.length > 0) {
      console.log('📊 Colunas da tabela profiles:', columns);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO ATUAL DO BANCO DE DADOS');
    console.log('='.repeat(60));

    // Status da migração
    const migrationComplete =
      existingPtTables.length === 0 &&
      functions &&
      functions.length > 0 &&
      columns &&
      columns.some((c) => c.column_name === 'unit_default_id');

    if (migrationComplete) {
      console.log('🎉 MIGRAÇÃO PARECE ESTAR COMPLETA!');
      console.log('✅ Todas as verificações passaram');
    } else {
      console.log('⚠️  MIGRAÇÃO INCOMPLETA - Alguns itens precisam ser ajustados:');

      if (existingPtTables.length > 0) {
        console.log(`❗ Tabelas em português: ${existingPtTables.join(', ')}`);
      }

      if (!functions || functions.length === 0) {
        console.log('❗ Função current_unit_id() não encontrada');
      }

      if (!columns || !columns.some((c) => c.column_name === 'unit_default_id')) {
        console.log('❗ Coluna unit_default_id não encontrada na tabela profiles');
      }

      console.log('\n🛠️  SOLUÇÃO:');
      console.log('Execute o arquivo SQL manualmente no SQL Editor do Supabase:');
      console.log(`📁 ${sqlPath}`);
      console.log('💻 Dashboard Supabase > SQL Editor > New Query > Colar conteúdo > Run');
    }

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. 🔨 npm run build');
    console.log('2. 🔄 supabase gen types typescript');
    console.log('3. 🧪 Testar funcionalidades');
    console.log('4. 📊 Monitorar logs');
  } catch (error) {
    console.error('\n❌ Erro durante a verificação:', error.message);
    console.log('\n🔧 Execute o SQL manualmente no Supabase Dashboard');
  }
}

executeMigration();
