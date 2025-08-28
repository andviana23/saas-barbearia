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

// ===== ASSINATURAS =====

export async function createSubscription(formData: FormData): Promise<SubscriptionActionResult> {
  try {
    const supabase = createServerSupabase();
    // Permitir campos legacy (planId / clienteId / unidadeId) e novos (plan_id form inputs normalizados)
    const planId = (formData.get('plan_id') || formData.get('planId')) as string | null;
    const customerId = (formData.get('customer_id') || formData.get('clienteId')) as string | null;
    const unitId = (formData.get('unit_id') || formData.get('unidadeId')) as string | null;
    const startDate = (formData.get('start_date') || formData.get('startDate')) as string | null;
    const endDate = (formData.get('end_date') || formData.get('endDate')) as string | null;

    const validatedData = SubscriptionSchema.parse({
      plan_id: planId,
      customer_id: customerId,
      unit_id: unitId,
      start_date: startDate,
      end_date: endDate,
      status: 'active',
    });

    const { data, error } = await supabase
      .from('subscriptions')
      .insert(validatedData)
      .select(
        `
        *,
        plan:subscription_plans(*),
        customer:customers(id, name, email),
        unit:units(id, name)
      `,
      )
      .single();

    if (error) throw error;

    revalidatePath('/subscriptions');
    return {
      success: true,
      data: transformSubscriptionToInterface(data),
      message: 'Assinatura criada com sucesso',
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

export async function updateSubscription(
  subscriptionId: string,
  formData: FormData,
): Promise<SubscriptionActionResult> {
  try {
    const supabase = createServerSupabase();
    const validatedData = SubscriptionSchema.partial().parse({
      plan_id: formData.get('plan_id') || formData.get('planId'),
      customer_id: formData.get('customer_id') || formData.get('clienteId'),
      start_date: formData.get('start_date') || formData.get('startDate'),
      end_date: formData.get('end_date') || formData.get('endDate'),
      status: formData.get('status') as 'active' | 'cancelled' | 'expired',
    });

    const { data, error } = await supabase
      .from('subscriptions')
      .update(validatedData)
      .eq('id', subscriptionId)
      .select(
        `
        *,
        plan:subscription_plans(*),
        customer:customers(id, name, email),
        unit:units(id, name)
      `,
      )
      .single();

    if (error) throw error;

    revalidatePath('/subscriptions');
    return {
      success: true,
      data: transformSubscriptionToInterface(data),
      message: 'Assinatura atualizada com sucesso',
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

export async function cancelSubscription(
  subscriptionId: string,
): Promise<SubscriptionActionResult> {
  try {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        end_date: new Date().toISOString().split('T')[0], // Data atual
      })
      .eq('id', subscriptionId)
      .select(
        `
        *,
        plan:subscription_plans(*),
        customer:customers(id, name, email),
        unit:units(id, name)
      `,
      )
      .single();

    if (error) throw error;

    revalidatePath('/subscriptions');
    return {
      success: true,
      data: transformSubscriptionToInterface(data),
      message: 'Assinatura cancelada com sucesso',
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getSubscriptions(
  filters: SubscriptionFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 },
): Promise<PaginatedResponse<Subscription>> {
  const supabase = createServerSupabase();
  const { data: currentUnitId } = await supabase.rpc('current_unit_id');

  let query = supabase.from('subscriptions').select(
    `
      *,
      plan:subscription_plans(*),
      customer:customers(id, name, email),
      unit:units(id, name)
    `,
    { count: 'exact' },
  );

  // Aplicar filtros
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.planId) {
    query = query.eq('plan_id', filters.planId);
  }
  // Forçar isolamento multi-tenant: sempre restringir por unidade atual (se disponível)
  if (currentUnitId) {
    query = query.eq('unit_id', currentUnitId);
  } else if (filters.unitId || (filters as Partial<{ unidadeId: string }>).unidadeId) {
    const legacy = (filters as Partial<{ unidadeId: string }>).unidadeId;
    query = query.eq('unit_id', filters.unitId ?? legacy);
  }
  if (filters.startDate) {
    query = query.gte('start_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('start_date', filters.endDate);
  }

  // Aplicar paginação
  const offset = (pagination.page - 1) * pagination.limit;
  query = query.range(offset, offset + pagination.limit - 1);

  // Aplicar ordenação
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / pagination.limit);

  return {
    data: (data || []).map(transformSubscriptionToInterface),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
}

export async function getSubscription(subscriptionId: string): Promise<Subscription | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      `
      *,
      plan:subscription_plans(*),
      customer:customers(id, name, email),
      unit:units(id, name)
    `,
    )
    .eq('id', subscriptionId)
    .single();
  if (error) throw error;
  return data ? transformSubscriptionToInterface(data) : null;
}

// ===== MÉTRICAS SIMPLIFICADAS =====

export async function getSubscriptionMetrics(): Promise<SubscriptionMetricsActionResult> {
  try {
    const supabase = createServerSupabase();
    const { data: currentUnitId } = await supabase.rpc('current_unit_id');
    const unitFilter = currentUnitId ? { column: 'unit_id', value: currentUnitId } : null;

    const base = supabase.from('subscriptions');
    const totalQuery = unitFilter
      ? base.select('*', { count: 'exact', head: true }).eq(unitFilter.column, unitFilter.value)
      : base.select('*', { count: 'exact', head: true });
    const activeQuery = unitFilter
      ? base
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq(unitFilter.column, unitFilter.value)
      : base.select('*', { count: 'exact', head: true }).eq('status', 'active');
    const cancelledQuery = unitFilter
      ? base
          .select('*', { count: 'exact', head: true })
          .eq('status', 'cancelled')
          .eq(unitFilter.column, unitFilter.value)
      : base.select('*', { count: 'exact', head: true }).eq('status', 'cancelled');

    const [
      { count: totalSubscriptions },
      { count: activeSubscriptions },
      { count: cancelledSubscriptions },
    ] = await Promise.all([totalQuery, activeQuery, cancelledQuery]);

    // Calcular receita (simplificado)
    let activeRevenueQuery = supabase
      .from('subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(price_cents, duration_months)
      `,
      )
      .eq('status', 'active');
    if (unitFilter) {
      activeRevenueQuery = activeRevenueQuery.eq(unitFilter.column, unitFilter.value);
    }
    const { data: activeSubs } = await activeRevenueQuery;

    const monthlyRevenue =
      activeSubs?.reduce((total, sub) => {
        const priceCents = sub.plan?.price_cents || 0;
        const months = sub.plan?.duration_months || 1;
        return total + priceCents / 100 / months;
      }, 0) || 0;

    const totalSubsSafe = totalSubscriptions || 0;
    const cancelledSafe = cancelledSubscriptions || 0;
    const churnRate = totalSubsSafe > 0 ? cancelledSafe / totalSubsSafe : 0;

    return {
      success: true,
      data: {
        totalSubscriptions: totalSubscriptions || 0,
        activeSubscriptions: activeSubscriptions || 0,
        trialSubscriptions: 0, // Não implementado na estrutura atual
        suspendedSubscriptions: 0, // Não implementado na estrutura atual
        cancelledSubscriptions: cancelledSubscriptions || 0,
        monthlyRevenue,
        quarterlyRevenue: monthlyRevenue * 3,
        yearlyRevenue: monthlyRevenue * 12,
        churnRate,
        averageLifetime: 12, // Simplificado
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getSubscriptionUsage(unitId: string): Promise<SubscriptionUsageActionResult> {
  try {
    const supabase = createServerSupabase();
    // Garantir que usuário só veja uso da sua unidade atual (se RLS não bloquear já)
    const { data: currentUnitId } = await supabase.rpc('current_unit_id');
    if (currentUnitId && currentUnitId !== unitId) {
      return { success: false, error: 'Acesso negado para unidade informada' };
    }

    // Buscar assinatura ativa da unidade
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*)
      `,
      )
      .eq('unit_id', unitId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return {
        success: false,
        error: 'Nenhuma assinatura ativa encontrada',
      };
    }

    // Contar recursos atuais (simplificado)
    const [{ count: usersCount }, { count: clientsCount }, { count: appointmentsCount }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('unidade_default_id', unitId),
        supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('unit_id', unitId),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('unit_id', unitId),
      ]);

    // Limites baseados no plano (valores padrão)
    const limits = {
      maxUnits: 1,
      maxUsers: 10,
      maxClients: 100,
      maxAppointments: 1000,
    };

    const currentUnits = 1;
    const currentUsers = usersCount || 0;
    const currentClients = clientsCount || 0;
    const currentAppointments = appointmentsCount || 0;

    const isOverLimit =
      currentUnits > limits.maxUnits ||
      currentUsers > limits.maxUsers ||
      currentClients > limits.maxClients ||
      currentAppointments > limits.maxAppointments;

    const overLimitBy = {
      units: Math.max(0, currentUnits - limits.maxUnits),
      users: Math.max(0, currentUsers - limits.maxUsers),
      clients: Math.max(0, currentClients - limits.maxClients),
      appointments: Math.max(0, currentAppointments - limits.maxAppointments),
    };

    return {
      success: true,
      data: {
        unitId,
        currentUnits,
        currentUsers,
        currentClients,
        currentAppointments,
        limits,
        isOverLimit,
        overLimitBy,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
