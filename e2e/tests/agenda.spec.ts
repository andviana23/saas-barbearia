import { test, expect } from '../fixtures';
import { createMockManager } from '../mocks';

/**
 * Testes E2E para Sistema de Agendamentos
 * Cobre criação, edição, validação de conflitos, múltiplos serviços e integração com fila
 */
test.describe('Agenda', () => {
  test.beforeEach(async ({ createTestData }) => {
    // Criar dados de teste antes de cada teste
    await createTestData();
  });

  test.afterEach(async ({ cleanupTestData }) => {
    // Limpar dados de teste após cada teste
    await cleanupTestData();
  });

  test('deve carregar calendário de agendamentos', async ({ authenticatedPage }) => {
    // Navegar para página de agenda
    await authenticatedPage.goto('/agenda');

    // Aguardar carregamento do calendário
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    // Verificar se o calendário está visível
    await expect(authenticatedPage.locator('[data-testid="calendario-view"]')).toBeVisible();

    // Verificar se há controles de navegação
    await expect(authenticatedPage.locator('[data-testid="navegacao-calendario"]')).toBeVisible();
  });

  test('deve criar novo agendamento com sucesso', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de agenda
    await authenticatedPage.goto('/agenda');

    // Aguardar carregamento do calendário
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    // Clicar em "Novo Agendamento"
    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '14:00');
    await authenticatedPage.fill('[data-testid="servicos-select"]', 'Serviço TESTE E2E');

    // Salvar agendamento
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o agendamento foi criado no calendário
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).toBeVisible();
  });

  test('deve editar agendamento existente', async ({ authenticatedPage, tenantData }) => {
    // Primeiro criar um agendamento
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    // Clicar em "Novo Agendamento"
    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    // Preencher e salvar
    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '15:00');
    await authenticatedPage.fill('[data-testid="servicos-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Agora editar o agendamento criado
    await authenticatedPage.click('[data-testid="agendamento-item"]:first');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-detail-dialog"]');

    // Clicar em editar
    await authenticatedPage.click('[data-testid="editar-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    // Modificar hora
    await authenticatedPage.fill('[data-testid="hora-input"]', '16:00');

    // Salvar alterações
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se a hora foi alterada
    await expect(authenticatedPage.locator('text=16:00')).toBeVisible();
  });

  test('deve validar conflitos de horário', async ({ authenticatedPage, tenantData }) => {
    // Criar primeiro agendamento
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '14:00');
    await authenticatedPage.fill('[data-testid="servicos-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');

    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Tentar criar segundo agendamento no mesmo horário
    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '14:00'); // Mesmo horário
    await authenticatedPage.fill('[data-testid="servicos-select"]', 'Serviço TESTE E2E');

    // Tentar salvar
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');

    // Verificar se mensagem de conflito aparece
    await expect(
      authenticatedPage.locator('[data-testid="conflito-horario-message"]'),
    ).toBeVisible();

    // Verificar se o modal não fechou
    await expect(
      authenticatedPage.locator('[data-testid="agendamento-form-dialog"]'),
    ).toBeVisible();
  });

  test('deve cancelar agendamento corretamente', async ({ authenticatedPage, tenantData }) => {
    // Criar agendamento para cancelar
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '17:00');
    await authenticatedPage.fill('[data-testid="servicos-select"]', 'Serviço TESTE E2E');
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');

    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Agora cancelar o agendamento
    await authenticatedPage.click('[data-testid="agendamento-item"]:first');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-detail-dialog"]');

    // Clicar em cancelar
    await authenticatedPage.click('[data-testid="cancelar-agendamento-button"]');

    // Confirmar cancelamento
    await authenticatedPage.click('[data-testid="confirmar-cancelamento-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="agendamento-detail-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o agendamento foi cancelado (não deve estar visível)
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).not.toBeVisible();
  });

  test('deve filtrar agendamentos por profissional', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página de agenda
    await authenticatedPage.goto('/agenda');

    // Aguardar carregamento do calendário
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    // Abrir filtros
    await authenticatedPage.click('[data-testid="filtros-button"]');

    // Selecionar profissional específico
    await authenticatedPage.selectOption(
      '[data-testid="profissional-filter"]',
      'Profissional TESTE E2E',
    );

    // Aplicar filtro
    await authenticatedPage.click('[data-testid="aplicar-filtros-button"]');

    // Aguardar filtro ser aplicado
    await authenticatedPage.waitForTimeout(500);

    // Verificar se apenas agendamentos do profissional selecionado estão visíveis
    const agendamentos = await authenticatedPage
      .locator('[data-testid="agendamento-item"]')
      .count();

    if (agendamentos > 0) {
      // Verificar se todos os agendamentos visíveis são do profissional selecionado
      for (let i = 0; i < agendamentos; i++) {
        const profissional = await authenticatedPage
          .locator('[data-testid="agendamento-item"]')
          .nth(i)
          .locator('[data-testid="profissional-nome"]')
          .textContent();
        expect(profissional).toContain('Profissional TESTE E2E');
      }
    }
  });

  test('deve alternar entre visualizações do calendário', async ({ authenticatedPage }) => {
    // Navegar para página de agenda
    await authenticatedPage.goto('/agenda');

    // Aguardar carregamento do calendário
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    // Verificar visualização padrão (provavelmente dia)
    await expect(authenticatedPage.locator('[data-testid="visualizacao-dia"]')).toBeVisible();

    // Alternar para visualização semanal
    await authenticatedPage.click('[data-testid="visualizacao-semana-button"]');
    await authenticatedPage.waitForSelector('[data-testid="visualizacao-semana"]');

    // Verificar se mudou para visualização semanal
    await expect(authenticatedPage.locator('[data-testid="visualizacao-semana"]')).toBeVisible();

    // Alternar para visualização mensal
    await authenticatedPage.click('[data-testid="visualizacao-mes-button"]');
    await authenticatedPage.waitForSelector('[data-testid="visualizacao-mes"]');

    // Verificar se mudou para visualização mensal
    await expect(authenticatedPage.locator('[data-testid="visualizacao-mes"]')).toBeVisible();
  });

  test('deve criar agendamento com múltiplos serviços', async ({
    authenticatedPage,
    tenantData,
  }) => {
    // Navegar para página de agenda
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    // Clicar em "Novo Agendamento"
    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    // Preencher dados básicos
    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '14:00');

    // Adicionar primeiro serviço
    await authenticatedPage.click('[data-testid="adicionar-servico-button"]');
    await authenticatedPage.selectOption('[data-testid="servico-select-0"]', 'Corte');

    // Adicionar segundo serviço
    await authenticatedPage.click('[data-testid="adicionar-servico-button"]');
    await authenticatedPage.selectOption('[data-testid="servico-select-1"]', 'Barba');

    // Verificar se duração total foi calculada automaticamente
    const duracaoTotal = await authenticatedPage
      .locator('[data-testid="duracao-total"]')
      .textContent();
    expect(duracaoTotal).toContain('90'); // 60 + 30 minutos

    // Salvar agendamento
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o agendamento foi criado com múltiplos serviços
    await expect(authenticatedPage.locator('text=Corte + Barba')).toBeVisible();
  });

  test('deve validar disponibilidade de profissional', async ({
    authenticatedPage,
    tenantData,
  }) => {
    // Criar primeiro agendamento
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '14:00');
    await authenticatedPage.selectOption('[data-testid="servicos-select"]', 'Corte');
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Tentar agendar horário conflitante
    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '14:30'); // Dentro do horário ocupado

    // Verificar se mostra horários indisponíveis
    await expect(authenticatedPage.locator('[data-testid="horario-indisponivel"]')).toBeVisible();

    // Sugerir próximo horário disponível
    await expect(authenticatedPage.locator('[data-testid="sugestao-horario"]')).toContainText(
      '15:00',
    );
  });

  test('deve integrar agendamento com sistema de fila', async ({
    authenticatedPage,
    tenantData,
  }) => {
    // Criar agendamento para horário atual + 5 minutos
    const dataAtual = new Date();
    const horaAgendamento = new Date(dataAtual.getTime() + 5 * 60000); // +5 minutos

    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill(
      '[data-testid="data-input"]',
      horaAgendamento.toISOString().split('T')[0],
    );
    await authenticatedPage.fill(
      '[data-testid="hora-input"]',
      horaAgendamento.toTimeString().substring(0, 5),
    );
    await authenticatedPage.selectOption('[data-testid="servicos-select"]', 'Corte');
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Navegar para fila e verificar se agendamento aparece
    await authenticatedPage.goto('/fila');
    await authenticatedPage.waitForSelector('[data-testid="fila-content"]');

    // Verificar se cliente aparece na fila próximo ao horário
    await expect(authenticatedPage.locator('text=Cliente TESTE E2E')).toBeVisible();
  });

  test('deve calcular tempo estimado de atendimento', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    // Selecionar serviço de 60 minutos
    await authenticatedPage.selectOption('[data-testid="servicos-select"]', 'Corte');

    // Verificar se mostra duração estimada
    const duracaoEstimada = await authenticatedPage
      .locator('[data-testid="duracao-estimada"]')
      .textContent();
    expect(duracaoEstimada).toContain('60 min');

    // Adicionar segundo serviço de 30 minutos
    await authenticatedPage.click('[data-testid="adicionar-servico-button"]');
    await authenticatedPage.selectOption('[data-testid="servico-select-1"]', 'Barba');

    // Verificar se duração foi atualizada
    const duracaoTotal = await authenticatedPage
      .locator('[data-testid="duracao-total"]')
      .textContent();
    expect(duracaoTotal).toContain('90 min');
  });

  test('deve validar horário de funcionamento', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');

    // Tentar agendar fora do horário de funcionamento (ex: 23:00)
    await authenticatedPage.fill('[data-testid="hora-input"]', '23:00');
    await authenticatedPage.selectOption('[data-testid="servicos-select"]', 'Corte');

    // Tentar salvar
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');

    // Verificar se mostra erro de horário inválido
    await expect(
      authenticatedPage.locator('[data-testid="erro-horario-funcionamento"]'),
    ).toBeVisible();
  });

  test('deve permitir reagendamento', async ({ authenticatedPage, tenantData }) => {
    // Criar agendamento inicial
    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

    await authenticatedPage.click('[data-testid="novo-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.fill('[data-testid="profissional-select"]', 'Profissional TESTE E2E');
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-25');
    await authenticatedPage.fill('[data-testid="hora-input"]', '14:00');
    await authenticatedPage.selectOption('[data-testid="servicos-select"]', 'Corte');
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Abrir detalhes do agendamento
    await authenticatedPage.click('[data-testid="agendamento-item"]:first');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-detail-dialog"]');

    // Clicar em reagendar
    await authenticatedPage.click('[data-testid="reagendar-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]');

    // Modificar data e hora
    await authenticatedPage.fill('[data-testid="data-input"]', '2025-08-26');
    await authenticatedPage.fill('[data-testid="hora-input"]', '15:00');

    // Salvar reagendamento
    await authenticatedPage.click('[data-testid="salvar-agendamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="agendamento-form-dialog"]', {
      state: 'hidden',
    });

    // Verificar se agendamento foi movido
    await expect(authenticatedPage.locator('text=26/08/2025')).toBeVisible();
    await expect(authenticatedPage.locator('text=15:00')).toBeVisible();
  });

  test('deve notificar sobre agendamentos próximos', async ({ authenticatedPage, tenantData }) => {
    // Configurar mock manager para interceptar notificações
    const mockManager = createMockManager(authenticatedPage);
    await mockManager.setupAll();

    // Criar agendamento para daqui a 15 minutos
    const proximoHorario = new Date(Date.now() + 15 * 60000);

    await authenticatedPage.goto('/agenda');
    await authenticatedPage.waitForSelector('[data-testid="calendario-view"]');

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

    // Aguardar e verificar se notificação aparece
    await authenticatedPage.waitForTimeout(2000);
    await expect(
      authenticatedPage.locator('[data-testid="notificacao-agendamento-proximo"]'),
    ).toBeVisible();
  });
});
