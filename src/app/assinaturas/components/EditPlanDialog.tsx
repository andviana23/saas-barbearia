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
import { useUpdateSubscriptionPlan } from '@/hooks/use-subscriptions';
import { SubscriptionPlan } from '@/types/subscription';

interface EditPlanDialogProps {
  open: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
}

export function EditPlanDialog({ open, onClose, plan }: EditPlanDialogProps) {
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
    isActive: true,
    trialDays: '0',
    setupFee: '0',
  });

  const updatePlan = useUpdateSubscriptionPlan();

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price.toString(),
        billingCycle: plan.billingCycle,
        maxUnits: plan.features.maxUnits.toString(),
        maxUsers: plan.features.maxUsers.toString(),
        maxClients: plan.features.maxClients.toString(),
        maxAppointments: plan.features.maxAppointments.toString(),
        supportLevel: plan.features.supportLevel,
        customBranding: plan.features.customBranding,
        advancedReports: plan.features.advancedReports,
        apiAccess: plan.features.apiAccess,
        isActive: plan.isActive,
        trialDays: plan.trialDays.toString(),
        setupFee: plan.setupFee.toString(),
      });
    }
  }, [plan]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, String(value));
    });

    const result = await updatePlan.mutateAsync({
      planId: plan.id,
      formData: formDataObj,
    });

    if (result.success) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!updatePlan.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Plano de Assinatura</DialogTitle>

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

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Plano Ativo"
                />
              </Box>
            </Grid>
          </Grid>

          {/* Mensagens de erro */}
          {updatePlan.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {String(updatePlan.error)}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={updatePlan.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updatePlan.isPending}
            startIcon={updatePlan.isPending ? <CircularProgress size={20} /> : null}
          >
            {updatePlan.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
