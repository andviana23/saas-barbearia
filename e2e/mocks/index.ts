export { AsaasMock } from './asaas';

import { Page } from '@playwright/test';
import { AsaasMock } from './asaas';

/**
 * Classe principal para gerenciar todos os mocks dos testes E2E
 */
export class MockManager {
  private asaasMock: AsaasMock;

  constructor(private page: Page) {
    this.asaasMock = new AsaasMock(page);
  }

  /**
   * Inicializar todos os mocks para o ambiente de teste
   */
  async setupAll() {
    const mockExternalApis = process.env.MOCK_EXTERNAL_APIS === 'true';

    if (mockExternalApis) {
      await this.setupAsaasMocks();
      await this.setupEmailMocks();
      await this.setupSmsMocks();
      await this.setupStorageMocks();
    }

    console.log('✅ Todos os mocks foram configurados');
  }

  /**
   * Configurar mocks específicos do Asaas
   */
  async setupAsaasMocks() {
    await this.asaasMock.mockAll();
    console.log('✅ Mocks do Asaas configurados');
  }

  /**
   * Mock para serviços de email
   */
  private async setupEmailMocks() {
    if (process.env.MOCK_EMAIL_SERVICE === 'true') {
      // Interceptar chamadas para serviços de email
      await this.page.route('**/sendgrid.com/**', async (route) => {
        await route.fulfill({
          status: 202,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Queued. Thank you.',
          }),
        });
      });

      await this.page.route('**/mailgun.com/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '<test@example.com>',
            message: 'Queued. Thank you.',
          }),
        });
      });

      console.log('✅ Mocks de email configurados');
    }
  }

  /**
   * Mock para serviços de SMS
   */
  private async setupSmsMocks() {
    if (process.env.MOCK_SMS_SERVICE === 'true') {
      // Interceptar chamadas para serviços de SMS
      await this.page.route('**/twilio.com/**', async (route) => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            sid: 'SM' + Date.now(),
            status: 'queued',
            to: '+5511999999999',
            from: '+5511888888888',
            body: 'SMS de teste enviado',
          }),
        });
      });

      console.log('✅ Mocks de SMS configurados');
    }
  }

  /**
   * Mock para serviços de armazenamento
   */
  private async setupStorageMocks() {
    // Interceptar uploads para Supabase Storage
    await this.page.route('**/supabase.co/storage/v1/**', async (route) => {
      const request = route.request();

      if (request.method() === 'POST') {
        // Upload de arquivo
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            Key: 'test/file-' + Date.now() + '.jpg',
            path: 'test/file-' + Date.now() + '.jpg',
            fullPath: 'test/file-' + Date.now() + '.jpg',
          }),
        });
      } else if (request.method() === 'GET') {
        // Download de arquivo
        await route.fulfill({
          status: 200,
          contentType: 'image/jpeg',
          body: Buffer.from('fake-image-data'),
        });
      } else if (request.method() === 'DELETE') {
        // Exclusão de arquivo
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Successfully deleted' }),
        });
      }
    });

    console.log('✅ Mocks de storage configurados');
  }

  /**
   * Simular cenários específicos para teste
   */
  async simulateScenario(scenario: TestScenario) {
    switch (scenario) {
      case 'api_timeout':
        await this.simulateTimeout();
        break;
      case 'api_error':
        await this.simulateApiError();
        break;
      case 'network_failure':
        await this.simulateNetworkFailure();
        break;
      case 'payment_success':
        await this.simulatePaymentSuccess();
        break;
      case 'payment_failure':
        await this.simulatePaymentFailure();
        break;
    }
  }

  /**
   * Simular timeout de API
   */
  private async simulateTimeout() {
    await this.page.route('**/api/**', async (route) => {
      // Delay de 30 segundos para simular timeout
      await new Promise((resolve) => setTimeout(resolve, 30000));
      await route.continue();
    });
  }

  /**
   * Simular erro de API
   */
  private async simulateApiError() {
    await this.page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Algo deu errado no servidor',
        }),
      });
    });
  }

  /**
   * Simular falha de rede
   */
  private async simulateNetworkFailure() {
    await this.page.route('**', async (route) => {
      await route.abort('failed');
    });
  }

  /**
   * Simular sucesso de pagamento
   */
  private async simulatePaymentSuccess() {
    await this.asaasMock.simulateWebhook('PAYMENT_RECEIVED', {
      id: 'pay_test_success',
      status: 'RECEIVED',
      value: 99.9,
    });
  }

  /**
   * Simular falha de pagamento
   */
  private async simulatePaymentFailure() {
    await this.asaasMock.simulateWebhook('PAYMENT_OVERDUE', {
      id: 'pay_test_failure',
      status: 'OVERDUE',
      value: 99.9,
    });
  }

  /**
   * Limpar todos os mocks
   */
  async clearAll() {
    await this.page.unrouteAll();
    console.log('🧹 Todos os mocks foram limpos');
  }

  /**
   * Getter para mocks específicos
   */
  get asaas() {
    return this.asaasMock;
  }
}

/**
 * Tipos de cenários de teste disponíveis
 */
export type TestScenario =
  | 'api_timeout'
  | 'api_error'
  | 'network_failure'
  | 'payment_success'
  | 'payment_failure';

/**
 * Factory function para criar MockManager
 */
export function createMockManager(page: Page): MockManager {
  return new MockManager(page);
}
