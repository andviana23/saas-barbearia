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
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Subscription, SubscriptionPlan } from '@/types/subscription';
import dayjs from 'dayjs';

interface ViewSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: Subscription;
  plan?: SubscriptionPlan;
}

export function ViewSubscriptionDialog({
  open,
  onClose,
  subscription,
  plan,
}: ViewSubscriptionDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
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
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'trial':
        return 'Trial';
      case 'suspended':
        return 'Suspensa';
      case 'cancelled':
        return 'Cancelada';
      case 'expired':
        return 'Expirada';
      default:
        return status;
    }
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'bank_slip':
        return 'Boleto';
      default:
        return method;
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
        Detalhes da Assinatura
        <Typography variant="subtitle2" color="textSecondary">
          {subscription.unidade?.name} - {plan?.name}
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
                    label={getStatusLabel(subscription.status)}
                    color={getStatusColor(subscription.status)}
                    size="medium"
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    ID: {subscription.id}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    ASAAS ID: {subscription.asaasSubscriptionId}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Informações da Unidade */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Unidade
            </Typography>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Nome:</strong> {subscription.unidade?.name || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>CNPJ:</strong> {subscription.unidade?.cnpj || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Cliente ASAAS:</strong> {subscription.customerId}
              </Typography>
            </Box>
          </Grid>

          {/* Informações do Plano */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Plano
            </Typography>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Nome:</strong> {plan?.name || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Preço:</strong> {plan ? formatCurrency(plan.price) : 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Descrição:</strong> {plan?.description || 'N/A'}
              </Typography>
            </Box>
          </Grid>

          {/* Datas e Períodos */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Datas e Períodos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Data de Início
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(subscription.startDate)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Próxima Cobrança
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(subscription.nextBillingDate)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Período Atual
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(subscription.currentPeriodStart)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    até {formatDate(subscription.currentPeriodEnd)}
                  </Typography>
                </Box>
              </Grid>

              {subscription.trialEnd && (
                <Grid item xs={12} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="textSecondary">
                      Fim do Trial
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(subscription.trialEnd)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Configurações de Cobrança */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Configurações de Cobrança
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Ciclo de Cobrança
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {getBillingCycleLabel(subscription.billingCycle)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Método de Pagamento
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {getPaymentMethodLabel(subscription.paymentMethod)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Renovação Automática
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {subscription.autoRenew ? 'Sim' : 'Não'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Recursos do Plano */}
          {plan && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Recursos Incluídos
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Recurso</TableCell>
                      <TableCell>Limite</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Unidades</TableCell>
                      <TableCell>{plan.features.maxUnits}</TableCell>
                      <TableCell>
                        <Chip label="Incluído" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Usuários</TableCell>
                      <TableCell>{plan.features.maxUsers}</TableCell>
                      <TableCell>
                        <Chip label="Incluído" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Clientes</TableCell>
                      <TableCell>{plan.features.maxClients}</TableCell>
                      <TableCell>
                        <Chip label="Incluído" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Agendamentos</TableCell>
                      <TableCell>{plan.features.maxAppointments}</TableCell>
                      <TableCell>
                        <Chip label="Incluído" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Suporte</TableCell>
                      <TableCell>{getSupportLevelLabel(plan.features.supportLevel)}</TableCell>
                      <TableCell>
                        <Chip label="Incluído" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Marca Personalizada</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        {plan.features.customBranding ? (
                          <Chip label="Sim" color="success" size="small" />
                        ) : (
                          <Chip label="Não" color="default" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Relatórios Avançados</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        {plan.features.advancedReports ? (
                          <Chip label="Sim" color="success" size="small" />
                        ) : (
                          <Chip label="Não" color="default" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Acesso à API</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        {plan.features.apiAccess ? (
                          <Chip label="Sim" color="success" size="small" />
                        ) : (
                          <Chip label="Não" color="default" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* Observações */}
          {subscription.notes && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Observações
              </Typography>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">{subscription.notes}</Typography>
              </Box>
            </Grid>
          )}

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
                    {formatDate(subscription.createdAt)}
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
                    {formatDate(subscription.updatedAt)}
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
