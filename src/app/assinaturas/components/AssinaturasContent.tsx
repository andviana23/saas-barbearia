'use client';

import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  useSubscriptions,
  useSubscriptionPlans,
  useSubscriptionStats,
} from '@/hooks/use-subscriptions';
import { SubscriptionPlansTab } from './SubscriptionPlansTab';
import { SubscriptionsTab } from './SubscriptionsTab';
import { SubscriptionMetrics } from './SubscriptionMetrics';
import { CreateSubscriptionDialog } from './CreateSubscriptionDialog';
import { CreatePlanDialog } from './CreatePlanDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assinaturas-tabpanel-${index}`}
      aria-labelledby={`assinaturas-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function AssinaturasContent() {
  const [tabValue, setTabValue] = useState(0);
  const [createSubscriptionOpen, setCreateSubscriptionOpen] = useState(false);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);

  const {
    data: subscriptions,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
  } = useSubscriptions();
  const { data: plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const stats = useSubscriptionStats();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateSubscription = () => {
    setCreateSubscriptionOpen(true);
  };

  const handleCreatePlan = () => {
    setCreatePlanOpen(true);
  };

  return (
    <Box>
      {/* Métricas */}
      <SubscriptionMetrics stats={stats} />

      {/* Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Assinaturas tabs">
            <Tab label="Assinaturas" />
            <Tab label="Planos" />
          </Tabs>
        </Box>

        {/* Tab Assinaturas */}
        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Assinaturas Ativas</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateSubscription}>
              Nova Assinatura
            </Button>
          </Box>

          {subscriptionsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erro ao carregar assinaturas: {subscriptionsError.message}
            </Alert>
          )}

          <SubscriptionsTab
            subscriptions={subscriptions?.data || []}
            plans={(plans || []) as any}
            isLoading={subscriptionsLoading}
            pagination={subscriptions?.pagination}
          />
        </TabPanel>

        {/* Tab Planos */}
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Planos Disponíveis</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreatePlan}>
              Novo Plano
            </Button>
          </Box>

          {plansError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erro ao carregar planos: {plansError.message}
            </Alert>
          )}

          <SubscriptionPlansTab plans={(plans || []) as any} isLoading={plansLoading} />
        </TabPanel>
      </Paper>

      {/* Diálogos */}
      <CreateSubscriptionDialog
        open={createSubscriptionOpen}
        onClose={() => setCreateSubscriptionOpen(false)}
        plans={(plans || []) as any}
      />

      <CreatePlanDialog open={createPlanOpen} onClose={() => setCreatePlanOpen(false)} />
    </Box>
  );
}
