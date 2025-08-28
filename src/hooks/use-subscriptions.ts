import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubscriptions,
  getSubscription,
  getSubscriptionPlans,
  getSubscriptionPlan,
  getSubscriptionUsage,
  getSubscriptionMetrics,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from '@/app/actions/subscriptions';
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionFilters,
  PaginationParams,
} from '@/types/subscription';

// ===== PLANOS DE ASSINATURA =====

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useSubscriptionPlan(planId: string) {
  return useQuery({
    queryKey: ['subscription-plans', planId],
    queryFn: () => getSubscriptionPlan(planId),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, formData }: { planId: string; formData: FormData }) =>
      updateSubscriptionPlan(planId, formData),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({
        queryKey: ['subscription-plans', planId],
      });
    },
  });
}

// ===== ASSINATURAS =====

export function useSubscriptions(
  filters: SubscriptionFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 },
) {
  return useQuery({
    queryKey: ['subscriptions', filters, pagination],
    queryFn: () => getSubscriptions(filters, pagination),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useSubscription(subscriptionId: string) {
  return useQuery({
    queryKey: ['subscriptions', subscriptionId],
    queryFn: () => getSubscription(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, formData }: { subscriptionId: string; formData: FormData }) =>
      updateSubscription(subscriptionId, formData),
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({
        queryKey: ['subscriptions', subscriptionId],
      });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
    },
  });
}

// ===== USO E LIMITES =====

export function useSubscriptionUsage(unidadeId: string) {
  return useQuery({
    queryKey: ['subscription-usage', unidadeId],
    queryFn: () => getSubscriptionUsage(unidadeId),
    enabled: !!unidadeId,
    staleTime: 1000 * 60 * 1, // 1 minuto
    refetchInterval: 1000 * 60 * 5, // Atualizar a cada 5 minutos
  });
}

// ===== MÉTRICAS =====

export function useSubscriptionMetrics() {
  return useQuery({
    queryKey: ['subscription-metrics'],
    queryFn: getSubscriptionMetrics,
    staleTime: 1000 * 60 * 10, // 10 minutos
    refetchInterval: 1000 * 60 * 15, // Atualizar a cada 15 minutos
  });
}

// ===== HOOKS UTILITÁRIOS =====

export function useSubscriptionStatus(unidadeId: string) {
  const { data: usage, isLoading, error } = useSubscriptionUsage(unidadeId);

  return {
    isActive: usage?.data?.isOverLimit === false,
    isOverLimit: usage?.data?.isOverLimit || false,
    limits: usage?.data?.limits,
    current: {
      units: usage?.data?.currentUnits || 0,
      users: usage?.data?.currentUsers || 0,
      clients: usage?.data?.currentClients || 0,
      appointments: usage?.data?.currentAppointments || 0,
    },
    overLimitBy: usage?.data?.overLimitBy,
    isLoading,
    error,
  };
}

export function useSubscriptionFeatures(unidadeId: string) {
  const { data: usage } = useSubscriptionUsage(unidadeId);

  if (!usage?.data?.limits) {
    return {
      canCreateUnit: false,
      canCreateUser: false,
      canCreateClient: false,
      canCreateAppointment: false,
      canUseCustomBranding: false,
      canUseAdvancedReports: false,
      canUseApiAccess: false,
      supportLevel: 'basic' as const,
    };
  }

  const { limits } = usage.data;
  const { currentUnits, currentUsers, currentClients, currentAppointments } = usage.data;

  return {
    canCreateUnit: currentUnits < limits.maxUnits,
    canCreateUser: currentUsers < limits.maxUsers,
    canCreateClient: currentClients < limits.maxClients,
    canCreateAppointment: currentAppointments < limits.maxAppointments,
    canUseCustomBranding: false, // TODO: buscar do plano da assinatura
    canUseAdvancedReports: false, // TODO: buscar do plano da assinatura
    canUseApiAccess: false, // TODO: buscar do plano da assinatura
    supportLevel: 'basic' as const, // TODO: buscar do plano da assinatura
  };
}

// ===== HOOKS PARA FILTROS =====

export function useSubscriptionFilters() {
  const { data: plans } = useSubscriptionPlans();

  const statusOptions = [
    { value: 'active', label: 'Ativa' },
    { value: 'trial', label: 'Trial' },
    { value: 'suspended', label: 'Suspensa' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'expired', label: 'Expirada' },
  ];

  const billingCycleOptions = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
  ];

  const planOptions =
    plans?.map((plan) => ({
      value: plan.id,
      label: plan.name,
    })) || [];

  return {
    statusOptions,
    billingCycleOptions,
    planOptions,
  };
}

// ===== HOOKS PARA ESTATÍSTICAS =====

export function useSubscriptionStats() {
  const { data: metrics, isLoading } = useSubscriptionMetrics();

  if (!metrics?.data) {
    return {
      total: 0,
      active: 0,
      trial: 0,
      suspended: 0,
      cancelled: 0,
      monthlyRevenue: 0,
      churnRate: 0,
      isLoading,
    };
  }

  const { data } = metrics;

  return {
    total: data.totalSubscriptions,
    active: data.activeSubscriptions,
    trial: data.trialSubscriptions,
    suspended: data.suspendedSubscriptions,
    cancelled: data.cancelledSubscriptions,
    monthlyRevenue: data.monthlyRevenue,
    churnRate: data.churnRate,
    isLoading,
  };
}
