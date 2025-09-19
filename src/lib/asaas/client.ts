// Cliente ASAAS para integração com APIs de pagamento
import { AsaasCustomer, AsaasSubscription, AsaasPayment } from '@/types/subscription';

// Interface para dados de cliente do sistema Trato
interface TratoCustomer {
  id?: string;
  name?: string;
  nome?: string;
  email?: string;
  phone?: string;
  telefone?: string;
  mobilePhone?: string;
  celular?: string;
  cpf?: string;
  cnpj?: string;
  postalCode?: string;
  cep?: string;
  address?: string;
  endereco?: string;
  addressNumber?: string;
  numero?: string;
  complement?: string;
  complemento?: string;
  province?: string;
  bairro?: string;
  city?: string;
  cidade?: string;
  state?: string;
  estado?: string;
  observations?: string;
  observacoes?: string;
}

// Interface para dados de chargeback e refunds
interface AsaasChargeback {
  id: string;
  status: string;
  reason: string;
  amount: number;
  date: string;
}

interface AsaasRefund {
  id: string;
  value: number;
  description?: string;
  status: string;
  refundDate: string;
}

interface AsaasError {
  message?: string;
  code?: string;
  details?: unknown;
}

class AsaasClient {
  private baseUrl: string;
  private apiKey: string;
  private environment: 'sandbox' | 'production';
  private webhookToken: string;

