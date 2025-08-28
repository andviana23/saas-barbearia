'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Assessment, Security, History, TrendingUp, People, Business } from '@mui/icons-material';
import { useMultiUnidadesStatus, useMultiUnidadesFeatures } from '@/hooks/use-multi-unidades';
import RelatoriosTab from './RelatoriosTab';
import PermissoesTab from './PermissoesTab';
import AuditoriaTab from './AuditoriaTab';
import BenchmarkTab from './BenchmarkTab';

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
      id={`multi-unidades-tabpanel-${index}`}
      aria-labelledby={`multi-unidades-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MultiUnidadesContent() {
  const [tabValue, setTabValue] = useState(0);

  // Hooks para buscar dados
  const {
    totalUnidades,
    unidadesAtivas,
    totalUsuarios,
    acessosMultiUnidade,
    relatoriosConsultados,
    auditoriaEntradas,
    isLoading,
    isError,
  } = useMultiUnidadesStatus();

  const {
    hasMultipleUnits,
    hasMultiUnitAccess,
    hasAuditTrail,
    hasConsolidatedReports,
    totalActiveUnits,
  } = useMultiUnidadesFeatures();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Erro ao carregar dados multi-unidades. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Estatísticas Gerais */}
      {!isLoading && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Business color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h4" component="div" color="primary">
                    {totalUnidades}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Unidades
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="h4" component="div" color="success.main">
                    {unidadesAtivas}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Unidades Ativas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People color="info" sx={{ mr: 1 }} />
                  <Typography variant="h4" component="div" color="info.main">
                    {totalUsuarios}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Usuários
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Security color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h4" component="div" color="warning.main">
                    {acessosMultiUnidade}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Acessos Multi-unidade
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Alertas e Status */}
      {hasMultipleUnits && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Sistema configurado para múltiplas unidades.
          {hasMultiUnitAccess && ' Usuários podem acessar diferentes unidades.'}
          {hasAuditTrail && ' Auditoria de acessos ativa.'}
        </Alert>
      )}

      {/* Abas Principais */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Relatórios Consolidados" icon={<Assessment />} iconPosition="start" />
          <Tab label="Permissões & Acessos" icon={<Security />} iconPosition="start" />
          <Tab label="Auditoria" icon={<History />} iconPosition="start" />
          <Tab label="Benchmarks" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Painel de Relatórios Consolidados */}
      <TabPanel value={tabValue} index={0}>
        <RelatoriosTab />
      </TabPanel>

      {/* Painel de Permissões e Acessos */}
      <TabPanel value={tabValue} index={1}>
        <PermissoesTab />
      </TabPanel>

      {/* Painel de Auditoria */}
      <TabPanel value={tabValue} index={2}>
        <AuditoriaTab />
      </TabPanel>

      {/* Painel de Benchmarks */}
      <TabPanel value={tabValue} index={3}>
        <BenchmarkTab />
      </TabPanel>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
