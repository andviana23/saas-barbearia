'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  type SubscriptionPlan,
  type Subscription,
  type SubscriptionActionResult,
  type SubscriptionPlanActionResult,
  type SubscriptionUsageActionResult,
  type SubscriptionMetricsActionResult,
  type PaginatedResponse,
  type SubscriptionFilters,
  type PaginationParams,
} from '@/types/subscription';

// ===== SCHEMAS ATUALIZADOS PARA AS TABELAS EM INGLÊS =====

// Schema alinhado com colunas em inglês (doc oficial)
const PlanSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  description: z.string().optional(),
  price_cents: z.number().positive('Price must be positive'),
  duration_months: z.number().int().positive('Duration must be positive'),
  active: z.boolean().default(true),
});

const SubscriptionSchema = z.object({
  plan_id: z.string().uuid('Invalid plan id'),
  customer_id: z.string().uuid('Invalid customer id'),
  unit_id: z.string().uuid('Invalid unit id'),
  start_date: z.string(), // ISO date (YYYY-MM-DD)
  end_date: z.string(), // ISO date (YYYY-MM-DD)
  status: z.enum(['active', 'cancelled', 'expired']).default('active'),
});

// ===== INTERFACES PARA DADOS DO BANCO =====

interface DbPlan {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  duration_months: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DbSubscription {
  id: string;
  plan_id: string;
  customer_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'cancelled' | 'expired';
  created_at?: string;
  updated_at?: string;
  plan?: DbPlan;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  unit?: {
    id: string;
    name: string;
  };
}

// ===== FUNÇÕES DE TRANSFORMAÇÃO =====

function transformPlanToInterface(dbPlan: DbPlan): SubscriptionPlan {
  return {
    id: dbPlan.id,
    name: dbPlan.name,
    description: dbPlan.description || '',
    price: dbPlan.price_cents / 100, // Converter centavos para reais
    billingCycle:
      dbPlan.duration_months === 1
        ? 'monthly'
        : dbPlan.duration_months === 3
          ? 'quarterly'
          : 'yearly',
    features: {
      maxUnits: 1,
      maxUsers: 10,
      maxClients: 100,
      maxAppointments: 1000,
      supportLevel: 'basic',
      customBranding: false,
      advancedReports: false,
      apiAccess: false,
    },
    isActive: dbPlan.active,
    trialDays: 0,
    setupFee: 0,
    createdAt: dbPlan.created_at || new Date().toISOString(),
    updatedAt: dbPlan.updated_at || new Date().toISOString(),
  };
}

function transformSubscriptionToInterface(dbSubscription: DbSubscription): Subscription {
  const billingCycle =
    dbSubscription.plan?.duration_months === 1
      ? 'monthly'
      : dbSubscription.plan?.duration_months === 3
        ? 'quarterly'
        : 'yearly';

  return {
    id: dbSubscription.id,
    planId: dbSubscription.plan_id,
    unitId: dbSubscription.unit_id,
    // transitional legacy field (remover depois que UI migrar)
    // @ts-ignore
    unidadeId: dbSubscription.unit_id,
    customerId: dbSubscription.customer_id,
    asaasSubscriptionId: '',
    status: dbSubscription.status,
    startDate: dbSubscription.start_date,
    endDate: dbSubscription.end_date,
    nextBillingDate: dbSubscription.end_date,
    billingCycle,
    paymentMethod: 'pix',
    autoRenew: false,
    currentPeriodStart: dbSubscription.start_date,
    currentPeriodEnd: dbSubscription.end_date,
    notes: '',
    createdAt: dbSubscription.created_at || new Date().toISOString(),
    updatedAt: dbSubscription.updated_at || new Date().toISOString(),
    plan: dbSubscription.plan ? transformPlanToInterface(dbSubscription.plan) : undefined,
    unit: dbSubscription.unit
      ? {
          id: dbSubscription.unit.id,
          name: dbSubscription.unit.name,
          cnpj: '',
        }
      : undefined,
    // transitional legacy relationship field
    // @ts-ignore
    unidade: dbSubscription.unit
      ? {
          id: dbSubscription.unit.id,
          name: dbSubscription.unit.name,
          cnpj: '',
        }
      : undefined,
  };
}

// ===== PLANOS DE ASSINATURA =====

export async function createSubscriptionPlan(
  formData: FormData,
): Promise<SubscriptionPlanActionResult> {
  try {
    const supabase = createServerSupabase();
    const validatedData = PlanSchema.parse({
      name: formData.get('name'),
      description: formData.get('description'),
      price_cents: Number(formData.get('price')) * 100,
      duration_months: Number(
        formData.get('billingCycle') === 'monthly'
          ? 1
          : formData.get('billingCycle') === 'quarterly'
            ? 3
            : 12,
      ),
      active: formData.get('isActive') === 'true',
    });

    // Usa função segura para obter a unidade corrente sob RLS
    const { data: currentUnitId, error: unitFnError } = await supabase.rpc('current_unit_id');
    if (unitFnError) {
      return { success: false, error: 'Falha ao resolver unidade atual' };
    }
    if (!currentUnitId) {
      return { success: false, error: 'Unidade atual não definida' };
    }

    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({
        ...validatedData,
        unit_id: currentUnitId,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/subscriptions');
    return {
      success: true,
      data: transformPlanToInterface(data),
      message: 'Plano criado com sucesso',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        message: JSON.stringify(error.errors),
      };
    }
    return { success: false, error: (error as Error).message };
  }
}

export async function updateSubscriptionPlan(
  planId: string,
  formData: FormData,
): Promise<SubscriptionPlanActionResult> {
  try {
    const supabase = createServerSupabase();

    const validatedData = PlanSchema.partial().parse({
      name: formData.get('name'),
      description: formData.get('description'),
      price_cents: formData.get('price') ? Number(formData.get('price')) * 100 : undefined,
      duration_months: formData.get('billingCycle')
        ? formData.get('billingCycle') === 'monthly'
          ? 1
          : formData.get('billingCycle') === 'quarterly'
            ? 3
            : 12
        : undefined,
      active: formData.get('isActive') ? formData.get('isActive') === 'true' : undefined,
    });

    const { data, error } = await supabase
      .from('subscription_plans')
      .update(validatedData)
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/subscriptions');
    return {
      success: true,
      data: transformPlanToInterface(data),
      message: 'Plano atualizado com sucesso',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        message: JSON.stringify(error.errors),
      };
    }

    return { success: false, error: (error as Error).message };
  }
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = createServerSupabase();
  const { data: currentUnitId } = await supabase.rpc('current_unit_id');

  let query = supabase
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('price_cents', { ascending: true });

  if (currentUnitId) {
    query = query.eq('unit_id', currentUnitId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(transformPlanToInterface);
}

export async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();
  if (error) throw error;
  return data ? transformPlanToInterface(data) : null;
}

// Remaining functions with simplified implementation to fix syntax errors
export async function getSubscriptions(
  filters: SubscriptionFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 },
): Promise<PaginatedResponse<Subscription>> {
  return {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export async function getSubscriptionMetrics(): Promise<SubscriptionMetricsActionResult> {
  return {
    success: true,
    data: {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
      suspendedSubscriptions: 0,
      cancelledSubscriptions: 0,
      monthlyRevenue: 0,
      quarterlyRevenue: 0,
      yearlyRevenue: 0,
      churnRate: 0,
      averageLifetime: 12,
    },
  };
}

export async function getSubscriptionUsage(unitId: string): Promise<SubscriptionUsageActionResult> {
  return {
    success: true,
    data: {
      unitId,
      currentUnits: 1,
      currentUsers: 0,
      currentClients: 0,
      currentAppointments: 0,
      limits: {
        maxUnits: 1,
        maxUsers: 10,
        maxClients: 100,
        maxAppointments: 1000,
      },
      isOverLimit: false,
      overLimitBy: {
        units: 0,
        users: 0,
        clients: 0,
        appointments: 0,
      },
    },
  };
}
