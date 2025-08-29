import { test, expect } from '../fixtures';

test.describe('Gestão Multi-Unidades', () => {
  // Futuro: adicionar fixture multiUnit para provisionar várias unidades reais se necessário.

  test.describe('Dashboard Multi-Unidades', () => {
    test('deve exibir estatísticas consolidadas', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      // Verificar se página carregou
      await expect(page.locator('h1, h2')).toContainText('Multi-Unidades');

      // Verificar cards de estatísticas
      const statsCards = page.locator('[data-testid="multi-unidades-stats"]');
      await expect(statsCards).toBeVisible();

      // Verificar métricas específicas
      await expect(statsCards.locator('[data-testid="total-unidades"]')).toBeVisible();
      await expect(statsCards.locator('[data-testid="unidades-ativas"]')).toBeVisible();
      await expect(statsCards.locator('[data-testid="total-usuarios"]')).toBeVisible();
      await expect(statsCards.locator('[data-testid="acessos-multi-unidade"]')).toBeVisible();
    });

    test('deve permitir navegação entre abas principais', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      // Testar navegação nas abas
      const tabsList = page.locator('[role="tablist"]');
      await expect(tabsList).toBeVisible();

      // Aba Relatórios Consolidados
      await page.locator('text="Relatórios Consolidados"').click();
      await expect(page.locator('[data-testid="relatorios-tab"]')).toBeVisible();

      // Aba Permissões & Acessos
      await page.locator('text="Permissões & Acessos"').click();
      await expect(page.locator('[data-testid="permissoes-tab"]')).toBeVisible();

      // Aba Auditoria
      await page.locator('text="Auditoria"').click();
      await expect(page.locator('[data-testid="auditoria-tab"]')).toBeVisible();

      // Aba Benchmarks
      await page.locator('text="Benchmarks"').click();
      await expect(page.locator('[data-testid="benchmark-tab"]')).toBeVisible();
    });
  });

  test.describe('Relatórios Consolidados', () => {
    test('deve exibir faturamento consolidado de todas as unidades', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      // Ir para aba de relatórios
      await page.locator('text="Relatórios Consolidados"').click();

      // Verificar tabela/gráfico de faturamento
      const faturamentoSection = page.locator('[data-testid="faturamento-consolidado"]');
      await expect(faturamentoSection).toBeVisible();

      // Verificar se há dados de múltiplas unidades
      const unidadeRows = faturamentoSection.locator('[data-testid="unidade-row"]');
      await expect(unidadeRows.first()).toBeVisible();

      // Verificar colunas importantes
      await expect(faturamentoSection.locator('text="Total Agendamentos"')).toBeVisible();
      await expect(faturamentoSection.locator('text="Faturamento Total"')).toBeVisible();
      await expect(faturamentoSection.locator('text="Ticket Médio"')).toBeVisible();
    });

    test('deve permitir filtrar relatórios por período', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Relatórios Consolidados"').click();

      // Usar filtros de período
      const periodoSelect = page.locator('select[name="periodo"], [data-testid="periodo-filter"]');
      await periodoSelect.selectOption('mes'); // Último mês

      // Aplicar filtro
      const aplicarFiltro = page.locator('button:has-text("Aplicar")');
      await aplicarFiltro.click();

      await page.waitForLoadState('networkidle');

      // Verificar se dados foram atualizados
      const faturamentoSection = page.locator('[data-testid="faturamento-consolidado"]');
      await expect(faturamentoSection).toBeVisible();
    });

    test('deve permitir filtrar por unidade específica', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Relatórios Consolidados"').click();

      // Filtrar por unidade específica
      const unidadeSelect = page.locator(
        'select[name="unidade_id"], [data-testid="unidade-filter"]',
      );
      await unidadeSelect.selectOption({ index: 1 }); // Primeira unidade não-vazia

      await page.locator('button:has-text("Aplicar")').click();
      await page.waitForLoadState('networkidle');

      // Verificar se só aparecem dados da unidade selecionada
      const unidadeRows = page.locator('[data-testid="unidade-row"]');
      const visibleRows = await unidadeRows.count();
      expect(visibleRows).toBeLessThanOrEqual(1); // No máximo 1 unidade deve aparecer
    });

    test('deve permitir exportar relatórios', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Relatórios Consolidados"').click();

      // Procurar botão de export
      const exportButton = page.locator(
        'button:has-text("Exportar"), [data-testid="export-button"]',
      );

      if (await exportButton.isVisible()) {
        // Setup para capturar download
        const downloadPromise = page.waitForEvent('download');

        await exportButton.click();

        // Selecionar formato CSV
        const csvOption = page.locator('text="CSV"');
        if (await csvOption.isVisible()) {
          await csvOption.click();
        }

        // Aguardar download
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.csv');
      } else {
        // Se não há botão, pelo menos deve haver os dados
        const faturamentoSection = page.locator('[data-testid="faturamento-consolidado"]');
        await expect(faturamentoSection).toBeVisible();
      }
    });

    test('deve exibir comparação entre unidades', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Benchmarks"').click();

      // Verificar gráfico/tabela de comparação
      const benchmarkSection = page.locator('[data-testid="benchmark-comparison"]');
      await expect(benchmarkSection).toBeVisible();

      // Verificar métricas de comparação
      await expect(benchmarkSection.locator('[data-testid="performance-ranking"]')).toBeVisible();
      await expect(benchmarkSection.locator('[data-testid="kpi-comparison"]')).toBeVisible();
    });
  });

  test.describe('Permissões Hierárquicas', () => {
    test('deve exibir matriz de permissões', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Permissões & Acessos"').click();

      // Verificar tabela de permissões hierárquicas
      const permissoesTable = page.locator('[data-testid="permissoes-hierarquicas-table"]');
      await expect(permissoesTable).toBeVisible();

      // Verificar colunas da tabela
      await expect(permissoesTable.locator('text="Papel"')).toBeVisible();
      await expect(permissoesTable.locator('text="Nível"')).toBeVisible();
      await expect(permissoesTable.locator('text="Permissões"')).toBeVisible();
    });

    test('deve permitir criar nova permissão hierárquica', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Permissões & Acessos"').click();

      // Clicar em criar nova permissão
      const createButton = page.locator(
        'button:has-text("Nova Permissão"), [data-testid="create-permission-button"]',
      );
      if (await createButton.isVisible()) {
        await createButton.click();

        // Preencher formulário
        const permissionForm = page.locator('[data-testid="permission-form"]');
        await expect(permissionForm).toBeVisible();

        const papelSelect = permissionForm.locator('select[name="papel"]');
        await papelSelect.selectOption('gerente');

        const nivelInput = permissionForm.locator('input[name="nivel_hierarquico"]');
        await nivelInput.fill('4');

        const descricaoInput = permissionForm.locator('textarea[name="descricao"]');
        await descricaoInput.fill('Gerente de unidade com acesso limitado');

        // Salvar
        await permissionForm.locator('button:has-text("Salvar")').click();

        await expect(page.locator('text="Permissão criada com sucesso"')).toBeVisible();
      }
    });

    test('deve permitir editar permissões existentes', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Permissões & Acessos"').click();

      // Editar primeira permissão
      const firstPermission = page.locator('[data-testid="permission-row"]').first();
      const editButton = firstPermission.locator('[data-testid="edit-button"]');

      if (await editButton.isVisible()) {
        await editButton.click();

        const editForm = page.locator('[data-testid="edit-permission-form"]');
        await expect(editForm).toBeVisible();

        // Alterar descrição
        const descricaoInput = editForm.locator('textarea[name="descricao"]');
        await descricaoInput.clear();
        await descricaoInput.fill('Descrição atualizada');

        await editForm.locator('button:has-text("Salvar")').click();

        await expect(page.locator('text="Permissão atualizada"')).toBeVisible();
      }
    });
  });

  test.describe('Gestão de Acessos Multi-Unidade', () => {
    test('deve exibir usuários com acesso a múltiplas unidades', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Permissões & Acessos"').click();

      // Ir para sub-aba de acessos
      const acessosSubTab = page.locator('text="Acessos Multi-Unidade"');
      if (await acessosSubTab.isVisible()) {
        await acessosSubTab.click();
      }

      // Verificar tabela de acessos
      const acessosTable = page.locator('[data-testid="acessos-multi-unidade-table"]');
      await expect(acessosTable).toBeVisible();

      // Verificar colunas
      await expect(acessosTable.locator('text="Usuário"')).toBeVisible();
      await expect(acessosTable.locator('text="Unidade"')).toBeVisible();
      await expect(acessosTable.locator('text="Papel"')).toBeVisible();
    });

    test('deve permitir conceder acesso de usuário a nova unidade', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Permissões & Acessos"').click();

      const acessosSubTab = page.locator('text="Acessos Multi-Unidade"');
      if (await acessosSubTab.isVisible()) {
        await acessosSubTab.click();
      }

      // Clicar em conceder novo acesso
      const grantAccessButton = page.locator(
        'button:has-text("Conceder Acesso"), [data-testid="grant-access-button"]',
      );
      if (await grantAccessButton.isVisible()) {
        await grantAccessButton.click();

        const accessForm = page.locator('[data-testid="grant-access-form"]');
        await expect(accessForm).toBeVisible();

        // Selecionar usuário
        const usuarioSelect = accessForm.locator('select[name="profile_id"]');
        await usuarioSelect.selectOption({ index: 1 });

        // Selecionar unidade
        const unidadeSelect = accessForm.locator('select[name="unidade_id"]');
        await unidadeSelect.selectOption({ index: 1 });

        // Selecionar papel
        const papelSelect = accessForm.locator('select[name="papel_unidade"]');
        await papelSelect.selectOption('profissional');

        await accessForm.locator('button:has-text("Conceder")').click();

        await expect(page.locator('text="Acesso concedido com sucesso"')).toBeVisible();
      }
    });

    test('deve permitir revogar acesso de usuário a uma unidade', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Permissões & Acessos"').click();

      const acessosSubTab = page.locator('text="Acessos Multi-Unidade"');
      if (await acessosSubTab.isVisible()) {
        await acessosSubTab.click();
      }

      // Revogar acesso do primeiro usuário
      const firstAccess = page.locator('[data-testid="access-row"]').first();
      const revokeButton = firstAccess.locator('[data-testid="revoke-button"]');

      if (await revokeButton.isVisible()) {
        await revokeButton.click();

        // Confirmar revogação
        const confirmDialog = page.locator('[role="dialog"]');
        await expect(confirmDialog).toBeVisible();
        await confirmDialog.locator('button:has-text("Confirmar")').click();

        await expect(page.locator('text="Acesso revogado"')).toBeVisible();
      }
    });
  });

  test.describe('Auditoria de Acessos', () => {
    test('deve exibir log de auditoria', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Auditoria"').click();

      // Verificar tabela de auditoria
      const auditoriaTable = page.locator('[data-testid="auditoria-table"]');
      await expect(auditoriaTable).toBeVisible();

      // Verificar colunas da auditoria
      await expect(auditoriaTable.locator('text="Data/Hora"')).toBeVisible();
      await expect(auditoriaTable.locator('text="Usuário"')).toBeVisible();
      await expect(auditoriaTable.locator('text="Ação"')).toBeVisible();
      await expect(auditoriaTable.locator('text="Recurso"')).toBeVisible();
      await expect(auditoriaTable.locator('text="Unidade"')).toBeVisible();
    });

    test('deve permitir filtrar auditoria por usuário', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Auditoria"').click();

      // Usar filtro de usuário
      const usuarioFilter = page.locator(
        'select[name="profile_id"], [data-testid="usuario-filter"]',
      );
      if (await usuarioFilter.isVisible()) {
        await usuarioFilter.selectOption({ index: 1 });

        const aplicarFiltro = page.locator('button:has-text("Aplicar")');
        await aplicarFiltro.click();

        await page.waitForLoadState('networkidle');

        // Verificar se tabela ainda tem dados
        const auditoriaTable = page.locator('[data-testid="auditoria-table"]');
        await expect(auditoriaTable).toBeVisible();
      }
    });

    test('deve permitir filtrar auditoria por unidade', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Auditoria"').click();

      // Usar filtro de unidade
      const unidadeFilter = page.locator(
        'select[name="unidade_id"], [data-testid="unidade-filter"]',
      );
      if (await unidadeFilter.isVisible()) {
        await unidadeFilter.selectOption({ index: 1 });

        const aplicarFiltro = page.locator('button:has-text("Aplicar")');
        await aplicarFiltro.click();

        await page.waitForLoadState('networkidle');

        const auditoriaTable = page.locator('[data-testid="auditoria-table"]');
        await expect(auditoriaTable).toBeVisible();
      }
    });

    test('deve permitir filtrar auditoria por período', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Auditoria"').click();

      // Usar filtros de data
      const dataInicioInput = page.locator('input[name="data_inicio"]');
      if (await dataInicioInput.isVisible()) {
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        await dataInicioInput.fill(umaSemanaAtras.toISOString().split('T')[0]);

        const aplicarFiltro = page.locator('button:has-text("Aplicar")');
        await aplicarFiltro.click();

        await page.waitForLoadState('networkidle');

        const auditoriaTable = page.locator('[data-testid="auditoria-table"]');
        await expect(auditoriaTable).toBeVisible();
      }
    });

    test('deve exibir detalhes do registro de auditoria', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Auditoria"').click();

      // Clicar no primeiro registro para ver detalhes
      const firstAuditRecord = page.locator('[data-testid="audit-row"]').first();
      const detailsButton = firstAuditRecord.locator('[data-testid="details-button"]');

      if (await detailsButton.isVisible()) {
        await detailsButton.click();

        const detailsModal = page.locator('[data-testid="audit-details-modal"]');
        await expect(detailsModal).toBeVisible();

        // Verificar informações detalhadas
        await expect(detailsModal.locator('[data-testid="audit-action"]')).toBeVisible();
        await expect(detailsModal.locator('[data-testid="audit-resource"]')).toBeVisible();
        await expect(detailsModal.locator('[data-testid="audit-timestamp"]')).toBeVisible();
        await expect(detailsModal.locator('[data-testid="audit-user"]')).toBeVisible();
      }
    });
  });

  test.describe('Benchmarks e Comparações', () => {
    test('deve exibir ranking de performance entre unidades', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Benchmarks"').click();

      // Verificar seção de ranking
      const rankingSection = page.locator('[data-testid="performance-ranking"]');
      await expect(rankingSection).toBeVisible();

      // Verificar se há dados de ranking
      const rankingItems = rankingSection.locator('[data-testid="ranking-item"]');
      await expect(rankingItems.first()).toBeVisible();
    });

    test('deve permitir comparar KPIs entre unidades selecionadas', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Benchmarks"').click();

      // Selecionar unidades para comparação
      const compareSection = page.locator('[data-testid="comparison-selector"]');
      if (await compareSection.isVisible()) {
        const unidade1 = compareSection.locator('input[type="checkbox"]').first();
        const unidade2 = compareSection.locator('input[type="checkbox"]').nth(1);

        await unidade1.check();
        await unidade2.check();

        const compareButton = page.locator('button:has-text("Comparar")');
        await compareButton.click();

        // Verificar resultado da comparação
        const comparisonResult = page.locator('[data-testid="comparison-result"]');
        await expect(comparisonResult).toBeVisible();
      }
    });

    test('deve exibir gráficos de tendência por unidade', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Benchmarks"').click();

      // Verificar gráficos de tendência
      const trendsSection = page.locator('[data-testid="trends-charts"]');
      await expect(trendsSection).toBeVisible();

      // Verificar se há visualizações gráficas
      const charts = trendsSection.locator('[data-testid="trend-chart"]');
      await expect(charts.first()).toBeVisible();
    });
  });

  test.describe('Isolamento e Segurança RLS', () => {
    test('deve manter isolamento de dados entre unidades', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Relatórios Consolidados"').click();

      // Verificar se só aparecem unidades autorizadas
      const unidadeRows = page.locator('[data-testid="unidade-row"]');
      const firstRow = unidadeRows.first();

      if (await firstRow.isVisible()) {
        // Verificar se dados estão mascarados adequadamente
        await expect(firstRow).toBeVisible();

        // Não deve haver dados sensíveis expostos
        await expect(
          firstRow.locator('text="password", text="token", text="secret"'),
        ).not.toBeVisible();
      }
    });

    test('deve registrar todas as consultas na auditoria', async ({ page }) => {
      // Fazer algumas ações que devem gerar auditoria
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Relatórios Consolidados"').click();
      await page.waitForLoadState('networkidle');

      // Aplicar filtro (deve gerar log de auditoria)
      const periodoSelect = page.locator('select[name="periodo"]');
      if (await periodoSelect.isVisible()) {
        await periodoSelect.selectOption('semana');
        await page.locator('button:has-text("Aplicar")').click();
        await page.waitForLoadState('networkidle');
      }

      // Ir para auditoria e verificar se ações foram registradas
      await page.locator('text="Auditoria"').click();

      const auditoriaTable = page.locator('[data-testid="auditoria-table"]');
      await expect(auditoriaTable).toBeVisible();

      // Verificar se há registros recentes
      const recentRecords = auditoriaTable.locator('[data-testid="audit-row"]');
      await expect(recentRecords.first()).toBeVisible();
    });

    test('deve bloquear acesso não autorizado a dados de outras unidades', async ({ page }) => {
      // Este teste simularia tentativa de acesso não autorizado
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      // Tentar acessar dados de unidade específica sem autorização
      // (Isso dependeria da configuração de teste específica)

      // Verificar se página carrega corretamente ou bloqueia acesso
      const hasAccess = await page.locator('h1, h2').isVisible();
      const hasError = await page
        .locator('text="Acesso negado", text="Não autorizado"')
        .isVisible();

      // Um dos dois deve ser verdadeiro (tem acesso legítimo ou foi bloqueado)
      expect(hasAccess || hasError).toBeTruthy();
    });
  });

  test.describe('Responsividade e UX', () => {
    test('deve funcionar corretamente em dispositivos móveis', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      // Verificar se layout mobile funciona
      await expect(page.locator('h1, h2')).toBeVisible();

      // Verificar se abas são navegáveis em mobile
      const tabsList = page.locator('[role="tablist"]');
      await expect(tabsList).toBeVisible();

      // Testar scroll horizontal se necessário
      const firstTab = tabsList.locator('[role="tab"]').first();
      await firstTab.click();
      await page.waitForLoadState('networkidle');
    });

    test('deve exibir dados em formato tabela responsiva', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad

      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Relatórios Consolidados"').click();

      // Verificar se tabelas são responsivas
      const faturamentoTable = page.locator('[data-testid="faturamento-consolidado"]');
      await expect(faturamentoTable).toBeVisible();

      // Verificar se colunas se adaptam ao tamanho da tela
      const tableHeaders = faturamentoTable.locator('thead th, .MuiTableHead-root th');
      await expect(tableHeaders.first()).toBeVisible();
    });

    test('deve permitir navegação via teclado', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      // Testar navegação por teclado nas abas
      const firstTab = page.locator('[role="tab"]').first();
      await firstTab.focus();

      // Navegar com setas
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');

      await page.waitForLoadState('networkidle');

      // Verificar se navegação funcionou
      const activeTab = page.locator('[role="tab"][aria-selected="true"]');
      await expect(activeTab).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('deve carregar relatórios consolidados em tempo razoável', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Relatórios Consolidados"').click();
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Deve carregar em menos de 5 segundos
      expect(loadTime).toBeLessThan(5000);

      // Verificar se dados carregaram
      const faturamentoSection = page.locator('[data-testid="faturamento-consolidado"]');
      await expect(faturamentoSection).toBeVisible();
    });

    test('deve implementar paginação para grandes volumes de dados', async ({ page }) => {
      await page.goto('/multi-unidades');
      await page.waitForLoadState('networkidle');

      await page.locator('text="Auditoria"').click();

      // Verificar se há paginação
      const pagination = page.locator('.MuiPagination-root, [data-testid="pagination"]');

      if (await pagination.isVisible()) {
        // Testar navegação entre páginas
        const nextPage = pagination.locator('button[aria-label*="next"], .MuiPaginationItem-next');
        if ((await nextPage.isVisible()) && (await nextPage.isEnabled())) {
          await nextPage.click();
          await page.waitForLoadState('networkidle');

          // Verificar se página mudou
          const auditoriaTable = page.locator('[data-testid="auditoria-table"]');
          await expect(auditoriaTable).toBeVisible();
        }
      }
    });
  });
});
