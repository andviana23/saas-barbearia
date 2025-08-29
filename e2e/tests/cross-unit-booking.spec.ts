import { test, expect } from '../fixtures';

test.describe('Cross-Unit Booking (Agendamentos Cross-Unidade)', () => {
  // Futuro: criar fixture multiUnit se precisarmos garantir 2+ unidades reais populadas.

  test.describe('Descoberta Cross-Unit', () => {
    test('deve permitir descobrir serviços de outras unidades via marketplace', async ({
      page,
    }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Verificar se aparecem serviços de múltiplas unidades
      const servicoCards = page.locator('[data-testid="servico-card"]');
      await expect(servicoCards.first()).toBeVisible();

      // Verificar se há serviços de diferentes unidades
      const unidadeNames = servicoCards.locator('[data-testid="unidade-nome"]');
      await expect(unidadeNames.first()).toBeVisible();

      // Contar quantas unidades diferentes aparecem
      const unidadeTexts = await unidadeNames.allTextContents();
      const uniqueUnidades = new Set(unidadeTexts);

      // Deve haver pelo menos 2 unidades diferentes
      expect(uniqueUnidades.size).toBeGreaterThanOrEqual(2);
    });

    test('deve filtrar serviços por unidade específica', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Usar filtro de unidade
      await page.locator('text="Filtros Avançados"').click();

      const unidadeFilter = page.locator('select[name="unidade_id"]');
      await unidadeFilter.selectOption({ index: 1 }); // Selecionar primeira unidade

      await page.locator('button:has-text("Aplicar Filtros")').click();
      await page.waitForLoadState('networkidle');

      // Verificar se só aparecem serviços da unidade selecionada
      const servicoCards = page.locator('[data-testid="servico-card"]');
      if ((await servicoCards.count()) > 0) {
        const unidadeNames = servicoCards.locator('[data-testid="unidade-nome"]');
        const unidadeTexts = await unidadeNames.allTextContents();
        const uniqueUnidades = new Set(unidadeTexts);

        // Deve haver apenas 1 unidade após filtro
        expect(uniqueUnidades.size).toBe(1);
      }
    });

    test('deve exibir informações de distância/localização', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const servicoCards = page.locator('[data-testid="servico-card"]');
      const firstCard = servicoCards.first();

      // Verificar se informações de localização são exibidas
      await expect(firstCard.locator('[data-testid="unidade-endereco"]')).toBeVisible();

      // Verificar se há indicador de unidade diferente
      const crossUnitIndicator = firstCard.locator('[data-testid="cross-unit-indicator"]');
      if (await crossUnitIndicator.isVisible()) {
        await expect(crossUnitIndicator).toContainText('Outra unidade');
      }
    });
  });

  test.describe('Processo de Agendamento Cross-Unit', () => {
    test('deve iniciar fluxo de agendamento cross-unit', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Selecionar serviço de outra unidade
      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await expect(detailModal).toBeVisible();

      // Verificar se há indicação de cross-unit
      await expect(detailModal.locator('[data-testid="cross-unit-warning"]')).toBeVisible();
      await expect(detailModal).toContainText('unidade diferente');

      // Iniciar agendamento
      await detailModal.locator('button:has-text("Agendar Serviço")').click();

      // Verificar se abre formulário de agendamento cross-unit
      const crossUnitForm = page.locator('[data-testid="cross-unit-booking-form"]');
      await expect(crossUnitForm).toBeVisible();
    });

    test('deve validar disponibilidade cross-unit', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Iniciar processo de agendamento
      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('button:has-text("Agendar Serviço")').click();

      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');

      // Selecionar cliente
      const clienteSelect = bookingForm.locator('select[name="cliente_id"]');
      await clienteSelect.selectOption({ index: 1 });

      // Selecionar data futura
      const dataInput = bookingForm.locator('input[name="data_reserva"]');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // Uma semana no futuro
      await dataInput.fill(futureDate.toISOString().split('T')[0]);

      // Verificar se horários disponíveis são carregados
      const horaSelect = bookingForm.locator('select[name="hora_reserva"]');
      await expect(horaSelect).toBeVisible();

      // Deve haver opções de horário disponíveis
      const horariosOptions = horaSelect.locator('option');
      const optionsCount = await horariosOptions.count();
      expect(optionsCount).toBeGreaterThan(1); // Pelo menos "Selecione" + 1 horário
    });

    test('deve exibir informações de comissão do marketplace', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('button:has-text("Agendar Serviço")').click();

      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');

      // Verificar se informações de comissão são exibidas
      const comissaoSection = bookingForm.locator('[data-testid="comissao-info"]');
      await expect(comissaoSection).toBeVisible();

      // Verificar elementos da comissão
      await expect(comissaoSection.locator('[data-testid="comissao-percentual"]')).toContainText(
        '%',
      );
      await expect(comissaoSection.locator('[data-testid="preco-total"]')).toBeVisible();
      await expect(comissaoSection.locator('[data-testid="comissao-valor"]')).toBeVisible();
    });

    test('deve calcular valores corretamente com comissão', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const crossUnitService = page.locator('[data-testid="servico-card"]').first();

      // Capturar preço do serviço na tela de listagem
      const precoElement = crossUnitService.locator('[data-testid="servico-preco"]');
      const precoText = await precoElement.textContent();
      const preco = parseFloat(precoText?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('button:has-text("Agendar Serviço")').click();

      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');
      const comissaoSection = bookingForm.locator('[data-testid="comissao-info"]');

      // Verificar cálculo da comissão
      const comissaoPercentualText = await comissaoSection
        .locator('[data-testid="comissao-percentual"]')
        .textContent();
      const comissaoPercentual = parseFloat(comissaoPercentualText?.replace('%', '') || '0');

      const comissaoValorText = await comissaoSection
        .locator('[data-testid="comissao-valor"]')
        .textContent();
      const comissaoValor = parseFloat(
        comissaoValorText?.replace(/[^\d.,]/g, '').replace(',', '.') || '0',
      );

      // Verificar se cálculo está correto (dentro de margem de erro para formatação)
      const comissaoEsperada = preco * (comissaoPercentual / 100);
      expect(Math.abs(comissaoValor - comissaoEsperada)).toBeLessThan(0.01);
    });

    test('deve criar reserva cross-unit com sucesso', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Processo completo de agendamento
      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('button:has-text("Agendar Serviço")').click();

      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');

      // Preencher todos os campos obrigatórios
      await bookingForm.locator('select[name="cliente_id"]').selectOption({ index: 1 });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      await bookingForm
        .locator('input[name="data_reserva"]')
        .fill(futureDate.toISOString().split('T')[0]);

      await bookingForm.locator('select[name="hora_reserva"]').selectOption('14:00');

      // Adicionar observações
      const observacoesField = bookingForm.locator('textarea[name="observacoes"]');
      if (await observacoesField.isVisible()) {
        await observacoesField.fill('Agendamento via marketplace - teste cross-unit');
      }

      // Confirmar reserva
      await bookingForm.locator('button:has-text("Confirmar Reserva")').click();

      // Verificar sucesso
      await expect(page.locator('text="Reserva criada com sucesso"')).toBeVisible();

      // Verificar se há informações sobre a reserva
      const successMessage = page.locator('[data-testid="success-message"]');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toContainText('cross-unit');
      }
    });

    test('deve impedir agendamento se unidade não permite cross-unit', async ({ page }) => {
      // Este teste assumiria uma unidade configurada para NÃO permitir cross-unit
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Tentar agendar em serviço que não permite cross-unit
      const restrictedService = page.locator(
        '[data-testid="servico-card"][data-cross-unit="false"]',
      );

      if (await restrictedService.isVisible()) {
        await restrictedService.locator('text="Ver Detalhes"').click();

        const detailModal = page.locator('[data-testid="servico-detail-modal"]');

        // Botão de agendar deve estar desabilitado ou com aviso
        const agendarButton = detailModal.locator('button:has-text("Agendar Serviço")');

        if (await agendarButton.isVisible()) {
          await agendarButton.click();

          // Deve mostrar mensagem de erro
          await expect(page.locator('text="não permite agendamentos cross-unit"')).toBeVisible();
        } else {
          // Ou o botão não deve estar disponível
          await expect(detailModal.locator('text="Agendamento não disponível"')).toBeVisible();
        }
      }
    });
  });

  test.describe('Gestão de Reservas Cross-Unit', () => {
    test('deve exibir reservas cross-unit na agenda', async ({ page }) => {
      await page.goto('/agenda');
      await page.waitForLoadState('networkidle');

      // Verificar se há indicadores de reservas cross-unit
      const agendaItems = page.locator('[data-testid="agenda-item"]');

      if ((await agendaItems.count()) > 0) {
        const crossUnitItems = agendaItems.locator('[data-testid="cross-unit-indicator"]');

        if ((await crossUnitItems.count()) > 0) {
          await expect(crossUnitItems.first()).toBeVisible();
          await expect(crossUnitItems.first()).toContainText('Marketplace');
        }
      }
    });

    test('deve permitir visualizar detalhes da reserva cross-unit', async ({ page }) => {
      await page.goto('/agenda');
      await page.waitForLoadState('networkidle');

      // Clicar em uma reserva cross-unit
      const crossUnitReserva = page
        .locator('[data-testid="agenda-item"][data-cross-unit="true"]')
        .first();

      if (await crossUnitReserva.isVisible()) {
        await crossUnitReserva.click();

        const detailsModal = page.locator('[data-testid="reserva-details-modal"]');
        await expect(detailsModal).toBeVisible();

        // Verificar informações específicas de cross-unit
        await expect(detailsModal.locator('[data-testid="unidade-origem"]')).toBeVisible();
        await expect(detailsModal.locator('[data-testid="unidade-destino"]')).toBeVisible();
        await expect(detailsModal.locator('[data-testid="comissao-marketplace"]')).toBeVisible();
      }
    });

    test('deve permitir atualizar status da reserva cross-unit', async ({ page }) => {
      await page.goto('/agenda');
      await page.waitForLoadState('networkidle');

      const crossUnitReserva = page
        .locator('[data-testid="agenda-item"][data-cross-unit="true"]')
        .first();

      if (await crossUnitReserva.isVisible()) {
        await crossUnitReserva.click();

        const detailsModal = page.locator('[data-testid="reserva-details-modal"]');

        // Alterar status
        const statusSelect = detailsModal.locator('select[name="status"]');
        if (await statusSelect.isVisible()) {
          await statusSelect.selectOption('em_andamento');

          const saveButton = detailsModal.locator('button:has-text("Salvar")');
          await saveButton.click();

          await expect(page.locator('text="Status atualizado"')).toBeVisible();
        }
      }
    });

    test('deve exibir reservas cross-unit no relatório de reservas', async ({ page }) => {
      await page.goto('/reservas');
      await page.waitForLoadState('networkidle');

      // Verificar filtro para reservas cross-unit
      const crossUnitFilter = page.locator('select[name="tipo"], select[name="origem"]');

      if (await crossUnitFilter.isVisible()) {
        await crossUnitFilter.selectOption('cross-unit');

        const aplicarFiltro = page.locator('button:has-text("Aplicar")');
        await aplicarFiltro.click();

        await page.waitForLoadState('networkidle');

        // Verificar se há reservas cross-unit listadas
        const reservasTable = page.locator('[data-testid="reservas-table"]');
        await expect(reservasTable).toBeVisible();

        const crossUnitRows = reservasTable.locator(
          '[data-testid="reserva-row"][data-cross-unit="true"]',
        );
        if ((await crossUnitRows.count()) > 0) {
          await expect(crossUnitRows.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Financeiro Cross-Unit', () => {
    test('deve calcular comissão do marketplace corretamente', async ({ page }) => {
      await page.goto('/financeiro');
      await page.waitForLoadState('networkidle');

      // Ir para seção de comissões
      const comissoesTab = page.locator('text="Comissões", text="Marketplace"');

      if (await comissoesTab.isVisible()) {
        await comissoesTab.click();

        const comissoesTable = page.locator('[data-testid="comissoes-table"]');
        await expect(comissoesTable).toBeVisible();

        // Verificar se há registros de comissão
        const comissaoRows = comissoesTable.locator('[data-testid="comissao-row"]');

        if ((await comissaoRows.count()) > 0) {
          const firstRow = comissaoRows.first();

          // Verificar informações da comissão
          await expect(firstRow.locator('[data-testid="valor-servico"]')).toBeVisible();
          await expect(firstRow.locator('[data-testid="percentual-comissao"]')).toBeVisible();
          await expect(firstRow.locator('[data-testid="valor-comissao"]')).toBeVisible();
        }
      }
    });

    test('deve exibir receita gerada via marketplace', async ({ page }) => {
      await page.goto('/relatorios/financeiro');
      await page.waitForLoadState('networkidle');

      // Verificar seção de receita do marketplace
      const marketplaceRevenueSection = page.locator('[data-testid="marketplace-revenue"]');

      if (await marketplaceRevenueSection.isVisible()) {
        await expect(
          marketplaceRevenueSection.locator('[data-testid="total-comissoes"]'),
        ).toBeVisible();
        await expect(
          marketplaceRevenueSection.locator('[data-testid="total-reservas-marketplace"]'),
        ).toBeVisible();
        await expect(
          marketplaceRevenueSection.locator('[data-testid="ticket-medio-marketplace"]'),
        ).toBeVisible();
      }
    });

    test('deve permitir filtrar receitas por origem (marketplace vs direta)', async ({ page }) => {
      await page.goto('/relatorios/financeiro');
      await page.waitForLoadState('networkidle');

      // Aplicar filtro por origem
      const origemFilter = page.locator('select[name="origem"]');

      if (await origemFilter.isVisible()) {
        await origemFilter.selectOption('marketplace');

        const aplicarFiltro = page.locator('button:has-text("Aplicar")');
        await aplicarFiltro.click();

        await page.waitForLoadState('networkidle');

        // Verificar se só aparecem dados do marketplace
        const receitasTable = page.locator('[data-testid="receitas-table"]');
        await expect(receitasTable).toBeVisible();

        const marketplaceRows = receitasTable.locator(
          '[data-testid="receita-row"][data-origem="marketplace"]',
        );
        if ((await marketplaceRows.count()) > 0) {
          await expect(marketplaceRows.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Notificações Cross-Unit', () => {
    test('deve notificar unidade de destino sobre nova reserva', async ({ page }) => {
      // Simular processo de criação de reserva cross-unit
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('button:has-text("Agendar Serviço")').click();

      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');

      // Preencher e confirmar reserva
      await bookingForm.locator('select[name="cliente_id"]').selectOption({ index: 1 });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      await bookingForm
        .locator('input[name="data_reserva"]')
        .fill(futureDate.toISOString().split('T')[0]);

      await bookingForm.locator('select[name="hora_reserva"]').selectOption('15:00');
      await bookingForm.locator('button:has-text("Confirmar Reserva")').click();

      await expect(page.locator('text="Reserva criada com sucesso"')).toBeVisible();

      // Verificar se há indicação de notificação enviada
      const notificationIndicator = page.locator('[data-testid="notification-sent"]');
      if (await notificationIndicator.isVisible()) {
        await expect(notificationIndicator).toContainText('Unidade notificada');
      }
    });

    test('deve exibir alertas para reservas cross-unit próximas', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Verificar se há alertas de reservas cross-unit
      const alertsSection = page.locator('[data-testid="alerts-section"]');

      if (await alertsSection.isVisible()) {
        const crossUnitAlerts = alertsSection.locator('[data-testid="cross-unit-alert"]');

        if ((await crossUnitAlerts.count()) > 0) {
          await expect(crossUnitAlerts.first()).toBeVisible();
          await expect(crossUnitAlerts.first()).toContainText('marketplace');
        }
      }
    });
  });

  test.describe('Isolamento e Segurança Cross-Unit', () => {
    test('deve manter isolamento de dados entre unidades origem e destino', async ({ page }) => {
      await page.goto('/reservas');
      await page.waitForLoadState('networkidle');

      // Filtrar por reservas cross-unit
      const tipoFilter = page.locator('select[name="tipo"]');
      if (await tipoFilter.isVisible()) {
        await tipoFilter.selectOption('cross-unit');
        await page.locator('button:has-text("Aplicar")').click();
        await page.waitForLoadState('networkidle');
      }

      // Verificar se só aparecem dados autorizados
      const reservasTable = page.locator('[data-testid="reservas-table"]');
      const reservaRows = reservasTable.locator('[data-testid="reserva-row"]');

      if ((await reservaRows.count()) > 0) {
        const firstRow = reservaRows.first();

        // Dados públicos devem estar visíveis
        await expect(firstRow.locator('[data-testid="cliente-nome"]')).toBeVisible();
        await expect(firstRow.locator('[data-testid="servico-nome"]')).toBeVisible();

        // Dados sensíveis não devem vazar
        await expect(
          firstRow.locator('text="custo_interno", text="margem_lucro"'),
        ).not.toBeVisible();
      }
    });

    test('deve validar permissões para modificar reservas cross-unit', async ({ page }) => {
      await page.goto('/agenda');
      await page.waitForLoadState('networkidle');

      const crossUnitReserva = page
        .locator('[data-testid="agenda-item"][data-cross-unit="true"]')
        .first();

      if (await crossUnitReserva.isVisible()) {
        await crossUnitReserva.click();

        const detailsModal = page.locator('[data-testid="reserva-details-modal"]');

        // Verificar se botões de edição respeitam permissões
        const editButtons = detailsModal.locator(
          'button:has-text("Editar"), button:has-text("Cancelar")',
        );

        if ((await editButtons.count()) > 0) {
          // Botões devem estar presentes se usuário tem permissão
          await expect(editButtons.first()).toBeVisible();
        } else {
          // Ou deve haver indicação de permissão limitada
          await expect(detailsModal.locator('text="Apenas visualização"')).toBeVisible();
        }
      }
    });

    test('deve registrar ações cross-unit na auditoria', async ({ page }) => {
      // Fazer uma ação que deve gerar log de auditoria
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Visualizar um serviço (deve gerar log)
      const firstService = page.locator('[data-testid="servico-card"]').first();
      await firstService.locator('text="Ver Detalhes"').click();
      await page.waitForLoadState('networkidle');

      // Fechar modal
      const closeButton = page.locator('[data-testid="close-modal"], button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      // Ir para auditoria e verificar se ação foi registrada
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Auditoria"').click();

      const auditoriaTable = page.locator('[data-testid="auditoria-table"]');
      await expect(auditoriaTable).toBeVisible();

      // Verificar se há registros de ações no marketplace
      const auditRows = auditoriaTable.locator('[data-testid="audit-row"]');

      if ((await auditRows.count()) > 0) {
        const marketplaceActions = auditRows.locator(
          ':has-text("marketplace"), :has-text("catalogo")',
        );

        if ((await marketplaceActions.count()) > 0) {
          await expect(marketplaceActions.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Performance Cross-Unit', () => {
    test('deve carregar catálogo marketplace rapidamente', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Deve carregar em menos de 3 segundos
      expect(loadTime).toBeLessThan(3000);

      // Verificar se dados carregaram
      const servicoCards = page.locator('[data-testid="servico-card"]');
      await expect(servicoCards.first()).toBeVisible();
    });

    test('deve validar disponibilidade cross-unit eficientemente', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const crossUnitService = page.locator('[data-testid="servico-card"]').first();
      await crossUnitService.locator('text="Ver Detalhes"').click();

      const detailModal = page.locator('[data-testid="servico-detail-modal"]');
      await detailModal.locator('button:has-text("Agendar Serviço")').click();

      const bookingForm = page.locator('[data-testid="cross-unit-booking-form"]');

      // Selecionar cliente e data
      await bookingForm.locator('select[name="cliente_id"]').selectOption({ index: 1 });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const startValidation = Date.now();
      await bookingForm
        .locator('input[name="data_reserva"]')
        .fill(futureDate.toISOString().split('T')[0]);

      // Aguardar carregamento de horários disponíveis
      await page.waitForLoadState('networkidle');
      const validationTime = Date.now() - startValidation;

      // Validação deve ser rápida (< 2 segundos)
      expect(validationTime).toBeLessThan(2000);

      // Horários devem estar disponíveis
      const horaSelect = bookingForm.locator('select[name="hora_reserva"]');
      const options = horaSelect.locator('option');
      expect(await options.count()).toBeGreaterThan(1);
    });
  });
});
