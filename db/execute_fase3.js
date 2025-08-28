require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Verifica status das tabelas testando acesso direto
 */
async function checkTableStatus() {
  console.log('🔍 VERIFICANDO STATUS DAS TABELAS\n');

  // Tabelas em português para testar
  const ptTables = ['unidades', 'clientes', 'profissionais', 'servicos', 'fila'];

  // Tabelas em inglês para testar
  const enTables = ['units', 'customers', 'professionals', 'services', 'queue'];

  let ptFound = 0;
  let enFound = 0;

  console.log('🇧🇷 Testando tabelas em português...');
  for (const table of ptTables) {
    try {
      const { error } = await supabase.from(table).select('id', { head: true }).limit(1);
      if (!error) {
        console.log(`   ✅ ${table} - EXISTE`);
        ptFound++;
      } else {
        console.log(`   ❌ ${table} - NÃO EXISTE`);
      }
    } catch (e) {
      console.log(`   ❌ ${table} - NÃO EXISTE`);
    }
  }

  console.log('\n🇺🇸 Testando tabelas em inglês...');
  for (const table of enTables) {
    try {
      const { error } = await supabase.from(table).select('id', { head: true }).limit(1);
      if (!error) {
        console.log(`   ✅ ${table} - EXISTE`);
        enFound++;
      } else {
        console.log(`   ❌ ${table} - NÃO EXISTE`);
      }
    } catch (e) {
      console.log(`   ❌ ${table} - NÃO EXISTE`);
    }
  }

  console.log('\n📊 RESULTADO:');
  console.log(`   🇧🇷 Tabelas PT encontradas: ${ptFound}/${ptTables.length}`);
  console.log(`   🇺🇸 Tabelas EN encontradas: ${enFound}/${enTables.length}`);

  // Determinar status
  if (ptFound > 0 && enFound === 0) {
    console.log('\n⚠️  STATUS: MIGRAÇÃO NECESSÁRIA');
    console.log('   📋 As tabelas ainda estão em português');
    console.log('   🚀 Precisa executar migration_pt_to_en.sql');
    return 'MIGRATION_NEEDED';
  } else if (ptFound === 0 && enFound > 0) {
    console.log('\n✅ STATUS: MIGRAÇÃO COMPLETA');
    console.log('   🎉 Tabelas já estão em inglês');
    console.log('   📋 Fase 3 concluída!');
    return 'MIGRATION_COMPLETE';
  } else if (ptFound > 0 && enFound > 0) {
    console.log('\n🤔 STATUS: MIGRAÇÃO PARCIAL');
    console.log('   ⚠️  Existem tabelas em ambos os idiomas');
    console.log('   🧹 Pode ser necessária limpeza');
    return 'MIGRATION_PARTIAL';
  } else {
    console.log('\n❓ STATUS: NÃO IDENTIFICADO');
    console.log('   🔍 Nenhuma tabela principal encontrada');
    return 'UNKNOWN';
  }
}

/**
 * Executa a migração através do script manual helper
 */
async function executeMigrationManual() {
  console.log('\n🚀 EXECUTANDO MIGRAÇÃO MANUAL');
  console.log('================================\n');

  try {
    // Executar o helper manual que já criamos
    const { spawn } = require('child_process');
    const helperPath = require('path').join(__dirname, 'manual_helper.js');

    console.log('📂 Abrindo helper manual...');
    console.log('📁 Arquivo: manual_helper.js');

    // Para Windows PowerShell
    const process = spawn('node', [helperPath], {
      stdio: 'inherit',
      shell: true,
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Helper executado com sucesso');
      } else {
        console.log('\n❌ Erro na execução do helper');
      }
    });
  } catch (error) {
    console.log('❌ Erro ao executar helper:', error.message);

    // Fallback: instruções manuais
    console.log('\n📋 INSTRUÇÕES MANUAIS:');
    console.log('1. Abrir Supabase Dashboard');
    console.log('2. Ir em SQL Editor > New Query');
    console.log('3. Copiar conteúdo de migration_pt_to_en.sql');
    console.log('4. Executar no SQL Editor');
    console.log('5. Verificar sucesso');
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🔄 ANÁLISE E EXECUÇÃO DA FASE 3');
  console.log('===============================\n');

  const status = await checkTableStatus();

  switch (status) {
    case 'MIGRATION_NEEDED':
      console.log('\n🎯 AÇÃO: Executar migração PT → EN');
      await executeMigrationManual();
      break;

    case 'MIGRATION_COMPLETE':
      console.log('\n🎯 AÇÃO: Prosseguir para Fase 4');
      console.log('📋 Próxima etapa: Atualização do código da aplicação');
      break;

    case 'MIGRATION_PARTIAL':
      console.log('\n🎯 AÇÃO: Investigar estado das tabelas');
      console.log('📋 Pode ser necessária limpeza ou re-execução');
      break;

    default:
      console.log('\n🎯 AÇÃO: Verificar configuração do banco');
      console.log('📋 Possível problema de conectividade ou permissões');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