  constructor() {
    // Configuração conforme Guia de Integração ASAAS
    const env = process.env.ASAAS_ENV || 'sandbox';
    this.environment = env as 'sandbox' | 'production';

    this.baseUrl =
      this.environment === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://api-sandbox.asaas.com/v3';

    this.apiKey = process.env.ASAAS_API_KEY || '';
    this.webhookToken = process.env.ASAAS_WEBHOOK_TOKEN || '';

    // Durante o build, não validar a presença da API key
    if (!this.apiKey && process.env.NODE_ENV !== 'development' && typeof window === 'undefined') {
      // Apenas avisar durante o build, não falhar
      console.warn('ASAAS_API_KEY não configurada - algumas funcionalidades podem não funcionar');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Validar API key no momento da requisição
    if (!this.apiKey) {
      throw new Error('ASAAS_API_KEY é obrigatória para fazer requisições à API');
    }

    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      access_token: this.apiKey,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ASAAS API Error: ${response.status} - ${errorData.message || response.statusText}`,
      );
    }

    return response.json();
  }

  // ===== CUSTOMERS =====

  async createCustomer(customerData: Partial<AsaasCustomer>): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async getCustomer(customerId: string): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>(`/customers/${customerId}`);
  }

  async updateCustomer(
    customerId: string,
    customerData: Partial<AsaasCustomer>,
  ): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>(`/customers/${customerId}`, {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(customerId: string): Promise<{ deleted: boolean }> {
    return this.request<{ deleted: boolean }>(`/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  async listCustomers(filters?: {
    name?: string;
    email?: string;
    cpfCnpj?: string;
    offset?: number;
    limit?: number;
  }): Promise<{
    data: AsaasCustomer[];
    hasMore: boolean;
    totalCount: number;
    offset: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.cpfCnpj) params.append('cpfCnpj', filters.cpfCnpj);
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request<{
      data: AsaasCustomer[];
      hasMore: boolean;
      totalCount: number;
      offset: number;
      limit: number;
    }>(`/customers?${params.toString()}`);
  }

  // Método utilitário para mapear dados do Trato para ASAAS
  mapTratoCustomerToAsaas(tratoCustomer: TratoCustomer): Partial<AsaasCustomer> {
    return {
      name: tratoCustomer.name || tratoCustomer.nome,
      email: tratoCustomer.email,
      phone: tratoCustomer.phone || tratoCustomer.telefone,
      mobilePhone: tratoCustomer.mobilePhone || tratoCustomer.celular || tratoCustomer.phone,
      cpfCnpj: tratoCustomer.cpf || tratoCustomer.cnpj,
      postalCode: tratoCustomer.postalCode || tratoCustomer.cep,
      address: tratoCustomer.address || tratoCustomer.endereco,
      addressNumber: tratoCustomer.addressNumber || tratoCustomer.numero,
      complement: tratoCustomer.complement || tratoCustomer.complemento,
      province: tratoCustomer.province || tratoCustomer.bairro,
      city: tratoCustomer.city || tratoCustomer.cidade,
      state: tratoCustomer.state || tratoCustomer.estado,
      externalReference: tratoCustomer.id, // ID do cliente no Trato
      notificationDisabled: false,
      observations: tratoCustomer.observations || tratoCustomer.observacoes || '',
    };
  }

  // Método para encontrar ou criar cliente no ASAAS
  async findOrCreateCustomer(tratoCustomer: TratoCustomer): Promise<AsaasCustomer> {
    try {
      // Primeiro tenta buscar por CPF/CNPJ
      const cpfCnpj = tratoCustomer.cpf || tratoCustomer.cnpj;
      if (cpfCnpj) {
        const searchResult = await this.listCustomers({ cpfCnpj });
        if (searchResult.data.length > 0) {
          console.log('Customer found by CPF/CNPJ:', searchResult.data[0].id);
          return searchResult.data[0];
        }
      }

      // Se não encontrou, tenta buscar por email
      if (tratoCustomer.email) {
        const searchResult = await this.listCustomers({ email: tratoCustomer.email });
        if (searchResult.data.length > 0) {
          console.log('Customer found by email:', searchResult.data[0].id);
          return searchResult.data[0];
        }
      }

      // Se não encontrou, cria novo cliente
      const asaasCustomerData = this.mapTratoCustomerToAsaas(tratoCustomer);
      const newCustomer = await this.createCustomer(asaasCustomerData);
      console.log('New customer created:', newCustomer.id);
      return newCustomer;
    } catch (error) {
      console.error('Error in findOrCreateCustomer:', error);
      throw error;
    }
  }

  // ===== SUBSCRIPTIONS =====

  async createSubscription(subscriptionData: {
    customer: string;
    billingType: string;
    value: number;
    nextDueDate: string;
    cycle: string;
    description?: string;
    endDate?: string;
    fine?: { value: number };
    interest?: { value: number };
    split?: {
      walletId: string;
      fixedValue: number;
      percentualValue: number;
    };
  }): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>(`/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(
    subscriptionId: string,
    subscriptionData: Partial<AsaasSubscription>,
  ): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>(`/subscriptions/${subscriptionId}`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  async activateSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>(`/subscriptions/${subscriptionId}/activate`, {
      method: 'POST',
    });
  }

  async getSubscriptionPayments(subscriptionId: string): Promise<{ data: AsaasPayment[] }> {
    return this.request<{ data: AsaasPayment[] }>(`/subscriptions/${subscriptionId}/payments`);
  }

  async listSubscriptions(filters?: {
    customer?: string;
    status?: string;
    offset?: number;
    limit?: number;
  }): Promise<{
    data: AsaasSubscription[];
    hasMore: boolean;
    totalCount: number;
    offset: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.customer) params.append('customer', filters.customer);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request<{
      data: AsaasSubscription[];
      hasMore: boolean;
      totalCount: number;
      offset: number;
      limit: number;
    }>(`/subscriptions?${params.toString()}`);
  }

  // Método para criar assinatura com todos os parâmetros do Trato
  async createSubscriptionComplete(data: {
    customer: string;
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
    cycle:
      | 'WEEKLY'
      | 'BIWEEKLY'
      | 'MONTHLY'
      | 'BIMONTHLY'
      | 'QUARTERLY'
      | 'SEMIANNUALLY'
      | 'YEARLY';
    value: number;
    nextDueDate: string;
    description?: string;
    endDate?: string;
    maxPayments?: number;
    externalReference?: string;
    discount?: {
      value: number;
      dueDateLimitDays: number;
    };
    fine?: {
      value: number;
    };
    interest?: {
      value: number;
    };
    creditCard?: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    creditCardHolderInfo?: {
      name: string;
      email: string;
      cpfCnpj: string;
      postalCode: string;
      addressNumber: string;
      phone?: string;
      mobilePhone?: string;
    };
  }): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Método utilitário para mapear ciclo de cobrança do Trato para ASAAS
  mapBillingCycleToAsaas(cycle: string): string {
    const cycleMap: { [key: string]: string } = {
      monthly: 'MONTHLY',
      quarterly: 'QUARTERLY',
      yearly: 'YEARLY',
      weekly: 'WEEKLY',
    };
    return cycleMap[cycle] || 'MONTHLY';
  }

  // Método utilitário para mapear forma de pagamento do Trato para ASAAS
  mapPaymentMethodToAsaas(method: string): string {
    const methodMap: { [key: string]: string } = {
      pix: 'PIX',
      credit_card: 'CREDIT_CARD',
      bank_slip: 'BOLETO',
      undefined: 'UNDEFINED',
    };
    return methodMap[method] || 'PIX';
  }

  // ===== PAYMENTS =====

  async createPayment(paymentData: {
    customer: string;
    billingType: string;
    value: number;
    dueDate: string;
    description?: string;
    externalReference?: string;
    installmentCount?: number;
    installmentValue?: number;
    discount?: {
      value: number;
      dueDateLimitDays: number;
      type: string;
    };
    fine?: {
      value: number;
      type: string;
    };
    interest?: {
      value: number;
      type: string;
    };
    split?: {
      walletId: string;
      fixedValue: number;
      percentualValue: number;
    };
  }): Promise<AsaasPayment> {
    return this.request<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${paymentId}`);
  }

  async updatePayment(
    paymentId: string,
    paymentData: Partial<AsaasPayment>,
  ): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async deletePayment(paymentId: string): Promise<{ deleted: boolean }> {
    return this.request<{ deleted: boolean }>(`/payments/${paymentId}`, {
      method: 'DELETE',
    });
  }

