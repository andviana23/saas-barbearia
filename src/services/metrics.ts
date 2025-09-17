/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserSupabase } from '@/lib/supabase/client';

// Tipos mínimos locais para evitar propagação de any e explosão de tipos do supabase
interface FinancialTxRecord {
  amount_cents?: number | null;
  type?: string | null;
  created_at?: string | null;
  unit_id?: string | null;
}
interface SubscriptionRecord {
  status?: string | null;
  created_at?: string | null;
  unit_id?: string | null;
}
interface AppointmentRecord {
  status?: string | null;
  created_at?: string | null;
  unit_id?: string | null;
}
interface CashboxTxRecord {
  amount_cents?: number | null;
  type?: string | null;
  created_at?: string | null;
  unit_id?: string | null;
}
interface AppointmentServiceRecord {
  service_id?: string | null;
  price?: number | null;
  services?: { id?: string; name?: string } | null;
  appointments?: { id?: string; status?: string; unit_id?: string } | null;
}

export type DateRange = {
  from: Date;
  to: Date;
};

export type RevenueMetrics = {
  total: number;
  deltaPct: number;
  seriesDaily: Array<{ date: string; value: number }>;
  seriesMonthly: Array<{ month: string; value: number }>;
};

export type SubscriptionMetrics = {
  active: number;
  new: number;
  churnPct: number;
  deltaPct: number;
};

export type AppointmentMetrics = {
  confirmed: number;
  canceled: number;
  noShow: number;
  deltaPct: number;
};

export type CashboxMetrics = {
  inflow: number;
  outflow: number;
  balance: number;
  deltaPct: number;
};

export type TopService = {
  id: string;
  name: string;
  revenue: number;
  count: number;
};

export async function getRevenueMetrics(
  range: DateRange,
  unidadeId?: string,
): Promise<RevenueMetrics> {
  // Usamos casting pontual para evitar TS2589 mantendo superfície tipada mínima
  const supabase = createBrowserSupabase() as unknown as {
    from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  try {
    // Separar declaração para evitar profundidade de tipo excessiva no encadeamento
    let query: any = supabase
      .from('financial_transactions')
      .select('amount_cents, type, created_at, unit_id');

    // Cast para any para evitar problemas de tipagem do Supabase
    query = query.eq('type' as any, 'income' as any);
    query = query.gte('created_at' as any, range.from.toISOString());
    query = query.lte('created_at' as any, range.to.toISOString());

    if (unidadeId) {
      query = query.eq('unit_id' as any, unidadeId as any);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Erro ao buscar métricas de receita:', error);
      return { total: 0, deltaPct: 0, seriesDaily: [], seriesMonthly: [] };
    }

    // Cast para any[] para evitar problemas de tipagem
    const records: FinancialTxRecord[] = Array.isArray(data) ? (data as FinancialTxRecord[]) : [];
    const validRecords = records.filter((item) => item && typeof item === 'object');

    const total =
      validRecords.reduce((sum, item) => {
        const amount = item.amount_cents || 0;
        return sum + amount;
      }, 0) / 100;

    // Agrupar por dia
    const dailyMap = new Map<string, number>();
    validRecords.forEach((item) => {
      if (item.created_at) {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        const amount = (item.amount_cents || 0) / 100;
        dailyMap.set(date, (dailyMap.get(date) || 0) + amount);
      }
    });
    const seriesDaily = Array.from(dailyMap.entries()).map(([date, value]) => ({
      date,
      value,
    }));

    // Agrupar por mês
    const monthlyMap = new Map<string, number>();
    validRecords.forEach((item) => {
      if (item.created_at) {
        const month = new Date(item.created_at).toISOString().slice(0, 7);
        const amount = (item.amount_cents || 0) / 100;
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + amount);
      }
    });
    const seriesMonthly = Array.from(monthlyMap.entries()).map(([month, value]) => ({
      month,
      value,
    }));

    // Calcular variação vs período anterior
    const prevFrom = new Date(range.from);
    const prevTo = new Date(range.to);
    const diffMs = range.to.getTime() - range.from.getTime();
    prevTo.setTime(prevFrom.getTime() - 1);
    prevFrom.setTime(prevFrom.getTime() - diffMs);

    let prevQuery: any = supabase
      .from('financial_transactions')
      .select('amount_cents, type, created_at, unit_id');

    prevQuery = prevQuery.eq('type' as any, 'income' as any);
    prevQuery = prevQuery.gte('created_at' as any, prevFrom.toISOString());
    prevQuery = prevQuery.lte('created_at' as any, prevTo.toISOString());

    if (unidadeId) {
      prevQuery = prevQuery.eq('unit_id' as any, unidadeId as any);
    }

    const { data: prevData } = await prevQuery;
    const prevRecords: FinancialTxRecord[] = (Array.isArray(prevData) ? prevData : []).filter(
      (item): item is FinancialTxRecord => !!item && typeof item === 'object',
    );
    const prevTotal = prevRecords.reduce((sum, item) => sum + (item.amount_cents || 0), 0) / 100;

    const deltaPct = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

    return { total, deltaPct, seriesDaily, seriesMonthly };
  } catch (error) {
    console.error('Erro inesperado ao buscar métricas de receita:', error);
    return { total: 0, deltaPct: 0, seriesDaily: [], seriesMonthly: [] };
  }
}

