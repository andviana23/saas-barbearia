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
  Autocomplete,
  Card,
  CardContent,
  Chip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  QrCode2 as QrCodeIcon,
  CreditCard as CreditCardIcon,
  Pix as PixIcon,
  Receipt as ReceiptIcon,
  Link as LinkIcon,
  LocalAtm as CashIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useCreateSubscription } from '@/hooks/use-subscriptions';
import { useUnidades } from '@/hooks/use-unidades';
import { SubscriptionPlan } from '@/types/subscription';
import dayjs, { Dayjs } from 'dayjs';

interface CreateSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export function CreateSubscriptionDialog({ open, onClose, plans }: CreateSubscriptionDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [subscriptionType, setSubscriptionType] = useState<'asaas' | 'external'>('asaas');

  const [formData, setFormData] = useState({
    planId: '',
    unidadeId: '',
    customerId: '',
    startDate: dayjs().add(1, 'day') as Dayjs,
    billingCycle: 'monthly',
    paymentMethod: 'pix',
    autoRenew: true,
    notes: '',
  });

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedUnidade, setSelectedUnidade] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchClient, setSearchClient] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');

  // Mock de clientes - em produção viria da API
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11999887766',
      cpf: '123.456.789-01',
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '11988776655',
      cpf: '987.654.321-09',
    },
    {
      id: '3',
      name: 'Pedro Lima',
      email: 'pedro@email.com',
      phone: '11977665544',
      cpf: '456.789.123-45',
    },
  ];

  const steps = ['Plano & Cliente', 'Pagamento', 'Confirmação'];

  const createSubscription = useCreateSubscription();
  const { data: unidades } = useUnidades();

  useEffect(() => {
    if (formData.planId) {
      const plan = plans.find((p) => p.id === formData.planId);
      setSelectedPlan(plan || null);
    }
  }, [formData.planId, plans]);

  useEffect(() => {
    if (formData.unidadeId) {
      const unidade = unidades?.data?.find((u: any) => u.id === formData.unidadeId);
      setSelectedUnidade(unidade || null);
    }
  }, [formData.unidadeId, unidades]);

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

    const result = await createSubscription.mutateAsync(formDataObj);

    if (result.success) {
      onClose();
      setFormData({
        planId: '',
        unidadeId: '',
        customerId: '',
        startDate: dayjs().add(1, 'day'),
        billingCycle: 'monthly',
        paymentMethod: 'pix',
        autoRenew: true,
        notes: '',
      });
      setSelectedPlan(null);
      setSelectedUnidade(null);
    }
  };

  const handleClose = () => {
    if (!createSubscription.isPending) {
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
      case 'cash':
        return 'Dinheiro';
      default:
        return method;
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedClient(null);
    setSelectedPlan(null);
    setSelectedUnidade(null);
    setShowQRCode(false);
    setPaymentLink('');
    setSearchClient('');
  };

  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
      client.email.toLowerCase().includes(searchClient.toLowerCase()) ||
      client.cpf.includes(searchClient.replace(/\D/g, '')),
  );

  const generateMockPaymentLink = () => {
    const link = `https://app.asaas.com/pay/${Math.random().toString(36).substring(7)}`;
    setPaymentLink(link);
    return link;
  };

  const generateMockQRCode = () => {
    // Mock QR Code - em produção seria integrado com ASAAS
    return '00020126580014BR.GOV.BCB.PIX013636b1d2c4-0c4a-4d89-85b1-c4a0c4a85b1c520400005303986540510.005802BR5925NOME LOJA EXEMPLO6014SAO PAULO62070503***6304ABCD';
  };

  // Renderizar conteúdo por etapa
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Tipo de Assinatura */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tipo de Assinatura
              </Typography>
              <ToggleButtonGroup
                value={subscriptionType}
                exclusive
                onChange={(_, value) => value && setSubscriptionType(value)}
                fullWidth
              >
                <ToggleButton value="asaas">
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinkIcon />
                    Link ASAAS
                  </Box>
                </ToggleButton>
                <ToggleButton value="external">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CashIcon />
                    Pagamento Externo
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Seleção de Cliente */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Cliente
              </Typography>
              <Autocomplete
                options={filteredClients}
                getOptionLabel={(client) => `${client.name} - ${client.cpf}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar cliente"
                    placeholder="Digite nome, email ou CPF..."
                    fullWidth
                  />
                )}
                value={selectedClient}
                onChange={(_, value) => setSelectedClient(value)}
                inputValue={searchClient}
                onInputChange={(_, value) => setSearchClient(value)}
                renderOption={(props, client) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="subtitle1">{client.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {client.email} • {client.phone} • {client.cpf}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Seleção de Plano */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Plano de Assinatura
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
                <InputLabel>Unidade</InputLabel>
                <Select
                  value={formData.unidadeId}
                  onChange={(e) => handleInputChange('unidadeId', e.target.value)}
                  label="Unidade"
                >
                  {unidades?.data?.map((unidade: any) => (
                    <MenuItem key={unidade.id} value={unidade.id}>
                      {unidade.nome || unidade.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Preview do Plano Selecionado */}
            {selectedPlan && (
              <Grid item xs={12}>
                <Card
                  sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}
                >
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {selectedPlan.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Typography variant="h5" color="primary">
                        {formatCurrency(selectedPlan.price)}
                      </Typography>
                      <Chip
                        label={getBillingCycleLabel(selectedPlan.billingCycle)}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {selectedPlan.description}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      <Chip label={`${selectedPlan.features.maxUsers} usuários`} size="small" />
                      <Chip label={`${selectedPlan.features.maxClients} clientes`} size="small" />
                      <Chip
                        label={`${selectedPlan.features.maxAppointments} agendamentos`}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            {/* Método de Pagamento */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Método de Pagamento
              </Typography>
            </Grid>

            {subscriptionType === 'asaas' ? (
              <>
                <Grid item xs={12}>
                  <Box display="flex" gap={2}>
                    <Button
                      variant={formData.paymentMethod === 'pix' ? 'contained' : 'outlined'}
                      startIcon={<PixIcon />}
                      onClick={() => handleInputChange('paymentMethod', 'pix')}
                      fullWidth
                    >
                      PIX
                    </Button>
                    <Button
                      variant={formData.paymentMethod === 'credit_card' ? 'contained' : 'outlined'}
                      startIcon={<CreditCardIcon />}
                      onClick={() => handleInputChange('paymentMethod', 'credit_card')}
                      fullWidth
                    >
                      Cartão
                    </Button>
                    <Button
                      variant={formData.paymentMethod === 'bank_slip' ? 'contained' : 'outlined'}
                      startIcon={<ReceiptIcon />}
                      onClick={() => handleInputChange('paymentMethod', 'bank_slip')}
                      fullWidth
                    >
                      Boleto
                    </Button>
                  </Box>
                </Grid>

                {formData.paymentMethod === 'pix' && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Será gerado um QR Code PIX para pagamento imediato após criar a assinatura.
                    </Alert>
                  </Grid>
                )}

                {formData.paymentMethod === 'credit_card' && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      O cliente será redirecionado para o formulário seguro do ASAAS para inserir os
                      dados do cartão.
                    </Alert>
                  </Grid>
                )}
              </>
            ) : (
              <Grid item xs={12}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Assinatura externa - o pagamento será confirmado manualmente pelo sistema.
                </Alert>
                <FormControl fullWidth>
                  <InputLabel>Forma de Pagamento Externa</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    label="Forma de Pagamento Externa"
                  >
                    <MenuItem value="pix">PIX</MenuItem>
                    <MenuItem value="cash">Dinheiro</MenuItem>
                    <MenuItem value="bank_transfer">Transferência</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Configurações Adicionais */}
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Data de Início"
                value={formData.startDate}
                onChange={(date) => handleInputChange('startDate', (date as Dayjs) || dayjs())}
                format="DD/MM/YYYY HH:mm"
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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

            <Grid item xs={12}>
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
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            {/* Resumo da Assinatura */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Resumo da Assinatura
              </Typography>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Cliente:</Typography>
                      <Typography>{selectedClient?.name || 'Cliente não selecionado'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Plano:</Typography>
                      <Typography>{selectedPlan?.name || 'Plano não selecionado'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Valor:</Typography>
                      <Typography variant="h6" color="primary">
                        {selectedPlan ? formatCurrency(selectedPlan.price) : 'R$ 0,00'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Pagamento:</Typography>
                      <Typography>{getPaymentMethodLabel(formData.paymentMethod)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Tipo:</Typography>
                      <Chip
                        label={subscriptionType === 'asaas' ? 'Link ASAAS' : 'Pagamento Externo'}
                        color={subscriptionType === 'asaas' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Ações finais */}
            {paymentLink && (
              <Grid item xs={12}>
                <Alert severity="success">
                  <Typography variant="subtitle2" gutterBottom>
                    Link de pagamento gerado com sucesso!
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', mt: 1 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {paymentLink}
                    </Typography>
                  </Paper>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => navigator.clipboard.writeText(paymentLink)}
                  >
                    Copiar Link
                  </Button>
                </Alert>
              </Grid>
            )}

            {showQRCode && formData.paymentMethod === 'pix' && (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <QrCodeIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      QR Code PIX Gerado
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Apresente este código para o cliente fazer o pagamento
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                      }}
                    >
                      {generateMockQRCode()}
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Criar Nova Assinatura</Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {renderStepContent(activeStep)}

          {/* Mensagens de erro */}
          {createSubscription.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {String(createSubscription.error)}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, width: '100%' }}>
            <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Voltar
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep < steps.length - 1 ? (
              <Button
                onClick={() => {
                  if (
                    activeStep === 1 &&
                    subscriptionType === 'asaas' &&
                    formData.paymentMethod === 'pix'
                  ) {
                    setShowQRCode(true);
                  }
                  if (activeStep === 1 && subscriptionType === 'asaas') {
                    generateMockPaymentLink();
                  }
                  handleNext();
                }}
                disabled={
                  (activeStep === 0 &&
                    (!formData.planId || !formData.unidadeId || !selectedClient)) ||
                  createSubscription.isPending
                }
                variant="contained"
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={createSubscription.isPending}
                startIcon={createSubscription.isPending ? <CircularProgress size={20} /> : null}
                onClick={handleSubmit}
              >
                {createSubscription.isPending ? 'Criando...' : 'Criar Assinatura'}
              </Button>
            )}
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}
