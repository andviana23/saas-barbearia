'use client';

import { useState, useCallback } from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { DateRange } from '@mui/x-date-pickers-pro';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { DateRange as MetricsDateRange } from '@/services/metrics';
import { PageHeader } from '@/components/ui';
import KpiCard from '@/components/dashboard/KpiCard';
import AreaChartCard from '@/components/dashboard/AreaChartCard';
import BarChartCard from '@/components/dashboard/BarChartCard';
import TopTableCard from '@/components/dashboard/TopTableCard';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';
import {
  useRevenueMetrics,
  useSubscriptionMetrics,
  useAppointmentMetrics,
  useCashboxMetrics,
  useTopServices,
} from '@/hooks/useMetrics';
import { TrendingUp, AccountBalance, CalendarToday, Subscriptions } from '@mui/icons-material';

export default function DashboardClient() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const [from, to] = dateRange;
  const range: MetricsDateRange | null =
    from && to ? { from: from.toDate(), to: to.toDate() } : null;

  // Hooks para métricas
  const { data: revenueMetrics, isLoading: revenueLoading } = useRevenueMetrics(range);
  const { data: subscriptionMetrics, isLoading: subscriptionLoading } =
    useSubscriptionMetrics(range);
  const { data: appointmentMetrics, isLoading: appointmentLoading } = useAppointmentMetrics(range);
  const { data: cashboxMetrics, isLoading: cashboxLoading } = useCashboxMetrics(range);
  const { data: topServices, isLoading: topServicesLoading } = useTopServices(range);

  // Navigation handlers - using useCallback to prevent unnecessary re-renders
  const navigateToFinanceiro = useCallback(() => router.push('/financeiro'), [router]);
  const navigateToAssinaturas = useCallback(() => router.push('/assinaturas'), [router]);
  const navigateToAgenda = useCallback(() => router.push('/agenda'), [router]);
  const navigateToCaixa = useCallback(() => router.push('/caixa'), [router]);

  // Date range change handler - using useCallback to prevent unnecessary re-renders
  // Adaptar assinatura esperada do componente (pode fornecer Date | Dayjs)
  const handleDateRangeChange = useCallback((value: any) => {
    const newValue = value as DateRange<Dayjs | Date> | null;
    const convertedValue: DateRange<Dayjs> = newValue
      ? [newValue[0] ? dayjs(newValue[0]) : null, newValue[1] ? dayjs(newValue[1]) : null]
      : [null, null];
    setDateRange(convertedValue);
  }, []);

  // Verificar se há dados
  const hasData =
    (revenueMetrics?.total ?? 0) > 0 ||
    (subscriptionMetrics?.active ?? 0) > 0 ||
    (appointmentMetrics?.confirmed ?? 0) > 0 ||
    (cashboxMetrics?.balance ?? 0) > 0;

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Visão geral do seu negócio" />

      {/* Filtro de Período */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Período:
          </Typography>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 200 },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Alerta quando não há dados */}
      {!hasData &&
        !revenueLoading &&
        !subscriptionLoading &&
        !appointmentLoading &&
        !cashboxLoading && (
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              <strong>Bem-vindo ao seu dashboard!</strong> Para começar a ver métricas e dados, você
              precisa cadastrar clientes, serviços e criar agendamentos. Os dados aparecerão
              automaticamente aqui conforme você usar o sistema.
            </Typography>
          </Alert>
        )}

      {/* Seção Overview - KPIs */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Visão Geral
        </Typography>
        <Grid container spacing={3}>
          {/* Receita */}
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard
              title="Receita"
              value={
                revenueMetrics?.total && revenueMetrics.total > 0
                  ? `R$ ${revenueMetrics.total.toLocaleString('pt-BR')}`
                  : 'Sem dados'
              }
              delta={
                revenueMetrics?.total && revenueMetrics.total > 0
                  ? revenueMetrics.deltaPct
                  : undefined
              }
              icon={<TrendingUp />}
              subtitle="Últimos 30 dias"
              loading={revenueLoading}
              onClick={navigateToFinanceiro}
            />
          </Grid>

          {/* Assinaturas */}
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard
              title="Assinaturas"
              value={
                subscriptionMetrics?.active && subscriptionMetrics.active > 0
                  ? subscriptionMetrics.active.toString()
                  : 'Sem dados'
              }
              delta={
                subscriptionMetrics?.active && subscriptionMetrics.active > 0
                  ? subscriptionMetrics.deltaPct
                  : undefined
              }
              icon={<Subscriptions />}
              subtitle="Ativas"
              loading={subscriptionLoading}
              onClick={navigateToAssinaturas}
            />
          </Grid>

          {/* Agendamentos */}
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard
              title="Agendamentos"
              value={
                appointmentMetrics?.confirmed && appointmentMetrics.confirmed > 0
                  ? appointmentMetrics.confirmed.toString()
                  : 'Sem dados'
              }
              delta={
                appointmentMetrics?.confirmed && appointmentMetrics.confirmed > 0
                  ? appointmentMetrics.deltaPct
                  : undefined
              }
              icon={<CalendarToday />}
              subtitle="Confirmados"
              loading={appointmentLoading}
              onClick={navigateToAgenda}
            />
          </Grid>

          {/* Caixa */}
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard
              title="Caixa"
              value={
                cashboxMetrics?.balance && cashboxMetrics.balance > 0
                  ? `R$ ${cashboxMetrics.balance.toLocaleString('pt-BR')}`
                  : 'Sem dados'
              }
              delta={
                cashboxMetrics?.balance && cashboxMetrics.balance > 0
                  ? cashboxMetrics.deltaPct
                  : undefined
              }
              icon={<AccountBalance />}
              subtitle="Saldo atual"
              loading={cashboxLoading}
              onClick={navigateToCaixa}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Seção de Gráficos */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Gráfico de Receita Acumulada */}
        <Grid item xs={12} lg={8}>
          <DashboardErrorBoundary fallbackTitle="Erro no Gráfico de Receita">
            <AreaChartCard
              title="Receita Acumulada"
              series={[
                {
                  name: 'Receita',
                  data:
                    revenueMetrics?.seriesDaily && revenueMetrics.seriesDaily.length > 0
                      ? revenueMetrics.seriesDaily.map((item) => ({
                          x: item.date,
                          y: item.value,
                        }))
                      : [],
                },
              ]}
              loading={revenueLoading}
            />
          </DashboardErrorBoundary>
        </Grid>

        {/* Receita por Categoria */}
        <Grid item xs={12} lg={4}>
          <DashboardErrorBoundary fallbackTitle="Erro no Gráfico por Categoria">
            <BarChartCard
              title="Receita por Categoria"
              series={
                // seriesByCategory pode não existir no tipo; usar optional chaining com cast
                (revenueMetrics as any)?.seriesByCategory &&
                (revenueMetrics as any).seriesByCategory.length > 0
                  ? (revenueMetrics as any).seriesByCategory.map((item: any) => ({
                      name: item.category,
                      data: [item.value],
                    }))
                  : []
              }
              loading={revenueLoading}
            />
          </DashboardErrorBoundary>
        </Grid>
      </Grid>

      {/* Seção de Tabelas */}
      <Grid container spacing={4}>
        {/* Top Serviços */}
        <Grid item xs={12} lg={6}>
          <DashboardErrorBoundary fallbackTitle="Erro na Tabela de Serviços">
            <TopTableCard
              title="Top Serviços"
              headers={['Serviço', 'Receita', 'Qtd']}
              rows={
                topServices && topServices.length > 0
                  ? topServices.map((service) => ({
                      id: service.id,
                      cells: [
                        service.name,
                        `R$ ${service.revenue.toLocaleString('pt-BR')}`,
                        service.count.toString(),
                      ],
                    }))
                  : []
              }
              loading={topServicesLoading}
              emptyMessage="Nenhum serviço encontrado"
            />
          </DashboardErrorBoundary>
        </Grid>

        {/* Top Clientes */}
        <Grid item xs={12} lg={6}>
          <DashboardErrorBoundary fallbackTitle="Erro na Tabela de Clientes">
            <TopTableCard
              title="Top Clientes"
              headers={['Cliente', 'Receita', 'Visitas']}
              rows={[]} // Implementar useTopClients se necessário
              loading={false}
              emptyMessage="Nenhum cliente encontrado"
            />
          </DashboardErrorBoundary>
        </Grid>
      </Grid>
    </Box>
  );
}
