#!/usr/bin/env node
/**
 * Cria (ou garante existência) de um usuário de teste via Supabase Admin API.
 * Requer: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD
 * Não falha se usuário já existe.
 */
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const {
    SUPABASE_URL: RAW_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD,
  } = process.env;
  const SUPABASE_URL = RAW_SUPABASE_URL || NEXT_PUBLIC_SUPABASE_URL;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      '[create-test-user] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes (forneça SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL)',
    );
    process.exit(1);
  }
  if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
    console.error('[create-test-user] TEST_USER_EMAIL ou TEST_USER_PASSWORD ausentes');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  try {
    // Tentar buscar usuário existente
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) {
      console.warn(
        '[create-test-user] Falha ao listar usuários (continuando tentativa de criação):',
        listError.message,
      );
    } else {
      const exists = list.users.find((u) => u.email === TEST_USER_EMAIL);
      if (exists) {
        console.log('[create-test-user] Usuário de teste já existe:', TEST_USER_EMAIL);
        return;
      }
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
      app_metadata: { test: true },
      user_metadata: { testUser: true, createdBy: 'create-test-user-script' },
    });
    if (error) {
      console.error('[create-test-user] Erro ao criar usuário:', error.message);
      process.exit(1);
    }
    console.log('[create-test-user] Usuário de teste criado:', data.user?.id);
  } catch (e) {
    console.error('[create-test-user] Exceção:', e.message || e);
    process.exit(1);
  }
}

main();
