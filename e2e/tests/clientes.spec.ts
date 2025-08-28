import { test, expect } from '../fixtures';

/**
 * Testes E2E para Módulo de Clientes
 * Cobre CRUD completo e funcionalidades principais
 */
test.describe('Clientes', () => {
  test.beforeEach(async ({ createTestData }) => {
    // Criar dados de teste antes de cada teste
    await createTestData();
  });

  test.afterEach(async ({ cleanupTestData }) => {
    // Limpar dados de teste após cada teste
    await cleanupTestData();
  });

  test('deve listar clientes corretamente', async ({ authenticatedPage }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Verificar se a lista está visível
    await expect(authenticatedPage.locator('[data-testid="clientes-list"]')).toBeVisible();

    // Verificar se há pelo menos um cliente (o de teste)
    const clientes = await authenticatedPage.locator('[data-testid="cliente-item"]').count();
    expect(clientes).toBeGreaterThan(0);
  });

  test('deve criar novo cliente com sucesso', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Clicar em "Novo Cliente"
    await authenticatedPage.click('[data-testid="novo-cliente-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="nome-input"]', 'Novo Cliente E2E');
    await authenticatedPage.fill('[data-testid="email-input"]', 'novo@e2e.com');
    await authenticatedPage.fill('[data-testid="telefone-input"]', '11777777777');
    await authenticatedPage.fill('[data-testid="data-nascimento-input"]', '1985-05-15');
    await authenticatedPage.fill(
      '[data-testid="observacoes-input"]',
      'Cliente criado via teste E2E',
    );

    // Salvar cliente
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o cliente foi criado na lista
    await expect(authenticatedPage.locator('text=Novo Cliente E2E')).toBeVisible();
  });

  test('deve editar cliente existente', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Clicar no primeiro cliente da lista
    await authenticatedPage.click('[data-testid="cliente-item"]:first');

    // Aguardar abertura do modal de detalhes
    await authenticatedPage.waitForSelector('[data-testid="cliente-detail-dialog"]');

    // Clicar em editar
    await authenticatedPage.click('[data-testid="editar-cliente-button"]');

    // Aguardar abertura do modal de edição
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Modificar nome
    await authenticatedPage.fill('[data-testid="nome-input"]', 'Cliente Editado E2E');

    // Salvar alterações
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o nome foi alterado
    await expect(authenticatedPage.locator('text=Cliente Editado E2E')).toBeVisible();
  });

  test('deve arquivar cliente corretamente', async ({ authenticatedPage, tenantData }) => {
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

    // Confirmar arquivamento
    await authenticatedPage.click('[data-testid="confirmar-arquivamento-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-detail-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o cliente foi arquivado (não deve estar visível na lista ativa)
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).not.toBeVisible();
  });

  test('deve filtrar clientes por nome', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Preencher campo de busca
    await authenticatedPage.fill('[data-testid="busca-input"]', 'TESTE E2E');

    // Aguardar filtro ser aplicado
    await authenticatedPage.waitForTimeout(500);

    // Verificar se apenas clientes com "TESTE E2E" estão visíveis
    const clientesVisiveis = await authenticatedPage
      .locator('[data-testid="cliente-item"]')
      .count();
    expect(clientesVisiveis).toBeGreaterThan(0);

    // Verificar se todos os clientes visíveis contêm "TESTE E2E"
    for (let i = 0; i < clientesVisiveis; i++) {
      const nomeCliente = await authenticatedPage
        .locator('[data-testid="cliente-item"]')
        .nth(i)
        .textContent();
      expect(nomeCliente).toContain('TESTE E2E');
    }
  });

  test('deve validar campos obrigatórios no formulário', async ({ authenticatedPage }) => {
    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Clicar em "Novo Cliente"
    await authenticatedPage.click('[data-testid="novo-cliente-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="cliente-form-dialog"]');

    // Tentar salvar sem preencher campos obrigatórios
    await authenticatedPage.click('[data-testid="salvar-button"]');

    // Verificar se mensagens de erro aparecem
    await expect(authenticatedPage.locator('[data-testid="nome-error"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="email-error"]')).toBeVisible();

    // Verificar se o modal não fechou
    await expect(authenticatedPage.locator('[data-testid="cliente-form-dialog"]')).toBeVisible();
  });

  test('deve navegar entre páginas da listagem', async ({ authenticatedPage, tenantData }) => {
    // Criar múltiplos clientes para testar paginação
    // (assumindo que já temos pelo menos um cliente de teste)

    // Navegar para página de clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento da lista
    await authenticatedPage.waitForSelector('[data-testid="clientes-list"]');

    // Verificar se controles de paginação estão visíveis
    const paginacao = authenticatedPage.locator('[data-testid="paginacao"]');

    if (await paginacao.isVisible()) {
      // Clicar na próxima página
      await authenticatedPage.click('[data-testid="proxima-pagina-button"]');

      // Verificar se mudou de página
      await expect(authenticatedPage.locator('[data-testid="pagina-atual"]')).toContainText('2');

      // Voltar para primeira página
      await authenticatedPage.click('[data-testid="primeira-pagina-button"]');

      // Verificar se voltou para página 1
      await expect(authenticatedPage.locator('[data-testid="pagina-atual"]')).toContainText('1');
    }
  });
});
