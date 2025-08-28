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
  Card,
  CardContent,
  Chip,
  Divider,
  Autocomplete,
  Paper,
} from '@mui/material';
import { Preview as PreviewIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { useCreateSubscriptionPlan } from '@/hooks/use-subscriptions';

interface CreatePlanDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Service {
  id: string;
  name: string;
  limit: number;
}

export function CreatePlanDialog({ open, onClose }: CreatePlanDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: 'monthly',
    maxUnits: '1',
    maxUsers: '5',
    maxClients: '100',
    maxAppointments: '1000',
    supportLevel: 'basic',
    customBranding: false,
    advancedReports: false,
    apiAccess: false,
    trialDays: '0',
    setupFee: '0',
  });

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Lista de serviços disponíveis (mockado - em produção viria da API)
  const availableServices = [
    { id: '1', name: 'Corte de Cabelo', defaultLimit: 10 },
    { id: '2', name: 'Barba', defaultLimit: 8 },
    { id: '3', name: 'Sobrancelha', defaultLimit: 5 },
    { id: '4', name: 'Manicure', defaultLimit: 12 },
    { id: '5', name: 'Pedicure', defaultLimit: 8 },
    { id: '6', name: 'Massagem', defaultLimit: 4 },
  ];

  const createPlan = useCreateSubscriptionPlan();

  // Validação em tempo real
  useEffect(() => {
    const errors: Record<string, string> = {};

    if (formData.name && formData.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (formData.price && Number(formData.price) <= 0) {
      errors.price = 'Preço deve ser maior que zero';
    }

    if (formData.maxUsers && Number(formData.maxUsers) < 1) {
      errors.maxUsers = 'Deve permitir pelo menos 1 usuário';
    }

    setFormErrors(errors);
  }, [formData]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddService = (serviceName: string) => {
    const service = availableServices.find((s) => s.name === serviceName);
    if (service && !selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices((prev) => [
        ...prev,
        {
          id: service.id,
          name: service.name,
          limit: service.defaultLimit,
        },
      ]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleServiceLimitChange = (serviceId: string, limit: number) => {
    setSelectedServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, limit } : s)));
  };

  const calculateMonthlyPrice = () => {
    const price = Number(formData.price) || 0;
    const setupFee = Number(formData.setupFee) || 0;

    switch (formData.billingCycle) {
      case 'quarterly':
        return (price / 3).toFixed(2);
      case 'yearly':
        return (price / 12).toFixed(2);
      default:
        return price.toFixed(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, String(value));
    });

    const result = await createPlan.mutateAsync(formDataObj);

    if (result.success) {
      onClose();
      setFormData({
        name: '',
        description: '',
        price: '',
        billingCycle: 'monthly',
        maxUnits: '1',
        maxUsers: '5',
        maxClients: '100',
        maxAppointments: '1000',
        supportLevel: 'basic',
        customBranding: false,
        advancedReports: false,
        apiAccess: false,
        trialDays: '0',
        setupFee: '0',
      });
    }
  };

  const handleClose = () => {
    if (!createPlan.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Criar Novo Plano de Assinatura</Typography>
          <Button
            startIcon={<CopyIcon />}
            size="small"
            color="primary"
            disabled={createPlan.isPending}
          >
            Duplicar Plano Existente
          </Button>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Informações básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Plano"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Ex: Plano Básico"
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preço"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                placeholder="0.00"
                inputProps={{ min: 0, step: 0.01 }}
                error={!!formErrors.price}
                helperText={formErrors.price || 'Valor da cobrança conforme ciclo selecionado'}
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dias de Trial"
                type="number"
                value={formData.trialDays}
                onChange={(e) => handleInputChange('trialDays', e.target.value)}
                placeholder="0"
                inputProps={{ min: 0 }}
                helperText="Deixe 0 para sem trial"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                placeholder="Descreva os benefícios e recursos do plano"
              />
            </Grid>

            {/* Limites */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Limites de Uso
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Máximo de Unidades"
                type="number"
                value={formData.maxUnits}
                onChange={(e) => handleInputChange('maxUnits', e.target.value)}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Máximo de Usuários"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => handleInputChange('maxUsers', e.target.value)}
                required
                inputProps={{ min: 1 }}
                error={!!formErrors.maxUsers}
                helperText={formErrors.maxUsers}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Máximo de Clientes"
                type="number"
                value={formData.maxClients}
                onChange={(e) => handleInputChange('maxClients', e.target.value)}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Máximo de Agendamentos"
                type="number"
                value={formData.maxAppointments}
                onChange={(e) => handleInputChange('maxAppointments', e.target.value)}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Recursos */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Recursos e Suporte
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nível de Suporte</InputLabel>
                <Select
                  value={formData.supportLevel}
                  onChange={(e) => handleInputChange('supportLevel', e.target.value)}
                  label="Nível de Suporte"
                >
                  <MenuItem value="basic">Básico</MenuItem>
                  <MenuItem value="standard">Padrão</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Taxa de Setup"
                type="number"
                value={formData.setupFee}
                onChange={(e) => handleInputChange('setupFee', e.target.value)}
                placeholder="0.00"
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Taxa única de configuração"
              />
            </Grid>

            <Grid item xs={12}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.customBranding}
                      onChange={(e) => handleInputChange('customBranding', e.target.checked)}
                    />
                  }
                  label="Marca Personalizada"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.advancedReports}
                      onChange={(e) => handleInputChange('advancedReports', e.target.checked)}
                    />
                  }
                  label="Relatórios Avançados"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.apiAccess}
                      onChange={(e) => handleInputChange('apiAccess', e.target.checked)}
                    />
                  }
                  label="Acesso à API"
                />
              </Box>
            </Grid>

            {/* Serviços Inclusos */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Serviços Inclusos no Plano
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={availableServices.map((s) => s.name)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Adicionar Serviço"
                    placeholder="Digite para buscar um serviço..."
                  />
                )}
                onChange={(_, value) => value && handleAddService(value)}
                value=""
              />
            </Grid>

            {selectedServices.length > 0 && (
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  {selectedServices.map((service) => (
                    <Paper key={service.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1">{service.name}</Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <TextField
                            type="number"
                            label="Limite mensal"
                            size="small"
                            value={service.limit}
                            onChange={(e) =>
                              handleServiceLimitChange(service.id, Number(e.target.value))
                            }
                            inputProps={{ min: 1, style: { width: '80px' } }}
                          />
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveService(service.id)}
                          >
                            Remover
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            )}

            {/* Preview do Plano */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Preview do Plano</Typography>
                <Button
                  startIcon={<PreviewIcon />}
                  onClick={() => setShowPreview(!showPreview)}
                  size="small"
                >
                  {showPreview ? 'Ocultar' : 'Visualizar'} Preview
                </Button>
              </Box>
            </Grid>

            {showPreview && (
              <Grid item xs={12}>
                <Card
                  sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}
                >
                  <CardContent>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {formData.name || 'Nome do Plano'}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" paragraph>
                      {formData.description || 'Descrição do plano...'}
                    </Typography>

                    <Box display="flex" alignItems="baseline" gap={1} mb={2}>
                      <Typography variant="h4" color="primary">
                        R$ {formData.price || '0,00'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /
                        {formData.billingCycle === 'monthly'
                          ? 'mês'
                          : formData.billingCycle === 'quarterly'
                            ? 'trimestre'
                            : 'ano'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (~R$ {calculateMonthlyPrice()}/mês)
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>
                      Limites de Uso:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip label={`${formData.maxUnits || 0} unidades`} size="small" />
                      <Chip label={`${formData.maxUsers || 0} usuários`} size="small" />
                      <Chip label={`${formData.maxClients || 0} clientes`} size="small" />
                      <Chip label={`${formData.maxAppointments || 0} agendamentos`} size="small" />
                    </Box>

                    {selectedServices.length > 0 && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Serviços Inclusos:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {selectedServices.map((service) => (
                            <Chip
                              key={service.id}
                              label={`${service.name} (${service.limit}/mês)`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </>
                    )}

                    {formData.trialDays && Number(formData.trialDays) > 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Inclui {formData.trialDays} dias de trial gratuito
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* Mensagens de erro */}
          {createPlan.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {String(createPlan.error)}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={createPlan.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createPlan.isPending}
            startIcon={createPlan.isPending ? <CircularProgress size={20} /> : null}
          >
            {createPlan.isPending ? 'Criando...' : 'Criar Plano'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
