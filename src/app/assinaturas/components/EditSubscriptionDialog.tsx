'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useUpdateSubscription } from '@/hooks/use-subscriptions';
import { Subscription, SubscriptionPlan } from '@/types/subscription';
import dayjs, { Dayjs } from 'dayjs';

interface EditSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: Subscription;
  plans: SubscriptionPlan[];
}

export function EditSubscriptionDialog({
  open,
  onClose,
  subscription,
  plans,
}: EditSubscriptionDialogProps) {
  const [formData, setFormData] = useState({
    planId: '',
    unidadeId: '',
    customerId: '',
    startDate: dayjs() as Dayjs,
    billingCycle: 'monthly',
    paymentMethod: 'pix',
    autoRenew: true,
    notes: '',
    status: 'active',
  });

  const updateSubscription = useUpdateSubscription();

  useEffect(() => {
    if (subscription) {
      setFormData({
        planId: subscription.planId,
        unidadeId: subscription.unitId || subscription.unidadeId || '',
        customerId: subscription.customerId,
        startDate: dayjs(subscription.startDate),
        billingCycle: subscription.billingCycle,
        paymentMethod: subscription.paymentMethod,
        autoRenew: subscription.autoRenew,
        notes: subscription.notes || '',
        status: subscription.status,
      });
    }
  }, [subscription]);

  const handleInputChange = (field: string, value: string | boolean | Dayjs) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'startDate' && dayjs.isDayjs(value)) {
        formDataObj.append(key, value.toISOString());
      } else {
        formDataObj.append(key, String(value));
      }
    });

    const result = await updateSubscription.mutateAsync({
      subscriptionId: subscription.id,
      formData: formDataObj,
    });

    if (result.success) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!updateSubscription.isPending) {
      onClose();
    }
  };

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

  const selectedPlan = plans.find((p) => p.id === formData.planId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Assinatura</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Status da Assinatura */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Status da Assinatura
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="active">Ativa</MenuItem>
                  <MenuItem value="trial">Trial</MenuItem>
                  <MenuItem value="suspended">Suspensa</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                  <MenuItem value="expired">Expirada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.autoRenew}
                    onChange={(e) => handleInputChange('autoRenew', e.target.checked)}
                  />
                }
                label="Renovação Automática"
              />
            </Grid>

            {/* Seleção de Plano */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Plano
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Plano</InputLabel>
                <Select
                  value={formData.planId}
                  onChange={(e) => handleInputChange('planId', e.target.value)}
                  label="Plano"
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatCurrency(plan.price)}/
                      {getBillingCycleLabel(plan.billingCycle).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Ciclo de Cobrança</InputLabel>
                <Select
                  value={formData.billingCycle}
                  onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                  label="Ciclo de Cobrança"
                >
                  <MenuItem value="monthly">Mensal</MenuItem>
                  <MenuItem value="quarterly">Trimestral</MenuItem>
                  <MenuItem value="yearly">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Informações do Plano Selecionado */}
            {selectedPlan && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Detalhes do Plano: {selectedPlan.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Preço:</strong> {formatCurrency(selectedPlan.price)}/
                        {getBillingCycleLabel(selectedPlan.billingCycle).toLowerCase()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Trial:</strong>{' '}
                        {selectedPlan.trialDays > 0
                          ? `${selectedPlan.trialDays} dias`
                          : 'Sem trial'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Recursos:</strong> {selectedPlan.features.maxUnits} unidades,{' '}
                        {selectedPlan.features.maxUsers} usuários,{' '}
                        {selectedPlan.features.maxClients} clientes
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* Configurações de Pagamento */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Configurações de Pagamento
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Método de Pagamento</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  label="Método de Pagamento"
                >
                  <MenuItem value="pix">PIX</MenuItem>
                  <MenuItem value="credit_card">Cartão de Crédito</MenuItem>
                  <MenuItem value="bank_slip">Boleto</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Data de Início"
                value={formData.startDate}
                onChange={(date) => handleInputChange('startDate', (date as any) || dayjs())}
                format="DD/MM/YYYY HH:mm"
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: 'Data e hora de início da assinatura',
                  },
                }}
              />
            </Grid>

            {/* Informações da Unidade */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Unidade
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID da Unidade"
                value={formData.unidadeId}
                onChange={(e) => handleInputChange('unidadeId', e.target.value)}
                required
                disabled
                helperText="ID da unidade não pode ser alterado"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID do Cliente ASAAS"
                value={formData.customerId}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
                required
                helperText="ID do cliente no sistema ASAAS"
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações adicionais sobre a assinatura"
              />
            </Grid>

            {/* Informações Atuais */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Atuais
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'blue.50', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Status Atual:</strong> {getStatusLabel(subscription.status)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Próxima Cobrança:</strong>{' '}
                      {dayjs(subscription.nextBillingDate).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Período Atual:</strong>{' '}
                      {dayjs(subscription.currentPeriodStart).format('DD/MM/YYYY')} até{' '}
                      {dayjs(subscription.currentPeriodEnd).format('DD/MM/YYYY')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>ID ASAAS:</strong> {subscription.asaasSubscriptionId}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* Mensagens de erro */}
          {updateSubscription.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {String(updateSubscription.error)}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={updateSubscription.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateSubscription.isPending}
            startIcon={updateSubscription.isPending ? <CircularProgress size={20} /> : null}
          >
            {updateSubscription.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
