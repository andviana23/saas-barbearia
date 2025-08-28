import { test, expect } from '@playwright/test';
import { createTestData, cleanupTestData } from '../fixtures';

test.describe('Configurações', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    testData = await createTestData();
    await page.goto('/configuracoes');
  });

  test.afterEach(async () => {
    await cleanupTestData(testData);
  });

  test('deve carregar painel de configurações', async ({ page }) => {
    await expect(page.locator('[data-testid="painel-configuracoes"]')).toBeVisible();
    await expect(page.locator('[data-testid="aba-configuracao"]')).toHaveCount(6);
  });

  test('deve configurar dados da empresa', async ({ page }) => {
    await page.click('[data-testid="aba-empresa"]');

    await expect(page.locator('[data-testid="form-empresa"]')).toBeVisible();

    // Editar informações
    await page.fill('[data-testid="input-razao-social"]', 'Barbearia Central Ltda');
    await page.fill('[data-testid="input-cnpj"]', '12.345.678/0001-90');
    await page.fill('[data-testid="input-email"]', 'contato@barbeariacentral.com');
    await page.fill('[data-testid="input-telefone"]', '(11) 3333-3333');
    await page.fill('[data-testid="input-endereco"]', 'Rua das Flores, 123');
    await page.fill('[data-testid="input-cidade"]', 'São Paulo');
    await page.fill('[data-testid="input-estado"]', 'SP');
    await page.fill('[data-testid="input-cep"]', '01234-567');

    await page.click('[data-testid="btn-salvar-empresa"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=Configurações salvas com sucesso')).toBeVisible();
  });

  test('deve configurar horário de funcionamento', async ({ page }) => {
    await page.click('[data-testid="aba-horarios"]');

    await expect(page.locator('[data-testid="form-horarios"]')).toBeVisible();

    // Configurar segunda-feira
    await page.click('[data-testid="checkbox-segunda"]');
    await page.fill('[data-testid="input-inicio-segunda"]', '08:00');
    await page.fill('[data-testid="input-fim-segunda"]', '18:00');

    // Configurar terça-feira
    await page.click('[data-testid="checkbox-terca"]');
    await page.fill('[data-testid="input-inicio-terca"]', '08:00');
    await page.fill('[data-testid="input-fim-terca"]', '18:00');

    // Configurar quarta-feira
    await page.click('[data-testid="checkbox-quarta"]');
    await page.fill('[data-testid="input-inicio-quarta"]', '08:00');
    await page.fill('[data-testid="input-fim-quarta"]', '18:00');

    // Configurar quinta-feira
    await page.click('[data-testid="checkbox-quinta"]');
    await page.fill('[data-testid="input-inicio-quinta"]', '08:00');
    await page.fill('[data-testid="input-fim-quinta"]', '18:00');

    // Configurar sexta-feira
    await page.click('[data-testid="checkbox-sexta"]');
    await page.fill('[data-testid="input-inicio-sexta"]', '08:00');
    await page.fill('[data-testid="input-fim-sexta"]', '18:00');

    // Configurar sábado
    await page.click('[data-testid="checkbox-sabado"]');
    await page.fill('[data-testid="input-inicio-sabado"]', '08:00');
    await page.fill('[data-testid="input-fim-sabado"]', '16:00');

    await page.click('[data-testid="btn-salvar-horarios"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve configurar serviços padrão', async ({ page }) => {
    await page.click('[data-testid="aba-servicos"]');

    await expect(page.locator('[data-testid="form-servicos"]')).toBeVisible();

    // Adicionar novo serviço padrão
    await page.click('[data-testid="btn-adicionar-servico"]');
    await page.fill('[data-testid="input-nome-servico"]', 'Corte + Barba');
    await page.fill('[data-testid="input-preco-servico"]', '60.00');
    await page.fill('[data-testid="input-duracao-servico"]', '60');
    await page.selectOption('[data-testid="select-categoria-servico"]', 'combo');

    await page.click('[data-testid="btn-salvar-servico"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=Corte + Barba')).toBeVisible();
  });

  test('deve configurar notificações', async ({ page }) => {
    await page.click('[data-testid="aba-notificacoes"]');

    await expect(page.locator('[data-testid="form-notificacoes"]')).toBeVisible();

    // Configurar notificações por email
    await page.click('[data-testid="checkbox-email-agendamentos"]');
    await page.click('[data-testid="checkbox-email-lembretes"]');
    await page.click('[data-testid="checkbox-email-relatorios"]');

    // Configurar notificações por SMS
    await page.click('[data-testid="checkbox-sms-lembretes"]');
    await page.click('[data-testid="checkbox-sms-confirmacoes"]');

    // Configurar horários de envio
    await page.fill('[data-testid="input-hora-lembrete"]', '20:00');
    await page.fill('[data-testid="input-hora-relatorio"]', '08:00');

    await page.click('[data-testid="btn-salvar-notificacoes"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve configurar integrações', async ({ page }) => {
    await page.click('[data-testid="aba-integracoes"]');

    await expect(page.locator('[data-testid="form-integracoes"]')).toBeVisible();

    // Configurar Asaas
    await page.fill('[data-testid="input-asaas-api-key"]', 'test_api_key_123');
    await page.fill('[data-testid="input-asaas-webhook"]', 'https://barbearia.com/webhook/asaas');
    await page.selectOption('[data-testid="select-asaas-ambiente"]', 'sandbox');

    // Configurar WhatsApp Business
    await page.fill('[data-testid="input-whatsapp-token"]', 'test_token_123');
    await page.fill('[data-testid="input-whatsapp-phone"]', '5511999999999');

    // Configurar Google Calendar
    await page.fill('[data-testid="input-google-client-id"]', 'test_client_id');
    await page.fill('[data-testid="input-google-client-secret"]', 'test_client_secret');

    await page.click('[data-testid="btn-salvar-integracoes"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve configurar usuários e permissões', async ({ page }) => {
    await page.click('[data-testid="aba-usuarios"]');

    await expect(page.locator('[data-testid="form-usuarios"]')).toBeVisible();

    // Adicionar novo usuário
    await page.click('[data-testid="btn-adicionar-usuario"]');
    await page.fill('[data-testid="input-nome-usuario"]', 'João Gerente');
    await page.fill('[data-testid="input-email-usuario"]', 'joao@barbearia.com');
    await page.selectOption('[data-testid="select-perfil-usuario"]', 'gerente');

    // Configurar permissões
    await page.click('[data-testid="checkbox-permissao-clientes"]');
    await page.click('[data-testid="checkbox-permissao-agenda"]');
    await page.click('[data-testid="checkbox-permissao-financeiro"]');
    await page.click('[data-testid="checkbox-permissao-relatorios"]');

    await page.click('[data-testid="btn-salvar-usuario"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=João Gerente')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.click('[data-testid="aba-empresa"]');

    // Tentar salvar sem preencher campos obrigatórios
    await page.click('[data-testid="btn-salvar-empresa"]');

    await expect(page.locator('[data-testid="error-razao-social"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-cnpj"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();

    // Preencher apenas alguns campos
    await page.fill('[data-testid="input-razao-social"]', 'Teste');
    await page.click('[data-testid="btn-salvar-empresa"]');

    await expect(page.locator('[data-testid="error-cnpj"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
  });

  test('deve validar formato de CNPJ', async ({ page }) => {
    await page.click('[data-testid="aba-empresa"]');

    // CNPJ inválido
    await page.fill('[data-testid="input-cnpj"]', '123.456.789-00');
    await page.click('[data-testid="btn-salvar-empresa"]');

    await expect(page.locator('[data-testid="error-cnpj-invalido"]')).toBeVisible();

    // CNPJ válido
    await page.fill('[data-testid="input-cnpj"]', '12.345.678/0001-90');
    await page.fill('[data-testid="input-razao-social"]', 'Teste Ltda');
    await page.fill('[data-testid="input-email"]', 'teste@teste.com');
    await page.click('[data-testid="btn-salvar-empresa"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve validar formato de email', async ({ page }) => {
    await page.click('[data-testid="aba-empresa"]');

    // Email inválido
    await page.fill('[data-testid="input-email"]', 'email-invalido');
    await page.click('[data-testid="btn-salvar-empresa"]');

    await expect(page.locator('[data-testid="error-email-invalido"]')).toBeVisible();

    // Email válido
    await page.fill('[data-testid="input-email"]', 'teste@teste.com');
    await page.fill('[data-testid="input-razao-social"]', 'Teste Ltda');
    await page.fill('[data-testid="input-cnpj"]', '12.345.678/0001-90');
    await page.click('[data-testid="btn-salvar-empresa"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve configurar backup automático', async ({ page }) => {
    await page.click('[data-testid="aba-backup"]');

    await expect(page.locator('[data-testid="form-backup"]')).toBeVisible();

    // Configurar backup automático
    await page.click('[data-testid="checkbox-backup-automatico"]');
    await page.selectOption('[data-testid="select-frequencia-backup"]', 'diario');
    await page.fill('[data-testid="input-hora-backup"]', '02:00');
    await page.fill('[data-testid="input-email-backup"]', 'admin@barbearia.com');

    // Configurar retenção
    await page.fill('[data-testid="input-dias-retencao"]', '30');
    await page.click('[data-testid="checkbox-backup-cloud"]');

    await page.click('[data-testid="btn-salvar-backup"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve executar backup manual', async ({ page }) => {
    await page.click('[data-testid="aba-backup"]');

    // Executar backup manual
    await page.click('[data-testid="btn-backup-manual"]');

    await expect(page.locator('[data-testid="modal-confirmacao-backup"]')).toBeVisible();
    await page.click('[data-testid="btn-confirmar-backup"]');

    await expect(page.locator('[data-testid="loading-backup"]')).toBeVisible();

    // Aguardar conclusão
    await page.waitForSelector('[data-testid="backup-concluido"]', {
      timeout: 30000,
    });

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=Backup executado com sucesso')).toBeVisible();
  });

  test('deve restaurar backup', async ({ page }) => {
    await page.click('[data-testid="aba-backup"]');

    // Restaurar backup
    await page.click('[data-testid="btn-restaurar-backup"]');

    await expect(page.locator('[data-testid="modal-restauracao"]')).toBeVisible();

    // Selecionar arquivo de backup
    await page.setInputFiles('[data-testid="input-arquivo-backup"]', 'test-backup.zip');
    await page.fill('[data-testid="input-senha-backup"]', 'senha123');

    await page.click('[data-testid="btn-confirmar-restauracao"]');

    await expect(page.locator('[data-testid="loading-restauracao"]')).toBeVisible();

    // Aguardar conclusão
    await page.waitForSelector('[data-testid="restauracao-concluida"]', {
      timeout: 60000,
    });

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('text=Backup restaurado com sucesso')).toBeVisible();
  });

  test('deve configurar tema e aparência', async ({ page }) => {
    await page.click('[data-testid="aba-aparencia"]');

    await expect(page.locator('[data-testid="form-aparencia"]')).toBeVisible();

    // Configurar tema
    await page.selectOption('[data-testid="select-tema"]', 'escuro');
    await page.selectOption('[data-testid="select-cor-primaria"]', '#1976d2');
    await page.selectOption('[data-testid="select-cor-secundaria"]', '#dc004e');

    // Configurar logo
    await page.setInputFiles('[data-testid="input-logo"]', 'logo.png');

    // Configurar favicon
    await page.setInputFiles('[data-testid="input-favicon"]', 'favicon.ico');

    await page.click('[data-testid="btn-salvar-aparencia"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });

  test('deve configurar idioma e fuso horário', async ({ page }) => {
    await page.click('[data-testid="aba-idioma"]');

    await expect(page.locator('[data-testid="form-idioma"]')).toBeVisible();

    // Configurar idioma
    await page.selectOption('[data-testid="select-idioma"]', 'pt-BR');

    // Configurar fuso horário
    await page.selectOption('[data-testid="select-fuso-horario"]', 'America/Sao_Paulo');

    // Configurar formato de data
    await page.selectOption('[data-testid="select-formato-data"]', 'DD/MM/YYYY');

    // Configurar formato de hora
    await page.selectOption('[data-testid="select-formato-hora"]', '24h');

    await page.click('[data-testid="btn-salvar-idioma"]');

    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
  });
});
