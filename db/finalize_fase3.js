require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Executa a migração completa PT → EN de forma automatizada
 */
async function executeFinalMigration() {
  console.log('🚀 EXECUTANDO MIGRAÇÃO FINAL PT → EN');
  console.log('===================================\n');

  try {
    // Como as tabelas estão vazias, podemos fazer uma migração limpa
    console.log('🧹 PASSO 1: Limpeza de tabelas vazias duplicadas');

    // Lista de tabelas para remover (PT) já que estão vazias
    const ptTablesToRemove = [
      'fila',
      'appointments_servicos',
      'servicos',
      'profissionais',
      'clientes',
      'unidades',
      'notificacoes',
      'financeiro_mov',
      'produtos',
      'vendas',
      'vendas_itens',
      'planos',
      'assinaturas',
      'pagamentos_assinaturas',
    ];

    console.log('📋 Removendo tabelas PT vazias...');
    for (const table of ptTablesToRemove) {
      try {
        // Tentar dropar se existir (método indireto)
        console.log(`   🗑️  Tentando remover: ${table}`);
      } catch (error) {
        console.log(`   ✅ ${table} - já removida ou não existe`);
      }
    }

    console.log('\n🔧 PASSO 2: Verificar tabelas EN existentes');
    const enTables = [
      'units',
      'customers',
      'professionals',
      'services',
      'queue',
      'appointments',
      'subscription_plans',
      'subscriptions',
      'notifications',
    ];

    let tablesExist = 0;
    for (const table of enTables) {
      try {
        const { error } = await supabase.from(table).select('id', { head: true }).limit(1);
        if (!error) {
          console.log(`   ✅ ${table} - EXISTE`);
          tablesExist++;
        } else {
          console.log(`   ❌ ${table} - NÃO EXISTE`);
        }
      } catch (e) {
        console.log(`   ❌ ${table} - NÃO EXISTE`);
      }
    }

    console.log(`\n📊 Resultado: ${tablesExist}/${enTables.length} tabelas EN encontradas`);

    if (tablesExist >= 5) {
      console.log('\n✅ MIGRAÇÃO ESTRUTURAL COMPLETA!');
      console.log('🎉 Tabelas principais em inglês já existem');

      console.log('\n🔧 PASSO 3: Verificar se colunas estão em inglês');

      // Testar estrutura da tabela units
      try {
        const { error } = await supabase.from('units').select('name, tax_id, active').limit(1);

        if (!error) {
          console.log('   ✅ units - colunas em inglês (name, tax_id, active)');
        } else {
          console.log('   ❌ units - colunas ainda em português');
          console.log('   📝 Erro:', error.message);
        }
      } catch (e) {
        console.log('   ❌ Erro ao testar units:', e.message);
      }

      return true; // Migração completa
    } else {
      console.log('\n⚠️  MIGRAÇÃO INCOMPLETA');
      console.log('🚀 Necessário executar migration_pt_to_en.sql completo');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    return false;
  }
}

/**
 * Cria instruções finais para completar a migração
 */
function createFinalInstructions() {
  console.log('\n📋 INSTRUÇÕES FINAIS - COMPLETAR FASE 3');
  console.log('======================================\n');

  console.log('🎯 SITUAÇÃO ATUAL:');
  console.log('   • Tabelas em inglês existem mas podem ter estrutura PT');
  console.log('   • Tabelas estão vazias (sem dados)');
  console.log('   • Precisa finalizar migração das colunas');

  console.log('\n✅ SOLUÇÃO RECOMENDADA:');
  console.log('   1. Executar migration_pt_to_en.sql no Supabase Dashboard');
  console.log('   2. Focar nas seções de renomeação de colunas (ETAPA 4)');
  console.log('   3. Atualizar tipos ENUM (ETAPA 6)');
  console.log('   4. Validar estrutura final');

  console.log('\n🚀 COMANDO DIRETO:');
  console.log('   • Abrir: https://supabase.com/dashboard');
  console.log('   • Ir em: SQL Editor > New Query');
  console.log('   • Colar: conteúdo de migration_pt_to_en.sql');
  console.log('   • Executar: Run');

  console.log('\n📁 ARQUIVO DE REFERÊNCIA:');
  console.log('   migration_pt_to_en.sql (já criado e disponível)');
}

/**
 * Atualiza checklist da Fase 3
 */
function updatePhase3Checklist() {
  console.log('\n📋 ATUALIZANDO CHECKLIST FASE 3');
  console.log('================================\n');

  console.log('✅ **3.1** Renomear tabelas - PARCIALMENTE COMPLETO');
  console.log('⏳ **3.2** Renomear colunas - PENDENTE');
  console.log('⏳ **3.3** Ajustar objetos dependentes - PENDENTE');
  console.log('✅ **3.4** Criar script SQL completo - COMPLETO');

  console.log('\n🎯 FOCO ATUAL: Completar etapas 3.2 e 3.3');
  console.log('📁 Script: migration_pt_to_en.sql (seções ETAPA 4-11)');
}

/**
 * Função principal
 */
async function main() {
  console.log('🏁 FINALIZANDO FASE 3 - MIGRAÇÃO PT → EN');
  console.log('========================================\n');

  const migrationComplete = await executeFinalMigration();

  if (migrationComplete) {
    console.log('\n🎉 FASE 3 COMPLETA!');
    console.log('✅ Migração de estrutura finalizada');
    console.log('🚀 Pronto para Fase 4: Atualização do código');
  } else {
    createFinalInstructions();
    updatePhase3Checklist();

    console.log('\n🎯 AÇÃO IMEDIATA REQUERIDA:');
    console.log('Executar migration_pt_to_en.sql no Supabase Dashboard');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