  async refundPayment(
    paymentId: string,
    refundData?: { value?: number; description?: string },
  ): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData || {}),
    });
  }

  // Confirmar pagamento externo (dinheiro)
  async confirmExternalPayment(
    paymentId: string,
    data?: {
      paymentDate?: string;
      value?: number;
      description?: string;
    },
  ): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${paymentId}/receiveInCash`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async listPayments(filters?: {
    customer?: string;
    subscription?: string;
    billingType?: string;
    status?: string;
    paymentDate?: string;
    estimatedCreditDate?: string;
    dueDate?: string;
    offset?: number;
    limit?: number;
  }): Promise<{
    data: AsaasPayment[];
    hasMore: boolean;
    totalCount: number;
    offset: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.customer) params.append('customer', filters.customer);
    if (filters?.subscription) params.append('subscription', filters.subscription);
    if (filters?.billingType) params.append('billingType', filters.billingType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paymentDate) params.append('paymentDate', filters.paymentDate);
    if (filters?.estimatedCreditDate)
      params.append('estimatedCreditDate', filters.estimatedCreditDate);
    if (filters?.dueDate) params.append('dueDate', filters.dueDate);
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request<{
      data: AsaasPayment[];
      hasMore: boolean;
      totalCount: number;
      offset: number;
      limit: number;
    }>(`/payments?${params.toString()}`);
  }

  // Gerar link de pagamento PIX
  async generatePixQrCode(paymentId: string): Promise<{
    success: boolean;
    encodedImage: string;
    payload: string;
    expirationDate: string;
  }> {
    return this.request<{
      success: boolean;
      encodedImage: string;
      payload: string;
      expirationDate: string;
    }>(`/payments/${paymentId}/pixQrCode`);
  }

  // Obter status do pagamento com informações detalhadas
  async getPaymentStatus(paymentId: string): Promise<
    AsaasPayment & {
      installments?: AsaasPayment[];
      chargeback?: AsaasChargeback;
      refunds?: AsaasRefund[];
    }
  > {
    return this.request<
      AsaasPayment & {
        installments?: AsaasPayment[];
        chargeback?: AsaasChargeback;
        refunds?: AsaasRefund[];
      }
    >(`/payments/${paymentId}?expand=installments,chargeback,refunds`);
  }

  // ===== UTILITIES =====

  async getPaymentMethods(): Promise<{ data: string[] }> {
    return this.request<{ data: string[] }>('/paymentMethods');
  }

  async getBillingTypes(): Promise<{ data: string[] }> {
    return this.request<{ data: string[] }>('/billingTypes');
  }

  async getInstallmentLimits(): Promise<{
    data: { maxInstallmentCount: number };
  }> {
    return this.request<{ data: { maxInstallmentCount: number } }>('/installmentLimits');
  }

  // ===== WEBHOOK VALIDATION =====

  validateWebhookToken(receivedToken: string): boolean {
    // Validação do token conforme documentação ASAAS
    if (!this.webhookToken) {
      console.error('ASAAS_WEBHOOK_TOKEN não configurado');
      return false;
    }

    return receivedToken === this.webhookToken;
  }

  validateWebhookSignature(payload: string, signature: string): boolean {
    // Para implementação futura com validação criptográfica
    // Por enquanto, usar validateWebhookToken para segurança básica
    return true;
  }

  // ===== ERROR HANDLING =====

  handleApiError(error: AsaasError): { message: string; code: string; details?: unknown } {
    if (error.message?.includes('ASAAS API Error')) {
      return {
        message: 'Erro na API ASAAS',
        code: 'ASAAS_API_ERROR',
        details: error.message,
      };
    }

    return {
      message: 'Erro interno do sistema',
      code: 'INTERNAL_ERROR',
      details: error.message,
    };
  }

  // ===== ENVIRONMENT INFO =====

  getEnvironment(): 'sandbox' | 'production' {
    return this.environment;
  }

  isSandbox(): boolean {
    return this.environment === 'sandbox';
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }
}

// Instância singleton do cliente ASAAS
export const asaasClient = new AsaasClient();

// Funções utilitárias para conversão de dados
export const asaasUtils = {
  // Converter valor para centavos (ASAAS trabalha com centavos)
  toCents: (value: number): number => Math.round(value * 100),

  // Converter centavos para valor decimal
  fromCents: (cents: number): number => cents / 100,

  // Formatar data para formato ASAAS (YYYY-MM-DD)
  formatDate: (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Calcular data de vencimento baseada no ciclo
  calculateNextDueDate: (cycle: string, fromDate: Date = new Date()): string => {
    const date = new Date(fromDate);

    switch (cycle) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }

    return asaasUtils.formatDate(date);
  },

  // Validar CPF/CNPJ
  validateCpfCnpj: (value: string): boolean => {
    const clean = value.replace(/\D/g, '');
    return clean.length === 11 || clean.length === 14;
  },

  // Limpar CPF/CNPJ para envio
  cleanCpfCnpj: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  // Limpar telefone para envio
  cleanPhone: (value: string): string => {
    return value.replace(/\D/g, '');
  },
};
