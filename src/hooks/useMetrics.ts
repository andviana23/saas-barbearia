'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getRevenueMetrics,
  getSubscriptionMetrics,
  getAppointmentMetrics,
  getCashboxMetrics,
  getTopServices,
  type DateRange,
} from '@/services/metrics';
import { useAuth } from '@/hooks/use-auth';

// Hook para métricas de receita
export function useRevenueMetrics(range: DateRange | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['revenue', range, user?.unidade_default_id],
    queryFn: () => getRevenueMetrics(range!, user?.unidade_default_id),
    enabled: !!range,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

// Hook para métricas de assinaturas
export function useSubscriptionMetrics(range: DateRange | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['subscriptions', range, user?.unidade_default_id],
    queryFn: () => getSubscriptionMetrics(range!, user?.unidade_default_id),
    enabled: !!range,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// Hook para métricas de agendamentos
export function useAppointmentMetrics(range: DateRange | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['appointments', range, user?.unidade_default_id],
    queryFn: () => getAppointmentMetrics(range!, user?.unidade_default_id),
    enabled: !!range,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// Hook para métricas de caixa
export function useCashboxMetrics(range: DateRange | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cashbox', range, user?.unidade_default_id],
    queryFn: () => getCashboxMetrics(range!, user?.unidade_default_id),
    enabled: !!range,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// Hook para top serviços
export function useTopServices(range: DateRange | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['topServices', range, user?.unidade_default_id],
    queryFn: () => getTopServices(range!, user?.unidade_default_id),
    enabled: !!range,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// Hook genérico para métricas
export function useMetrics(
  type: 'revenue' | 'subscriptions' | 'appointments' | 'cashbox' | 'topServices',
  range: DateRange | null,
) {
  const hooks = {
    revenue: useRevenueMetrics,
    subscriptions: useSubscriptionMetrics,
    appointments: useAppointmentMetrics,
    cashbox: useCashboxMetrics,
    topServices: useTopServices,
  };

  return hooks[type](range);
}
