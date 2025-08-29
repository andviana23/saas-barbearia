import { test, expect } from '../fixtures';

test.describe('Troca de Unidade', () => {
  test.beforeEach(async ({ authenticatedPage, createTestData }) => {
    await createTestData();
    await authenticatedPage.goto('/dashboard');
  });

  test('deve exibir seletor de unidade atual', async ({ page }) => {
    await expect(page.locator('[data-testid="seletor-unidade"]')).toBeVisible();
    await expect(page.locator('[data-testid="unidade-atual"]')).toContainText('Barbearia Central');
  });

  test('deve permitir trocar para outra unidade', async ({ page }) => {
    await page.click('[data-testid="seletor-unidade"]');

    await expect(page.locator('[data-testid="lista-unidades"]')).toBeVisible();
    await expect(page.locator('[data-testid="opcao-unidade"]')).toHaveCount(2);

    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="unidade-atual"]')).toContainText('Barbearia Norte');
  });

  test('deve isolar dados entre unidades (RLS)', async ({ page }) => {
    // Verificar dados na unidade atual
    await page.goto('/clientes');
    await expect(page.locator('[data-testid="cliente-item"]')).toHaveCount(1);
    await expect(page.locator('text=João Silva')).toBeVisible();

    // Trocar para outra unidade
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Verificar que os dados são isolados
    await page.goto('/clientes');
    await expect(page.locator('[data-testid="cliente-item"]')).toHaveCount(0);

    // Voltar para unidade original
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Central")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Verificar que os dados voltaram
    await page.goto('/clientes');
    await expect(page.locator('[data-testid="cliente-item"]')).toHaveCount(1);
    await expect(page.locator('text=João Silva')).toBeVisible();
  });

  test('deve persistir seleção de unidade no localStorage', async ({ page }) => {
    // Trocar unidade
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Recarregar página
    await page.reload();

    // Verificar que a seleção foi mantida
    await expect(page.locator('[data-testid="unidade-atual"]')).toContainText('Barbearia Norte');
  });

  test('deve atualizar contexto de usuário ao trocar unidade', async ({ page }) => {
    // Verificar contexto inicial
    await expect(page.locator('[data-testid="contexto-unidade"]')).toContainText(
      'Barbearia Central',
    );

    // Trocar unidade
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Verificar que o contexto foi atualizado
    await expect(page.locator('[data-testid="contexto-unidade"]')).toContainText('Barbearia Norte');
  });

  test('deve validar permissões por unidade', async ({ page }) => {
    // Verificar permissões na unidade atual
    await expect(page.locator('[data-testid="btn-novo-cliente"]')).toBeVisible();

    // Trocar para unidade sem permissões
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Verificar que botões foram desabilitados
    await expect(page.locator('[data-testid="btn-novo-cliente"]')).toBeDisabled();
  });

  test('deve limpar cache ao trocar unidade', async ({ page }) => {
    // Acessar dados na unidade atual
    await page.goto('/clientes');
    await expect(page.locator('[data-testid="cliente-item"]')).toHaveCount(1);

    // Trocar unidade
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Verificar que o cache foi limpo
    await page.goto('/clientes');
    await expect(page.locator('[data-testid="cliente-item"]')).toHaveCount(0);

    // Verificar que não há dados em cache
    await expect(page.locator('[data-testid="sem-dados"]')).toBeVisible();
  });

  test('deve atualizar breadcrumbs ao trocar unidade', async ({ page }) => {
    // Verificar breadcrumb inicial
    await expect(page.locator('[data-testid="breadcrumb-unidade"]')).toContainText(
      'Barbearia Central',
    );

    // Trocar unidade
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Verificar que breadcrumb foi atualizado
    await expect(page.locator('[data-testid="breadcrumb-unidade"]')).toContainText(
      'Barbearia Norte',
    );
  });

  test('deve mostrar indicador de carregamento durante troca', async ({ page }) => {
    // Iniciar troca de unidade
    await page.click('[data-testid="seletor-unidade"]');

    // Verificar indicador de carregamento
    await expect(page.locator('[data-testid="loading-troca-unidade"]')).toBeVisible();

    // Completar troca
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    // Verificar que loading foi removido
    await expect(page.locator('[data-testid="loading-troca-unidade"]')).not.toBeVisible();
  });

  test('deve validar unidade ativa antes de operações', async ({ page }) => {
    // Tentar operação sem unidade selecionada (simular erro)
    await page.evaluate(() => {
      localStorage.removeItem('unidade_id');
    });

    await page.reload();

    // Verificar que sistema solicita seleção de unidade
    await expect(page.locator('[data-testid="modal-selecao-unidade"]')).toBeVisible();
    await expect(page.locator('text=Selecione uma unidade para continuar')).toBeVisible();

    // Selecionar unidade
    await page.click('[data-testid="btn-selecionar-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Central")');

    // Verificar que modal foi fechado
    await expect(page.locator('[data-testid="modal-selecao-unidade"]')).not.toBeVisible();
  });

  test('deve sincronizar unidade entre abas', async ({ page, context }) => {
    // Abrir nova aba
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');

    // Verificar que ambas as abas mostram a mesma unidade
    await expect(page.locator('[data-testid="unidade-atual"]')).toContainText('Barbearia Central');
    await expect(newPage.locator('[data-testid="unidade-atual"]')).toContainText(
      'Barbearia Central',
    );

    // Trocar unidade na aba original
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Verificar que a nova aba também foi atualizada
    await newPage.reload();
    await expect(newPage.locator('[data-testid="unidade-atual"]')).toContainText('Barbearia Norte');

    await newPage.close();
  });

  test('deve exibir informações da unidade selecionada', async ({ page }) => {
    // Verificar informações da unidade atual
    await expect(page.locator('[data-testid="info-unidade"]')).toContainText('Barbearia Central');
    await expect(page.locator('[data-testid="endereco-unidade"]')).toContainText(
      'Rua das Flores, 123',
    );
    await expect(page.locator('[data-testid="telefone-unidade"]')).toContainText('(11) 3333-3333');

    // Trocar unidade
    await page.click('[data-testid="seletor-unidade"]');
    await page.click('[data-testid="opcao-unidade"]:has-text("Barbearia Norte")');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Verificar que informações foram atualizadas
    await expect(page.locator('[data-testid="info-unidade"]')).toContainText('Barbearia Norte');
    await expect(page.locator('[data-testid="endereco-unidade"]')).toContainText('Av. Norte, 456');
    await expect(page.locator('[data-testid="telefone-unidade"]')).toContainText('(11) 4444-4444');
  });
});
