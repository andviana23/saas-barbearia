const { execSync } = require('child_process');
const path = require('path');

/**
 * Helper para executar migração manual no Supabase Dashboard
 */
function openManualMigrationHelper() {
  console.log('🚀 HELPER DE MIGRAÇÃO MANUAL - FASE 3 FINAL');
  console.log('===========================================\n');

  console.log('📋 SITUAÇÃO ATUAL:');
  console.log('   ✅ Tabelas em inglês existem (units, customers, etc.)');
  console.log('   ❌ Colunas ainda estão em português');
  console.log('   🎯 NECESSÁRIO: Renomear colunas PT → EN');

  console.log('\n🔧 ETAPAS PARA COMPLETAR A MIGRAÇÃO:');
  console.log('====================================\n');

  // Passo 1: Abrir Dashboard
  console.log('📌 PASSO 1: Abrir Supabase Dashboard');
  console.log('   🌐 URL: https://supabase.com/dashboard');
  console.log('   📂 Projeto: saas-barbearia');
  console.log('   🔧 Navegar: SQL Editor > New Query');

  // Passo 2: Script específico para colunas
  console.log('\n📌 PASSO 2: Copiar e executar script de colunas');
  console.log('   📄 Executar apenas a ETAPA 4 de migration_pt_to_en.sql:');

  const columnScript = `-- ================================================================================
-- MIGRAÇÃO DE COLUNAS PT → EN (SOMENTE ETAPA 4)
-- Execute este script no SQL Editor do Supabase
-- ================================================================================

BEGIN;

-- 4.1 Tabela units (ex-unidades)
ALTER TABLE public.units RENAME COLUMN nome TO name;
ALTER TABLE public.units RENAME COLUMN cnpj TO tax_id;
ALTER TABLE public.units RENAME COLUMN endereco TO address;
ALTER TABLE public.units RENAME COLUMN telefone TO phone;
ALTER TABLE public.units RENAME COLUMN ativo TO active;

-- 4.2 Tabela profiles (já está correta)
ALTER TABLE public.profiles RENAME COLUMN nome TO name;
ALTER TABLE public.profiles RENAME COLUMN telefone TO phone;
ALTER TABLE public.profiles RENAME COLUMN unidade_default_id TO unit_default_id;
ALTER TABLE public.profiles RENAME COLUMN ativo TO active;

-- 4.3 Tabela professionals (ex-profissionais)
ALTER TABLE public.professionals RENAME COLUMN nome TO name;
ALTER TABLE public.professionals RENAME COLUMN papel TO role;
ALTER TABLE public.professionals RENAME COLUMN comissao_regra TO commission_rule;
ALTER TABLE public.professionals RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.professionals RENAME COLUMN ativo TO active;

-- 4.4 Tabela customers (ex-clientes)
ALTER TABLE public.customers RENAME COLUMN nome TO name;
ALTER TABLE public.customers RENAME COLUMN telefone TO phone;
ALTER TABLE public.customers RENAME COLUMN preferencias TO preferences;
ALTER TABLE public.customers RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.customers RENAME COLUMN ativo TO active;

-- 4.5 Tabela services (ex-servicos)
ALTER TABLE public.services RENAME COLUMN nome TO name;
ALTER TABLE public.services RENAME COLUMN categoria TO category;
ALTER TABLE public.services RENAME COLUMN preco TO price_cents;
ALTER TABLE public.services RENAME COLUMN duracao_min TO duration_minutes;
ALTER TABLE public.services RENAME COLUMN categoria_id TO category_id;
ALTER TABLE public.services RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.services RENAME COLUMN ativo TO active;

-- 4.6 Tabela appointments
ALTER TABLE public.appointments RENAME COLUMN cliente_id TO customer_id;
ALTER TABLE public.appointments RENAME COLUMN profissional_id TO professional_id;
ALTER TABLE public.appointments RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.appointments RENAME COLUMN inicio TO start_time;
ALTER TABLE public.appointments RENAME COLUMN fim TO end_time;
ALTER TABLE public.appointments RENAME COLUMN total TO total_cents;
ALTER TABLE public.appointments RENAME COLUMN notas TO notes;

-- 4.7 Tabela queue (ex-fila)
ALTER TABLE public.queue RENAME COLUMN posicao TO position;
ALTER TABLE public.queue RENAME COLUMN estimativa_min TO estimated_wait_minutes;
ALTER TABLE public.queue RENAME COLUMN prioridade TO priority;
ALTER TABLE public.queue RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.queue RENAME COLUMN cliente_id TO customer_id;

COMMIT;

-- Verificação final
SELECT 'Migração de colunas concluída!' as status;`;

  console.log('\n📄 SCRIPT PARA COPIAR E COLAR:');
  console.log('================================\n');
  console.log(columnScript);

  // Passo 3: Abrir automaticamente
  console.log('\n📌 PASSO 3: Tentar abrir automaticamente');
  try {
    console.log('   🌐 Abrindo browser...');
    const command =
      process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    execSync(`${command} https://supabase.com/dashboard`);
    console.log('   ✅ Dashboard aberto no browser');
  } catch (error) {
    console.log('   ⚠️  Não foi possível abrir automaticamente');
    console.log('   📋 Abra manualmente: https://supabase.com/dashboard');
  }

  console.log('\n📋 CHECKLIST EXECUÇÃO:');
  console.log('======================');
  console.log('[ ] 1. Dashboard Supabase aberto');
  console.log('[ ] 2. SQL Editor > New Query');
  console.log('[ ] 3. Script colado na query');
  console.log('[ ] 4. Executar com "Run"');
  console.log('[ ] 5. Verificar sucesso');
  console.log('[ ] 6. Confirmar: "Migração de colunas concluída!"');

  console.log('\n🎯 APÓS EXECUÇÃO:');
  console.log('   📋 Fase 3 estará 100% completa');
  console.log('   🚀 Prosseguir para Fase 4: Código da aplicação');

  console.log('\n⚠️  IMPORTANTE:');
  console.log('   • Se houver erro de "coluna já existe", está OK');
  console.log('   • Focar na mensagem final de sucesso');
  console.log('   • Backup já foi feito anteriormente');
}

