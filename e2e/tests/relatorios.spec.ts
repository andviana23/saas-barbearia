import { test, expect } from '../fixtures';

test.describe('Relatórios', () => {
  test.beforeEach(async ({ authenticatedPage, createTestData }) => {
    await createTestData();
    await authenticatedPage.goto('/relatorios');
  });

  test('deve carregar painel de relatórios', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.locator('[data-testid="painel-relatorios"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="card-relatorio"]')).toHaveCount(4);
  });

  test('deve gerar relatório de clientes', async ({ authenticatedPage }) => {
    await authenticatedPage.click('[data-testid="btn-relatorio-clientes"]');

    await expect(
      authenticatedPage.locator('[data-testid="modal-relatorio-clientes"]'),
    ).toBeVisible();

    // Configurar filtros
    await authenticatedPage.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await authenticatedPage.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await authenticatedPage.selectOption('[data-testid="select-status-cliente"]', 'ativo');

    await authenticatedPage.click('[data-testid="btn-gerar-relatorio"]');

    await expect(authenticatedPage.locator('[data-testid="loading-relatorio"]')).toBeVisible();

    // Aguardar geração
    await authenticatedPage.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    await expect(authenticatedPage.locator('[data-testid="total-clientes"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="clientes-ativos"]')).toBeVisible();
  });

  test('deve gerar relatório financeiro', async ({ page }) => {
    await page.click('[data-testid="btn-relatorio-financeiro"]');

    await expect(page.locator('[data-testid="modal-relatorio-financeiro"]')).toBeVisible();

    // Configurar período
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await page.click('[data-testid="checkbox-incluir-comparativo"]');

    await page.click('[data-testid="btn-gerar-relatorio"]');

    await expect(page.locator('[data-testid="loading-relatorio"]')).toBeVisible();

    // Aguardar geração
    await page.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    await expect(page.locator('[data-testid="receita-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="despesas-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="lucro-liquido"]')).toBeVisible();
  });

  test('deve gerar relatório de agendamentos', async ({ page }) => {
    await page.click('[data-testid="btn-relatorio-agendamentos"]');

    await expect(page.locator('[data-testid="modal-relatorio-agendamentos"]')).toBeVisible();

    // Configurar filtros
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    // Selecionar primeiro profissional disponível (fallback se fixture não retornar id direto)
    const profissionalSelect = page.locator('[data-testid="select-profissional"]');
    if (await profissionalSelect.isVisible()) {
      const options = profissionalSelect.locator('option');
      if ((await options.count()) > 1) {
        const value = await options.nth(1).getAttribute('value');
        if (value) await profissionalSelect.selectOption(value);
      }
    }

    await page.click('[data-testid="btn-gerar-relatorio"]');

    await expect(page.locator('[data-testid="loading-relatorio"]')).toBeVisible();

    // Aguardar geração
    await page.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    await expect(page.locator('[data-testid="total-agendamentos"]')).toBeVisible();
    await expect(page.locator('[data-testid="agendamentos-concluidos"]')).toBeVisible();
    await expect(page.locator('[data-testid="agendamentos-cancelados"]')).toBeVisible();
  });

  test('deve gerar relatório de profissionais', async ({ page }) => {
    await page.click('[data-testid="btn-relatorio-profissionais"]');

    await expect(page.locator('[data-testid="modal-relatorio-profissionais"]')).toBeVisible();

    // Configurar filtros
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await page.selectOption('[data-testid="select-especialidade"]', 'corte');

    await page.click('[data-testid="btn-gerar-relatorio"]');

    await expect(page.locator('[data-testid="loading-relatorio"]')).toBeVisible();

    // Aguardar geração
    await page.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    await expect(page.locator('[data-testid="total-profissionais"]')).toBeVisible();
    await expect(page.locator('[data-testid="profissionais-ativos"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-comissoes"]')).toBeVisible();
  });

  test('deve exportar relatório para PDF', async ({ page }) => {
    // Gerar relatório primeiro
    await page.click('[data-testid="btn-relatorio-clientes"]');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await page.click('[data-testid="btn-gerar-relatorio"]');

    await page.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    // Exportar para PDF
    await page.click('[data-testid="btn-exportar-pdf"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();

    // Verificar que download foi iniciado
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="btn-confirmar-download"]');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('deve exportar relatório para Excel', async ({ page }) => {
    // Gerar relatório primeiro
    await page.click('[data-testid="btn-relatorio-financeiro"]');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await page.click('[data-testid="btn-gerar-relatorio"]');

    await page.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    // Exportar para Excel
    await page.click('[data-testid="btn-exportar-excel"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();

    // Verificar que download foi iniciado
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="btn-confirmar-download"]');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('deve agendar relatório recorrente', async ({ page }) => {
    await page.click('[data-testid="btn-relatorio-financeiro"]');

    await expect(page.locator('[data-testid="modal-relatorio-financeiro"]')).toBeVisible();

    // Configurar agendamento
    await page.click('[data-testid="checkbox-agendar"]');
    await page.selectOption('[data-testid="select-frequencia"]', 'semanal');
    await page.selectOption('[data-testid="select-dia-semana"]', 'segunda');
    await page.fill('[data-testid="input-email-destinatario"]', 'admin@barbearia.com');

    await page.click('[data-testid="btn-agendar-relatorio"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=Relatório agendado com sucesso')).toBeVisible();
  });

  test('deve validar filtros obrigatórios', async ({ page }) => {
    await page.click('[data-testid="btn-relatorio-clientes"]');

    // Tentar gerar sem filtros
    await page.click('[data-testid="btn-gerar-relatorio"]');

    await expect(page.locator('[data-testid="error-data-inicio"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-data-fim"]')).toBeVisible();

    // Preencher apenas data início
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.click('[data-testid="btn-gerar-relatorio"]');

    await expect(page.locator('[data-testid="error-data-fim"]')).toBeVisible();

    // Preencher data fim inválida
    await page.fill('[data-testid="input-data-fim"]', '2023-12-31');
    await page.click('[data-testid="btn-gerar-relatorio"]');

    await expect(page.locator('[data-testid="error-periodo-invalido"]')).toBeVisible();
  });

  test('deve exibir gráficos nos relatórios', async ({ page }) => {
    await page.click('[data-testid="btn-relatorio-financeiro"]');

    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await page.click('[data-testid="btn-gerar-relatorio"]');

    await page.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    // Verificar gráficos
    await expect(page.locator('[data-testid="grafico-receita-mensal"]')).toBeVisible();
    await expect(page.locator('[data-testid="grafico-despesas-categoria"]')).toBeVisible();
    await expect(page.locator('[data-testid="grafico-evolucao-lucro"]')).toBeVisible();
  });

  test('deve filtrar relatórios por unidade', async ({ page }) => {
    await page.click('[data-testid="btn-relatorio-clientes"]');

    // Verificar filtro de unidade
    await expect(page.locator('[data-testid="select-unidade"]')).toBeVisible();
    // Verifica apenas que o select de unidade existe; seleção específica depende de fixture multi-unidades futura
    await expect(page.locator('[data-testid="select-unidade"]')).toBeVisible();

    // Trocar unidade
    await page.selectOption('[data-testid="select-unidade"]', '2');

    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await page.click('[data-testid="btn-gerar-relatorio"]');

    await page.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    // Verificar que dados são da unidade selecionada
    await expect(page.locator('[data-testid="unidade-relatorio"]')).toContainText(
      'Barbearia Norte',
    );
  });

  test('deve salvar relatórios favoritos', async ({ page }) => {
    await page.click('[data-testid="btn-relatorio-financeiro"]');

    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await page.click('[data-testid="checkbox-incluir-comparativo"]');

    // Salvar como favorito
    await page.click('[data-testid="btn-salvar-favorito"]');
    await page.fill('[data-testid="input-nome-favorito"]', 'Relatório Mensal Financeiro');
    await page.click('[data-testid="btn-confirmar-favorito"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();

    // Verificar que foi salvo
    await page.reload();
    await expect(page.locator('[data-testid="favorito-salvo"]')).toContainText(
      'Relatório Mensal Financeiro',
    );
  });

  test('deve compartilhar relatório por email', async ({ page }) => {
    // Gerar relatório primeiro
    await page.click('[data-testid="btn-relatorio-clientes"]');
    await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
    await page.click('[data-testid="btn-gerar-relatorio"]');

    await page.waitForSelector('[data-testid="relatorio-gerado"]', {
      timeout: 10000,
    });

    // Compartilhar por email
    await page.click('[data-testid="btn-compartilhar-email"]');
    await page.fill('[data-testid="input-email-destinatario"]', 'gerente@barbearia.com');
    await page.fill('[data-testid="input-assunto"]', 'Relatório de Clientes - Janeiro 2024');
    await page.fill('[data-testid="input-mensagem"]', 'Segue relatório mensal de clientes.');

    await page.click('[data-testid="btn-enviar-email"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=Relatório enviado com sucesso')).toBeVisible();
  });

  test('deve exibir histórico de relatórios gerados', async ({ page }) => {
    // Gerar alguns relatórios
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="btn-relatorio-clientes"]');
      await page.fill('[data-testid="input-data-inicio"]', '2024-01-01');
      await page.fill('[data-testid="input-data-fim"]', '2024-12-31');
      await page.click('[data-testid="btn-gerar-relatorio"]');

      await page.waitForSelector('[data-testid="relatorio-gerado"]', {
        timeout: 10000,
      });
      await page.click('[data-testid="btn-fechar-modal"]');
    }

    // Verificar histórico
    await page.click('[data-testid="btn-historico-relatorios"]');

    await expect(page.locator('[data-testid="modal-historico"]')).toBeVisible();
    await expect(page.locator('[data-testid="item-historico"]')).toHaveCount(3);

    // Verificar informações do histórico
    await expect(page.locator('[data-testid="tipo-relatorio"]').first()).toContainText('Clientes');
    await expect(page.locator('[data-testid="data-geracao"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="usuario-gerador"]').first()).toContainText('admin');
  });
});
