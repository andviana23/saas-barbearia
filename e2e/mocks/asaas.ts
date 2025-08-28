import { Page } from '@playwright/test';

/**
 * Mock para API do Asaas (Pagamentos/Assinaturas)
 * Intercepta chamadas para a API externa durante testes E2E
 */

export class AsaasMock {
  constructor(private page: Page) {}

  /**
   * Intercepta todas as chamadas para API do Asaas
   */
  async mockAll() {
    await this.mockCreateCustomer();
    await this.mockCreateSubscription();
    await this.mockUpdateSubscription();
    await this.mockCancelSubscription();
    await this.mockGetCustomer();
    await this.mockGetSubscription();
    await this.mockListSubscriptions();
    await this.mockWebhooks();
  }

  /**
   * Mock para criação de cliente
   */
  private async mockCreateCustomer() {
    await this.page.route('**/asaas.com/api/v3/customers', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = request.postDataJSON();

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            object: 'customer',
            id: 'cus_test_' + Date.now(),
            dateCreated: new Date().toISOString(),
            name: body.name || 'Cliente Teste',
            email: body.email || 'cliente@teste.com',
            phone: body.phone || '11999999999',
            mobilePhone: body.mobilePhone || '11999999999',
            address: body.address || 'Endereço teste',
            addressNumber: body.addressNumber || '123',
            complement: body.complement || '',
            province: body.province || 'Centro',
            city: body.city || 'São Paulo',
            state: body.state || 'SP',
            country: body.country || 'Brasil',
            postalCode: body.postalCode || '01234-567',
            cpfCnpj: body.cpfCnpj || '123.456.789-10',
            personType: body.personType || 'FISICA',
            deleted: false,
          }),
        });
      }
    });
  }

  /**
   * Mock para criação de assinatura
   */
  private async mockCreateSubscription() {
    await this.page.route('**/asaas.com/api/v3/subscriptions', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = request.postDataJSON();

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            object: 'subscription',
            id: 'sub_test_' + Date.now(),
            dateCreated: new Date().toISOString(),
            customer: body.customer,
            paymentMethod: body.paymentMethod || 'CREDIT_CARD',
            billingType: body.billingType || 'CREDIT_CARD',
            value: body.value || 99.9,
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cycle: body.cycle || 'MONTHLY',
            description: body.description || 'Assinatura Teste',
            status: 'ACTIVE',
            deleted: false,
          }),
        });
      }
    });
  }

  /**
   * Mock para atualização de assinatura
   */
  private async mockUpdateSubscription() {
    await this.page.route('**/asaas.com/api/v3/subscriptions/*', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const subscriptionId = route.request().url().split('/').pop();
        const body = request.postDataJSON();

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            object: 'subscription',
            id: subscriptionId,
            dateCreated: new Date().toISOString(),
            customer: body.customer,
            paymentMethod: body.paymentMethod || 'CREDIT_CARD',
            billingType: body.billingType || 'CREDIT_CARD',
            value: body.value || 99.9,
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cycle: body.cycle || 'MONTHLY',
            description: body.description || 'Assinatura Teste',
            status: body.status || 'ACTIVE',
            deleted: false,
          }),
        });
      }
    });
  }

  /**
   * Mock para cancelamento de assinatura
   */
  private async mockCancelSubscription() {
    await this.page.route('**/asaas.com/api/v3/subscriptions/*/cancel', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const subscriptionId = route.request().url().split('/')[
          route.request().url().split('/').length - 2
        ];

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            object: 'subscription',
            id: subscriptionId,
            status: 'CANCELLED',
            deleted: false,
          }),
        });
      }
    });
  }

  /**
   * Mock para buscar cliente
   */
  private async mockGetCustomer() {
    await this.page.route('**/asaas.com/api/v3/customers/*', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        const customerId = route.request().url().split('/').pop();

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            object: 'customer',
            id: customerId,
            dateCreated: new Date().toISOString(),
            name: 'Cliente Teste',
            email: 'cliente@teste.com',
            phone: '11999999999',
            mobilePhone: '11999999999',
            address: 'Endereço teste',
            addressNumber: '123',
            complement: '',
            province: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil',
            postalCode: '01234-567',
            cpfCnpj: '123.456.789-10',
            personType: 'FISICA',
            deleted: false,
          }),
        });
      }
    });
  }

  /**
   * Mock para buscar assinatura específica
   */
  private async mockGetSubscription() {
    await this.page.route('**/asaas.com/api/v3/subscriptions/*', async (route) => {
      const request = route.request();
      if (request.method() === 'GET' && !route.request().url().includes('cancel')) {
        const subscriptionId = route.request().url().split('/').pop()?.split('?')[0];

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            object: 'subscription',
            id: subscriptionId,
            dateCreated: new Date().toISOString(),
            customer: 'cus_test_123',
            paymentMethod: 'CREDIT_CARD',
            billingType: 'CREDIT_CARD',
            value: 99.9,
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cycle: 'MONTHLY',
            description: 'Assinatura Teste',
            status: 'ACTIVE',
            deleted: false,
          }),
        });
      }
    });
  }

  /**
   * Mock para listar assinaturas
   */
  private async mockListSubscriptions() {
    await this.page.route('**/asaas.com/api/v3/subscriptions?**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            object: 'list',
            hasMore: false,
            totalCount: 2,
            limit: 20,
            offset: 0,
            data: [
              {
                object: 'subscription',
                id: 'sub_test_1',
                dateCreated: new Date().toISOString(),
                customer: 'cus_test_1',
                paymentMethod: 'CREDIT_CARD',
                billingType: 'CREDIT_CARD',
                value: 99.9,
                nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                cycle: 'MONTHLY',
                description: 'Assinatura Teste 1',
                status: 'ACTIVE',
                deleted: false,
              },
              {
                object: 'subscription',
                id: 'sub_test_2',
                dateCreated: new Date().toISOString(),
                customer: 'cus_test_2',
                paymentMethod: 'PIX',
                billingType: 'PIX',
                value: 149.9,
                nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                cycle: 'MONTHLY',
                description: 'Assinatura Teste 2',
                status: 'ACTIVE',
                deleted: false,
              },
            ],
          }),
        });
      }
    });
  }

  /**
   * Mock para webhooks (simular notificações)
   */
  private async mockWebhooks() {
    // Interceptar tentativas de envio de webhook
    await this.page.route('**/webhook**', async (route) => {
      // Simular sucesso do webhook
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ received: true }),
      });
    });
  }

  /**
   * Simular webhook específico para teste
   */
  async simulateWebhook(
    type: 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'SUBSCRIPTION_CANCELLED',
    data: any,
  ) {
    const webhookPayload = {
      object: 'webhook',
      id: 'wh_test_' + Date.now(),
      dateCreated: new Date().toISOString(),
      type,
      data,
    };

    // Fazer POST para endpoint de webhook da aplicação
    await this.page.evaluate(async (payload) => {
      await fetch('/api/webhooks/asaas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }, webhookPayload);
  }

  /**
   * Cenários de erro
   */
  async mockErrors() {
    // Simular erro de API indisponível
    await this.page.route('**/asaas.com/api/v3/customers', async (route) => {
      if (Math.random() > 0.5) {
        // 50% chance de erro
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [
              {
                code: 'api_error',
                description: 'Erro interno do servidor',
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Limpar todos os mocks
   */
  async clearAll() {
    await this.page.unrouteAll();
  }
}
