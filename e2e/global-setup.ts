import { chromium, FullConfig } from '@playwright/test';
import { createClient, type User } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Global setup para Playwright
 * Configura autenticação e prepara ambiente de testes
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  // Configurações do Supabase para testes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

  // Criar usuário de teste se não existir
  const candidateEmails = [
    process.env.TEST_USER_EMAIL,
    'e2e@test.local',
    'e2e@test.localhost',
    'e2e@dev.local',
    'e2e@localhost.com',
    'e2e@exemplo.com',
  ].filter(Boolean) as string[];
  const testUserPassword = process.env.TEST_USER_PASSWORD || 'test123456';
  let testUserEmail: string | null = null;

  try {
    // Tentar fazer login ou criar usuário existente
    let user: User | null = null;

    if (!supabaseAdmin) {
      console.warn(
        '⚠️ SUPABASE_SERVICE_ROLE_KEY não definido – criação/auto-confirmação de usuário indisponível.',
      );
    } else {
      // Procurar usuário em qualquer email candidato
      const list = await supabaseAdmin.auth.admin.listUsers();
      for (const email of candidateEmails) {
        const found = list.data.users.find((u) => u.email === email);
        if (found) {
          user = found;
          testUserEmail = email;
          break;
        }
      }

      // Criar se não encontrou
      if (!user) {
        for (const email of candidateEmails) {
          try {
            const created = await supabaseAdmin.auth.admin.createUser({
              email,
              password: testUserPassword,
              email_confirm: true,
              user_metadata: { nome: 'Usuário Teste', papel: 'admin' },
            });
            if (created.data.user) {
              user = created.data.user;
              testUserEmail = email;
              console.log(`✅ Usuário de teste criado via admin: ${email}`);
              break;
            }
          } catch (e) {
            const msg = (e as { message?: string })?.message || e;
            console.warn(`⚠️ Falha ao criar usuário ${email}:`, msg);
          }
        }
      }

      // Confirmar email se necessário
      if (user && !user.email_confirmed_at) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
          console.log('✅ Email confirmado (admin)');
        } catch (e) {
          console.warn('⚠️ Falha ao confirmar email (admin):', e);
        }
      }
    }

    if (!testUserEmail) {
      console.error('❌ Nenhum email de teste pôde ser utilizado. Abortando.');
      return;
    }
    process.env.TEST_USER_EMAIL = testUserEmail;

    const { data: finalLoginTry, error: finalTryError } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    });
    if (finalTryError || !finalLoginTry.session) {
      console.error('❌ Falha ao autenticar usuário de teste:', finalTryError?.message);
      return;
    }
    user = finalLoginTry.user;

    // Iniciar browser para salvar estado de autenticação
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const storageDir = path.join(process.cwd(), 'e2e', 'storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    await context.storageState({ path: path.join(storageDir, 'auth.json') });

    await browser.close();

    console.log(`✅ Global setup concluído - Estado salvo para ${testUserEmail}`);
  } catch (error) {
    console.error('❌ Erro no global setup:', error);
    throw error; // Impede execução sem autenticação
  }
}

export default globalSetup;