export async function getSubscriptionMetrics(
  range: DateRange,
  unidadeId?: string,
): Promise<SubscriptionMetrics> {
  const supabase = createBrowserSupabase() as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  try {
    let query: any = supabase.from('subscriptions').select('status, created_at, unit_id');

    query = query.gte('created_at' as any, range.from.toISOString());
    query = query.lte('created_at' as any, range.to.toISOString());

    if (unidadeId) {
      query = query.eq('unit_id' as any, unidadeId as any);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Erro ao buscar métricas de assinaturas:', error);
      return { active: 0, new: 0, churnPct: 0, deltaPct: 0 };
    }

    const records: SubscriptionRecord[] = Array.isArray(data) ? data : [];
    const validRecords = records.filter((item): item is SubscriptionRecord => !!item);

    const active = validRecords.filter((item) => item.status === 'ativa').length;
    const newSubscriptions = validRecords.filter((item) => {
      if (!item.created_at) return false;
      const date = new Date(item.created_at);
      return date >= range.from && date <= range.to;
    }).length;

    // Calcular período anterior
    const prevFrom = new Date(range.from);
    const prevTo = new Date(range.to);
    const diffMs = range.to.getTime() - range.from.getTime();
    prevTo.setTime(prevFrom.getTime() - 1);
    prevFrom.setTime(prevFrom.getTime() - diffMs);

    let prevQuery: any = supabase.from('subscriptions').select('status, created_at, unit_id');

    prevQuery = prevQuery.gte('created_at' as any, prevFrom.toISOString());
    prevQuery = prevQuery.lte('created_at' as any, prevTo.toISOString());

    if (unidadeId) {
      prevQuery = prevQuery.eq('unit_id' as any, unidadeId as any);
    }

    const { data: prevData } = await prevQuery;
    const prevRecords: SubscriptionRecord[] = (Array.isArray(prevData) ? prevData : []).filter(
      (item): item is SubscriptionRecord => !!item,
    );
    const prevNew = prevRecords.filter((item) => {
      if (!item.created_at) return false;
      const date = new Date(item.created_at);
      return date >= prevFrom && date <= prevTo;
    }).length;

    const deltaPct = prevNew > 0 ? ((newSubscriptions - prevNew) / prevNew) * 100 : 0;

    return { active, new: newSubscriptions, churnPct: 0, deltaPct };
  } catch (error) {
    console.error('Erro inesperado ao buscar métricas de assinaturas:', error);
    return { active: 0, new: 0, churnPct: 0, deltaPct: 0 };
  }
}

export async function getAppointmentMetrics(
  range: DateRange,
  unidadeId?: string,
): Promise<AppointmentMetrics> {
  const supabase = createBrowserSupabase() as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  try {
    let query: any = supabase.from('appointments').select('status, created_at, unit_id');

    query = query.gte('created_at' as any, range.from.toISOString());
    query = query.lte('created_at' as any, range.to.toISOString());

    if (unidadeId) {
      query = query.eq('unit_id' as any, unidadeId as any);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Erro ao buscar métricas de agendamentos:', error);
      return { confirmed: 0, canceled: 0, noShow: 0, deltaPct: 0 };
    }

    const records: AppointmentRecord[] = Array.isArray(data) ? data : [];
    const validRecords = records.filter((item): item is AppointmentRecord => !!item);

    const confirmed = validRecords.filter((item) => item.status === 'confirmado').length;
    const canceled = validRecords.filter((item) => item.status === 'cancelado').length;
    const noShow = validRecords.filter((item) => item.status === 'no_show').length;

    // Calcular período anterior
    const prevFrom = new Date(range.from);
    const prevTo = new Date(range.to);
    const diffMs = range.to.getTime() - range.from.getTime();
    prevTo.setTime(prevFrom.getTime() - 1);
    prevFrom.setTime(prevFrom.getTime() - diffMs);

    let prevQuery: any = supabase.from('appointments').select('status, created_at, unit_id');

    prevQuery = prevQuery.gte('created_at' as any, prevFrom.toISOString());
    prevQuery = prevQuery.lte('created_at' as any, prevTo.toISOString());

    if (unidadeId) {
      prevQuery = prevQuery.eq('unit_id' as any, unidadeId as any);
    }

    const { data: prevApts } = await prevQuery;
    const prevRecords: AppointmentRecord[] = (Array.isArray(prevApts) ? prevApts : []).filter(
      (item): item is AppointmentRecord => !!item,
    );
    const prevConfirmed = prevRecords.filter((item) => item.status === 'confirmado').length;

    const deltaPct = prevConfirmed > 0 ? ((confirmed - prevConfirmed) / prevConfirmed) * 100 : 0;

    return { confirmed, canceled, noShow, deltaPct };
  } catch (error) {
    console.error('Erro inesperado ao buscar métricas de agendamentos:', error);
    return { confirmed: 0, canceled: 0, noShow: 0, deltaPct: 0 };
  }
}

