#!/usr/bin/env node

/**
 * Script para executar a migração final PT -> EN via Supabase
 * Executa o arquivo: db/migration_logs/20250827_enum_migration_final.sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_KEY);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Lê o arquivo SQL da migração final
 */
function readMigrationSQL() {
  const sqlPath = path.join(__dirname, 'db', 'migration_logs', '20250827_enum_migration_final.sql');

  if (!fs.existsSync(sqlPath)) {
    throw new Error(`Arquivo não encontrado: ${sqlPath}`);
  }

  return fs.readFileSync(sqlPath, 'utf8');
}

/**
 * Extrai comandos SQL válidos (remove comentários e blocos vazios)
 */
function extractSQLCommands(sqlContent) {
  // Remove comentários de linha e blocos de comentários
  let cleaned = sqlContent
    .replace(/--.*$/gm, '') // Remove comentários de linha
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários de bloco
    .replace(/^\s*$/gm, '') // Remove linhas vazias
    .trim();

  // Divide em comandos por ponto e vírgula
  const commands = cleaned
    .split(';')
    .map((cmd) => cmd.trim())
    .filter((cmd) => cmd.length > 0 && !cmd.startsWith('/*') && !cmd.startsWith('--'));

  return commands;
}

/**
 * Executa comando SQL individual
 */
async function executeSQL(sql) {
  try {
    console.log('🔄 Executando:', sql.substring(0, 80) + '...');

    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });

    if (error) {
      console.warn('⚠️  Aviso:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Sucesso');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Executa a migração completa
 */
async function executeMigration() {
  console.log('🚀 Iniciando migração final PT -> EN');
  console.log('📁 Arquivo:', 'db/migration_logs/20250827_enum_migration_final.sql');
  console.log('🗄️  Conectando ao Supabase...\n');

  try {
    // 1. Teste de conectividade
    const { error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (testError) {
      throw new Error(`Erro de conectividade: ${testError.message}`);
    }

    console.log('✅ Conexão com Supabase estabelecida\n');

    // 2. Ler arquivo SQL
    console.log('📖 Lendo arquivo de migração...');
    const sqlContent = readMigrationSQL();

    // 3. Extrair comandos SQL
    console.log('🔍 Extraindo comandos SQL...');
    const commands = extractSQLCommands(sqlContent);
    console.log(`📋 Encontrados ${commands.length} comandos SQL\n`);

    // 4. Executar comandos
    console.log('⚡ Executando comandos...\n');

    let successCount = 0;
    let warningCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      // Pular comandos que são apenas comentários ou validações
      if (
        command.toLowerCase().includes("select 'validação") ||
        command.toLowerCase().includes('relatório final') ||
        command.toLowerCase().startsWith('/*')
      ) {
        console.log(`⏭️  Pulando comando ${i + 1}: validação/comentário`);
        continue;
      }

      console.log(`\n📤 Comando ${i + 1}/${commands.length}:`);
      const result = await executeSQL(command);

      if (result.success) {
        successCount++;
      } else {
        warningCount++;
        console.log(`   Detalhes: ${result.error}`);
      }

      // Pequena pausa entre comandos
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 5. Executar validações finais
    console.log('\n🔍 Executando validações finais...\n');

    // Verificar tabelas em português ainda existentes
    const { data: ptTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'unidades',
        'clientes',
        'profissionais',
        'servicos',
        'fila',
        'planos',
        'assinaturas',
        'financeiro_mov',
        'notificacoes',
      ]);

    // Verificar se current_unit_id existe
    const { data: functions } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'current_unit_id');

    // 6. Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DA MIGRAÇÃO FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`⚠️  Comandos com avisos: ${warningCount}`);
    console.log(`📋 Total de comandos processados: ${successCount + warningCount}`);

    if (ptTables && ptTables.length > 0) {
      console.log(
        `❗ Tabelas em português ainda existentes: ${ptTables.map((t) => t.table_name).join(', ')}`,
      );
    } else {
      console.log('✅ Nenhuma tabela em português encontrada');
    }

    if (functions && functions.length > 0) {
      console.log('✅ Função current_unit_id() criada com sucesso');
    } else {
      console.log('❌ Função current_unit_id() não encontrada');
    }

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. 🔨 Executar: npm run build');
    console.log('2. 🔄 Gerar tipos: supabase gen types typescript');
    console.log('3. 🧪 Testar todas as funcionalidades');
    console.log('4. 📊 Monitorar logs por 24-48h');

    console.log('\n🎉 Migração final PT -> EN concluída!');
  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error.message);
    console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
    console.log('1. Verificar variáveis de ambiente (.env.local)');
    console.log('2. Verificar conexão com Supabase');
    console.log('3. Executar manualmente via SQL Editor do Supabase');
    process.exit(1);
  }
}

/**
 * Execução principal
 */
if (require.main === module) {
  executeMigration();
}

module.exports = { executeMigration };
