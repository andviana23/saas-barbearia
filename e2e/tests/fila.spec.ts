import { test, expect } from '../fixtures';
import { createMockManager } from '../mocks';

/**
 * Testes E2E para Sistema de Fila em Tempo Real
 * Cobre entrada/saída, estimativas, notificações e sincronização multi-dispositivo
 */
test.describe('Fila', () => {
  test.beforeEach(async ({ createTestData }) => {
    // Criar dados de teste antes de cada teste
    await createTestData();
  });

  test.afterEach(async ({ cleanupTestData }) => {
    // Limpar dados de teste após cada teste
    await cleanupTestData();
  });

  test('deve carregar painel da fila', async ({ authenticatedPage }) => {
    // Navegar para página da fila
    await authenticatedPage.goto('/fila');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Verificar se o painel está visível
    await expect(authenticatedPage.locator('[data-testid="fila-content"]')).toBeVisible();

    // Verificar se há controles de fila
    await expect(authenticatedPage.locator('[data-testid="controles-fila"]')).toBeVisible();
  });

  test('deve adicionar cliente à fila', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página da fila
    await authenticatedPage.goto('/fila');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Clicar em "Adicionar à Fila"
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.fill(
      '[data-testid="observacoes-input"]',
      'Cliente adicionado via teste E2E',
    );

    // Adicionar à fila
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o cliente foi adicionado à fila
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).toBeVisible();

    // Verificar se está na posição correta
    await expect(authenticatedPage.locator('[data-testid="posicao-fila"]')).toContainText('1');
  });

  test('deve chamar próximo cliente da fila', async ({ authenticatedPage, tenantData }) => {
    // Primeiro adicionar cliente à fila
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Verificar se cliente está na fila
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).toBeVisible();

    // Chamar próximo cliente
    await authenticatedPage.click('[data-testid="chamar-proximo-button"]');

    // Aguardar confirmação
    await authenticatedPage.waitForSelector('[data-testid="confirmar-chamada-dialog"]');

    // Confirmar chamada
    await authenticatedPage.click('[data-testid="confirmar-chamada-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="confirmar-chamada-dialog"]', {
      state: 'hidden',
    });

    // Verificar se cliente foi removido da fila
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).not.toBeVisible();
  });

  test('deve calcular estimativa de tempo corretamente', async ({
    authenticatedPage,
    tenantData,
  }) => {
    // Navegar para página da fila
    await authenticatedPage.goto('/fila');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Adicionar primeiro cliente
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Verificar estimativa para primeiro cliente
    const estimativa1 = await authenticatedPage
      .locator('[data-testid="estimativa-tempo"]:first')
      .textContent();
    expect(estimativa1).toContain('0'); // Primeiro cliente não tem espera

    // Adicionar segundo cliente
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Verificar estimativa para segundo cliente (deve ser maior que 0)
    const estimativa2 = await authenticatedPage
      .locator('[data-testid="estimativa-tempo"]:last')
      .textContent();
    expect(estimativa2).toContain('60'); // 60 minutos do serviço
  });

  test('deve remover cliente da fila', async ({ authenticatedPage, tenantData }) => {
    // Adicionar cliente à fila
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Verificar se cliente está na fila
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).toBeVisible();

    // Clicar no cliente para abrir opções
    await authenticatedPage.click('[data-testid="cliente-fila-item"]:first');

    // Clicar em remover
    await authenticatedPage.click('[data-testid="remover-fila-button"]');

    // Confirmar remoção
    await authenticatedPage.click('[data-testid="confirmar-remocao-button"]');

    // Verificar se cliente foi removido da fila
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).not.toBeVisible();
  });

  test('deve priorizar cliente na fila', async ({ authenticatedPage, tenantData }) => {
    // Adicionar primeiro cliente
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Adicionar segundo cliente
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Verificar posições iniciais
    const posicao1 = await authenticatedPage
      .locator('[data-testid="posicao-fila"]:first')
      .textContent();
    const posicao2 = await authenticatedPage
      .locator('[data-testid="posicao-fila"]:last')
      .textContent();

    expect(posicao1).toBe('1');
    expect(posicao2).toBe('2');

    // Priorizar segundo cliente
    await authenticatedPage.click('[data-testid="cliente-fila-item"]:last');
    await authenticatedPage.click('[data-testid="priorizar-button"]');

    // Verificar se posições foram invertidas
    const novaPosicao1 = await authenticatedPage
      .locator('[data-testid="posicao-fila"]:first')
      .textContent();
    const novaPosicao2 = await authenticatedPage
      .locator('[data-testid="posicao-fila"]:last')
      .textContent();

    expect(novaPosicao1).toBe('2'); // Segundo cliente agora é primeiro
    expect(novaPosicao2).toBe('1'); // Primeiro cliente agora é segundo
  });

  test('deve mostrar status da fila em tempo real', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página da fila
    await authenticatedPage.goto('/fila');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Verificar se status está visível
    await expect(authenticatedPage.locator('[data-testid="status-fila"]')).toBeVisible();

    // Verificar contador inicial
    const contadorInicial = await authenticatedPage
      .locator('[data-testid="contador-fila"]')
      .textContent();
    expect(contadorInicial).toBe('0');

    // Adicionar cliente à fila
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Verificar se contador foi atualizado
    const contadorAtualizado = await authenticatedPage
      .locator('[data-testid="contador-fila"]')
      .textContent();
    expect(contadorAtualizado).toBe('1');

    // Verificar se status mudou
    await expect(authenticatedPage.locator('[data-testid="status-fila"]')).toContainText('Ativa');
  });

  test('deve sincronizar fila entre múltiplos dispositivos', async ({
    authenticatedPage,
    tenantData,
    browser,
  }) => {
    // Abrir segundo contexto (simular outro dispositivo)
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    // Configurar autenticação na segunda página
    await page2.goto('/login');
    await page2.fill(
      '[data-testid="email-input"]',
      process.env.TEST_USER_EMAIL || 'test@trato.com',
    );
    await page2.fill(
      '[data-testid="password-input"]',
      process.env.TEST_USER_PASSWORD || 'test123456',
    );
    await page2.click('[data-testid="login-button"]');
    await page2.waitForURL('/dashboard');

    // Navegar para fila em ambos dispositivos
    await authenticatedPage.goto('/fila');
    await page2.goto('/fila');

    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');
    await page2.waitForSelector('[data-testid="fila-content"]');

    // Adicionar cliente no primeiro dispositivo
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Aguardar sincronização (2 segundos)
    await page2.waitForTimeout(2000);

    // Verificar se cliente apareceu no segundo dispositivo
    await expect(page2.locator('text=Cliente TESTE E2E')).toBeVisible();

    // Chamar cliente no segundo dispositivo
    await page2.click('[data-testid="chamar-proximo-button"]');
    await page2.waitForSelector('[data-testid="confirmar-chamada-dialog"]');
    await page2.click('[data-testid="confirmar-chamada-button"]');

    // Aguardar sincronização
    await authenticatedPage.waitForTimeout(2000);

    // Verificar se cliente foi removido no primeiro dispositivo
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).not.toBeVisible();

    await context2.close();
  });

  test('deve notificar sobre mudanças na fila', async ({ authenticatedPage, tenantData }) => {
    // Configurar mock manager para notificações
    const mockManager = createMockManager(authenticatedPage);
    await mockManager.setupAll();

    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Adicionar cliente à fila
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    // Verificar se notificação aparece
    await expect(
      authenticatedPage.locator('[data-testid="notificacao-cliente-adicionado"]'),
    ).toBeVisible();

    // Chamar próximo cliente
    await authenticatedPage.click('[data-testid="chamar-proximo-button"]');
    await authenticatedPage.waitForSelector('[data-testid="confirmar-chamada-dialog"]');
    await authenticatedPage.click('[data-testid="confirmar-chamada-button"]');

    // Verificar se notificação de chamada aparece
    await expect(
      authenticatedPage.locator('[data-testid="notificacao-cliente-chamado"]'),
    ).toBeVisible();
  });

  test('deve filtrar fila por profissional', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Adicionar cliente para profissional específico
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Aplicar filtro por profissional
    await authenticatedPage.click('[data-testid="filtros-fila-button"]');
    await authenticatedPage.selectOption(
      '[data-testid="profissional-filter"]',
      'Profissional TESTE E2E',
    );
    await authenticatedPage.click('[data-testid="aplicar-filtros-button"]');

    // Verificar se apenas clientes do profissional selecionado aparecem
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).toBeVisible();
    await expect(authenticatedPage.locator('text=Profissional TESTE E2E')).toBeVisible();
  });

  test('deve gerenciar fila com múltiplos profissionais', async ({
    authenticatedPage,
    tenantData,
  }) => {
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Adicionar cliente para primeiro profissional
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente 1');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional A');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Corte');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Adicionar cliente para segundo profissional
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente 2');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional B');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Barba');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Verificar se ambos clientes estão na fila
    await expect(authenticatedPage.locator('text=Cliente 1')).toBeVisible();
    await expect(authenticatedPage.locator('text=Cliente 2')).toBeVisible();

    // Verificar se profissionais estão corretos
    await expect(authenticatedPage.locator('text=Profissional A')).toBeVisible();
    await expect(authenticatedPage.locator('text=Profissional B')).toBeVisible();
  });

  test('deve calcular tempo de espera dinamicamente', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Simular início de atendimento
    await authenticatedPage.click('[data-testid="iniciar-atendimento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="atendimento-ativo"]');

    // Adicionar clientes à fila
    for (let i = 1; i <= 3; i++) {
      await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
      await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

      await authenticatedPage.fill('[data-testid="cliente-select"]', `Cliente ${i}`);
      await authenticatedPage.fill('[data-testid="servico-select"]', 'Corte'); // 60 min
      await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

      await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
        state: 'hidden',
      });
    }

    // Verificar estimativas crescentes
    const estimativas = await authenticatedPage
      .locator('[data-testid="estimativa-tempo"]')
      .allTextContents();

    // Primeiro cliente: 0 min (sendo atendido)
    expect(estimativas[0]).toContain('0');

    // Segundo cliente: 60 min (1 serviço à frente)
    expect(estimativas[1]).toContain('60');

    // Terceiro cliente: 120 min (2 serviços à frente)
    expect(estimativas[2]).toContain('120');
  });

  test('deve mostrar histórico de atendimentos', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Adicionar cliente e atender
    await authenticatedPage.click('[data-testid="adicionar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="servico-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="confirmar-adicionar-button"]');

    await authenticatedPage.waitForSelector('[data-testid="adicionar-fila-dialog"]', {
      state: 'hidden',
    });

    // Chamar cliente
    await authenticatedPage.click('[data-testid="chamar-proximo-button"]');
    await authenticatedPage.waitForSelector('[data-testid="confirmar-chamada-dialog"]');
    await authenticatedPage.click('[data-testid="confirmar-chamada-button"]');

    // Finalizar atendimento
    await authenticatedPage.click('[data-testid="finalizar-atendimento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="confirmar-finalizacao-dialog"]');
    await authenticatedPage.click('[data-testid="confirmar-finalizacao-button"]');

    // Abrir histórico
    await authenticatedPage.click('[data-testid="historico-button"]');
    await authenticatedPage.waitForSelector('[data-testid="historico-dialog"]');

    // Verificar se cliente aparece no histórico
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="status-finalizado"]')).toBeVisible();
  });

  test('deve permitir pausar e retomar fila', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Verificar se fila está ativa
    await expect(authenticatedPage.locator('[data-testid="status-fila"]')).toContainText('Ativa');

    // Pausar fila
    await authenticatedPage.click('[data-testid="pausar-fila-button"]');
    await authenticatedPage.waitForSelector('[data-testid="confirmar-pausa-dialog"]');
    await authenticatedPage.click('[data-testid="confirmar-pausa-button"]');

    // Verificar se fila foi pausada
    await expect(authenticatedPage.locator('[data-testid="status-fila"]')).toContainText('Pausada');

    // Verificar se botão de adicionar está desabilitado
    await expect(authenticatedPage.locator('[data-testid="adicionar-fila-button"]')).toBeDisabled();

    // Retomar fila
    await authenticatedPage.click('[data-testid="retomar-fila-button"]');

    // Verificar se fila voltou a ficar ativa
    await expect(authenticatedPage.locator('[data-testid="status-fila"]')).toContainText('Ativa');

    // Verificar se botão de adicionar está habilitado
    await expect(authenticatedPage.locator('[data-testid="adicionar-fila-button"]')).toBeEnabled();
  });

  test('deve integrar com sistema de agendamentos', async ({ authenticatedPage, tenantData }) => {
    // Primeiro criar agendamento que deve aparecer na fila
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    // Criar agendamento para daqui a 5 minutos
    const proximoHorario = new Date(Date.now() + 5 * 60000);

    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill(
      '[data-testid="data-input"]',
      proximoHorario.toISOString().split('T')[0],
    );
    await authenticatedPage.fill(
      '[data-testid="hora-input"]',
      proximoHorario.toTimeString().substring(0, 5),
    );
    await authenticatedPage.selectOption('[data-testid="servicos-select"]', 'Corte');
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');

    // Navegar para fila
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Aguardar um pouco para o agendamento aparecer próximo ao horário
    await authenticatedPage.waitForTimeout(3000);

    // Verificar se cliente do agendamento aparece na fila
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="origem-agendamento"]')).toBeVisible();
  });
});
