'use client';

import { useState, useCallback } from 'react';
import { Box, Grid, Typography, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { DateRange as MetricsDateRange } from '@/services/metrics';
import { PageHeader, Card } from '@/components/ui';
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
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const range: MetricsDateRange | null =
    startDate && endDate ? { from: startDate.toDate(), to: endDate.toDate() } : null;

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
      <Card sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Período:
          </Typography>
          <DatePicker
            label="Data inicial"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue ? dayjs(newValue) : null)}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 160 },
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            até
          </Typography>
          <DatePicker
            label="Data final"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue ? dayjs(newValue) : null)}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 160 },
              },
            }}
          />
        </Box>
      </Card>

      {/* Alerta quando não há dados */}
      {!hasData &&
        !revenueLoading &&
        !subscriptionLoading &&
        !appointmentLoading &&
        !cashboxLoading && (
          <Alert
            severity="info"
            sx={{
              mb: 4,
              borderRadius: '4px', // radius.md
              backgroundColor: 'rgba(244, 163, 0, 0.08)', // primary com transparência
              border: '1px solid rgba(244, 163, 0, 0.2)',
            }}
          >
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
                // Dados por categoria podem não estar disponíveis nos tipos atuais
                []
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
