const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Verificando configuração do Supabase...\n');

// Verificar variáveis de ambiente
console.log('📋 Variáveis de ambiente:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***definida***' : 'undefined');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '***definida***' : 'undefined');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '***definida***' : 'undefined');

// Verificar se está usando local ou nuvem
const isLocal = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost') || 
                process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('127.0.0.1');

console.log('\n🌐 Configuração detectada:');
console.log('Tipo:', isLocal ? 'LOCAL' : 'NUVEM');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Criar cliente e testar conexão
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    console.log('\n🔗 Testando conexão...');
    
    // Testar conexão básica
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return;
    }
    
    console.log('✅ Conexão bem-sucedida!');
    
    // Verificar se o usuário Andrey existe
    console.log('\n👤 Verificando usuário Andrey...');
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('name', 'Andrey - Administrador Trato de Barbados')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Perfil encontrado:', profiles[0]);
    } else {
      console.log('❌ Perfil não encontrado');
      
      // Listar todos os perfis para debug
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('name, user_id')
        .limit(5);
      
      console.log('📋 Perfis disponíveis:', allProfiles);
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testConnection();