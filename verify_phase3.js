/**
 * Script para executar migração PT->EN usando RPC calls do Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkDatabaseStatus() {
  console.log('🔍 Verificando status atual do banco de dados...\n');

  try {
    // 1. Verificar tabelas existentes
    console.log('1️⃣ Verificando tabelas...');
    const { data: tablesResult, error: tablesError } = await supabase.rpc('exec_sql', {
      sql_text: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `,
    });

    if (tablesError) {
      throw new Error(`Erro ao consultar tabelas: ${tablesError.message}`);
    }

    const allTables = tablesResult || [];
    console.log(`📊 Total de tabelas: ${allTables.length}`);

    // Verificar tabelas em português
    const ptTables = [
      'assinaturas',
      'financeiro_mov',
      'notificacoes',
      'unidades',
      'clientes',
      'profissionais',
      'servicos',
      'fila',
      'planos',
    ];
    const existingPtTables = allTables.filter((row) => ptTables.includes(row.table_name));

    if (existingPtTables.length > 0) {
      console.log('❗ Tabelas em português ainda existentes:');
      existingPtTables.forEach((table) => console.log(`   - ${table.table_name}`));
    } else {
      console.log('✅ Nenhuma tabela em português encontrada');
    }

    // 2. Verificar ENUMs
    console.log('\n2️⃣ Verificando tipos ENUM...');
    const { data: enumsResult, error: enumsError } = await supabase.rpc('exec_sql', {
      sql_text: `
        SELECT 
          t.typname as enum_name,
          array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname IN ('user_role', 'queue_priority', 'appointment_status', 'queue_status', 'transaction_type')
        GROUP BY t.typname
        ORDER BY t.typname;
      `,
    });

    if (enumsError) {
      console.warn(`⚠️ Aviso ao consultar ENUMs: ${enumsError.message}`);
    } else if (enumsResult && enumsResult.length > 0) {
      console.log('📊 ENUMs encontrados:');
      enumsResult.forEach((enumType) => {
        console.log(`   - ${enumType.enum_name}: [${enumType.enum_values.join(', ')}]`);
      });
    }

    // 3. Verificar função current_unit_id
    console.log('\n3️⃣ Verificando funções...');
    const { data: functionsResult, error: functionsError } = await supabase.rpc('exec_sql', {
      sql_text: `
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
          AND routine_name IN ('current_unit_id', 'current_unidade_id')
        ORDER BY routine_name;
      `,
    });

    if (functionsError) {
      console.warn(`⚠️ Aviso ao consultar funções: ${functionsError.message}`);
    } else if (functionsResult) {
      console.log('📊 Funções encontradas:');
      functionsResult.forEach((func) => console.log(`   - ${func.routine_name}()`));
    }

    // 4. Verificar colunas da tabela profiles
    console.log('\n4️⃣ Verificando colunas da tabela profiles...');
    const { data: columnsResult, error: columnsError } = await supabase.rpc('exec_sql', {
      sql_text: `
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name IN ('unit_default_id', 'unidade_default_id', 'papel', 'role')
        ORDER BY column_name;
      `,
    });

    if (columnsError) {
      console.warn(`⚠️ Aviso ao consultar colunas: ${columnsError.message}`);
    } else if (columnsResult && columnsResult.length > 0) {
      console.log('📊 Colunas da tabela profiles:');
      columnsResult.forEach((col) => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.udt_name})`);
      });
    }

    // 5. Avaliar status da migração
    console.log('\n' + '='.repeat(60));
    console.log('📊 AVALIAÇÃO DO STATUS DA MIGRAÇÃO');
    console.log('='.repeat(60));

    const hasPortugueseTables = existingPtTables.length > 0;
    const hasCurrentUnitId =
      functionsResult && functionsResult.some((f) => f.routine_name === 'current_unit_id');
    const hasUnitDefaultId =
      columnsResult && columnsResult.some((c) => c.column_name === 'unit_default_id');
    const hasEnglishEnums =
      enumsResult &&
      enumsResult.some((e) => e.enum_name === 'user_role' && e.enum_values.includes('manager'));

    if (!hasPortugueseTables && hasCurrentUnitId && hasUnitDefaultId && hasEnglishEnums) {
      console.log('🎉 MIGRAÇÃO COMPLETAMENTE FINALIZADA!');
      console.log('✅ Todas as verificações passaram:');
      console.log('   ✓ Nenhuma tabela em português');
      console.log('   ✓ Função current_unit_id() existe');
      console.log('   ✓ Coluna unit_default_id existe');
      console.log('   ✓ ENUMs em inglês');

      console.log('\n🎯 PRÓXIMOS PASSOS:');
      console.log('1. 🔨 npm run build (verificar se compila)');
      console.log('2. 🔄 supabase gen types typescript (gerar tipos)');
      console.log('3. 🧪 Testar funcionalidades críticas');
      console.log('4. 📊 Monitorar logs por 24h');
    } else {
      console.log('⚠️ MIGRAÇÃO INCOMPLETA - Itens pendentes:');

      if (hasPortugueseTables) {
        console.log('❌ Tabelas em português ainda existem');
      } else {
        console.log('✅ Tabelas renomeadas');
      }

      if (hasCurrentUnitId) {
        console.log('✅ Função current_unit_id() existe');
      } else {
        console.log('❌ Função current_unit_id() não encontrada');
      }

      if (hasUnitDefaultId) {
        console.log('✅ Coluna unit_default_id existe');
      } else {
        console.log('❌ Coluna unit_default_id não encontrada');
      }

      if (hasEnglishEnums) {
        console.log('✅ ENUMs em inglês');
      } else {
        console.log('❌ ENUMs ainda contêm valores em português');
      }

      console.log('\n🛠️ PRÓXIMA AÇÃO:');
      console.log('Execute o SQL manualmente no Supabase Dashboard:');
      console.log('📁 db/migration_logs/20250827_enum_migration_final.sql');
      console.log('💻 Supabase Dashboard > SQL Editor > New Query');
    }
  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
    console.log('\n🔧 Tente executar manualmente via SQL Editor do Supabase');
  }
}

// Executar verificação
checkDatabaseStatus();
