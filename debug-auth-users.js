const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Verificando usuários na tabela auth...\n');

// Usar service role key para acessar auth.users
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAuthUsers() {
  try {
    console.log('👥 Listando usuários na auth.users...');
    
    // Listar usuários usando Admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Erro ao listar usuários:', error.message);
      return;
    }
    
    console.log(`📊 Total de usuários encontrados: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`👤 Usuário ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
      console.log(`   Criado em: ${user.created_at}`);
      console.log('');
    });
    
    // Verificar especificamente o usuário Andrey
    const andreyUser = users.find(u => u.email === 'andrey@tratodebarbados.com.br');
    
    if (andreyUser) {
      console.log('✅ Usuário Andrey encontrado na auth!');
      console.log('📋 Detalhes:', andreyUser);
      
      // Agora verificar se existe perfil para este usuário
      console.log('\n🔍 Verificando perfil correspondente...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', andreyUser.id)
        .single();
      
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError.message);
        console.log('💡 O usuário existe na auth mas não tem perfil na tabela profiles!');
      } else {
        console.log('✅ Perfil encontrado:', profile);
      }
      
    } else {
      console.log('❌ Usuário Andrey NÃO encontrado na auth!');
      console.log('💡 Isso explica por que o login não funciona.');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkAuthUsers();