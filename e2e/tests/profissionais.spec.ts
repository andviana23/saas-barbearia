import { test, expect } from '../fixtures';

test.describe('Profissionais e Horários', () => {
  test.beforeEach(async ({ createTestData, page }) => {
    await createTestData();
    await page.goto('/profissionais');
  });

  test.afterEach(async ({ cleanupTestData }) => {
    await cleanupTestData();
  });

  test('deve carregar lista de profissionais', async ({ page }) => {
    await expect(page.locator('[data-testid="profissionais-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="profissional-item"]')).toHaveCount(1);
  });

  test('deve criar novo profissional', async ({ page }) => {
    await page.click('[data-testid="btn-novo-profissional"]');

    await page.fill('[data-testid="input-nome"]', 'João Silva');
    await page.fill('[data-testid="input-email"]', 'joao@teste.com');
    await page.fill('[data-testid="input-telefone"]', '(11) 99999-9999');
    await page.selectOption('[data-testid="select-especialidade"]', 'corte');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=João Silva')).toBeVisible();
  });

  test('deve editar profissional existente', async ({ page }) => {
    await page.click('[data-testid="btn-editar-profissional"]');

    await page.fill('[data-testid="input-nome"]', 'Maria Santos Atualizada');
    await page.selectOption('[data-testid="select-especialidade"]', 'barba');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=Maria Santos Atualizada')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.click('[data-testid="btn-novo-profissional"]');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="error-nome"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
  });

  test('deve configurar horários de trabalho', async ({ page }) => {
    await page.click('[data-testid="btn-horarios-profissional"]');

    // Configurar segunda-feira
    await page.click('[data-testid="checkbox-segunda"]');
    await page.fill('[data-testid="input-inicio-segunda"]', '08:00');
    await page.fill('[data-testid="input-fim-segunda"]', '18:00');

    // Configurar terça-feira
    await page.click('[data-testid="checkbox-terca"]');
    await page.fill('[data-testid="input-inicio-terca"]', '08:00');
    await page.fill('[data-testid="input-fim-terca"]', '18:00');

    await page.click('[data-testid="btn-salvar-horarios"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve detectar conflitos de horários', async ({ page }) => {
    // Criar agendamento conflitante
    await page.goto('/agenda');
    await page.click('[data-testid="btn-novo-agendamento"]');

    // Selecionar primeiro profissional e serviço disponíveis (ignora placeholder)
    const profOption = await page.locator('[data-testid="select-profissional"] option').nth(1);
    const servOption = await page.locator('[data-testid="select-servico"] option').nth(1);
    const profVal = await profOption.getAttribute('value');
    const servVal = await servOption.getAttribute('value');
    if (profVal) await page.selectOption('[data-testid="select-profissional"]', profVal);
    if (servVal) await page.selectOption('[data-testid="select-servico"]', servVal);
    await page.fill('[data-testid="input-data"]', '2024-01-15');
    await page.fill('[data-testid="input-hora"]', '09:00');

    await page.click('[data-testid="btn-salvar"]');

    // Tentar criar outro agendamento no mesmo horário
    await page.click('[data-testid="btn-novo-agendamento"]');

    const profOption2 = await page.locator('[data-testid="select-profissional"] option').nth(1);
    const servOption2 = await page.locator('[data-testid="select-servico"] option').nth(1);
    const profVal2 = await profOption2.getAttribute('value');
    const servVal2 = await servOption2.getAttribute('value');
    if (profVal2) await page.selectOption('[data-testid="select-profissional"]', profVal2);
    if (servVal2) await page.selectOption('[data-testid="select-servico"]', servVal2);
    await page.fill('[data-testid="input-data"]', '2024-01-15');
    await page.fill('[data-testid="input-hora"]', '09:00');

    await page.click('[data-testid="btn-salvar"]');

    await expect(page.locator('[data-testid="notification-error"]')).toBeVisible();
    await expect(page.locator('text=Horário não disponível')).toBeVisible();
  });

  test('deve arquivar profissional', async ({ page }) => {
    await page.click('[data-testid="btn-acoes-profissional"]');
    await page.click('[data-testid="btn-arquivar-profissional"]');

    await page.click('[data-testid="btn-confirmar-arquivamento"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="profissional-arquivado"]')).toBeVisible();
  });

  test('deve filtrar profissionais por especialidade', async ({ page }) => {
    await page.selectOption('[data-testid="select-filtro-especialidade"]', 'corte');

    await expect(page.locator('[data-testid="profissional-item"]')).toHaveCount(1);

    await page.selectOption('[data-testid="select-filtro-especialidade"]', 'barba');

    await expect(page.locator('[data-testid="profissional-item"]')).toHaveCount(0);
  });

  test('deve navegar entre páginas da lista', async ({ page }) => {
    // Criar profissionais adicionais para testar paginação
    for (let i = 0; i < 15; i++) {
      await page.click('[data-testid="btn-novo-profissional"]');
      await page.fill('[data-testid="input-nome"]', `Profissional ${i + 1}`);
      await page.fill('[data-testid="input-email"]', `prof${i + 1}@teste.com`);
      await page.selectOption('[data-testid="select-especialidade"]', 'corte');
      await page.click('[data-testid="btn-salvar"]');
      await page.waitForSelector('[data-testid="notification-success"]');
    }

    await page.reload();

    // Verificar primeira página
    await expect(page.locator('[data-testid="profissional-item"]')).toHaveCount(10);

    // Ir para próxima página
    await page.click('[data-testid="btn-proxima-pagina"]');

    await expect(page.locator('[data-testid="profissional-item"]')).toHaveCount(6);
    await expect(page.locator('[data-testid="pagina-atual"]')).toHaveText('2');
  });
});
