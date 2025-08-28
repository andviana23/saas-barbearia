import { test, expect } from '../fixtures';

/**
 * Testes de Smoke - Verificação de Carregamento das Páginas Principais
 * Cobre navegação básica e carregamento de componentes essenciais
 */
test.describe('Smoke Tests', () => {
  test('deve carregar dashboard principal', async ({ authenticatedPage }) => {
    // Navegar para dashboard
    await authenticatedPage.goto('/dashboard');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="dashboard-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="dashboard-content"]')).toBeVisible();

    // Verificar se há KPIs principais
    await expect(authenticatedPage.locator('[data-testid="kpi-cards"]')).toBeVisible();

    // Verificar se há gráficos
    await expect(authenticatedPage.locator('[data-testid="dashboard-charts"]')).toBeVisible();
  });

  test('deve carregar página de clientes', async ({ authenticatedPage }) => {
    // Navegar para clientes
    await authenticatedPage.goto('/clientes');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="clientes-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="clientes-content"]')).toBeVisible();

    // Verificar se há lista de clientes
    await expect(authenticatedPage.locator('[data-testid="clientes-list"]')).toBeVisible();

    // Verificar se há botão de novo cliente
    await expect(authenticatedPage.locator('[data-testid="novo-cliente-button"]')).toBeVisible();
  });

  test('deve carregar página de profissionais', async ({ authenticatedPage }) => {
    // Navegar para profissionais
    await authenticatedPage.goto('/profissionais');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="profissionais-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="profissionais-content"]')).toBeVisible();

    // Verificar se há lista de profissionais
    await expect(authenticatedPage.locator('[data-testid="profissionais-list"]')).toBeVisible();

    // Verificar se há botão de novo profissional
    await expect(
      authenticatedPage.locator('[data-testid="novo-profissional-button"]'),
    ).toBeVisible();
  });

  test('deve carregar página de serviços', async ({ authenticatedPage }) => {
    // Navegar para serviços
    await authenticatedPage.goto('/servicos');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="servicos-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="servicos-content"]')).toBeVisible();

    // Verificar se há lista de serviços
    await expect(authenticatedPage.locator('[data-testid="servicos-list"]')).toBeVisible();

    // Verificar se há botão de novo serviço
    await expect(authenticatedPage.locator('[data-testid="novo-servico-button"]')).toBeVisible();
  });

  test('deve carregar página de agenda', async ({ authenticatedPage }) => {
    // Navegar para agenda
    await authenticatedPage.goto('/agenda');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="agenda-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="agenda-content"]')).toBeVisible();

    // Verificar se há calendário
    await expect(authenticatedPage.locator('[data-testid="calendario-view"]')).toBeVisible();

    // Verificar se há botão de novo agendamento
    await expect(
      authenticatedPage.locator('[data-testid="novo-agendamento-button"]'),
    ).toBeVisible();
  });

  test('deve carregar página da fila', async ({ authenticatedPage }) => {
    // Navegar para fila
    await authenticatedPage.goto('/fila');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="fila-content"]')).toBeVisible();

    // Verificar se há painel da fila
    await expect(authenticatedPage.locator('[data-testid="painel-fila"]')).toBeVisible();

    // Verificar se há botão de adicionar à fila
    await expect(authenticatedPage.locator('[data-testid="adicionar-fila-button"]')).toBeVisible();
  });

  test('deve carregar página financeira', async ({ authenticatedPage }) => {
    // Navegar para caixa
    await authenticatedPage.goto('/caixa');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="caixa-content"]')).toBeVisible();

    // Verificar se há resumo financeiro
    await expect(authenticatedPage.locator('[data-testid="resumo-financeiro"]')).toBeVisible();

    // Verificar se há botão de novo lançamento
    await expect(authenticatedPage.locator('[data-testid="novo-lancamento-button"]')).toBeVisible();
  });

  test('deve carregar página de relatórios', async ({ authenticatedPage }) => {
    // Navegar para relatórios
    await authenticatedPage.goto('/relatorios');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="relatorios-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="relatorios-content"]')).toBeVisible();

    // Verificar se há navegação para relatórios específicos
    await expect(
      authenticatedPage.locator('[data-testid="relatorio-financeiro-link"]'),
    ).toBeVisible();
    await expect(
      authenticatedPage.locator('[data-testid="relatorio-operacional-link"]'),
    ).toBeVisible();
  });

  test('deve carregar página de configurações', async ({ authenticatedPage }) => {
    // Navegar para configurações
    await authenticatedPage.goto('/configuracoes');

    // Aguardar carregamento
    await authenticatedPage.waitForSelector('[data-testid="configuracoes-content"]');

    // Verificar se página carregou
    await expect(authenticatedPage.locator('[data-testid="configuracoes-content"]')).toBeVisible();

    // Verificar se há navegação para configurações específicas
    await expect(authenticatedPage.locator('[data-testid="perfil-link"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="unidade-link"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="sistema-link"]')).toBeVisible();
  });

  test('deve navegar entre módulos principais', async ({ authenticatedPage }) => {
    // Começar no dashboard
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForSelector('[data-testid="dashboard-content"]');

    // Navegar para clientes
    await authenticatedPage.click('[data-testid="nav-clientes"]');
    await authenticatedPage.waitForURL('/clientes');
    await authenticatedPage.waitForSelector('[data-testid="clientes-content"]');

    // Navegar para agenda
    await authenticatedPage.click('[data-testid="nav-agenda"]');
    await authenticatedPage.waitForURL('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="agenda-content"]');

    // Navegar para fila
    await authenticatedPage.click('[data-testid="nav-fila"]');
    await authenticatedPage.waitForURL('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Navegar para caixa
    await authenticatedPage.click('[data-testid="nav-caixa"]');
    await authenticatedPage.waitForURL('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Voltar para dashboard
    await authenticatedPage.click('[data-testid="nav-dashboard"]');
    await authenticatedPage.waitForURL('/dashboard');
    await authenticatedPage.waitForSelector('[data-testid="dashboard-content"]');
  });

  test('deve carregar componentes de layout consistentemente', async ({ authenticatedPage }) => {
    // Navegar para qualquer página
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForSelector('[data-testid="dashboard-content"]');

    // Verificar se header está presente
    await expect(authenticatedPage.locator('[data-testid="app-header"]')).toBeVisible();

    // Verificar se sidebar está presente
    await expect(authenticatedPage.locator('[data-testid="app-sidebar"]')).toBeVisible();

    // Verificar se footer está presente
    await expect(authenticatedPage.locator('[data-testid="app-footer"]')).toBeVisible();

    // Verificar se menu do usuário está presente
    await expect(authenticatedPage.locator('[data-testid="user-menu"]')).toBeVisible();

    // Verificar se seletor de unidade está presente
    await expect(authenticatedPage.locator('[data-testid="unidade-selector"]')).toBeVisible();
  });

  test('deve responder a mudanças de viewport', async ({ authenticatedPage }) => {
    // Navegar para dashboard
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForSelector('[data-testid="dashboard-content"]');

    // Verificar layout desktop
    await expect(authenticatedPage.locator('[data-testid="app-sidebar"]')).toBeVisible();

    // Mudar para viewport mobile
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });

    // Verificar se sidebar está oculta em mobile
    await expect(authenticatedPage.locator('[data-testid="app-sidebar"]')).not.toBeVisible();

    // Verificar se menu mobile está presente
    await expect(authenticatedPage.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Voltar para viewport desktop
    await authenticatedPage.setViewportSize({ width: 1280, height: 720 });

    // Verificar se sidebar voltou a ser visível
    await expect(authenticatedPage.locator('[data-testid="app-sidebar"]')).toBeVisible();
  });

  test('deve carregar páginas com performance aceitável', async ({ authenticatedPage }) => {
    // Medir tempo de carregamento do dashboard
    const startTime = Date.now();

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForSelector('[data-testid="dashboard-content"]');

    const loadTime = Date.now() - startTime;

    // Verificar se carregamento foi rápido (menos de 5 segundos)
    expect(loadTime).toBeLessThan(5000);

    // Verificar se não há erros no console
    const consoleErrors: string[] = [];
    authenticatedPage.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Aguardar um pouco para capturar erros
    await authenticatedPage.waitForTimeout(2000);

    // Verificar se não há erros críticos
    const criticalErrors = consoleErrors.filter(
      (error) =>
        error.includes('Failed to load') ||
        error.includes('NetworkError') ||
        error.includes('TypeError'),
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
