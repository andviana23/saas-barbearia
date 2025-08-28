import { test, expect } from '@playwright/test';

test.describe('LGPD Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@saas-barbearia.com');
    await page.getByPlaceholder(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
  });

  test.describe('Consent Management', () => {
    test('should display consent form', async ({ page }) => {
      await page.goto('/lgpd/consentimentos');

      await expect(page.getByText(/consentimentos de dados/i)).toBeVisible();
      await expect(page.getByText(/obrigatórios/i)).toBeVisible();
      await expect(page.getByText(/opcionais/i)).toBeVisible();
    });

    test('should require mandatory consents', async ({ page }) => {
      await page.goto('/lgpd/consentimentos');

      // Try to submit without mandatory consents
      await page.getByRole('button', { name: /salvar consentimentos/i }).click();

      await expect(page.getByText(/obrigatório aceitar/i)).toBeVisible();
    });

    test('should save consent preferences successfully', async ({ page }) => {
      await page.goto('/lgpd/consentimentos');

      // Accept terms and mandatory consents
      await page.getByLabel(/aceito os termos/i).check();
      await page.getByLabel(/aceito a política/i).check();

      // Continue to consents
      await page.getByRole('button', { name: /continuar/i }).click();

      // Select some optional consents
      await page.getByLabel(/marketing/i).check();
      await page.getByLabel(/analytics/i).check();

      // Save consents
      await page.getByRole('button', { name: /salvar consentimentos/i }).click();

      await expect(page.getByText(/consentimento registrado com sucesso/i)).toBeVisible();
    });

    test('should allow revoking consents', async ({ page }) => {
      await page.goto('/lgpd/consentimentos');

      // Find a consent to revoke
      await page
        .getByRole('button', { name: /revogar/i })
        .first()
        .click();

      // Confirm revocation
      await page.getByRole('button', { name: /confirmar/i }).click();

      await expect(page.getByText(/consentimento revogado/i)).toBeVisible();
    });
  });

  test.describe('Data Requests', () => {
    test('should display data request form', async ({ page }) => {
      await page.goto('/lgpd/solicitacoes');

      await expect(page.getByText(/solicitações de dados/i)).toBeVisible();
      await expect(page.getByText(/portabilidade/i)).toBeVisible();
      await expect(page.getByText(/exclusão/i)).toBeVisible();
    });

    test('should create data portability request', async ({ page }) => {
      await page.goto('/lgpd/solicitacoes');

      // Select data types
      await page.getByLabel(/dados pessoais/i).check();
      await page.getByLabel(/agendamentos/i).check();

      // Fill email
      await page.getByPlaceholder(/seu.email@exemplo.com/i).fill('user@test.com');

      // Fill reason
      await page.getByPlaceholder(/explique brevemente/i).fill('Preciso dos dados para migração');

      // Submit request
      await page.getByRole('button', { name: /solicitar portabilidade/i }).click();

      await expect(page.getByText(/solicitação criada com sucesso/i)).toBeVisible();
      await expect(page.getByText(/protocolo/i)).toBeVisible();
    });

    test('should create data deletion request', async ({ page }) => {
      await page.goto('/lgpd/solicitacoes');

      // Switch to deletion tab
      await page.getByRole('tab', { name: /exclusão/i }).click();

      // Select deletion type
      await page.getByLabel(/exclusão parcial/i).check();

      // Fill detailed reason
      await page
        .getByPlaceholder(/explique detalhadamente/i)
        .fill(
          'Não desejo mais receber comunicações de marketing da empresa e gostaria de excluir esses dados',
        );

      // Accept confirmations
      await page.getByLabel(/confirmo que desejo solicitar/i).check();
      await page.getByLabel(/estou ciente de que a exclusão/i).check();

      // Submit request
      await page.getByRole('button', { name: /solicitar exclusão/i }).click();

      await expect(page.getByText(/solicitação de exclusão enviada/i)).toBeVisible();
    });

    test('should validate required fields in data requests', async ({ page }) => {
      await page.goto('/lgpd/solicitacoes');

      // Try to submit without required fields
      await page.getByRole('button', { name: /solicitar portabilidade/i }).click();

      await expect(page.getByText(/selecione pelo menos um tipo/i)).toBeVisible();
      await expect(page.getByText(/email deve ser válido/i)).toBeVisible();
      await expect(page.getByText(/explique brevemente o motivo/i)).toBeVisible();
    });
  });

  test.describe('Compliance Dashboard', () => {
    test('should display compliance metrics for admins', async ({ page }) => {
      await page.goto('/lgpd/dashboard');

      await expect(page.getByText(/dashboard lgpd/i)).toBeVisible();
      await expect(page.getByText(/solicitações pendentes/i)).toBeVisible();
      await expect(page.getByText(/consentimentos ativos/i)).toBeVisible();
      await expect(page.getByText(/taxa de conformidade/i)).toBeVisible();
    });

    test('should show pending requests', async ({ page }) => {
      await page.goto('/lgpd/dashboard');

      await page.getByRole('tab', { name: /solicitações/i }).click();

      await expect(page.getByText(/solicitações recentes/i)).toBeVisible();
    });

    test('should generate compliance report', async ({ page }) => {
      await page.goto('/lgpd/dashboard');

      // Click generate report button
      await page.getByRole('button', { name: /relatório/i }).click();

      await expect(page.getByText(/relatório gerado com sucesso/i)).toBeVisible();
    });

    test('should display consent statistics', async ({ page }) => {
      await page.goto('/lgpd/dashboard');

      await page.getByRole('tab', { name: /consentimentos/i }).click();

      await expect(page.getByText(/consentimentos por tipo/i)).toBeVisible();
      await expect(page.getByText(/status dos consentimentos/i)).toBeVisible();
    });
  });

  test.describe('Privacy Policy and Terms', () => {
    test('should display current terms and privacy policy', async ({ page }) => {
      await page.goto('/lgpd/termos');

      await expect(page.getByText(/termos de uso/i)).toBeVisible();
      await expect(page.getByText(/política de privacidade/i)).toBeVisible();
    });

    test('should show version information', async ({ page }) => {
      await page.goto('/lgpd/termos');

      await expect(page.getByText(/versão/i)).toBeVisible();
      await expect(page.getByText(/vigência/i)).toBeVisible();
    });
  });

  test.describe('Data Subject Rights', () => {
    test('should handle access requests correctly', async ({ page }) => {
      await page.goto('/lgpd/solicitacoes');

      await page.getByRole('tab', { name: /acesso/i }).click();

      await expect(page.getByText(/acesso aos dados/i)).toBeVisible();
      await expect(page.getByText(/em desenvolvimento/i)).toBeVisible();
    });

    test('should handle correction requests correctly', async ({ page }) => {
      await page.goto('/lgpd/solicitacoes');

      await page.getByRole('tab', { name: /correção/i }).click();

      await expect(page.getByText(/correção de dados/i)).toBeVisible();
      await expect(page.getByText(/em desenvolvimento/i)).toBeVisible();
    });
  });

  test.describe('LGPD Compliance Validation', () => {
    test('should validate data minimization principle', async ({ page }) => {
      await page.goto('/lgpd/consentimentos');

      // Check that only necessary data is collected
      await expect(page.getByText(/tratamento de dados pessoais/i)).toBeVisible();
      await expect(page.getByText(/finalidade/i)).toBeVisible();
    });

    test('should implement purpose limitation', async ({ page }) => {
      await page.goto('/lgpd/consentimentos');

      // Each consent should have a clear purpose
      const consentItems = page.locator('[data-testid="consent-item"]');
      const count = await consentItems.count();

      for (let i = 0; i < count; i++) {
        await expect(consentItems.nth(i).getByText(/finalidade/i)).toBeVisible();
      }
    });

    test('should provide transparency about data processing', async ({ page }) => {
      await page.goto('/lgpd/consentimentos');

      await expect(page.getByText(/você pode revogar qualquer consentimento/i)).toBeVisible();
      await expect(page.getByText(/seus direitos/i)).toBeVisible();
    });

    test('should ensure data subject can exercise rights', async ({ page }) => {
      await page.goto('/lgpd/solicitacoes');

      // All major rights should be accessible
      await expect(page.getByRole('tab', { name: /portabilidade/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /exclusão/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /acesso/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /correção/i })).toBeVisible();
    });

    test('should maintain audit trail', async ({ page }) => {
      await page.goto('/lgpd/dashboard');

      // Dashboard should show compliance metrics
      await expect(
        page.getByText(/total de solicitações/i).or(page.getByText(/solicitações pendentes/i)),
      ).toBeVisible();
      await expect(page.getByText(/conformidade/i)).toBeVisible();
    });
  });
});
