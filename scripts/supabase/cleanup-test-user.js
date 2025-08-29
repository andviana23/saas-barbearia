#!/usr/bin/env node
/**
 * Remove usuário de teste (idempotente).
 * Requer: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_USER_EMAIL
 */
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const {
    SUPABASE_URL: RAW_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    TEST_USER_EMAIL,
  } = process.env;
  const SUPABASE_URL = RAW_SUPABASE_URL || NEXT_PUBLIC_SUPABASE_URL;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TEST_USER_EMAIL) {
    console.error(
      '[cleanup-test-user] Variáveis obrigatórias ausentes (SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_USER_EMAIL)',
    );
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  try {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) {
      console.error('[cleanup-test-user] Falha ao listar usuários:', listError.message);
      process.exit(1);
    }
    const user = list.users.find((u) => u.email === TEST_USER_EMAIL);
    if (!user) {
      console.log('[cleanup-test-user] Usuário não encontrado, nada a remover.');
      return;
    }
    const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
    if (delError) {
      console.error('[cleanup-test-user] Erro ao remover usuário:', delError.message);
      process.exit(1);
    }
    console.log('[cleanup-test-user] Usuário removido:', user.id);
  } catch (e) {
    console.error('[cleanup-test-user] Exceção:', e.message || e);
    process.exit(1);
  }
}

main();
