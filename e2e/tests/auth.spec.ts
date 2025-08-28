import { test, expect } from '../fixtures';

/**
 * Testes E2E para Autenticação
 * Cobre login, logout e proteção de rotas
 */
test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page, testUser, supabase }) => {
    // Navegar para página de login
    await page.goto('/login');

    // Preencher formulário de login
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);

    // Submeter formulário
    await page.click('[data-testid="login-button"]');

    // Aguardar redirecionamento
    await page.waitForURL('/dashboard');

    // Verificar se está autenticado
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });

  test('deve bloquear acesso a rotas protegidas sem autenticação', async ({ page }) => {
    // Tentar acessar dashboard sem estar logado
    await page.goto('/dashboard');

    // Deve ser redirecionado para login
    await page.waitForURL('/login');

    // Verificar mensagem de erro ou redirecionamento
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('deve fazer logout corretamente', async ({ authenticatedPage }) => {
    // Estar autenticado
    await expect(authenticatedPage.locator('[data-testid="user-menu"]')).toBeVisible();

    // Abrir menu do usuário
    await authenticatedPage.click('[data-testid="user-menu"]');

    // Clicar em logout
    await authenticatedPage.click('[data-testid="logout-button"]');

    // Deve ser redirecionado para login
    await authenticatedPage.waitForURL('/login');

    // Verificar se não está mais autenticado
    await expect(authenticatedPage.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    // Navegar para página de login
    await page.goto('/login');

    // Preencher com credenciais inválidas
    await page.fill('[data-testid="email-input"]', 'invalid@email.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');

    // Submeter formulário
    await page.click('[data-testid="login-button"]');

    // Aguardar mensagem de erro
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Deve permanecer na página de login
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('deve manter sessão após refresh da página', async ({ authenticatedPage }) => {
    // Estar autenticado
    await expect(authenticatedPage.locator('[data-testid="user-menu"]')).toBeVisible();

    // Fazer refresh da página
    await authenticatedPage.reload();

    // Aguardar carregamento
    await authenticatedPage.waitForLoadState('networkidle');

    // Deve continuar autenticado
    await expect(authenticatedPage.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });

  test('deve redirecionar usuário autenticado para dashboard ao acessar login', async ({
    authenticatedPage,
  }) => {
    // Estar autenticado e tentar acessar login
    await authenticatedPage.goto('/login');

    // Deve ser redirecionado para dashboard
    await authenticatedPage.waitForURL('/dashboard');

    // Verificar se está no dashboard
    await expect(authenticatedPage.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });
});