// Salvar script em arquivo separado
function createColumnMigrationScript() {
  const fs = require('fs');
  const scriptPath = path.join(__dirname, 'column_migration_only.sql');

  const script = `-- ================================================================================
-- MIGRAÇÃO DE COLUNAS PT → EN (SOMENTE ETAPA 4)
-- Execute este script no SQL Editor do Supabase
-- Data: ${new Date().toISOString().split('T')[0]}
-- ================================================================================

BEGIN;

-- 4.1 Tabela units (ex-unidades) 
ALTER TABLE public.units RENAME COLUMN nome TO name;
ALTER TABLE public.units RENAME COLUMN cnpj TO tax_id;
ALTER TABLE public.units RENAME COLUMN endereco TO address;
ALTER TABLE public.units RENAME COLUMN telefone TO phone;
ALTER TABLE public.units RENAME COLUMN ativo TO active;

-- 4.2 Tabela profiles
ALTER TABLE public.profiles RENAME COLUMN nome TO name;
ALTER TABLE public.profiles RENAME COLUMN telefone TO phone;
ALTER TABLE public.profiles RENAME COLUMN unidade_default_id TO unit_default_id;
ALTER TABLE public.profiles RENAME COLUMN ativo TO active;

-- 4.3 Tabela professionals (ex-profissionais)
ALTER TABLE public.professionals RENAME COLUMN nome TO name;
ALTER TABLE public.professionals RENAME COLUMN papel TO role;
ALTER TABLE public.professionals RENAME COLUMN comissao_regra TO commission_rule;
ALTER TABLE public.professionals RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.professionals RENAME COLUMN ativo TO active;

-- 4.4 Tabela customers (ex-clientes)
ALTER TABLE public.customers RENAME COLUMN nome TO name;
ALTER TABLE public.customers RENAME COLUMN telefone TO phone;
ALTER TABLE public.customers RENAME COLUMN preferencias TO preferences;
ALTER TABLE public.customers RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.customers RENAME COLUMN ativo TO active;

-- 4.5 Tabela services (ex-servicos)
ALTER TABLE public.services RENAME COLUMN nome TO name;
ALTER TABLE public.services RENAME COLUMN categoria TO category;
ALTER TABLE public.services RENAME COLUMN preco TO price_cents;
ALTER TABLE public.services RENAME COLUMN duracao_min TO duration_minutes;
ALTER TABLE public.services RENAME COLUMN categoria_id TO category_id;
ALTER TABLE public.services RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.services RENAME COLUMN ativo TO active;

-- 4.6 Tabela appointments
ALTER TABLE public.appointments RENAME COLUMN cliente_id TO customer_id;
ALTER TABLE public.appointments RENAME COLUMN profissional_id TO professional_id;
ALTER TABLE public.appointments RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.appointments RENAME COLUMN inicio TO start_time;
ALTER TABLE public.appointments RENAME COLUMN fim TO end_time;
ALTER TABLE public.appointments RENAME COLUMN total TO total_cents;
ALTER TABLE public.appointments RENAME COLUMN notas TO notes;

-- 4.7 Tabela queue (ex-fila)
ALTER TABLE public.queue RENAME COLUMN posicao TO position;
ALTER TABLE public.queue RENAME COLUMN estimativa_min TO estimated_wait_minutes;
ALTER TABLE public.queue RENAME COLUMN prioridade TO priority;
ALTER TABLE public.queue RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.queue RENAME COLUMN cliente_id TO customer_id;

COMMIT;

-- Verificação final
SELECT 'Migração de colunas concluída com sucesso!' as status;

-- ================================================================================
-- FIM DA MIGRAÇÃO DE COLUNAS
-- ================================================================================`;

  fs.writeFileSync(scriptPath, script);
  console.log(`\n📄 Script salvo em: ${scriptPath}`);
  console.log('📋 Use este arquivo como referência');
}

/**
 * Função principal
 */
function main() {
  openManualMigrationHelper();
  createColumnMigrationScript();

  console.log('\n🎯 RESUMO:');
  console.log('==========');
  console.log('✅ Helper executado');
  console.log('✅ Script criado: column_migration_only.sql');
  console.log('🌐 Dashboard deveria estar aberto');
  console.log('📋 Siga o checklist acima');
  console.log('\n🚀 Boa sorte na execução final!');
}

if (require.main === module) {
  main();
}
