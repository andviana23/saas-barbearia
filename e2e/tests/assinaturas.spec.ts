import { test, expect } from '@playwright/test';
import { createTestData, cleanupTestData } from '../fixtures';

test.describe('Assinaturas (Asaas)', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    testData = await createTestData();
    await page.goto('/assinaturas');
  });

  test.afterEach(async () => {
    await cleanupTestData(testData);
  });

  test('deve carregar lista de assinaturas', async ({ page }) => {
    await expect(page.locator('[data-testid="assinaturas-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="assinatura-item"]')).toHaveCount(0); // Inicialmente vazio
  });

  test('deve criar nova assinatura', async ({ page }) => {
    await page.click('[data-testid="btn-nova-assinatura"]');

    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="assinatura-item"]')).toHaveCount(1);
  });

  test('deve editar assinatura existente', async ({ page }) => {
    // Primeiro criar uma assinatura
    await page.click('[data-testid="btn-nova-assinatura"]');
    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Agora editar
    await page.click('[data-testid="btn-editar-assinatura"]');

    await page.fill('[data-testid="input-valor"]', '119.90');
    await page.selectOption('[data-testid="select-plano"]', 'premium');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=R$ 119,90')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.click('[data-testid="btn-nova-assinatura"]');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="error-cliente"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-plano"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-valor"]')).toBeVisible();
  });

  test('deve ativar assinatura', async ({ page }) => {
    // Criar assinatura inativa
    await page.click('[data-testid="btn-nova-assinatura"]');
    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
    await page.click('[data-testid="checkbox-ativa"]'); // Desmarcar
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Ativar
    await page.click('[data-testid="btn-ativar-assinatura"]');
    await page.click('[data-testid="btn-confirmar-ativacao"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-ativa"]')).toBeVisible();
  });

  test('deve cancelar assinatura', async ({ page }) => {
    // Criar assinatura ativa
    await page.click('[data-testid="btn-nova-assinatura"]');
    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Cancelar
    await page.click('[data-testid="btn-cancelar-assinatura"]');
    await page.fill('[data-testid="input-motivo-cancelamento"]', 'Cliente solicitou cancelamento');
    await page.click('[data-testid="btn-confirmar-cancelamento"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-cancelada"]')).toBeVisible();
  });

  test('deve simular webhook Asaas', async ({ page }) => {
    // Criar assinatura
    await page.click('[data-testid="btn-nova-assinatura"]');
    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Simular webhook de pagamento confirmado
    await page.click('[data-testid="btn-simular-webhook"]');
    await page.selectOption('[data-testid="select-tipo-webhook"]', 'payment_confirmed');
    await page.fill('[data-testid="input-data-webhook"]', '2024-01-15');
    await page.click('[data-testid="btn-executar-webhook"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-pago"]')).toBeVisible();

    // Simular webhook de pagamento atrasado
    await page.click('[data-testid="btn-simular-webhook"]');
    await page.selectOption('[data-testid="select-tipo-webhook"]', 'payment_overdue');
    await page.fill('[data-testid="input-data-webhook"]', '2024-02-15');
    await page.click('[data-testid="btn-executar-webhook"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-atrasado"]')).toBeVisible();
  });

  test('deve gerar cobrança recorrente', async ({ page }) => {
    // Criar assinatura ativa
    await page.click('[data-testid="btn-nova-assinatura"]');
    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Gerar próxima cobrança
    await page.click('[data-testid="btn-gerar-cobranca"]');
    await page.fill('[data-testid="input-data-vencimento"]', '2024-02-15');
    await page.click('[data-testid="btn-confirmar-cobranca"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="cobranca-gerada"]')).toBeVisible();
  });

  test('deve exibir histórico de pagamentos', async ({ page }) => {
    // Criar assinatura com histórico
    await page.click('[data-testid="btn-nova-assinatura"]');
    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Ver histórico
    await page.click('[data-testid="btn-ver-historico"]');

    await expect(page.locator('[data-testid="modal-historico"]')).toBeVisible();
    await expect(page.locator('[data-testid="item-historico"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="valor-cobranca"]')).toContainText('R$ 99,90');
  });

  test('deve filtrar assinaturas por status', async ({ page }) => {
    // Criar assinaturas com status diferentes
    await page.click('[data-testid="btn-nova-assinatura"]');
    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
    await page.click('[data-testid="btn-salvar"]');

    await page.waitForSelector('[data-testid="notification-success"]');

    // Filtrar por ativas
    await page.selectOption('[data-testid="select-filtro-status"]', 'ativa');

    await expect(page.locator('[data-testid="assinatura-item"]')).toHaveCount(1);

    // Filtrar por canceladas
    await page.selectOption('[data-testid="select-filtro-status"]', 'cancelada');

    await expect(page.locator('[data-testid="assinatura-item"]')).toHaveCount(0);
  });

  test('deve validar datas de assinatura', async ({ page }) => {
    await page.click('[data-testid="btn-nova-assinatura"]');

    // Data de início no passado
    await page.fill('[data-testid="input-data-inicio"]', '2020-01-15');
    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="error-data-inicio"]')).toBeVisible();

    // Data de início no futuro muito distante
    await page.fill('[data-testid="input-data-inicio"]', '2030-01-15');
    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="error-data-inicio"]')).toBeVisible();

    // Data válida
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
    await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
    await page.selectOption('[data-testid="select-plano"]', 'basico');
    await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
    await page.fill('[data-testid="input-valor"]', '99.90');
    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve calcular valor total de assinaturas', async ({ page }) => {
    // Criar múltiplas assinaturas
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="btn-nova-assinatura"]');
      await page.selectOption('[data-testid="select-cliente"]', testData.cliente.id);
      await page.selectOption('[data-testid="select-plano"]', 'basico');
      await page.selectOption('[data-testid="select-ciclo"]', 'mensal');
      await page.fill('[data-testid="input-valor"]', '99.90');
      await page.fill('[data-testid="input-data-inicio"]', '2024-01-15');
      await page.click('[data-testid="btn-salvar"]');

      await page.waitForSelector('[data-testid="notification-success"]');
    }

    await page.reload();

    // Verificar total
    await expect(page.locator('[data-testid="total-assinaturas"]')).toContainText('R$ 299,70');
    await expect(page.locator('[data-testid="quantidade-assinaturas"]')).toContainText('3');
  });
});