export async function getCashboxMetrics(
  range: DateRange,
  unidadeId?: string,
): Promise<CashboxMetrics> {
  const supabase = createBrowserSupabase() as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  try {
    let query: any = supabase
      .from('cashbox_transactions')
      .select('amount_cents, type, created_at, unit_id');

    query = query.gte('created_at' as any, range.from.toISOString());
    query = query.lte('created_at' as any, range.to.toISOString());

    if (unidadeId) {
      query = query.eq('unit_id' as any, unidadeId as any);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Erro ao buscar métricas de caixa:', error);
      return { inflow: 0, outflow: 0, balance: 0, deltaPct: 0 };
    }

    const records: CashboxTxRecord[] = Array.isArray(data) ? data : [];
    const validRecords = records.filter((item): item is CashboxTxRecord => !!item);

    const inflow =
      validRecords
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + (item.amount_cents || 0), 0) / 100;

    const outflow =
      validRecords
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + (item.amount_cents || 0), 0) / 100;

    const balance = inflow - outflow;

    // Calcular período anterior
    const prevFrom = new Date(range.from);
    const prevTo = new Date(range.to);
    const diffMs = range.to.getTime() - range.from.getTime();
    prevTo.setTime(prevFrom.getTime() - 1);
    prevFrom.setTime(prevFrom.getTime() - diffMs);

    let prevQuery: any = supabase
      .from('cashbox_transactions')
      .select('amount_cents, type, created_at, unit_id');

    prevQuery = prevQuery.gte('created_at' as any, prevFrom.toISOString());
    prevQuery = prevQuery.lte('created_at' as any, prevTo.toISOString());

    if (unidadeId) {
      prevQuery = prevQuery.eq('unit_id' as any, unidadeId as any);
    }

    const { data: prevData } = await prevQuery;
    const prevRecords: CashboxTxRecord[] = (Array.isArray(prevData) ? prevData : []).filter(
      (item): item is CashboxTxRecord => !!item,
    );

    const prevInflow =
      prevRecords
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + (item.amount_cents || 0), 0) / 100;

    const prevOutflow =
      prevRecords
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + (item.amount_cents || 0), 0) / 100;

    const prevBalance = prevInflow - prevOutflow;
    const deltaPct =
      prevBalance !== 0 ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;

    return { inflow, outflow, balance, deltaPct };
  } catch (error) {
    console.error('Erro inesperado ao buscar métricas de caixa:', error);
    return { inflow: 0, outflow: 0, balance: 0, deltaPct: 0 };
  }
}

export async function getTopServices(
  range: DateRange,
  unidadeId?: string,
  limit = 5,
): Promise<TopService[]> {
  const supabase = createBrowserSupabase() as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  try {
    let query: any = supabase.from('appointment_services').select(`
        service_id,
        price,
        appointments!inner (
          id,
          status,
          unit_id
        ),
        services!inner (
          id,
          name
        )
      `);

    query = query.eq('appointments.status' as any, 'confirmado' as any);
    query = query.gte('appointments.created_at' as any, range.from.toISOString());
    query = query.lte('appointments.created_at' as any, range.to.toISOString());

    if (unidadeId) {
      query = query.eq('appointments.unit_id' as any, unidadeId as any);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Erro ao buscar top serviços:', error);
      return [];
    }

    const records: AppointmentServiceRecord[] = Array.isArray(data) ? data : [];
    const validRecords = records.filter((item): item is AppointmentServiceRecord => !!item);

    // Agrupar por serviço
    const serviceMap = new Map<string, { name: string; revenue: number; count: number }>();

    validRecords.forEach((item) => {
      const serviceId = item.service_id || '';
      const price = item.price || 0;
      const serviceName = item.services?.name || `Serviço ${serviceId}`;

      if (serviceId) {
        const current = serviceMap.get(serviceId) || { name: serviceName, revenue: 0, count: 0 };
        current.revenue += price;
        current.count += 1;
        serviceMap.set(serviceId, current);
      }
    });

    // Converter para array e ordenar por receita
    const topServices = Array.from(serviceMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        revenue: data.revenue,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return topServices;
  } catch (error) {
    console.error('Erro inesperado ao buscar top serviços:', error);
    return [];
  }
}
