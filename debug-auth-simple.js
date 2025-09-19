// Script simples para debugar autenticação
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugAuth() {
  console.log('🔄 Debugando autenticação...');
  
  try {
    // Testar conexão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      return;
    }
    
    console.log('📋 Sessão atual:', session ? 'Encontrada' : 'Nenhuma');
    
    if (session) {
      console.log('👤 Usuário atual:', session.user.email);
      
      // Testar busca de perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
      } else {
        console.log('✅ Perfil encontrado:', profile);
      }
    }
    
    // Testar login
    console.log('\n🧪 Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'andrey@tratodebarbados.com.br',
      password: '@Aa30019258'
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      console.error('📋 Detalhes:', loginError);
    } else {
      console.log('✅ Login bem-sucedido!', loginData.user.email);
      console.log('🆔 User ID:', loginData.user.id);
      
      // Buscar perfil com retry
      console.log('\n🔍 Buscando perfil...');
      let profileData = null;
      let profileError = null;
      
      for (let i = 0; i < 3; i++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', loginData.user.id)
          .maybeSingle();
        
        if (!error) {
          profileData = data;
          break;
        }
        
        profileError = error;
        console.log(`Tentativa ${i + 1} falhou, aguardando...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (profileData) {
        console.log('✅ Perfil encontrado:', profileData);
      } else {
        console.error('❌ Erro ao buscar perfil após login:', profileError);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugAuth();