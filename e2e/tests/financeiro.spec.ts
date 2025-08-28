import { test, expect } from '../fixtures';
import { createMockManager } from '../mocks';

/**
 * Testes E2E para Sistema Financeiro Completo
 * Cobre lançamentos, fechamento de caixa, comissões, relatórios e integrações
 */
test.describe('Financeiro', () => {
  test.beforeEach(async ({ createTestData }) => {
    // Criar dados de teste antes de cada teste
    await createTestData();
  });

  test.afterEach(async ({ cleanupTestData }) => {
    // Limpar dados de teste após cada teste
    await cleanupTestData();
  });

  test('deve carregar painel financeiro', async ({ authenticatedPage }) => {
    // Navegar para página financeira
    await authenticatedPage.goto('/caixa');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Verificar se o painel está visível
    await expect(authenticatedPage.locator('[data-testid="caixa-content"]')).toBeVisible();

    // Verificar se há controles financeiros
    await expect(authenticatedPage.locator('[data-testid="controles-financeiros"]')).toBeVisible();
  });

  test('deve fazer lançamento financeiro simples', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página financeira
    await authenticatedPage.goto('/caixa');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Clicar em "Novo Lançamento"
    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    // Preencher formulário
    await authenticatedPage.fill('[data-testid="descricao-input"]', 'Lançamento E2E');
    await authenticatedPage.fill('[data-testid="valor-input"]', '100.00');
    await authenticatedPage.selectOption('[data-testid="tipo-select"]', 'entrada');
    await authenticatedPage.selectOption('[data-testid="categoria-select"]', 'venda');
    await authenticatedPage.fill(
      '[data-testid="observacoes-input"]',
      'Lançamento criado via teste E2E',
    );

    // Salvar lançamento
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o lançamento foi criado na lista
    await expect(authenticatedPage.locator('text=Lançamento E2E')).toBeVisible();

    // Verificar se o valor está correto
    await expect(authenticatedPage.locator('text=R$ 100,00')).toBeVisible();
  });

  test('deve fazer fechamento de caixa diário', async ({ authenticatedPage, tenantData }) => {
    // Primeiro criar alguns lançamentos para fechar o caixa
    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Criar lançamento de entrada
    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    await authenticatedPage.fill('[data-testid="descricao-input"]', 'Venda E2E');
    await authenticatedPage.fill('[data-testid="valor-input"]', '150.00');
    await authenticatedPage.selectOption('[data-testid="tipo-select"]', 'entrada');
    await authenticatedPage.selectOption('[data-testid="categoria-select"]', 'venda');
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });

    // Criar lançamento de saída
    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    await authenticatedPage.fill('[data-testid="descricao-input"]', 'Despesa E2E');
    await authenticatedPage.fill('[data-testid="valor-input"]', '50.00');
    await authenticatedPage.selectOption('[data-testid="tipo-select"]', 'saida');
    await authenticatedPage.selectOption('[data-testid="categoria-select"]', 'despesa');
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });

    // Agora fazer fechamento de caixa
    await authenticatedPage.click('[data-testid="fechar-caixa-button"]');

    // Aguardar abertura do modal de fechamento
    await authenticatedPage.waitForSelector('[data-testid="fechamento-caixa-dialog"]');

    // Verificar resumo do fechamento
    await expect(authenticatedPage.locator('[data-testid="total-entradas"]')).toContainText(
      'R$ 150,00',
    );
    await expect(authenticatedPage.locator('[data-testid="total-saidas"]')).toContainText(
      'R$ 50,00',
    );
    await expect(authenticatedPage.locator('[data-testid="saldo-final"]')).toContainText(
      'R$ 100,00',
    );

    // Confirmar fechamento
    await authenticatedPage.click('[data-testid="confirmar-fechamento-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="fechamento-caixa-dialog"]', {
      state: 'hidden',
    });

    // Verificar se fechamento foi registrado
    await expect(
      authenticatedPage.locator('[data-testid="fechamento-sucesso-message"]'),
    ).toBeVisible();
  });

  test('deve filtrar movimentações por período', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página financeira
    await authenticatedPage.goto('/caixa');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Abrir filtros
    await authenticatedPage.click('[data-testid="filtros-button"]');

    // Selecionar período
    await authenticatedPage.fill('[data-testid="data-inicio-input"]', '2025-08-01');
    await authenticatedPage.fill('[data-testid="data-fim-input"]', '2025-08-31');

    // Aplicar filtros
    await authenticatedPage.click('[data-testid="aplicar-filtros-button"]');

    // Aguardar filtro ser aplicado
    await authenticatedPage.waitForTimeout(500);

    // Verificar se filtros foram aplicados
    await expect(authenticatedPage.locator('[data-testid="filtros-ativos"]')).toBeVisible();
  });

  test('deve exportar movimentações em CSV', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página financeira
    await authenticatedPage.goto('/caixa');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Clicar em exportar
    await authenticatedPage.click('[data-testid="exportar-csv-button"]');

    // Aguardar download (em testes reais, verificar se arquivo foi baixado)
    await authenticatedPage.waitForTimeout(1000);

    // Verificar se mensagem de sucesso aparece
    await expect(
      authenticatedPage.locator('[data-testid="exportacao-sucesso-message"]'),
    ).toBeVisible();
  });

  test('deve mostrar resumo financeiro correto', async ({ authenticatedPage, tenantData }) => {
    // Navegar para página financeira
    await authenticatedPage.goto('/caixa');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Verificar se resumo está visível
    await expect(authenticatedPage.locator('[data-testid="resumo-financeiro"]')).toBeVisible();

    // Verificar se cards de resumo estão presentes
    await expect(authenticatedPage.locator('[data-testid="card-entradas"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="card-saidas"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="card-saldo"]')).toBeVisible();

    // Verificar se valores estão sendo exibidos
    const saldo = await authenticatedPage.locator('[data-testid="valor-saldo"]').textContent();
    expect(saldo).toMatch(/R\$\s*\d+,\d{2}/); // Formato de moeda brasileira
  });

  test('deve validar campos obrigatórios no lançamento', async ({ authenticatedPage }) => {
    // Navegar para página financeira
    await authenticatedPage.goto('/caixa');

    // Aguardar carregamento do painel
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Clicar em "Novo Lançamento"
    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');

    // Aguardar abertura do modal
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    // Tentar salvar sem preencher campos obrigatórios
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    // Verificar se mensagens de erro aparecem
    await expect(authenticatedPage.locator('[data-testid="descricao-error"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="valor-error"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="tipo-error"]')).toBeVisible();

    // Verificar se o modal não fechou
    await expect(authenticatedPage.locator('[data-testid="lancamento-dialog"]')).toBeVisible();
  });

  test('deve editar lançamento existente', async ({ authenticatedPage, tenantData }) => {
    // Primeiro criar um lançamento
    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    await authenticatedPage.fill('[data-testid="descricao-input"]', 'Lançamento para Editar');
    await authenticatedPage.fill('[data-testid="valor-input"]', '75.00');
    await authenticatedPage.selectOption('[data-testid="tipo-select"]', 'entrada');
    await authenticatedPage.selectOption('[data-testid="categoria-select"]', 'venda');
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });

    // Agora editar o lançamento
    await authenticatedPage.click('[data-testid="lancamento-item"]:first');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-detail-dialog"]');

    // Clicar em editar
    await authenticatedPage.click('[data-testid="editar-lancamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    // Modificar valor
    await authenticatedPage.fill('[data-testid="valor-input"]', '85.00');

    // Salvar alterações
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });

    // Verificar se o valor foi alterado
    await expect(authenticatedPage.locator('text=R$ 85,00')).toBeVisible();
  });

  test('deve calcular comissões automaticamente', async ({ authenticatedPage, tenantData }) => {
    // Configurar mock para manter consistência
    const mockManager = createMockManager(authenticatedPage);
    await mockManager.setupAll();

    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Criar venda de serviço (que gera comissão)
    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    await authenticatedPage.fill('[data-testid="descricao-input"]', 'Serviço com Comissão');
    await authenticatedPage.fill('[data-testid="valor-input"]', '100.00');
    await authenticatedPage.selectOption('[data-testid="tipo-select"]', 'entrada');
    await authenticatedPage.selectOption('[data-testid="categoria-select"]', 'servico');
    await authenticatedPage.selectOption(
      '[data-testid="profissional-select"]',
      'Profissional TESTE E2E',
    );
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });

    // Verificar se comissão foi calculada (30% do valor)
    await expect(authenticatedPage.locator('[data-testid="comissao-calculada"]')).toContainText(
      'R$ 30,00',
    );

    // Verificar se aparece no resumo de comissões
    await authenticatedPage.click('[data-testid="aba-comissoes"]');
    await expect(authenticatedPage.locator('text=Profissional TESTE E2E')).toBeVisible();
    await expect(authenticatedPage.locator('text=R$ 30,00')).toBeVisible();
  });

  test('deve processar venda de produtos', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Criar venda de produto
    await authenticatedPage.click('[data-testid="nova-venda-button"]');
    await authenticatedPage.waitForSelector('[data-testid="venda-dialog"]');

    // Selecionar cliente
    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');

    // Adicionar produto à venda
    await authenticatedPage.click('[data-testid="adicionar-produto-button"]');
    await authenticatedPage.selectOption('[data-testid="produto-select-0"]', 'Pomada Teste');
    await authenticatedPage.fill('[data-testid="quantidade-input-0"]', '2');

    // Verificar se total foi calculado automaticamente
    const total = await authenticatedPage.locator('[data-testid="total-venda"]').textContent();
    expect(total).toContain('R$ 60,00'); // 2 x R$ 30,00

    // Finalizar venda
    await authenticatedPage.click('[data-testid="finalizar-venda-button"]');

    // Aguardar fechamento do modal
    await authenticatedPage.waitForSelector('[data-testid="venda-dialog"]', {
      state: 'hidden',
    });

    // Verificar se venda aparece no extrato
    await expect(authenticatedPage.locator('text=Venda - Pomada Teste')).toBeVisible();
    await expect(authenticatedPage.locator('text=R$ 60,00')).toBeVisible();
  });

  test('deve gerar relatório financeiro detalhado', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/relatorios/financeiro');
    await authenticatedPage.waitForSelector('[data-testid="relatorio-financeiro-content"]');

    // Configurar período do relatório
    await authenticatedPage.fill('[data-testid="data-inicio-input"]', '2025-08-01');
    await authenticatedPage.fill('[data-testid="data-fim-input"]', '2025-08-31');

    // Gerar relatório
    await authenticatedPage.click('[data-testid="gerar-relatorio-button"]');

    // Aguardar carregamento do relatório
    await authenticatedPage.waitForSelector('[data-testid="relatorio-gerado"]');

    // Verificar componentes do relatório
    await expect(authenticatedPage.locator('[data-testid="resumo-receitas"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="resumo-despesas"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="grafico-evolucao"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="top-servicos"]')).toBeVisible();
    await expect(
      authenticatedPage.locator('[data-testid="comissoes-profissionais"]'),
    ).toBeVisible();

    // Testar exportação do relatório
    await authenticatedPage.click('[data-testid="exportar-pdf-button"]');

    // Verificar se download foi iniciado
    await expect(
      authenticatedPage.locator('[data-testid="download-iniciado-message"]'),
    ).toBeVisible();
  });

  test('deve controlar fluxo de caixa em tempo real', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Verificar saldo inicial
    const saldoInicial = await authenticatedPage
      .locator('[data-testid="saldo-atual"]')
      .textContent();
    const valorInicial = parseFloat(saldoInicial?.replace(/[R$\s,]/g, '').replace(',', '.') || '0');

    // Fazer entrada
    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    await authenticatedPage.fill('[data-testid="descricao-input"]', 'Entrada Teste');
    await authenticatedPage.fill('[data-testid="valor-input"]', '200.00');
    await authenticatedPage.selectOption('[data-testid="tipo-select"]', 'entrada');
    await authenticatedPage.selectOption('[data-testid="categoria-select"]', 'venda');
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });

    // Verificar se saldo foi atualizado em tempo real
    await authenticatedPage.waitForTimeout(1000); // Aguardar atualização
    const novoSaldo = await authenticatedPage.locator('[data-testid="saldo-atual"]').textContent();
    const valorNovo = parseFloat(novoSaldo?.replace(/[R$\s,]/g, '').replace(',', '.') || '0');

    expect(valorNovo).toBe(valorInicial + 200.0);
  });

  test('deve validar limites e alertas financeiros', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Tentar fazer saída muito alta
    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    await authenticatedPage.fill('[data-testid="descricao-input"]', 'Despesa Muito Alta');
    await authenticatedPage.fill('[data-testid="valor-input"]', '10000.00');
    await authenticatedPage.selectOption('[data-testid="tipo-select"]', 'saida');
    await authenticatedPage.selectOption('[data-testid="categoria-select"]', 'despesa');

    // Tentar salvar
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    // Verificar se alerta aparece
    await expect(authenticatedPage.locator('[data-testid="alerta-valor-alto"]')).toBeVisible();

    // Confirmar mesmo assim
    await authenticatedPage.click('[data-testid="confirmar-valor-alto-button"]');

    // Verificar se lançamento foi salvo
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });
    await expect(authenticatedPage.locator('text=Despesa Muito Alta')).toBeVisible();
  });

  test('deve integrar com sistema de assinaturas', async ({ authenticatedPage, tenantData }) => {
    // Configurar mock para Asaas
    const mockManager = createMockManager(authenticatedPage);
    await mockManager.setupAsaasMocks();

    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Simular recebimento de webhook de pagamento
    await mockManager.asaas.simulateWebhook('PAYMENT_RECEIVED', {
      id: 'pay_test_123',
      status: 'RECEIVED',
      value: 99.9,
      description: 'Mensalidade João Silva',
      customer: 'cus_test_123',
    });

    // Aguardar processamento do webhook
    await authenticatedPage.waitForTimeout(2000);

    // Verificar se entrada automática foi criada
    await expect(authenticatedPage.locator('text=Mensalidade João Silva')).toBeVisible();
    await expect(authenticatedPage.locator('text=R$ 99,90')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="origem-assinatura"]')).toBeVisible();
  });

  test('deve controlar conciliação bancária', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/caixa/conciliacao');
    await authenticatedPage.waitForSelector('[data-testid="conciliacao-content"]');

    // Importar extrato bancário (mock)
    await authenticatedPage.click('[data-testid="importar-extrato-button"]');
    await authenticatedPage.setInputFiles('[data-testid="arquivo-extrato"]', {
      name: 'extrato_teste.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        'Data,Descrição,Valor\n2025-08-23,TED João Silva,99.90\n2025-08-23,PIX Maria Santos,150.00',
      ),
    });

    await authenticatedPage.click('[data-testid="processar-extrato-button"]');

    // Aguardar processamento
    await authenticatedPage.waitForSelector('[data-testid="itens-conciliacao"]');

    // Verificar itens para conciliação
    await expect(
      authenticatedPage.locator('[data-testid="item-conciliacao"]:has-text("João Silva")'),
    ).toBeVisible();
    await expect(
      authenticatedPage.locator('[data-testid="item-conciliacao"]:has-text("Maria Santos")'),
    ).toBeVisible();

    // Conciliar primeiro item
    await authenticatedPage.click('[data-testid="conciliar-button"]:first');
    await authenticatedPage.waitForSelector('[data-testid="conciliacao-dialog"]');

    await authenticatedPage.selectOption(
      '[data-testid="lancamento-select"]',
      'Mensalidade João Silva',
    );
    await authenticatedPage.click('[data-testid="confirmar-conciliacao-button"]');

    // Verificar se item foi conciliado
    await expect(
      authenticatedPage.locator('[data-testid="status-conciliado"]:first'),
    ).toBeVisible();
  });

  test('deve calcular métricas de performance', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Navegar para aba de métricas
    await authenticatedPage.click('[data-testid="aba-metricas"]');
    await authenticatedPage.waitForSelector('[data-testid="metricas-content"]');

    // Verificar KPIs principais
    await expect(authenticatedPage.locator('[data-testid="kpi-faturamento-mensal"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="kpi-ticket-medio"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="kpi-margem-lucro"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="kpi-crescimento-mensal"]')).toBeVisible();

    // Verificar gráficos
    await expect(
      authenticatedPage.locator('[data-testid="grafico-faturamento-diario"]'),
    ).toBeVisible();
    await expect(
      authenticatedPage.locator('[data-testid="grafico-categoria-receitas"]'),
    ).toBeVisible();
    await expect(
      authenticatedPage.locator('[data-testid="grafico-evolucao-clientes"]'),
    ).toBeVisible();

    // Testar filtros de período
    await authenticatedPage.selectOption('[data-testid="periodo-select"]', '30d');

    // Aguardar atualização dos dados
    await authenticatedPage.waitForTimeout(1000);

    // Verificar se dados foram atualizados
    await expect(authenticatedPage.locator('[data-testid="periodo-ativo"]')).toContainText(
      '30 dias',
    );
  });

  test('deve gerenciar múltiplas formas de pagamento', async ({
    authenticatedPage,
    tenantData,
  }) => {
    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Criar venda com múltiplas formas de pagamento
    await authenticatedPage.click('[data-testid="nova-venda-button"]');
    await authenticatedPage.waitForSelector('[data-testid="venda-dialog"]');

    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.click('[data-testid="adicionar-produto-button"]');
    await authenticatedPage.selectOption('[data-testid="produto-select-0"]', 'Corte');

    // Total da venda: R$ 50,00
    await expect(authenticatedPage.locator('[data-testid="total-venda"]')).toContainText(
      'R$ 50,00',
    );

    // Dividir pagamento
    await authenticatedPage.click('[data-testid="dividir-pagamento-button"]');

    // Primeira forma: Dinheiro - R$ 30,00
    await authenticatedPage.selectOption('[data-testid="forma-pagamento-0"]', 'dinheiro');
    await authenticatedPage.fill('[data-testid="valor-pagamento-0"]', '30.00');

    // Segunda forma: Cartão - R$ 20,00
    await authenticatedPage.click('[data-testid="adicionar-forma-pagamento"]');
    await authenticatedPage.selectOption('[data-testid="forma-pagamento-1"]', 'cartao_credito');
    await authenticatedPage.fill('[data-testid="valor-pagamento-1"]', '20.00');

    // Verificar se total confere
    await expect(authenticatedPage.locator('[data-testid="total-conferido"]')).toBeVisible();

    // Finalizar venda
    await authenticatedPage.click('[data-testid="finalizar-venda-button"]');

    // Verificar se lançamentos foram criados corretamente
    await authenticatedPage.waitForSelector('[data-testid="venda-dialog"]', {
      state: 'hidden',
    });
    await expect(authenticatedPage.locator('text=Dinheiro - R$ 30,00')).toBeVisible();
    await expect(authenticatedPage.locator('text=Cartão - R$ 20,00')).toBeVisible();
  });

  test('deve emitir recibos e comprovantes', async ({ authenticatedPage, tenantData }) => {
    await authenticatedPage.goto('/caixa');
    await authenticatedPage.waitForSelector('[data-testid="caixa-content"]');

    // Criar lançamento
    await authenticatedPage.click('[data-testid="novo-lancamento-button"]');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]');

    await authenticatedPage.fill('[data-testid="descricao-input"]', 'Serviço para Recibo');
    await authenticatedPage.fill('[data-testid="valor-input"]', '80.00');
    await authenticatedPage.selectOption('[data-testid="tipo-select"]', 'entrada');
    await authenticatedPage.selectOption('[data-testid="categoria-select"]', 'servico');
    await authenticatedPage.fill('[data-testid="cliente-select"]', 'Cliente TESTE E2E');
    await authenticatedPage.click('[data-testid="salvar-lancamento-button"]');

    await authenticatedPage.waitForSelector('[data-testid="lancamento-dialog"]', {
      state: 'hidden',
    });

    // Abrir detalhes do lançamento
    await authenticatedPage.click('[data-testid="lancamento-item"]:first');
    await authenticatedPage.waitForSelector('[data-testid="lancamento-detail-dialog"]');

    // Emitir recibo
    await authenticatedPage.click('[data-testid="emitir-recibo-button"]');

    // Aguardar abertura do recibo
    await authenticatedPage.waitForSelector('[data-testid="recibo-dialog"]');

    // Verificar dados do recibo
    await expect(authenticatedPage.locator('[data-testid="recibo-cliente"]')).toContainText(
      'Cliente TESTE E2E',
    );
    await expect(authenticatedPage.locator('[data-testid="recibo-valor"]')).toContainText(
      'R$ 80,00',
    );
    await expect(authenticatedPage.locator('[data-testid="recibo-descricao"]')).toContainText(
      'Serviço para Recibo',
    );

    // Imprimir recibo
    await authenticatedPage.click('[data-testid="imprimir-recibo-button"]');

    // Verificar se impressão foi iniciada (mock)
    await expect(
      authenticatedPage.locator('[data-testid="impressao-iniciada-message"]'),
    ).toBeVisible();
  });
});
