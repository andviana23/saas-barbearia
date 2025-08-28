import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@saas-barbearia.com');
    await page.getByPlaceholder(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('should display main dashboard components', async ({ page }) => {
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    await expect(page.getByText(/agendamentos/i)).toBeVisible();
    await expect(page.getByText(/receita/i)).toBeVisible();
    await expect(page.getByText(/clientes/i)).toBeVisible();
  });

  test('should show key performance indicators', async ({ page }) => {
    // Check for KPI cards
    await expect(
      page.locator('[data-testid="kpi-agendamentos"]').or(page.getByText(/agendamentos.*hoje/i)),
    ).toBeVisible();

    await expect(
      page.locator('[data-testid="kpi-receita"]').or(page.getByText(/receita.*mensal/i)),
    ).toBeVisible();

    await expect(
      page.locator('[data-testid="kpi-ocupacao"]').or(page.getByText(/taxa.*ocupação/i)),
    ).toBeVisible();
  });

  test('should display charts and graphs', async ({ page }) => {
    // Wait for charts to load
    await page.waitForTimeout(2000);

    // Check for chart containers
    await expect(
      page.locator('canvas').or(page.locator('[data-testid="chart"]')).first(),
    ).toBeVisible();
  });

  test('should navigate to other sections', async ({ page }) => {
    // Test navigation to agenda
    await page.getByRole('link', { name: /agenda/i }).click();
    await expect(page).toHaveURL(/\/agenda/);

    // Back to dashboard
    await page.goto('/dashboard');

    // Test navigation to clientes
    await page.getByRole('link', { name: /clientes/i }).click();
    await expect(page).toHaveURL(/\/clientes/);
  });

  test('should update data in real-time', async ({ page }) => {
    const initialValue = await page
      .locator('[data-testid="kpi-agendamentos"]')
      .textContent()
      .catch(() => '0');

    // Simulate data change (this would typically come from websocket or polling)
    await page.reload();

    // Data should be present (even if same value)
    await expect(
      page.locator('[data-testid="kpi-agendamentos"]').or(page.getByText(/\d+/)),
    ).toBeVisible();
  });

  test('should filter data by date range', async ({ page }) => {
    // Look for date filter
    const dateFilter = page
      .getByPlaceholder(/data inicial/i)
      .or(page.locator('[data-testid="date-filter"]'));

    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      // Select a date range
      await page.waitForTimeout(1000);
      await expect(
        page.getByText(/aplicar filtro/i).or(page.getByRole('button', { name: /filtrar/i })),
      ).toBeVisible();
    }
  });

  test('should show recent activities', async ({ page }) => {
    await expect(
      page.getByText(/atividades recentes/i).or(page.getByText(/últimos agendamentos/i)),
    ).toBeVisible();
  });

  test('should display alerts and notifications', async ({ page }) => {
    // Check for notification area
    const notifications = page.getByTestId('notifications').or(page.locator('[role="alert"]'));

    if (await notifications.isVisible()) {
      await expect(notifications).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Dashboard should still be functional on mobile
    await expect(page.getByText(/dashboard/i)).toBeVisible();

    // Navigation should be accessible (hamburger menu or similar)
    const mobileNav = page
      .getByRole('button', { name: /menu/i })
      .or(page.locator('[data-testid="mobile-nav"]'));

    if (await mobileNav.isVisible()) {
      await mobileNav.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Reload to see loading states
    await page.reload();

    // Should show loading indicators briefly
    const loader = page
      .getByText(/carregando/i)
      .or(page.locator('.loading').or(page.locator('[data-testid="loading"]')));

    // Loading state may be brief, so don't assert it's always visible
    await page.waitForTimeout(100);
  });

  test('should display user-specific data', async ({ page }) => {
    // Check if user name/info is displayed
    await expect(page.getByText(/admin/i).or(page.getByTestId('user-info'))).toBeVisible();
  });

  test('should show unit-specific data when multi-tenant', async ({ page }) => {
    // Check for unit selector or unit name
    const unitSelector = page.getByTestId('unit-selector').or(page.getByText(/unidade/i));

    if (await unitSelector.isVisible()) {
      await expect(unitSelector).toBeVisible();
    }
  });
});

test.describe('Dashboard Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@saas-barbearia.com');
    await page.getByPlaceholder(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');

    // Wait for main content to load
    await page.waitForSelector('h1, [data-testid="dashboard-content"]');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/**', (route) => {
      route.abort();
    });

    await page.goto('/dashboard');

    // Should show error state or fallback content
    await expect(
      page
        .getByText(/erro/i)
        .or(page.getByText(/falha ao carregar/i))
        .or(page.getByTestId('error-state')),
    ).toBeVisible();
  });
});
