'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { SubscriptionPlan } from '@/types/subscription';
import { EditPlanDialog } from './EditPlanDialog';
import { ViewPlanDialog } from './ViewPlanDialog';

interface SubscriptionPlansTabProps {
  plans: SubscriptionPlan[];
  isLoading: boolean;
}

export function SubscriptionPlansTab({ plans, isLoading }: SubscriptionPlansTabProps) {
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [viewPlanOpen, setViewPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setEditPlanOpen(true);
  };

  const handleViewPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setViewPlanOpen(true);
  };

  const handleCloseEdit = () => {
    setEditPlanOpen(false);
    setSelectedPlan(null);
  };

  const handleCloseView = () => {
    setViewPlanOpen(false);
    setSelectedPlan(null);
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

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="40%" height={32} />
                <Box mt={2}>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (plans.length === 0) {
    return (
      <Alert severity="info">
        Nenhum plano de assinatura encontrado. Crie o primeiro plano para começar.
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={6} lg={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                ...(plan.isActive ? {} : { opacity: 0.7 }),
              }}
            >
              {/* Status Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 1,
                }}
              >
                <Chip
                  label={plan.isActive ? 'Ativo' : 'Inativo'}
                  color={plan.isActive ? 'success' : 'default'}
                  size="small"
                  icon={plan.isActive ? <CheckIcon /> : <CloseIcon />}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                {/* Nome e Preço */}
                <Typography variant="h5" component="h3" gutterBottom>
                  {plan.name}
                </Typography>

                <Typography variant="h4" component="h2" color="primary" gutterBottom>
                  {formatCurrency(plan.price)}
                  <Typography component="span" variant="body2" color="textSecondary">
                    /{getBillingCycleLabel(plan.billingCycle).toLowerCase()}
                  </Typography>
                </Typography>

                {/* Descrição */}
                <Typography variant="body2" color="textSecondary" paragraph>
                  {plan.description}
                </Typography>

                {/* Features */}
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recursos incluídos:
                  </Typography>

                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2">Até {plan.features.maxUnits} unidades</Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2">Até {plan.features.maxUsers} usuários</Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2">
                        Até {plan.features.maxClients} clientes
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2">
                        Até {plan.features.maxAppointments} agendamentos
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2">
                        Suporte {getSupportLevelLabel(plan.features.supportLevel)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Features opcionais */}
                  {plan.features.customBranding && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main">
                        Marca personalizada
                      </Typography>
                    </Box>
                  )}

                  {plan.features.advancedReports && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main">
                        Relatórios avançados
                      </Typography>
                    </Box>
                  )}

                  {plan.features.apiAccess && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main">
                        Acesso à API
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Informações adicionais */}
                <Box mt={2}>
                  {plan.trialDays > 0 && (
                    <Chip
                      label={`${plan.trialDays} dias de trial`}
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                  )}

                  {plan.setupFee > 0 && (
                    <Chip
                      label={`Taxa de setup: ${formatCurrency(plan.setupFee)}`}
                      color="warning"
                      variant="outlined"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Box>
                  <Tooltip title="Ver detalhes">
                    <IconButton size="small" onClick={() => handleViewPlan(plan)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Editar plano">
                    <IconButton size="small" onClick={() => handleEditPlan(plan)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Button variant="outlined" size="small" onClick={() => handleViewPlan(plan)}>
                  Ver Detalhes
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogos */}
      {selectedPlan && (
        <>
          <EditPlanDialog open={editPlanOpen} onClose={handleCloseEdit} plan={selectedPlan} />

          <ViewPlanDialog open={viewPlanOpen} onClose={handleCloseView} plan={selectedPlan} />
        </>
      )}
    </Box>
  );
}
