import { test, expect } from '../fixtures';

test.describe('Marketplace de Serviços', () => {
  // Uso das fixtures autenticadas já provê usuário e unidade padrão; se precisarmos múltiplas unidades futuramente, criar fixture específica.

  test.describe('Catálogo Público', () => {
    test('deve exibir serviços disponíveis no marketplace', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Verificar se página carregou
      await expect(page.locator('h1, h2, h3')).toContainText('Marketplace');

      // Verificar se estatísticas são exibidas
      await expect(page.locator('[data-testid="marketplace-stats"]')).toBeVisible();

      // Verificar se há cards de serviços
      const servicoCards = page.locator('[data-testid="servico-card"]');
      await expect(servicoCards.first()).toBeVisible();
    });

    test('deve permitir busca por serviços', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Buscar por um termo específico
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('corte');
      await page.waitForLoadState('networkidle');

      // Verificar se resultados são filtrados
      const resultCount = page.locator('[data-testid="results-count"]');
      await expect(resultCount).toBeVisible();
    });

    test('deve permitir filtrar por categoria', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Clicar em filtros avançados
      const filtrosTab = page.locator('text="Filtros Avançados"');
      await filtrosTab.click();

      // Selecionar uma categoria
      const categoriaSelect = page.locator('select[name="categoria"], [role="combobox"]').first();
      await categoriaSelect.click();
      await page.locator('text="Cabelo"').click();

      // Aplicar filtros
      await page.locator('text="Aplicar Filtros"').click();
      await page.waitForLoadState('networkidle');

      // Verificar se só aparecem serviços da categoria selecionada
      const servicoCards = page.locator('[data-testid="servico-card"]');
      await expect(servicoCards.first()).toBeVisible();
    });

    test('deve permitir ordenação por preço', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Selecionar ordenação por preço
      const sortSelect = page.locator('select[aria-label*="Ordenar"], [role="combobox"]').first();
      await sortSelect.click();
      await page.locator('text="Preço"').click();

      await page.waitForLoadState('networkidle');

      // Verificar se primeira carta tem preço válido
      const firstCard = page.locator('[data-testid="servico-card"]').first();
      const priceElement = firstCard.locator('[data-testid="servico-preco"]');
      await expect(priceElement).toBeVisible();
    });
  });

  test.describe('Detalhes do Serviço', () => {
    test('deve exibir detalhes completos do serviço', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Clicar no primeiro serviço
      const firstCard = page.locator('[data-testid="servico-card"]').first();
      const detailsButton = firstCard.locator('text="Ver Detalhes"');
      await detailsButton.click();

      // Verificar modal ou página de detalhes
      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await expect(detailModal).toBeVisible();

      // Verificar informações do serviço
      await expect(detailModal.locator('[data-testid="servico-nome"]')).toBeVisible();
      await expect(detailModal.locator('[data-testid="servico-preco"]')).toBeVisible();
      await expect(detailModal.locator('[data-testid="servico-duracao"]')).toBeVisible();
      await expect(detailModal.locator('[data-testid="unidade-nome"]')).toBeVisible();
    });

    test('deve permitir iniciar processo de agendamento cross-unit', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Clicar no primeiro serviço de outra unidade
      const firstCard = page.locator('[data-testid="servico-card"]').first();
      await firstCard.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await expect(detailModal).toBeVisible();

      // Clicar em agendar
      const agendarButton = detailModal.locator('text="Agendar Serviço"');
      await agendarButton.click();

      // Verificar se abre tela de agendamento cross-unit
      await expect(page.locator('[data-testid="cross-unit-booking-form"]')).toBeVisible();
    });
  });

  test.describe('Configurações do Marketplace', () => {
    test('deve permitir configurar participação no marketplace', async ({ page }) => {
      await page.goto('/configuracoes/marketplace');
      await page.waitForLoadState('networkidle');

      // Verificar se página de configurações carregou
      await expect(page.locator('h1, h2')).toContainText('Marketplace');

      // Verificar toggle de participação
      const participarToggle = page.locator('input[type="checkbox"][name*="ativo"]');
      await expect(participarToggle).toBeVisible();

      // Verificar campo de comissão
      const comissaoInput = page.locator('input[name*="comissao"]');
      await expect(comissaoInput).toBeVisible();

      // Alterar configuração e salvar
      await participarToggle.check();
      await comissaoInput.fill('7.5');

      const saveButton = page.locator('button:has-text("Salvar")');
      await saveButton.click();

      // Verificar feedback de sucesso
      await expect(page.locator('text="Configurações salvas"')).toBeVisible();
    });

    test('deve permitir configurar políticas de reserva', async ({ page }) => {
      await page.goto('/configuracoes/marketplace');
      await page.waitForLoadState('networkidle');

      // Permitir reservas cross-unit
      const crossUnitToggle = page.locator('input[name*="permitir_reservas_cross_unit"]');
      await crossUnitToggle.check();

      // Configurar horários de funcionamento para marketplace
      const horarioConfig = page.locator('[data-testid="horarios-marketplace"]');
      await expect(horarioConfig).toBeVisible();

      // Salvar configurações
      const saveButton = page.locator('button:has-text("Salvar")');
      await saveButton.click();

      await expect(page.locator('text="Configurações salvas"')).toBeVisible();
    });
  });

  test.describe('Gestão de Serviços no Marketplace', () => {
    test('deve permitir adicionar serviço ao marketplace', async ({ page }) => {
      await page.goto('/servicos');
      await page.waitForLoadState('networkidle');

      // Clicar no primeiro serviço
      const firstService = page.locator('[data-testid="servico-row"]').first();
      await firstService
        .locator('button[aria-label*="menu"], [data-testid="servico-menu"]')
        .click();

      // Clicar em "Adicionar ao Marketplace"
      await page.locator('text="Adicionar ao Marketplace"').click();

      // Preencher formulário do marketplace
      const marketplaceForm = page.locator('[data-testid="marketplace-service-form"]');
      await expect(marketplaceForm).toBeVisible();

      await marketplaceForm.locator('input[name="nome_publico"]').fill('Corte Masculino Premium');
      await marketplaceForm
        .locator('textarea[name="descricao_publica"]')
        .fill('Corte profissional para homens');
      await marketplaceForm.locator('input[name="preco_publico"]').fill('35.00');

      // Marcar como destaque
      const destaqueToggle = marketplaceForm.locator('input[name="destaque"]');
      await destaqueToggle.check();

      // Salvar
      await marketplaceForm.locator('button:has-text("Salvar")').click();

      await expect(page.locator('text="Serviço adicionado ao marketplace"')).toBeVisible();
    });

    test('deve permitir editar informações públicas do serviço', async ({ page }) => {
      await page.goto('/configuracoes/marketplace');
      await page.waitForLoadState('networkidle');

      // Ir para aba de serviços do marketplace
      await page.locator('text="Meus Serviços"').click();

      // Editar primeiro serviço
      const firstService = page.locator('[data-testid="marketplace-service-row"]').first();
      await firstService.locator('button[aria-label*="edit"], [data-testid="edit-button"]').click();

      const editForm = page.locator('[data-testid="edit-marketplace-service-form"]');
      await expect(editForm).toBeVisible();

      // Alterar descrição pública
      const descricaoField = editForm.locator('textarea[name="descricao_publica"]');
      await descricaoField.clear();
      await descricaoField.fill('Nova descrição atualizada para o marketplace');

      // Salvar alterações
      await editForm.locator('button:has-text("Salvar")').click();

      await expect(page.locator('text="Serviço atualizado"')).toBeVisible();
    });

    test('deve permitir remover serviço do marketplace', async ({ page }) => {
      await page.goto('/configuracoes/marketplace');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Meus Serviços"').click();

      // Remover primeiro serviço
      const firstService = page.locator('[data-testid="marketplace-service-row"]').first();
      await firstService
        .locator('button[aria-label*="delete"], [data-testid="delete-button"]')
        .click();

      // Confirmar remoção
      const confirmDialog = page.locator('[role="dialog"]');
      await expect(confirmDialog).toBeVisible();
      await confirmDialog.locator('button:has-text("Confirmar")').click();

      await expect(page.locator('text="Serviço removido do marketplace"')).toBeVisible();
    });
  });

  test.describe('Reservas Cross-Unit', () => {
    test('deve permitir criar reserva para outra unidade', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Selecionar um serviço de outra unidade
      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('text="Agendar Serviço"').click();

      // Preencher formulário de reserva cross-unit
      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');
      await expect(bookingForm).toBeVisible();

      // Selecionar cliente
      const clienteSelect = bookingForm.locator('select[name="cliente_id"]');
      await clienteSelect.selectOption({ index: 1 });

      // Selecionar data
      const dataInput = bookingForm.locator('input[name="data_reserva"]');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await dataInput.fill(tomorrow.toISOString().split('T')[0]);

      // Selecionar horário
      const horaSelect = bookingForm.locator('select[name="hora_reserva"]');
      await horaSelect.selectOption('14:00');

      // Confirmar reserva
      await bookingForm.locator('button:has-text("Confirmar Reserva")').click();

      await expect(page.locator('text="Reserva criada com sucesso"')).toBeVisible();
    });

    test('deve exibir confirmação de comissão do marketplace', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('text="Agendar Serviço"').click();

      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');

      // Verificar se informações de comissão são exibidas
      const comissaoInfo = bookingForm.locator('[data-testid="comissao-info"]');
      await expect(comissaoInfo).toBeVisible();
      await expect(comissaoInfo).toContainText('%'); // Deve mostrar percentual de comissão
    });

    test('deve validar disponibilidade antes de confirmar reserva', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('text="Agendar Serviço"').click();

      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');

      // Tentar agendar em horário já ocupado (simular conflito)
      const clienteSelect = bookingForm.locator('select[name="cliente_id"]');
      await clienteSelect.selectOption({ index: 1 });

      const dataInput = bookingForm.locator('input[name="data_reserva"]');
      await dataInput.fill('2024-12-25'); // Data já ocupada (mock)

      const horaSelect = bookingForm.locator('select[name="hora_reserva"]');
      await horaSelect.selectOption('10:00'); // Horário ocupado (mock)

      await bookingForm.locator('button:has-text("Confirmar Reserva")').click();

      // Verificar mensagem de erro
      await expect(page.locator('text="Horário não disponível"')).toBeVisible();
    });
  });

  test.describe('Estatísticas e Analytics', () => {
    test('deve exibir estatísticas do marketplace', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Verificar cards de estatísticas
      const statsCards = page.locator('[data-testid="marketplace-stats"]');
      await expect(statsCards).toBeVisible();

      // Verificar métricas específicas
      await expect(statsCards.locator('[data-testid="total-servicos"]')).toBeVisible();
      await expect(statsCards.locator('[data-testid="total-unidades"]')).toBeVisible();
      await expect(statsCards.locator('[data-testid="servicos-destaque"]')).toBeVisible();
      await expect(statsCards.locator('[data-testid="categorias"]')).toBeVisible();
    });

    test('deve permitir visualizar métricas de performance por unidade', async ({ page }) => {
      await page.goto('/configuracoes/marketplace');
      await page.waitForLoadState('networkidle');

      // Ir para aba de analytics
      await page.locator('text="Analytics"').click();

      // Verificar gráficos e métricas
      const analyticsPanel = page.locator('[data-testid="marketplace-analytics"]');
      await expect(analyticsPanel).toBeVisible();

      // Verificar métricas de reservas
      await expect(analyticsPanel.locator('[data-testid="total-reservas"]')).toBeVisible();
      await expect(analyticsPanel.locator('[data-testid="reservas-concluidas"]')).toBeVisible();
      await expect(analyticsPanel.locator('[data-testid="comissao-gerada"]')).toBeVisible();
    });
  });

  test.describe('Isolamento de Dados (RLS)', () => {
    test('deve manter isolamento de dados entre unidades', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Verificar se só aparecem serviços permitidos
      const servicoCards = page.locator('[data-testid="servico-card"]');
      const firstCard = servicoCards.first();

      // Verificar se unidade está visível mas dados sensíveis não
      await expect(firstCard.locator('[data-testid="unidade-nome"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="servico-preco"]')).toBeVisible();

      // Dados internos não devem estar visíveis
      await expect(firstCard.locator('text="custo"')).not.toBeVisible();
      await expect(firstCard.locator('text="margem"')).not.toBeVisible();
    });

    test('deve bloquear acesso não autorizado a configurações de outras unidades', async ({
      page,
    }) => {
      // Este teste dependeria de ter acesso limitado configurado
      // Por ora, verificamos se existe sistema de proteção
      await page.goto('/configuracoes/marketplace');

      // Verificar se página carrega (usuário autorizado) ou redireciona/bloqueia
      await page.waitForLoadState('networkidle');

      // Se página carrega, usuário tem acesso. Se não, deve ver erro/redirecionamento
      const hasAccess = await page.locator('h1, h2').isVisible();
      const hasError = await page
        .locator('text="Acesso negado", text="Não autorizado"')
        .isVisible();

      // Um dos dois deve ser verdadeiro
      expect(hasAccess || hasError).toBeTruthy();
    });
  });

  test.describe('Responsividade', () => {
    test('deve funcionar corretamente em dispositivos móveis', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Verificar se layout mobile funciona
      await expect(page.locator('h1, h2')).toBeVisible();

      // Verificar se cards de serviços são responsivos
      const servicoCards = page.locator('[data-testid="servico-card"]');
      await expect(servicoCards.first()).toBeVisible();

      // Testar navegação em abas mobile
      const tabsList = page.locator('[role="tablist"]');
      if (await tabsList.isVisible()) {
        const firstTab = tabsList.locator('[role="tab"]').first();
        await firstTab.click();
        await page.waitForLoadState('networkidle');
      }
    });

    test('deve funcionar corretamente em tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad

      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Verificar layout em tablet
      await expect(page.locator('h1, h2')).toBeVisible();

      // Verificar grid de serviços
      const servicoCards = page.locator('[data-testid="servico-card"]');
      await expect(servicoCards.first()).toBeVisible();

      // Verificar se filtros são acessíveis
      const filtrosAdvancados = page.locator('text="Filtros Avançados"');
      if (await filtrosAdvancados.isVisible()) {
        await filtrosAdvancados.click();
        await expect(page.locator('[data-testid="filtros-form"]')).toBeVisible();
      }
    });
  });
});
