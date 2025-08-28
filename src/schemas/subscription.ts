import { z } from 'zod';

// Schema base para planos de assinatura (ZodObject puro)
export const SubscriptionPlanBase = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Plan name must have at least 2 characters'),
  description: z.string().min(10, 'Description must have at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  billingCycle: z.enum(['monthly', 'quarterly', 'yearly'], {
    errorMap: () => ({
      message: 'Billing cycle must be monthly, quarterly or yearly',
    }),
  }),
  features: z.object({
    maxUnits: z.number().int().positive('Número máximo de unidades deve ser positivo'),
    maxUsers: z.number().int().positive('Número máximo de usuários deve ser positivo'),
    maxClients: z.number().int().positive('Número máximo de clientes deve ser positivo'),
    maxAppointments: z.number().int().positive('Número máximo de agendamentos deve ser positivo'),
    supportLevel: z.enum(['basic', 'standard', 'premium'], {
      errorMap: () => ({
        message: 'Nível de suporte deve ser básico, padrão ou premium',
      }),
    }),
    customBranding: z.boolean(),
    advancedReports: z.boolean(),
    apiAccess: z.boolean(),
  }),
  isActive: z.boolean().default(true),
  trialDays: z.number().int().min(0).default(0),
  setupFee: z.number().min(0).default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema principal (pode conter transforms/refines)
export const SubscriptionPlanSchema = SubscriptionPlanBase;

// Schema base para assinatura (ZodObject puro)
export const SubscriptionBase = z.object({
  id: z.string().uuid().optional(),
  planId: z.string().uuid('ID do plano inválido'),
  unitId: z.string().uuid('ID da unidade inválido'),
  customerId: z.string().min(1, 'ID do cliente ASAAS é obrigatório'),
  startDate: z.string().datetime('Data de início inválida'),
  billingCycle: z.enum(['monthly', 'quarterly', 'yearly']),
  paymentMethod: z.enum(['pix', 'credit_card', 'bank_slip'], {
    errorMap: () => ({
      message: 'Método de pagamento deve ser PIX, cartão de crédito ou boleto',
    }),
  }),
  autoRenew: z.boolean().default(true),
  notes: z.string().max(500).optional(),
  status: z.enum(['active', 'suspended', 'cancelled', 'expired']).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema para criação de assinatura
export const CreateSubscriptionSchema = SubscriptionBase.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualização de assinatura
export const UpdateSubscriptionSchema = SubscriptionBase.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema para webhook ASAAS
export const AsaasWebhookSchema = z.object({
  event: z.enum([
    'PAYMENT_RECEIVED',
    'PAYMENT_OVERDUE',
    'PAYMENT_DELETED',
    'PAYMENT_RESTORED',
    'PAYMENT_REFUNDED',
    'PAYMENT_RECEIVED_CASH',
    'PAYMENT_ANTICIPATED',
    'SUBSCRIPTION_CREATED',
    'SUBSCRIPTION_UPDATED',
    'SUBSCRIPTION_DELETED',
    'SUBSCRIPTION_CANCELLED',
    'SUBSCRIPTION_RENEWED',
    'SUBSCRIPTION_OVERDUE',
  ]),
  payment: z
    .object({
      id: z.string(),
      subscription: z.string().optional(),
      customer: z.string(),
      value: z.number(),
      netValue: z.number(),
      originalValue: z.number().optional(),
      status: z.string(),
      dueDate: z.string(),
      paymentDate: z.string().optional(),
      clientPaymentDate: z.string().optional(),
      installmentNumber: z.number().optional(),
      invoiceUrl: z.string().optional(),
      bankSlipUrl: z.string().optional(),
      transactionReceiptUrl: z.string().optional(),
    })
    .optional(),
  subscription: z
    .object({
      id: z.string(),
      customer: z.string(),
      value: z.number(),
      nextDueDate: z.string(),
      cycle: z.string(),
      status: z.string(),
    })
    .optional(),
});

// Tipos inferidos dos schemas
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type CreateSubscriptionData = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscriptionData = z.infer<typeof UpdateSubscriptionSchema>;
export type AsaasWebhookData = z.infer<typeof AsaasWebhookSchema>;

// Schema para resposta de API
export const SubscriptionResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
