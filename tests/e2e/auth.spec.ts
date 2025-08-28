import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText(/email é obrigatório/i)).toBeVisible();
    await expect(page.getByText(/senha é obrigatória/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('invalid-email');
    await page.getByPlaceholder(/senha/i).fill('password123');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText(/formato de email inválido/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('admin@saas-barbearia.com');
    await page.getByPlaceholder(/senha/i).fill('admin123');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.getByRole('button', { name: /entrar/i }).click(),
    ]);

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('invalid@example.com');
    await page.getByPlaceholder(/senha/i).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();
  });

  test('should redirect to forgot password page', async ({ page }) => {
    await page.getByText(/esqueceu a senha/i).click();
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByText(/recuperar senha/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByPlaceholder(/email/i).fill('admin@saas-barbearia.com');
    await page.getByPlaceholder(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();

    await page.waitForURL('/dashboard');

    // Find and click logout button
    await page.getByRole('button', { name: /sair/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should prevent access to protected routes when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login
    await page.getByPlaceholder(/email/i).fill('admin@saas-barbearia.com');
    await page.getByPlaceholder(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');

    // Refresh page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});
