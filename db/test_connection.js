require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas.');
  console.log(
    'Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Teste de conexão básica com query customizada
 */
async function testCustomQuery() {
  try {
    console.log('🔌 Testando conexão com query customizada...\n');

    // Query personalizada usando RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT inet_server_addr(), current_user, current_database();',
    });

    if (error) {
      console.log('⚠️  RPC exec_sql não disponível, tentando query alternativa...');

      // Alternativa: query básica de informação do sistema
      const { data: sysData, error: sysError } = await supabase
        .from('pg_stat_database')
        .select('datname')
        .eq('datname', 'postgres')
        .limit(1);

      if (sysError) {
        console.log('❌ Não foi possível executar queries do sistema');
        console.log('Error:', sysError.message);
        return;
      }

      console.log('✅ Conexão estabelecida com sucesso!');
      console.log('📊 Dados do sistema:');
      console.log('   - Banco: postgres (confirmado via pg_stat_database)');
      console.log('   - Status: Conectado');
      console.log('   - URL:', SUPABASE_URL);
    } else {
      console.log('✅ Query customizada executada com sucesso!');
      console.log('📊 Resultado da query:');
      console.log(data);
    }
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

if (require.main === module) {
  testCustomQuery().catch(console.error);
}
