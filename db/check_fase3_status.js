require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Verifica o status atual das migrações e executa a Fase 3
 */
async function executeFase3() {
  try {
    console.log('🔍 ANÁLISE DA FASE 3 - EXECUÇÃO NO BANCO DE DADOS\n');

    // 1. Verificar status atual das tabelas
    console.log('📊 Verificando tabelas atuais...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.log('❌ Erro ao consultar tabelas:', tablesError.message);
      return;
    }

    // Listar tabelas encontradas
    const tableNames = tables.map((t) => t.table_name);
    console.log('📋 Tabelas encontradas:', tableNames.length);

    // Verificar se ainda existem nomes em português
    const ptTables = tableNames.filter((name) =>
      [
        'unidades',
        'clientes',
        'profissionais',
        'servicos',
        'fila',
        'planos',
        'assinaturas',
        'notificacoes',
        'financeiro_mov',
      ].includes(name),
    );

    // Verificar se já existem nomes em inglês
    const enTables = tableNames.filter((name) =>
      [
        'units',
        'customers',
        'professionals',
        'services',
        'queue',
        'subscription_plans',
        'subscriptions',
        'notifications',
        'financial_transactions',
      ].includes(name),
    );

    console.log(
      '🇧🇷 Tabelas em português ainda presentes:',
      ptTables.length > 0 ? ptTables : 'Nenhuma',
    );
    console.log('🇺🇸 Tabelas em inglês já existentes:', enTables.length > 0 ? enTables : 'Nenhuma');

    // 2. Determinar ação necessária
    if (ptTables.length > 0) {
      console.log('\n🚀 AÇÃO NECESSÁRIA: Executar migração PT → EN');
      console.log('📁 Script disponível: migration_pt_to_en.sql');
      console.log('📋 Checklist Fase 3 em docs/Tarefas/AjustedoSQL.md está marcado como CONCLUÍDO');
      console.log('❓ Mas as tabelas ainda estão em português no banco');

      console.log('\n⚠️  DECISÃO NECESSÁRIA:');
      console.log('1. Executar migration_pt_to_en.sql no Supabase Dashboard SQL Editor');
      console.log('2. Ou usar o script de execução automática');

      return false; // Migração ainda necessária
    } else if (enTables.length > 0) {
      console.log('\n✅ MIGRAÇÃO JÁ EXECUTADA!');
      console.log('🎉 Todas as tabelas já estão em inglês');

      // Verificar tipos ENUM
      const { data: enums, error: enumsError } = await supabase.rpc('exec_sql', {
        sql_query:
          "SELECT typname FROM pg_type WHERE typname IN ('user_role', 'appointment_status', 'queue_status', 'transaction_type')",
      });

      if (!enumsError && enums) {
        console.log(
          '🏷️  Tipos ENUM em inglês:',
          enums.length > 0 ? 'Encontrados' : 'Não encontrados',
        );
      }

      return true; // Migração completa
    } else {
      console.log('\n🤔 SITUAÇÃO NÃO IDENTIFICADA');
      console.log('Nem tabelas PT nem EN foram encontradas');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    return false;
  }
}

/**
 * Executa a migração PT → EN automaticamente
 */
async function executeMigration() {
  try {
    console.log('🚀 Iniciando execução da migração PT → EN...\n');

    // Ler o arquivo de migração
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '..', 'migration_pt_to_en.sql');

    if (!fs.existsSync(migrationPath)) {
      console.log('❌ Arquivo migration_pt_to_en.sql não encontrado');
      return false;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Arquivo de migração carregado');
    console.log('📏 Tamanho:', migrationSQL.length, 'caracteres');

    // Dividir em comandos menores para execução
    const commands = migrationSQL
      .split(';')
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith('--') && !cmd.match(/^\s*$/))
      .filter((cmd) => !cmd.includes('BEGIN') && !cmd.includes('COMMIT'));

    console.log('🔧 Comandos extraídos:', commands.length);

    console.log('\n⚠️  IMPORTANTE: Para executar via API do Supabase:');
    console.log('1. As migrações DDL (ALTER TABLE, CREATE TYPE, etc.) têm limitações via API');
    console.log('2. Recomendado: Execução manual no SQL Editor do Dashboard Supabase');
    console.log('3. Ou uso de conexão direta com psql');

    return false; // Execução manual recomendada
  } catch (error) {
    console.error('❌ Erro na execução:', error.message);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🔄 FASE 3: EXECUÇÃO NO BANCO DE DADOS');
  console.log('=====================================\n');

  const migrationCompleted = await executeFase3();

  if (!migrationCompleted) {
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Abrir Supabase Dashboard > SQL Editor');
    console.log('2. Executar o conteúdo de migration_pt_to_en.sql');
    console.log('3. Verificar sucesso da execução');
    console.log('4. Prosseguir para Fase 4 (Atualização do Código)');
  } else {
    console.log('\n🎯 FASE 3 COMPLETA! Prosseguir para Fase 4');
    console.log('📋 Próxima tarefa: Atualização do código da aplicação');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
