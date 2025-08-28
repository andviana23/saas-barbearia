import { test as base, Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Fixtures para autenticação e gerenciamento de sessões
 */
interface TestUser {
  email: string;
  password: string;
  unidadeId: string;
}

interface AuthFixtures {
  supabase: SupabaseClient;
  authenticatedPage: Page;
  testUser: TestUser;
}

export const test = base.extend<AuthFixtures>({
  // Cliente Supabase para testes
  supabase: async ({}, use) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await use(supabase);
  },

  // Dados do usuário de teste
  testUser: async ({}, use) => {
    const testUser: TestUser = {
      email: process.env.TEST_USER_EMAIL || 'test@trato.com',
      password: process.env.TEST_USER_PASSWORD || 'test123456',
      unidadeId: process.env.TEST_UNIDADE_ID || 'test-unidade-id',
    };

    await use(testUser);
  },

  // Página autenticada
  authenticatedPage: async ({ page, testUser, supabase }, use) => {
    // Fazer login via API
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (error || !session) {
      throw new Error(`Falha na autenticação: ${error?.message}`);
    }

    // Navegar para a aplicação
    await page.goto('/');

    // Aguardar carregamento da aplicação
    await page.waitForLoadState('networkidle');

    // Verificar se está autenticado
    const isAuthenticated = await page.locator('[data-testid="user-menu"]').isVisible();
    if (!isAuthenticated) {
      throw new Error('Usuário não está autenticado após login');
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
