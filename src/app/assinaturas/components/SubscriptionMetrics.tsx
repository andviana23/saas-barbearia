'use client';

import { Box, Grid, Card, CardContent, Typography, Skeleton, Chip } from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useSubscriptionStats } from '@/hooks/use-subscriptions';

interface SubscriptionMetricsProps {
  stats: ReturnType<typeof useSubscriptionStats>;
}

export function SubscriptionMetrics({ stats }: SubscriptionMetricsProps) {
  const { total, active, trial, suspended, cancelled, monthlyRevenue, churnRate, isLoading } =
    stats;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'suspended':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="text" width="80%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Total de Assinaturas */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total de Assinaturas
                </Typography>
                <Typography variant="h4" component="h2">
                  {total}
                </Typography>
              </Box>
              <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Assinaturas Ativas */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Assinaturas Ativas
                </Typography>
                <Typography variant="h4" component="h2" color="success.main">
                  {active}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Chip label="Ativa" color="success" size="small" icon={<TrendingUpIcon />} />
                </Box>
              </Box>
              <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Receita Mensal */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Receita Mensal
                </Typography>
                <Typography variant="h4" component="h2" color="primary.main">
                  {formatCurrency(monthlyRevenue)}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  MRR (Monthly Recurring Revenue)
                </Typography>
              </Box>
              <MoneyIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Taxa de Churn */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Taxa de Churn
                </Typography>
                <Typography variant="h4" component="h2" color="error.main">
                  {formatPercentage(churnRate)}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Assinaturas canceladas
                </Typography>
              </Box>
              <CancelIcon color="error" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Status Detalhados */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Status das Assinaturas
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip
                label={`Trial: ${trial}`}
                color="info"
                variant="outlined"
                icon={<PeopleIcon />}
              />
              <Chip
                label={`Suspensa: ${suspended}`}
                color="warning"
                variant="outlined"
                icon={<PeopleIcon />}
              />
              <Chip
                label={`Cancelada: ${cancelled}`}
                color="error"
                variant="outlined"
                icon={<PeopleIcon />}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
