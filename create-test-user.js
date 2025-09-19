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

async function createTestUser() {
  try {
    console.log('🔧 Criando usuário de teste...');
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'teste@exemplo.com',
      password: 'senha123',
      email_confirm: true,
      user_metadata: { 
        nome: 'Usuário Teste',
        papel: 'admin'
      }
    });

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', data.user.email);
    console.log('🔑 Senha: senha123');
    console.log('🆔 ID:', data.user.id);

    // Criar perfil no banco
    console.log('\n🔧 Criando perfil...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: crypto.randomUUID(),
          user_id: data.user.id,
          email: data.user.email,
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
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createTestUser();