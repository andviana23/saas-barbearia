/**
 * Script para facilitar a execução manual no Supabase
 * Como a API não permite DDL, vamos preparar tudo para execução manual
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 FACILITADOR PARA EXECUÇÃO MANUAL NO SUPABASE\n');

// 1. Ler o arquivo SQL
const sqlPath = path.join(__dirname, 'db', 'migration_logs', 'correcoes_identificadas.sql');

if (!fs.existsSync(sqlPath)) {
  console.error('❌ Arquivo não encontrado:', sqlPath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, 'utf8');

console.log('📋 INSTRUÇÕES PASSO A PASSO:');
console.log('═'.repeat(50));

console.log('\n1️⃣ ABRIR SUPABASE DASHBOARD:');
console.log('   🌐 https://aadfqninxfigsaqfijke.supabase.co');
console.log('   📱 Fazer login');

console.log('\n2️⃣ ACESSAR SQL EDITOR:');
console.log('   📍 Menu lateral esquerdo > "SQL Editor"');
console.log('   ➕ Clicar em "New Query" (botão verde)');

console.log('\n3️⃣ COPIAR E COLAR:');
console.log('   📄 Arquivo preparado:', path.basename(sqlPath));
console.log('   📏 Tamanho:', sqlContent.length, 'caracteres');
console.log('   📊 Linhas:', sqlContent.split('\n').length);

console.log('\n4️⃣ EXECUTAR:');
console.log('   ▶️ Clicar no botão "Run" (ou Ctrl+Enter)');
console.log('   ⏳ Aguardar conclusão (1-2 minutos)');

console.log('\n5️⃣ VERIFICAR RESULTADO:');
console.log('   ✅ Procurar por mensagens de sucesso');
console.log('   ❌ Se houver erro, copiar mensagem');

console.log('\n6️⃣ VALIDAR:');
console.log('   📊 Executar: node check_migration_direct.js');
console.log('   🎯 Meta: 95%+ de conclusão');

console.log('\n' + '═'.repeat(50));
console.log('💡 DICAS IMPORTANTES:');
console.log('═'.repeat(50));

console.log('\n🔄 SE DER ERRO:');
console.log('   • Copie a mensagem de erro');
console.log('   • Execute comando por comando');
console.log('   • Pule comandos já executados');

console.log('\n✅ SCRIPT É SEGURO:');
console.log('   • Idempotente (pode executar várias vezes)');
console.log('   • Preserva dados existentes');
console.log('   • Não quebra estruturas');

console.log('\n⚡ COMANDOS PRINCIPAIS QUE SERÃO EXECUTADOS:');
console.log('─'.repeat(30));

// Extrair comandos principais
const mainCommands = [
  'ALTER TABLE appointments RENAME COLUMN unidade_id TO unit_id',
  'ALTER TABLE profiles RENAME COLUMN unidade_default_id TO unit_default_id',
  'ALTER TABLE customers RENAME COLUMN nome TO name',
  'ALTER TABLE professionals RENAME COLUMN nome TO name',
  'ALTER TABLE professionals RENAME COLUMN papel TO role',
  'ALTER TABLE financeiro_mov RENAME TO financial_transactions',
  'ALTER TABLE notificacoes RENAME TO notifications',
  'CREATE TABLE appointments_services',
  'CREATE FUNCTION current_unit_id()',
];

mainCommands.forEach((cmd, index) => {
  console.log(`   ${index + 1}. ${cmd}`);
});

console.log('\n' + '═'.repeat(50));
console.log('🚀 PRONTO PARA EXECUÇÃO!');
console.log('═'.repeat(50));

console.log('\n📂 ARQUIVO PARA COPIAR:');
console.log(`   ${sqlPath}`);

console.log('\n🌐 DASHBOARD SUPABASE:');
console.log('   https://aadfqninxfigsaqfijke.supabase.co');

console.log('\n💾 BACKUP AUTOMÁTICO:');
console.log('   ✅ Supabase faz backup automático');
console.log('   ✅ Point-in-time recovery disponível');

console.log('\n📞 APÓS EXECUÇÃO:');
console.log('   1. Volte ao terminal');
console.log('   2. Execute: node check_migration_direct.js');
console.log('   3. Reporte o resultado (95%+ = sucesso)');

console.log('\n🎉 VAMOS LÁ! Execute no Supabase Dashboard!');

// Abrir arquivo no explorador (Windows)
const { exec } = require('child_process');
exec(`explorer /select,"${sqlPath}"`, (error) => {
  if (!error) {
    console.log('\n📁 Arquivo aberto no Windows Explorer');
  }
});

// Abrir dashboard no navegador
exec('start https://aadfqninxfigsaqfijke.supabase.co', (error) => {
  if (!error) {
    console.log('🌐 Dashboard do Supabase aberto no navegador');
  }
});

console.log('\n⌚ Aguardando sua execução...');
console.log('💬 Me informe quando terminar!');
