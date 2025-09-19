// Script para verificar usuários existentes
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usar service key para acesso total
);

async function checkUsers() {
  console.log('=== Verificando Usuários no Sistema ===');
  
  try {
    // 1. Buscar todos os usuários
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários do auth:', authError);
      return;
    }
    
    console.log('✅ Usuários encontrados no auth:', authUsers.users.length);
    
    authUsers.users.forEach(user => {
      console.log(`- ${user.email} (${user.id})`);
    });
    
    // 2. Buscar perfis no banco
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
    } else {
      console.log('\n✅ Perfis encontrados:', profiles.length);
      
      profiles.forEach(profile => {
        console.log(`- ${profile.full_name} (${profile.email}) - ${profile.role}`);
      });
    }
    
    // 3. Verificar se existe o email andrey@tratodebarbados.com.br
    const targetEmail = 'andrey@tratodebarbados.com.br';
    const userExists = authUsers.users.some(u => u.email === targetEmail);
    
    if (userExists) {
      console.log(`\n✅ Usuário ${targetEmail} existe no auth`);
      
      // Buscar unidades do usuário
      const targetUser = authUsers.users.find(u => u.email === targetEmail);
      const { data: unitMembers, error: umError } = await supabase
        .from('unit_members')
        .select('*, units(*)')
        .eq('user_id', targetUser.id);
        
      if (umError) {
        console.log('❌ Erro ao buscar unidades:', umError);
      } else {
        console.log(`✅ Unidades do usuário ${targetEmail}:`, unitMembers.length);
        unitMembers.forEach(um => {
          console.log(`  → ${um.units.name} (${um.unit_id}) - Role: ${um.role}`);
        });
      }
      
    } else {
      console.log(`\n❌ Usuário ${targetEmail} NÃO existe no auth`);
      
      // Verificar se existe no profiles
      const profileExists = profiles.some(p => p.email === targetEmail);
      if (profileExists) {
        console.log(`⚠️  Mas o perfil existe no banco - inconsistência!`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkUsers();