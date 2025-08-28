require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Investiga o estado das tabelas duplicadas
 */
async function investigateTableDuplication() {
  console.log('🔍 INVESTIGAÇÃO: TABELAS DUPLICADAS\n');

  const tablePairs = [
    ['unidades', 'units'],
    ['clientes', 'customers'],
    ['profissionais', 'professionals'],
    ['servicos', 'services'],
    ['fila', 'queue'],
  ];

  for (const [ptTable, enTable] of tablePairs) {
    console.log(`📊 Comparando: ${ptTable} vs ${enTable}`);

    try {
      // Contar registros em cada tabela
      const { data: ptData, error: ptError } = await supabase
        .from(ptTable)
        .select('id', { count: 'exact', head: true });

      const { data: enData, error: enError } = await supabase
        .from(enTable)
        .select('id', { count: 'exact', head: true });

      const ptCount = ptError ? 'ERRO' : ptData?.length || 0;
      const enCount = enError ? 'ERRO' : enData?.length || 0;

      console.log(`   🇧🇷 ${ptTable}: ${ptCount} registros`);
      console.log(`   🇺🇸 ${enTable}: ${enCount} registros`);

      if (ptCount === enCount && ptCount !== 'ERRO') {
        console.log(`   ✅ Mesma quantidade de dados`);
      } else {
        console.log(`   ⚠️  Quantidades diferentes!`);
      }
    } catch (error) {
      console.log(`   ❌ Erro na comparação: ${error.message}`);
    }

    console.log('');
  }
}

/**
 * Verifica estrutura das colunas
 */
async function checkColumnStructure() {
  console.log('🔧 VERIFICANDO ESTRUTURA DAS COLUNAS\n');

  try {
    // Testar tabela unidades vs units
    console.log('📋 Testando estrutura: unidades vs units');

    const { data: unidadesTest, error: unidadesError } = await supabase
      .from('unidades')
      .select('nome, cnpj, endereco, telefone, ativo')
      .limit(1);

    const { data: unitsTest, error: unitsError } = await supabase
      .from('units')
      .select('name, tax_id, address, phone, active')
      .limit(1);

    if (!unidadesError) {
      console.log('   🇧🇷 unidades: colunas em português (nome, cnpj, endereco, telefone, ativo)');
    } else {
      console.log('   🇧🇷 unidades: erro ao acessar -', unidadesError.message);
    }

    if (!unitsError) {
      console.log('   🇺🇸 units: colunas em inglês (name, tax_id, address, phone, active)');
    } else {
      console.log('   🇺🇸 units: erro ao acessar -', unitsError.message);
    }
  } catch (error) {
    console.log('❌ Erro na verificação:', error.message);
  }
}

/**
 * Recomenda ação corretiva
 */
function recommendAction() {
  console.log('\n💡 ANÁLISE E RECOMENDAÇÕES');
  console.log('===========================\n');

  console.log('🔍 SITUAÇÃO IDENTIFICADA:');
  console.log('   • Tabelas em AMBOS os idiomas existem');
  console.log('   • Migração foi executada parcialmente');
  console.log('   • Estrutura duplicada no banco');

  console.log('\n🎯 POSSÍVEIS CAUSAS:');
  console.log('   1. Migração executada sem DROP das tabelas antigas');
  console.log('   2. Script migration_pt_to_en.sql criou novas tabelas');
  console.log('   3. Aplicação ainda usa nomes antigos');

  console.log('\n✅ AÇÕES RECOMENDADAS:');
  console.log('   1. VERIFICAR qual conjunto está sendo usado pela aplicação');
  console.log('   2. MIGRAR dados se necessário (PT → EN)');
  console.log('   3. ATUALIZAR código da aplicação para usar nomes EN');
  console.log('   4. REMOVER tabelas PT antigas após validação');

  console.log('\n🚨 ATENÇÃO:');
  console.log('   • NÃO remover tabelas PT antes de confirmar migração dos dados');
  console.log('   • Fazer backup antes de qualquer alteração');
  console.log('   • Testar aplicação com nomes EN primeiro');
}

/**
 * Cria script de limpeza
 */
async function createCleanupScript() {
  console.log('\n🧹 CRIANDO SCRIPT DE LIMPEZA\n');

  const cleanupSQL = `-- ================================================================================
-- SCRIPT DE LIMPEZA - REMOÇÃO DE TABELAS DUPLICADAS PT
-- Data: ${new Date().toISOString().split('T')[0]}
-- ATENÇÃO: Executar apenas após confirmar migração completa dos dados
-- ================================================================================

-- IMPORTANTE: 
-- 1. Confirmar que aplicação usa tabelas EN
-- 2. Confirmar que dados foram migrados PT → EN  
-- 3. Fazer backup antes da execução

BEGIN;

-- Verificar se tabelas EN existem e têm dados
DO $$
DECLARE
    units_count INTEGER;
    customers_count INTEGER; 
    professionals_count INTEGER;
    services_count INTEGER;
    queue_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO units_count FROM public.units;
    SELECT COUNT(*) INTO customers_count FROM public.customers;
    SELECT COUNT(*) INTO professionals_count FROM public.professionals;
    SELECT COUNT(*) INTO services_count FROM public.services;
    SELECT COUNT(*) INTO queue_count FROM public.queue;
    
    RAISE NOTICE 'CONTAGEM DE DADOS NAS TABELAS EM INGLÊS:';
    RAISE NOTICE 'units: % registros', units_count;
    RAISE NOTICE 'customers: % registros', customers_count;
    RAISE NOTICE 'professionals: % registros', professionals_count;
    RAISE NOTICE 'services: % registros', services_count;
    RAISE NOTICE 'queue: % registros', queue_count;
    
    IF units_count = 0 OR customers_count = 0 THEN
        RAISE EXCEPTION 'ATENÇÃO: Tabelas em inglês estão vazias! Não remover tabelas PT.';
    END IF;
END
$$;

-- Remover tabelas em português (apenas após confirmação)
-- DESCOMENTE APENAS APÓS VALIDAR MIGRAÇÃO COMPLETA

/*
DROP TABLE IF EXISTS public.fila CASCADE;
DROP TABLE IF EXISTS public.servicos CASCADE;
DROP TABLE IF EXISTS public.profissionais CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE; 
DROP TABLE IF EXISTS public.unidades CASCADE;

-- Remover outras tabelas PT se existirem
DROP TABLE IF EXISTS public.planos CASCADE;
DROP TABLE IF EXISTS public.assinaturas CASCADE;
DROP TABLE IF EXISTS public.pagamentos_assinaturas CASCADE;
DROP TABLE IF EXISTS public.notificacoes CASCADE;
DROP TABLE IF EXISTS public.financeiro_mov CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.vendas CASCADE;
DROP TABLE IF EXISTS public.vendas_itens CASCADE;

RAISE NOTICE 'Tabelas em português removidas com sucesso!';
*/

COMMIT;

-- ================================================================================
-- FIM DO SCRIPT DE LIMPEZA
-- ================================================================================`;

  const fs = require('fs');
  const path = require('path');
  const cleanupPath = path.join(__dirname, 'cleanup_duplicate_tables.sql');

  fs.writeFileSync(cleanupPath, cleanupSQL);
  console.log('📄 Script de limpeza criado: cleanup_duplicate_tables.sql');
  console.log('⚠️  NÃO executar até confirmar migração dos dados!');
}

/**
 * Função principal
 */
async function main() {
  console.log('🔍 INVESTIGAÇÃO DETALHADA - TABELAS DUPLICADAS');
  console.log('==============================================\n');

  await investigateTableDuplication();
  await checkColumnStructure();
  recommendAction();
  await createCleanupScript();

  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Verificar qual conjunto de tabelas a aplicação está usando');
  console.log('2. Se usar tabelas PT: migrar dados para tabelas EN');
  console.log('3. Atualizar código da aplicação para usar tabelas EN');
  console.log('4. Após validação: executar script de limpeza');
}

if (require.main === module) {
  main().catch(console.error);
}
