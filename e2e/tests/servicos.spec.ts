// Usar fixtures estendidas (inclui supabase, authenticatedPage, createTestData, cleanupTestData)
import { test, expect } from '../fixtures';

test.describe('Serviços', () => {
  test.beforeEach(async ({ createTestData, page }) => {
    await createTestData();
    await page.goto('/servicos');
  });

  test.afterEach(async ({ cleanupTestData }) => {
    await cleanupTestData();
  });

  test('deve carregar catálogo de serviços', async ({ page }) => {
    await expect(page.locator('[data-testid="servicos-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="servico-item"]')).toHaveCount(1);
  });

  test('deve criar novo serviço', async ({ page }) => {
    await page.click('[data-testid="btn-novo-servico"]');

    await page.fill('[data-testid="input-nome"]', 'Corte Masculino Premium');
    await page.fill(
      '[data-testid="input-descricao"]',
      'Corte masculino com acabamento profissional',
    );
    await page.fill('[data-testid="input-preco"]', '45.00');
    await page.fill('[data-testid="input-duracao"]', '45');
    await page.selectOption('[data-testid="select-categoria"]', 'corte');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=Corte Masculino Premium')).toBeVisible();
  });

  test('deve editar serviço existente', async ({ page }) => {
    await page.click('[data-testid="btn-editar-servico"]');

    await page.fill('[data-testid="input-preco"]', '50.00');
    await page.fill('[data-testid="input-duracao"]', '50');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=R$ 50,00')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.click('[data-testid="btn-novo-servico"]');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="error-nome"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-preco"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-duracao"]')).toBeVisible();
  });

  test('deve vincular serviço a profissional', async ({ page }) => {
    await page.click('[data-testid="btn-vincular-profissional"]');
    // Selecionar primeiro profissional disponível (dados criados no createTestData)
    const firstProf = await page.locator('[data-testid="select-profissional"] option').nth(1); // pular placeholder
    const value = await firstProf.getAttribute('value');
    if (value) {
      await page.selectOption('[data-testid="select-profissional"]', value);
    }
    await page.fill('[data-testid="input-comissao"]', '15');

    await page.click('[data-testid="btn-salvar-vinculo"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="profissional-vinculado"]')).toBeVisible();
  });

  test('deve remover vínculo com profissional', async ({ page }) => {
    // Primeiro criar o vínculo
    await page.click('[data-testid="btn-vincular-profissional"]');
    const firstProf = await page.locator('[data-testid="select-profissional"] option').nth(1);
    const value = await firstProf.getAttribute('value');
    if (value) {
      await page.selectOption('[data-testid="select-profissional"]', value);
    }
    await page.fill('[data-testid="input-comissao"]', '15');
    await page.click('[data-testid="btn-salvar-vinculo"]');

    // Agora remover
    await page.click('[data-testid="btn-remover-vinculo"]');
    await page.click('[data-testid="btn-confirmar-remocao"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="profissional-vinculado"]')).not.toBeVisible();
  });

  test('deve arquivar serviço', async ({ page }) => {
    await page.click('[data-testid="btn-acoes-servico"]');
    await page.click('[data-testid="btn-arquivar-servico"]');

    await page.click('[data-testid="btn-confirmar-arquivamento"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="servico-arquivado"]')).toBeVisible();
  });

  test('deve filtrar serviços por categoria', async ({ page }) => {
    await page.selectOption('[data-testid="select-filtro-categoria"]', 'corte');

    await expect(page.locator('[data-testid="servico-item"]')).toHaveCount(1);

    await page.selectOption('[data-testid="select-filtro-categoria"]', 'barba');

    await expect(page.locator('[data-testid="servico-item"]')).toHaveCount(0);
  });

  test('deve buscar serviços por nome', async ({ page }) => {
    await page.fill('[data-testid="input-busca-servico"]', 'Corte');

    await expect(page.locator('[data-testid="servico-item"]')).toHaveCount(1);

    await page.fill('[data-testid="input-busca-servico"]', 'Barba');

    await expect(page.locator('[data-testid="servico-item"]')).toHaveCount(0);
  });

  test('deve ordenar serviços por preço', async ({ page }) => {
    // Criar serviços com preços diferentes
    await page.click('[data-testid="btn-novo-servico"]');
    await page.fill('[data-testid="input-nome"]', 'Serviço Barato');
    await page.fill('[data-testid="input-preco"]', '20.00');
    await page.fill('[data-testid="input-duracao"]', '30');
    await page.selectOption('[data-testid="select-categoria"]', 'corte');
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    await page.click('[data-testid="btn-novo-servico"]');
    await page.fill('[data-testid="input-nome"]', 'Serviço Caro');
    await page.fill('[data-testid="input-preco"]', '80.00');
    await page.fill('[data-testid="input-duracao"]', '60');
    await page.selectOption('[data-testid="select-categoria"]', 'corte');
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    await page.reload();

    // Ordenar por preço crescente
    await page.selectOption('[data-testid="select-ordenacao"]', 'preco-asc');

    const servicos = page.locator('[data-testid="servico-item"]');
    await expect(servicos.nth(0)).toContainText('R$ 20,00');
    await expect(servicos.nth(1)).toContainText('R$ 45,00');
    await expect(servicos.nth(2)).toContainText('R$ 80,00');

    // Ordenar por preço decrescente
    await page.selectOption('[data-testid="select-ordenacao"]', 'preco-desc');

    await expect(servicos.nth(0)).toContainText('R$ 80,00');
    await expect(servicos.nth(1)).toContainText('R$ 45,00');
    await expect(servicos.nth(2)).toContainText('R$ 20,00');
  });

  test('deve exibir detalhes do serviço', async ({ page }) => {
    await page.click('[data-testid="btn-ver-detalhes"]');

    await expect(page.locator('[data-testid="modal-detalhes-servico"]')).toBeVisible();
    await expect(page.locator('[data-testid="nome-servico"]')).toContainText('Corte Masculino');
    await expect(page.locator('[data-testid="preco-servico"]')).toContainText('R$ 45,00');
    await expect(page.locator('[data-testid="duracao-servico"]')).toContainText('45 min');
    await expect(page.locator('[data-testid="categoria-servico"]')).toContainText('Corte');
  });

  test('deve validar preço e duração', async ({ page }) => {
    await page.click('[data-testid="btn-novo-servico"]');

    // Preço negativo
    await page.fill('[data-testid="input-preco"]', '-10.00');
    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="error-preco"]')).toBeVisible();

    // Duração zero
    await page.fill('[data-testid="input-preco"]', '10.00');
    await page.fill('[data-testid="input-duracao"]', '0');
    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="error-duracao"]')).toBeVisible();

    // Duração muito alta
    await page.fill('[data-testid="input-duracao"]', '300');
    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="error-duracao"]')).toBeVisible();
  });
});
