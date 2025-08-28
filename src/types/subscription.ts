// Tipos para o sistema de assinaturas

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: {
    maxUnits: number;
    maxUsers: number;
    maxClients: number;
    maxAppointments: number;
    supportLevel: 'basic' | 'standard' | 'premium';
    customBranding: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
  };
  isActive: boolean;
  trialDays: number;
  setupFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  planId: string;
  unitId: string; // novo padrão
  // Campos legacy para compatibilidade com código existente (deprecar depois)
  unidadeId?: string;
  customerId: string; // ID do cliente no ASAAS
  asaasSubscriptionId: string; // ID da assinatura no ASAAS
  status: 'active' | 'suspended' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  paymentMethod: 'pix' | 'credit_card' | 'bank_slip';
  autoRenew: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  plan?: SubscriptionPlan;
  unit?: {
    id: string;
    name: string;
    cnpj: string;
  };
  // Relacionamento legacy
  unidade?: {
    id: string;
    name: string;
    cnpj: string;
  };
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
  cpfCnpj: string;
  postalCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
  city: string;
  state: string;
  country: string;
  externalReference: string;
  notificationDisabled: boolean;
  observations: string;
  additionalEmails: string;
  municipalInscription: string;
  stateInscription: string;
  createdAt: string;
  updatedAt: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  description: string;
  status: string;
  billingType: string;
  endDate?: string;
  fine: {
    value: number;
  };
  interest: {
    value: number;
  };
  split: {
    walletId: string;
    fixedValue: number;
    percentualValue: number;
    totalFixedValue: number;
    totalPercentualValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AsaasPayment {
  id: string;
  subscription?: string;
  customer: string;
  value: number;
  netValue: number;
  originalValue?: number;
  interestValue?: number;
  description: string;
  billingType: string;
  status: string;
  dueDate: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  discount: {
    value: number;
    dueDateLimitDays: number;
    type: string;
  };
  fine: {
    value: number;
    type: string;
  };
  interest: {
    value: number;
    type: string;
  };
  split: {
    walletId: string;
    fixedValue: number;
    percentualValue: number;
    totalFixedValue: number;
    totalPercentualValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AsaasWebhook {
  event: string;
  payment?: AsaasPayment;
  subscription?: AsaasSubscription;
  customer?: AsaasCustomer;
}

export interface SubscriptionUsage {
  unitId: string;
  currentUnits: number;
  currentUsers: number;
  currentClients: number;
  currentAppointments: number;
  limits: {
    maxUnits: number;
    maxUsers: number;
    maxClients: number;
    maxAppointments: number;
  };
  isOverLimit: boolean;
  overLimitBy: {
    units: number;
    users: number;
    clients: number;
    appointments: number;
  };
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  suspendedSubscriptions: number;
  cancelledSubscriptions: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  churnRate: number;
  averageLifetime: number;
}

// Tipos para respostas de API
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SubscriptionActionResult extends ActionResult<Subscription> {}
export interface SubscriptionPlanActionResult extends ActionResult<SubscriptionPlan> {}
export interface SubscriptionUsageActionResult extends ActionResult<SubscriptionUsage> {}
export interface SubscriptionMetricsActionResult extends ActionResult<SubscriptionMetrics> {}

// Tipos para filtros e paginação
export interface SubscriptionFilters {
  status?: string;
  planId?: string;
  unitId?: string;
  // transitional legacy field (remoção futura)
  unidadeId?: string;
  billingCycle?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
