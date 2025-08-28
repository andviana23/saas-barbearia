import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Global setup para Playwright
 * Configura autenticação e prepara ambiente de testes
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  // Configurações do Supabase para testes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Criar usuário de teste se não existir
  const testUserEmail = process.env.TEST_USER_EMAIL || 'test@trato.com';
  const testUserPassword = process.env.TEST_USER_PASSWORD || 'test123456';

  try {
    // Tentar fazer login com usuário existente
    const {
      data: { user },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    });

    if (signInError || !user) {
      // Criar usuário de teste se não existir
      const {
        data: { user: newUser },
        error: signUpError,
      } = await supabase.auth.signUp({
        email: testUserEmail,
        password: testUserPassword,
        options: {
          data: {
            nome: 'Usuário Teste',
            papel: 'admin',
          },
        },
      });

      if (signUpError || !newUser) {
        console.warn('Não foi possível criar usuário de teste:', signUpError);
        return;
      }

      // Aguardar confirmação (em ambiente real)
      if (!newUser.email_confirmed_at) {
        console.log('Usuário de teste criado, aguardando confirmação...');
        // Em ambiente de teste, podemos confirmar manualmente
      }
    }

    // Fazer login para obter session
    const {
      data: { session },
      error: finalSignInError,
    } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    });

    if (finalSignInError || !session) {
      console.warn('Não foi possível fazer login:', finalSignInError);
      return;
    }

    // Iniciar browser para salvar estado de autenticação
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navegar para a aplicação
    await page.goto(baseURL || 'http://localhost:3000');

    // Aguardar carregamento da aplicação
    await page.waitForLoadState('networkidle');

    // Salvar estado de autenticação
    await context.storageState({ path: 'e2e/storage/auth.json' });

    await browser.close();

    console.log('✅ Global setup concluído - Estado de autenticação salvo');
  } catch (error) {
    console.error('❌ Erro no global setup:', error);
    throw error;
  }
}

export default globalSetup;
