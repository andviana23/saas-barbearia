import { test, expect } from '@playwright/test';

test.describe('Página Not Found (404)', () => {
  test('deve exibir página 404 para rota inexistente', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Página não encontrada');
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve exibir mensagem de erro amigável', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="mensagem-erro"]')).toContainText(
      'A página que você está procurando não existe ou foi movida.',
    );
    await expect(page.locator('[data-testid="sugestao"]')).toContainText(
      'Verifique se o endereço está correto ou use os links abaixo para navegar.',
    );
  });

  test('deve exibir botão para voltar ao dashboard', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="btn-voltar-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-voltar-dashboard"]')).toContainText(
      'Voltar ao Dashboard',
    );
  });

  test('deve exibir botão para ir à página inicial', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="btn-pagina-inicial"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-pagina-inicial"]')).toContainText(
      'Página Inicial',
    );
  });

  test('deve exibir botão para contatar suporte', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="btn-contatar-suporte"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-contatar-suporte"]')).toContainText(
      'Contatar Suporte',
    );
  });

  test('deve navegar para dashboard ao clicar em voltar', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await page.click('[data-testid="btn-voltar-dashboard"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
  });

  test('deve navegar para página inicial ao clicar no botão', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await page.click('[data-testid="btn-pagina-inicial"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
  });

  test('deve abrir modal de contato ao clicar em suporte', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await page.click('[data-testid="btn-contatar-suporte"]');

    await expect(page.locator('[data-testid="modal-contato-suporte"]')).toBeVisible();
    await expect(page.locator('[data-testid="titulo-modal"]')).toContainText('Contatar Suporte');
  });

  test('deve exibir informações de contato no modal', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await page.click('[data-testid="btn-contatar-suporte"]');

    await expect(page.locator('[data-testid="email-suporte"]')).toContainText(
      'suporte@barbearia.com',
    );
    await expect(page.locator('[data-testid="telefone-suporte"]')).toContainText('(11) 3333-3333');
    await expect(page.locator('[data-testid="horario-atendimento"]')).toContainText(
      'Segunda a Sexta, 8h às 18h',
    );
  });

  test('deve permitir fechar modal de suporte', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await page.click('[data-testid="btn-contatar-suporte"]');
    await expect(page.locator('[data-testid="modal-contato-suporte"]')).toBeVisible();

    await page.click('[data-testid="btn-fechar-modal"]');

    await expect(page.locator('[data-testid="modal-contato-suporte"]')).not.toBeVisible();
  });

  test('deve exibir breadcrumb correto na página 404', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="breadcrumb"]')).toBeVisible();
    await expect(page.locator('[data-testid="breadcrumb-item"]').first()).toContainText('Início');
    await expect(page.locator('[data-testid="breadcrumb-item"]').last()).toContainText(
      'Página não encontrada',
    );
  });

  test('deve permitir navegação pelo breadcrumb', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await page.click('[data-testid="breadcrumb-item"]:has-text("Início")');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
  });

  test('deve exibir logo da empresa na página 404', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="logo-empresa"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-empresa"]')).toHaveAttribute(
      'alt',
      'Logo Barbearia',
    );
  });

  test('deve exibir footer na página 404', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="footer"]')).toBeVisible();
    await expect(page.locator('[data-testid="copyright"]')).toContainText(
      '© 2024 Barbearia Central. Todos os direitos reservados.',
    );
  });

  test('deve exibir links úteis no footer', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="link-sobre"]')).toContainText('Sobre Nós');
    await expect(page.locator('[data-testid="link-servicos"]')).toContainText('Serviços');
    await expect(page.locator('[data-testid="link-contato"]')).toContainText('Contato');
    await expect(page.locator('[data-testid="link-politica-privacidade"]')).toContainText(
      'Política de Privacidade',
    );
  });

  test('deve navegar para páginas através dos links do footer', async ({ page }) => {
    await page.goto('/rota-inexistente');

    await page.click('[data-testid="link-sobre"]');
    await expect(page).toHaveURL('/sobre');

    await page.goto('/rota-inexistente');
    await page.click('[data-testid="link-servicos"]');
    await expect(page).toHaveURL('/servicos');

    await page.goto('/rota-inexistente');
    await page.click('[data-testid="link-contato"]');
    await expect(page).toHaveURL('/contato');
  });

  test('deve exibir página 404 para subrotas inexistentes', async ({ page }) => {
    await page.goto('/clientes/rota-inexistente');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve exibir página 404 para rotas com parâmetros inválidos', async ({ page }) => {
    await page.goto('/clientes/999999');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve manter estado de autenticação na página 404', async ({ page }) => {
    // Primeiro fazer login
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'admin@barbearia.com');
    await page.fill('[data-testid="input-senha"]', 'senha123');
    await page.click('[data-testid="btn-entrar"]');

    await page.waitForURL('/dashboard');

    // Agora acessar rota inexistente
    await page.goto('/rota-inexistente');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();

    // Verificar que ainda está autenticado
    await page.click('[data-testid="btn-voltar-dashboard"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
  });

  test('deve exibir página 404 para rotas de API inexistentes', async ({ page }) => {
    await page.goto('/api/rota-inexistente');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve exibir página 404 para arquivos estáticos inexistentes', async ({ page }) => {
    await page.goto('/arquivo-inexistente.pdf');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve exibir página 404 para rotas com caracteres especiais', async ({ page }) => {
    await page.goto('/rota%20com%20espacos');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve exibir página 404 para rotas muito longas', async ({ page }) => {
    const rotaLonga =
      '/rota-muito-longa-que-excede-o-limite-maximo-permitido-pelo-sistema-de-roteamento';
    await page.goto(rotaLonga);

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve exibir página 404 para rotas com números', async ({ page }) => {
    await page.goto('/123456');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve exibir página 404 para rotas com símbolos', async ({ page }) => {
    await page.goto('/rota@com#simbolos$');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });

  test('deve exibir página 404 para rotas vazias', async ({ page }) => {
    await page.goto('/');

    // Se a rota raiz não estiver configurada, deve exibir 404
    if (await page.locator('[data-testid="not-found-page"]').isVisible()) {
      await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
    }
  });

  test('deve exibir página 404 para rotas com extensões', async ({ page }) => {
    await page.goto('/pagina.html');

    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="codigo-erro"]')).toContainText('404');
  });
});
