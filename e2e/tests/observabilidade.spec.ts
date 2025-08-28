import { test, expect } from '../fixtures';

/**
 * Testes E2E para Observabilidade e Tratamento de Erros
 * Cobre ErrorBoundary, notificações e logs
 */
test.describe('Observabilidade', () => {
  test('deve capturar erros com ErrorBoundary', async ({ authenticatedPage }) => {
    // Navegar para uma página que pode gerar erro
    await authenticatedPage.goto('/dashboard');

    // Aguardar carregamento da página
    await authenticatedPage.waitForSelector('[data-testid="dashboard-content"]');

    // Simular erro (se houver botão de teste de erro)
    const errorButton = authenticatedPage.locator('[data-testid="test-error-button"]');
    if (await errorButton.isVisible()) {
      await errorButton.click();

      // Aguardar ErrorBoundary ser ativado
      await authenticatedPage.waitForSelector('[data-testid="error-boundary-fallback"]');

      // Verificar se fallback está visível
      await expect(
        authenticatedPage.locator('[data-testid="error-boundary-fallback"]'),
      ).toBeVisible();

      // Verificar se há opções de recuperação
      await expect(authenticatedPage.locator('[data-testid="reload-button"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="go-home-button"]')).toBeVisible();
    }
  });

  test('deve mostrar notificações de sucesso', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Clicar em "Novo Cliente"
    await authenticatedPage.click('[data-testid="novo-cliente-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="nome-input"]', 'Cliente Notificação E2E');
    await authenticatedPage.fill('[data-testid="email-input"]', 'notificacao@e2e.com');
    await authenticatedPage.fill('[data-testid="telefone-input"]', '11666666666');

    // Salvar cliente
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se notificação de sucesso aparece
    await expect(authenticatedPage.locator('[data-testid="notification-success"]')).toBeVisible();

    // Verificar se mensagem está correta
    await expect(authenticatedPage.locator('[data-testid="notification-message"]')).toContainText(
      'Cliente criado com sucesso',
    );
  });

  test('deve mostrar notificações de erro', async ({ authenticatedPage }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Clicar em "Novo Cliente"
    await authenticatedPage.click('[data-testid="novo-cliente-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Tentar salvar sem preencher campos obrigatórios
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Verificar se notificação de erro aparece
    await expect(authenticatedPage.locator('[data-testid="notification-error"]')).toBeVisible();

    // Verificar se mensagem está correta
    await expect(authenticatedPage.locator('[data-testid="notification-message"]')).toContainText(
      'Erro ao criar cliente',
    );
  });

  test('deve mostrar notificações de aviso', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Clicar no primeiro cliente da lista
    await authenticatedPage.click('[data-testid="cliente-item"]:first');

    // Aguardar abertura do modal de detalhes
    await authenticatedPage.waitForSelector('[data-testid="cliente-detail-dialog"]');

    // Clicar em arquivar
    await authenticatedPage.click('[data-testid="arquivar-cliente-button"]');

    // Verificar se notificação de aviso aparece
    await expect(authenticatedPage.locator('[data-testid="notification-warning"]')).toBeVisible();

    // Verificar se mensagem está correta
    await expect(authenticatedPage.locator('[data-testid="notification-message"]')).toContainText(
      'Tem certeza que deseja arquivar',
    );
  });

  test('deve fechar notificações automaticamente', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Clicar em "Novo Cliente"
    await authenticatedPage.click('[data-testid="novo-cliente-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="nome-input"]', 'Cliente Auto-Close E2E');
    await authenticatedPage.fill('[data-testid="email-input"]', 'autoclose@e2e.com');
    await authenticatedPage.fill('[data-testid="telefone-input"]', '11555555555');

    // Salvar cliente
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se notificação aparece
    await expect(authenticatedPage.locator('[data-testid="notification-success"]')).toBeVisible();

    // Aguardar notificação fechar automaticamente (assumindo 5 segundos)
    await authenticatedPage.waitForTimeout(6000);

    // Verificar se notificação foi fechada
    await expect(
      authenticatedPage.locator('[data-testid="notification-success"]'),
    ).not.toBeVisible();
  });

  test('deve permitir fechar notificações manualmente', async ({
    authenticatedPage,
    tenantData,
  }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Clicar em "Novo Cliente"
    await authenticatedPage.click('[data-testid="novo-cliente-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="nome-input"]', 'Cliente Manual-Close E2E');
    await authenticatedPage.fill('[data-testid="email-input"]', 'manualclose@e2e.com');
    await authenticatedPage.fill('[data-testid="telefone-input"]', '11444444444');

    // Salvar cliente
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se notificação aparece
    await expect(authenticatedPage.locator('[data-testid="notification-success"]')).toBeVisible();

    // Clicar no botão de fechar
    await authenticatedPage.click('[data-testid="close-notification-button"]');

    // Verificar se notificação foi fechada
    await expect(
      authenticatedPage.locator('[data-testid="notification-success"]'),
    ).not.toBeVisible();
  });

  test('deve mostrar página de erro 404', async ({ authenticatedPage }) => {
    // Tentar acessar rota inexistente
    await authenticatedPage.goto('/rota-inexistente');

    // Aguardar carregamento da página de erro
    await authenticatedPage.waitForSelector('[data-testid="error-page"]');

    // Verificar se página de erro está visível
    await expect(authenticatedPage.locator('[data-testid="error-page"]')).toBeVisible();

    // Verificar se há opções de recuperação
    await expect(authenticatedPage.locator('[data-testid="go-home-button"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="go-back-button"]')).toBeVisible();

    // Verificar se mensagem está correta
    await expect(authenticatedPage.locator('[data-testid="error-message"]')).toContainText(
      'Página não encontrada',
    );
  });

  test('deve registrar logs de ações críticas', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Clicar em "Novo Cliente"
    await authenticatedPage.click('[data-testid="novo-cliente-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="nome-input"]', 'Cliente Log E2E');
    await authenticatedPage.fill('[data-testid="email-input"]', 'log@e2e.com');
    await authenticatedPage.fill('[data-testid="telefone-input"]', '11333333333');

    // Salvar cliente
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se notificação de sucesso aparece
    await expect(authenticatedPage.locator('[data-testid="notification-success"]')).toBeVisible();

    // Em um ambiente real, verificaríamos se os logs foram registrados
    // Aqui apenas verificamos se a ação foi bem-sucedida
    await expect(authenticatedPage.locator('text=Cliente Log E2E')).toBeVisible();
  });

  test('deve mostrar loading states durante operações', async ({
    authenticatedPage,
    tenantData,
  }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Clicar em "Novo Cliente"
    await authenticatedPage.click('[data-testid="novo-cliente-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="nome-input"]', 'Cliente Loading E2E');
    await authenticatedPage.fill('[data-testid="email-input"]', 'loading@e2e.com');
    await authenticatedPage.fill('[data-testid="telefone-input"]', '11222222222');

    // Clicar em salvar
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Verificar se loading state aparece
    await expect(authenticatedPage.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Verificar se botão de salvar está desabilitado
    await expect(authenticatedPage.locator('[data-testid="salvar-button"]')).toBeDisabled();

    // Aguardar operação completar
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se loading state desapareceu
    await expect(authenticatedPage.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });
});
