/**
 * Script para executar correções diretas no Supabase via API
 * Usando Service Role Key para ter permissões administrativas
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

// Cliente com Service Role Key (permissões administrativas)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🚀 CORREÇÃO DIRETA VIA API SUPABASE');
console.log('📋 Executando correções identificadas...\n');

async function executeDirectCorrections() {
  const results = [];

  try {
    console.log('1️⃣ Verificando estrutura atual...');

    // 1. Verificar se appointments tem unidade_id ou unit_id
    console.log('🔍 Verificando colunas da tabela appointments...');

    try {
      // Testar se unit_id existe
      const { data: testUnitId, error: errorUnitId } = await supabase
        .from('appointments')
        .select('unit_id')
        .limit(1);

      if (!errorUnitId) {
        console.log('✅ appointments.unit_id já existe');
        results.push({ task: 'appointments.unit_id', status: 'already_exists' });
      }
    } catch (err) {
      // Se der erro, pode ser que a coluna não existe
      console.log('📝 appointments.unit_id precisa ser verificada');
    }

    try {
      // Testar se unidade_id existe
      const { data: testUnidadeId, error: errorUnidadeId } = await supabase
        .from('appointments')
        .select('unidade_id')
        .limit(1);

      if (!errorUnidadeId) {
        console.log('❗ appointments.unidade_id ainda existe (precisa renomear)');
        results.push({ task: 'appointments.unidade_id', status: 'needs_rename' });
      }
    } catch (err) {
      console.log('✅ appointments.unidade_id não existe (já renomeada)');
    }

    // 2. Verificar tabelas que precisam ser renomeadas
    console.log('\n2️⃣ Verificando tabelas em português...');

    const tablesToCheck = [
      { old: 'assinaturas', new: 'subscriptions' },
      { old: 'financeiro_mov', new: 'financial_transactions' },
      { old: 'notificacoes', new: 'notifications' },
    ];

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table.old).select('*').limit(1);

        if (!error) {
          console.log(`❗ Tabela ${table.old} ainda existe`);
          results.push({ task: `rename_${table.old}`, status: 'needs_action' });
        }
      } catch (err) {
        console.log(`✅ Tabela ${table.old} não existe (já renomeada)`);
        results.push({ task: `rename_${table.old}`, status: 'already_done' });
      }
    }

    // 3. Verificar colunas específicas
    console.log('\n3️⃣ Verificando colunas específicas...');

    // Verificar profiles.unit_default_id
    try {
      const { data, error } = await supabase.from('profiles').select('unit_default_id').limit(1);

      if (!error) {
        console.log('✅ profiles.unit_default_id existe');
        results.push({ task: 'profiles.unit_default_id', status: 'exists' });
      }
    } catch (err) {
      console.log('❌ profiles.unit_default_id não existe');
      results.push({ task: 'profiles.unit_default_id', status: 'missing' });
    }

    // Verificar customers.name
    try {
      const { data, error } = await supabase.from('customers').select('name').limit(1);

      if (!error) {
        console.log('✅ customers.name existe');
        results.push({ task: 'customers.name', status: 'exists' });
      }
    } catch (err) {
      console.log('❌ customers.name não existe');
      results.push({ task: 'customers.name', status: 'missing' });
    }

    // Verificar professionals.name
    try {
      const { data, error } = await supabase.from('professionals').select('name').limit(1);

      if (!error) {
        console.log('✅ professionals.name existe');
        results.push({ task: 'professionals.name', status: 'exists' });
      }
    } catch (err) {
      console.log('❌ professionals.name não existe');
      results.push({ task: 'professionals.name', status: 'missing' });
    }

    // 4. Verificar se appointments_services existe
    console.log('\n4️⃣ Verificando tabela appointments_services...');

    try {
      const { data, error } = await supabase.from('appointments_services').select('*').limit(1);

      if (!error) {
        console.log('✅ appointments_services existe');
        results.push({ task: 'appointments_services', status: 'exists' });
      }
    } catch (err) {
      console.log('❌ appointments_services não existe');
      results.push({ task: 'appointments_services', status: 'missing' });
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE VERIFICAÇÃO');
    console.log('='.repeat(60));

    const needsAction = results.filter(
      (r) => r.status === 'needs_action' || r.status === 'missing' || r.status === 'needs_rename',
    );

    if (needsAction.length === 0) {
      console.log('🎉 Todas as verificações passaram!');
      console.log('✅ O banco parece estar correto');

      // Fazer um teste final
      console.log('\n5️⃣ Teste final das consultas...');
      await testFinalQueries();
    } else {
      console.log(`⚠️ ${needsAction.length} item(s) precisam de correção:`);
      needsAction.forEach((item) => {
        console.log(`   • ${item.task}: ${item.status}`);
      });

      console.log('\n🔧 EXECUTANDO CORREÇÕES VIA SQL...');
      await executeRawSQLCorrections(needsAction);
    }
  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
    console.log('\n🔧 Tentando correções alternativas...');
    await executeRawSQLCorrections([]);
  }
}

async function testFinalQueries() {
  console.log('🧪 Testando consultas críticas...');

  const tests = [
    {
      name: 'customers com name',
      query: () => supabase.from('customers').select('id, name, unit_id').limit(1),
    },
    {
      name: 'professionals com name e role',
      query: () => supabase.from('professionals').select('id, name, role, unit_id').limit(1),
    },
    {
      name: 'profiles com unit_default_id',
      query: () => supabase.from('profiles').select('id, unit_default_id').limit(1),
    },
    {
      name: 'appointments com unit_id',
      query: () => supabase.from('appointments').select('id, unit_id').limit(1),
    },
  ];

  let passedTests = 0;

  for (const test of tests) {
    try {
      const { data, error } = await test.query();

      if (!error) {
        console.log(`✅ ${test.name} - OK`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} - ERRO: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${test.name} - ERRO: ${err.message}`);
    }
  }

  console.log(`\n📈 Testes: ${passedTests}/${tests.length} passaram`);

  if (passedTests === tests.length) {
    console.log('🎉 MIGRAÇÃO COMPLETA! Todos os testes passaram!');
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. npm run build');
    console.log('2. supabase gen types typescript');
    console.log('3. Testar aplicação');
  } else {
    console.log('⚠️ Alguns testes falharam. Executando correções...');
    await executeRawSQLCorrections([]);
  }
}

async function executeRawSQLCorrections(issues) {
  console.log('🔧 Executando correções SQL diretas...');

  // Como o Supabase via API tem limitações para DDL,
  // vamos tentar usar a função do PostgREST para SQL direto
  const sqlCommands = [
    // Renomear colunas se necessário
    `DO $$ 
     BEGIN 
       IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'appointments' AND column_name = 'unidade_id') THEN
         ALTER TABLE appointments RENAME COLUMN unidade_id TO unit_id;
       END IF;
     END $$;`,

    `DO $$ 
     BEGIN 
       IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'unidade_default_id') THEN
         ALTER TABLE profiles RENAME COLUMN unidade_default_id TO unit_default_id;
       END IF;
     END $$;`,

    `DO $$ 
     BEGIN 
       IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'customers' AND column_name = 'nome') THEN
         ALTER TABLE customers RENAME COLUMN nome TO name;
       END IF;
     END $$;`,

    `DO $$ 
     BEGIN 
       IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'professionals' AND column_name = 'nome') THEN
         ALTER TABLE professionals RENAME COLUMN nome TO name;
       END IF;
     END $$;`,

    `DO $$ 
     BEGIN 
       IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'professionals' AND column_name = 'papel') THEN
         ALTER TABLE professionals RENAME COLUMN papel TO role;
       END IF;
     END $$;`,
  ];

  console.log('\n📝 INSTRUÇÕES PARA EXECUÇÃO MANUAL:');
  console.log('Como a API do Supabase tem limitações para DDL (ALTER TABLE),');
  console.log('você precisa executar estes comandos no SQL Editor:');
  console.log('\n💻 Dashboard Supabase > SQL Editor > New Query:');
  console.log('─'.repeat(50));

  sqlCommands.forEach((sql, index) => {
    console.log(`-- Comando ${index + 1}:`);
    console.log(sql);
    console.log('');
  });

  console.log('─'.repeat(50));
  console.log('\n▶️ APÓS EXECUTAR OS COMANDOS ACIMA:');
  console.log('Execute: node check_migration_direct.js');

  return false; // Indica que precisa de execução manual
}

// Executar verificação
executeDirectCorrections();
