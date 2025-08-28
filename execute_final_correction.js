/**
 * Script para executar a correção final da Fase 3 da migração PT->EN
 * Status atual: 63% - corrigindo problemas específicos identificados
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 EXECUÇÃO DA CORREÇÃO FINAL - FASE 3');
console.log('📊 Status atual: 63% completo');
console.log('🎯 Objetivo: Completar 100% da migração PT->EN\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

async function executeFinalCorrection() {
  console.log('📋 INSTRUÇÕES PARA EXECUÇÃO:');
  console.log('═'.repeat(50));

  console.log('\n1️⃣ ABRIR SUPABASE DASHBOARD:');
  console.log(`   🌐 URL: ${SUPABASE_URL.replace('/rest/v1', '')}`);
  console.log('   📱 Login com suas credenciais');

  console.log('\n2️⃣ ACESSAR SQL EDITOR:');
  console.log('   📍 Menu lateral > SQL Editor');
  console.log('   ➕ Clique em "New Query"');

  console.log('\n3️⃣ COPIAR ARQUIVO SQL:');
  const sqlPath = path.join(__dirname, 'db', 'migration_logs', 'correcao_final_fase3.sql');
  console.log(`   📁 Arquivo: ${sqlPath}`);

  if (fs.existsSync(sqlPath)) {
    console.log('   ✅ Arquivo encontrado');

    // Mostrar primeiras linhas do arquivo
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    const firstLines = sqlContent.split('\n').slice(0, 15).join('\n');

    console.log('\n📄 PRÉVIA DO ARQUIVO:');
    console.log('─'.repeat(40));
    console.log(firstLines);
    console.log('─'.repeat(40));
    console.log('... (arquivo completo tem mais comandos)');

    console.log('\n4️⃣ EXECUTAR NO SUPABASE:');
    console.log('   📋 Copiar todo o conteúdo do arquivo');
    console.log('   📝 Colar no SQL Editor');
    console.log('   ▶️  Clicar em "Run" (ou Ctrl+Enter)');

    console.log('\n5️⃣ AGUARDAR EXECUÇÃO:');
    console.log('   ⏳ Processo pode levar 1-2 minutos');
    console.log('   ✅ Aguardar mensagem de sucesso');

    console.log('\n6️⃣ VERIFICAR RESULTADO:');
    console.log('   📊 Executar: node check_migration_direct.js');
    console.log('   🎯 Meta: 95%+ de conclusão');
  } else {
    console.error('   ❌ Arquivo não encontrado!');
    console.log('   🔍 Verificar se o caminho está correto');
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📝 RESUMO DAS CORREÇÕES QUE SERÃO APLICADAS:');
  console.log('═'.repeat(50));

  console.log('\n🏷️  TABELAS:');
  console.log('   • assinaturas → subscriptions (mesclar dados)');
  console.log('   • financeiro_mov → financial_transactions');
  console.log('   • notificacoes → notifications');
  console.log('   • criar appointments_services');

  console.log('\n📄 COLUNAS:');
  console.log('   • profiles.unidade_default_id → unit_default_id');
  console.log('   • customers.nome → name');
  console.log('   • professionals.nome → name');
  console.log('   • professionals.papel → role');

  console.log('\n⚙️  FUNÇÕES:');
  console.log('   • criar current_unit_id()');
  console.log('   • remover current_unidade_id()');

  console.log('\n🔒 SEGURANÇA:');
  console.log('   • RLS para novas tabelas');
  console.log('   • Policies de acesso');
  console.log('   • Triggers updated_at');

  console.log('\n🎯 RESULTADO ESPERADO:');
  console.log('   📈 Migração: 63% → 95%+');
  console.log('   ✅ Todas as tabelas funcionando');
  console.log('   ✅ Todas as consultas passando');
  console.log('   ✅ Aplicação pronta para uso');

  console.log('\n⚠️  IMPORTANTE:');
  console.log('   • Execute em horário de baixo uso');
  console.log('   • Faça backup antes (se necessário)');
  console.log('   • Teste a aplicação depois');

  console.log('\n🆘 EM CASO DE ERRO:');
  console.log('   • Copie a mensagem de erro');
  console.log('   • Execute comando por comando');
  console.log('   • Pule comandos que já funcionaram');

  console.log('\n▶️  PRÓXIMO PASSO: Execute o SQL no Supabase Dashboard!');
}

// Aguardar confirmação do usuário
function waitForConfirmation() {
  console.log('\n❓ APÓS EXECUTAR O SQL NO SUPABASE:');
  console.log('   1. Volte ao terminal');
  console.log('   2. Execute: node check_migration_direct.js');
  console.log('   3. Verifique se chegou a 95%+ de conclusão');

  console.log('\n🎉 QUANDO CHEGAR A 95%+:');
  console.log('   1. npm run build');
  console.log('   2. supabase gen types typescript');
  console.log('   3. Testar aplicação');
  console.log('   4. 🎊 Migração COMPLETA!');
}

// Executar
executeFinalCorrection().then(() => {
  waitForConfirmation();
});
