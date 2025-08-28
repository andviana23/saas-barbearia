'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { SubscriptionPlan } from '@/types/subscription';

interface ViewPlanDialogProps {
  open: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
}

export function ViewPlanDialog({ open, onClose, plan }: ViewPlanDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return 'Mensal';
      case 'quarterly':
        return 'Trimestral';
      case 'yearly':
        return 'Anual';
      default:
        return cycle;
    }
  };

  const getSupportLevelLabel = (level: string) => {
    switch (level) {
      case 'basic':
        return 'Básico';
      case 'standard':
        return 'Padrão';
      case 'premium':
        return 'Premium';
      default:
        return level;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalhes do Plano: {plan.name}
        <Typography variant="subtitle2" color="textSecondary">
          {formatCurrency(plan.price)}/{getBillingCycleLabel(plan.billingCycle).toLowerCase()}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Status e Informações Principais */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Chip
                    label={plan.isActive ? 'Ativo' : 'Inativo'}
                    color={plan.isActive ? 'success' : 'default'}
                    size="medium"
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    ID: {plan.id}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    Criado em: {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Informações Básicas */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Informações Básicas
            </Typography>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" paragraph>
                <strong>Nome:</strong> {plan.name}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Preço:</strong> {formatCurrency(plan.price)}/
                {getBillingCycleLabel(plan.billingCycle).toLowerCase()}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Ciclo de Cobrança:</strong> {getBillingCycleLabel(plan.billingCycle)}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Dias de Trial:</strong>{' '}
                {plan.trialDays > 0 ? `${plan.trialDays} dias` : 'Sem trial'}
              </Typography>
              {plan.setupFee > 0 && (
                <Typography variant="body2">
                  <strong>Taxa de Setup:</strong> {formatCurrency(plan.setupFee)}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Descrição */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Descrição
            </Typography>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                height: '100%',
              }}
            >
              <Typography variant="body2">{plan.description}</Typography>
            </Box>
          </Grid>

          {/* Limites de Uso */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Limites de Uso
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Recurso</TableCell>
                    <TableCell>Limite</TableCell>
                    <TableCell>Descrição</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Unidades</TableCell>
                    <TableCell>{plan.features.maxUnits}</TableCell>
                    <TableCell>Número máximo de unidades que podem ser criadas</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Usuários</TableCell>
                    <TableCell>{plan.features.maxUsers}</TableCell>
                    <TableCell>Número máximo de usuários que podem ser cadastrados</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Clientes</TableCell>
                    <TableCell>{plan.features.maxClients}</TableCell>
                    <TableCell>Número máximo de clientes que podem ser cadastrados</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Agendamentos</TableCell>
                    <TableCell>{plan.features.maxAppointments}</TableCell>
                    <TableCell>Número máximo de agendamentos permitidos</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Recursos e Suporte */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Recursos e Suporte
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Nível de Suporte
                  </Typography>
                  <Chip
                    label={getSupportLevelLabel(plan.features.supportLevel)}
                    color={
                      plan.features.supportLevel === 'premium'
                        ? 'success'
                        : plan.features.supportLevel === 'standard'
                          ? 'primary'
                          : 'default'
                    }
                    variant="outlined"
                  />
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    {plan.features.supportLevel === 'premium' && 'Suporte prioritário 24/7'}
                    {plan.features.supportLevel === 'standard' && 'Suporte em horário comercial'}
                    {plan.features.supportLevel === 'basic' && 'Suporte por email'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Recursos Especiais
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={plan.features.customBranding ? 'Sim' : 'Não'}
                        color={plan.features.customBranding ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2">Marca Personalizada</Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={plan.features.advancedReports ? 'Sim' : 'Não'}
                        color={plan.features.advancedReports ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2">Relatórios Avançados</Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={plan.features.apiAccess ? 'Sim' : 'Não'}
                        color={plan.features.apiAccess ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2">Acesso à API</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Comparação de Preços */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Comparação de Preços por Ciclo
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ciclo</TableCell>
                    <TableCell>Preço</TableCell>
                    <TableCell>Economia</TableCell>
                    <TableCell>Preço Mensal Equivalente</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Mensal</TableCell>
                    <TableCell>{formatCurrency(plan.price)}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{formatCurrency(plan.price)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Trimestral</TableCell>
                    <TableCell>{formatCurrency(plan.price * 3)}</TableCell>
                    <TableCell>0%</TableCell>
                    <TableCell>{formatCurrency(plan.price)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Anual</TableCell>
                    <TableCell>{formatCurrency(plan.price * 12)}</TableCell>
                    <TableCell>0%</TableCell>
                    <TableCell>{formatCurrency(plan.price)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              * Os preços são os mesmos independente do ciclo de cobrança
            </Typography>
          </Grid>

          {/* Informações de Sistema */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Informações de Sistema
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Criado em
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {new Date(plan.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(plan.createdAt).toLocaleTimeString('pt-BR')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Última atualização
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {new Date(plan.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(plan.updatedAt).toLocaleTimeString('pt-BR')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
