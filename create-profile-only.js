import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variáveis de ambiente não configuradas corretamente');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function createProfile() {
  try {
    console.log('🔧 Criando perfil para usuário existente...');
    
    // Buscar o usuário
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
      console.error('❌ Erro ao buscar usuários:', userError.message);
      return;
    }

    const testUser = users.users.find(u => u.email === 'teste@exemplo.com');
    if (!testUser) {
      console.error('❌ Usuário teste@exemplo.com não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', testUser.email);

    // Criar perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: crypto.randomUUID(),
          user_id: testUser.id,
          email: testUser.email,
          name: 'Usuário Teste',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message);
    } else {
      console.log('✅ Perfil criado com sucesso!');
      console.log('📧 Email: teste@exemplo.com');
      console.log('🔑 Senha: senha123');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createProfile();