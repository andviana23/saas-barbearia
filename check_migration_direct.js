/**
 * Verificação direta das tabelas conhecidas para avaliar status da migração PT->EN
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkMigrationStatus() {
  console.log('🔍 Verificando status da migração PT->EN...\n');

  const checks = {
    tablesExist: {},
    columnsExist: {},
    functionsWork: {},
  };

  // Lista de tabelas esperadas em inglês
  const expectedTables = [
    'units',
    'profiles',
    'customers',
    'professionals',
    'services',
    'appointments',
    'appointments_services',
    'queue',
    'subscriptions',
    'subscription_plans',
    'financial_transactions',
    'notifications',
  ];

  // Lista de tabelas antigas em português que não deveriam existir
  const oldTables = [
    'unidades',
    'clientes',
    'profissionais',
    'servicos',
    'fila',
    'assinaturas',
    'planos',
    'financeiro_mov',
    'notificacoes',
  ];

  console.log('1️⃣ Verificando existência das tabelas...');

  // Verificar tabelas em inglês
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      checks.tablesExist[table] = !error;

      if (!error) {
        console.log(`✅ ${table} - OK`);
      } else {
        console.log(`❌ ${table} - ERRO: ${error.message}`);
      }
    } catch (err) {
      checks.tablesExist[table] = false;
      console.log(`❌ ${table} - ERRO: ${err.message}`);
    }
  }

  console.log('\n2️⃣ Verificando tabelas antigas (não deveriam existir)...');

  // Verificar se tabelas antigas ainda existem
  for (const table of oldTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      if (!error) {
        console.log(`❗ ${table} - AINDA EXISTE (deveria ter sido renomeada)`);
        checks.tablesExist[`old_${table}`] = true;
      } else {
        console.log(`✅ ${table} - Não existe (correto)`);
        checks.tablesExist[`old_${table}`] = false;
      }
    } catch (err) {
      checks.tablesExist[`old_${table}`] = false;
      console.log(`✅ ${table} - Não existe (correto)`);
    }
  }

  console.log('\n3️⃣ Verificando coluna unit_default_id na tabela profiles...');

  try {
    const { data, error } = await supabase.from('profiles').select('unit_default_id').limit(1);

    if (!error) {
      checks.columnsExist.unit_default_id = true;
      console.log('✅ Coluna unit_default_id existe na tabela profiles');
    } else {
      checks.columnsExist.unit_default_id = false;
      console.log(`❌ Coluna unit_default_id não encontrada: ${error.message}`);
    }
  } catch (err) {
    checks.columnsExist.unit_default_id = false;
    console.log(`❌ Erro ao verificar unit_default_id: ${err.message}`);
  }

  console.log('\n4️⃣ Testando algumas consultas críticas...');

  // Testar consulta com as novas tabelas
  try {
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('id, name, unit_id')
      .limit(3);

    if (!customersError) {
      console.log(`✅ Consulta customers - OK (${customersData?.length || 0} registros)`);
      checks.functionsWork.customers_query = true;
    } else {
      console.log(`❌ Consulta customers - ERRO: ${customersError.message}`);
      checks.functionsWork.customers_query = false;
    }
  } catch (err) {
    console.log(`❌ Consulta customers - ERRO: ${err.message}`);
    checks.functionsWork.customers_query = false;
  }

  // Testar consulta com professionals
  try {
    const { data: profData, error: profError } = await supabase
      .from('professionals')
      .select('id, name, role, unit_id')
      .limit(3);

    if (!profError) {
      console.log(`✅ Consulta professionals - OK (${profData?.length || 0} registros)`);
      checks.functionsWork.professionals_query = true;
    } else {
      console.log(`❌ Consulta professionals - ERRO: ${profError.message}`);
      checks.functionsWork.professionals_query = false;
    }
  } catch (err) {
    console.log(`❌ Consulta professionals - ERRO: ${err.message}`);
    checks.functionsWork.professionals_query = false;
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DA MIGRAÇÃO');
  console.log('='.repeat(60));

  // Contar sucessos
  const englishTablesOk = expectedTables.filter((table) => checks.tablesExist[table]).length;
  const oldTablesGone = oldTables.filter((table) => !checks.tablesExist[`old_${table}`]).length;
  const columnsOk = checks.columnsExist.unit_default_id ? 1 : 0;
  const queriesOk = Object.values(checks.functionsWork).filter(Boolean).length;

  console.log(`📋 Tabelas em inglês funcionando: ${englishTablesOk}/${expectedTables.length}`);
  console.log(`🗑️  Tabelas antigas removidas: ${oldTablesGone}/${oldTables.length}`);
  console.log(`📄 Colunas renomeadas: ${columnsOk}/1`);
  console.log(`🔍 Consultas funcionando: ${queriesOk}/${Object.keys(checks.functionsWork).length}`);

  const totalChecks =
    expectedTables.length + oldTables.length + 1 + Object.keys(checks.functionsWork).length;
  const successfulChecks = englishTablesOk + oldTablesGone + columnsOk + queriesOk;
  const successPercentage = Math.round((successfulChecks / totalChecks) * 100);

  console.log(`\n📈 PROGRESSO GERAL: ${successfulChecks}/${totalChecks} (${successPercentage}%)`);

  if (successPercentage >= 90) {
    console.log('\n🎉 MIGRAÇÃO PRATICAMENTE COMPLETA!');
    console.log('✅ A maioria das verificações passou');
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. 🔨 npm run build');
    console.log('2. 🔄 supabase gen types typescript');
    console.log('3. 🧪 Testar funcionalidades');
  } else if (successPercentage >= 70) {
    console.log('\n⚠️ MIGRAÇÃO PARCIALMENTE COMPLETA');
    console.log('🔧 Alguns ajustes ainda são necessários');
    console.log('\n📝 EXECUTAR MANUALMENTE:');
    console.log('1. Abrir Supabase Dashboard > SQL Editor');
    console.log('2. Executar: db/migration_logs/20250827_enum_migration_final.sql');
  } else {
    console.log('\n❌ MIGRAÇÃO INCOMPLETA');
    console.log('🚨 Muitos itens ainda precisam ser corrigidos');
    console.log('\n📝 AÇÃO NECESSÁRIA:');
    console.log('1. Executar migração SQL manualmente');
    console.log('2. Verificar configuração do Supabase');
  }

  // Listar problemas específicos
  console.log('\n🔍 DETALHES DOS PROBLEMAS:');

  const missingTables = expectedTables.filter((table) => !checks.tablesExist[table]);
  if (missingTables.length > 0) {
    console.log(`❌ Tabelas faltando: ${missingTables.join(', ')}`);
  }

  const remainingOldTables = oldTables.filter((table) => checks.tablesExist[`old_${table}`]);
  if (remainingOldTables.length > 0) {
    console.log(`❗ Tabelas antigas ainda existem: ${remainingOldTables.join(', ')}`);
  }

  if (!checks.columnsExist.unit_default_id) {
    console.log('❌ Coluna unit_default_id não encontrada na tabela profiles');
  }

  const failedQueries = Object.entries(checks.functionsWork)
    .filter(([, success]) => !success)
    .map(([query]) => query);

  if (failedQueries.length > 0) {
    console.log(`❌ Consultas falhando: ${failedQueries.join(', ')}`);
  }
}

// Executar verificação
checkMigrationStatus();
