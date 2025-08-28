'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Box,
  Alert,
  Divider,
  LinearProgress,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Shield,
  People,
  Description,
  AccessTime,
  Warning,
  CheckCircle,
  TrendingUp,
  CalendarToday,
  Download,
  Visibility,
} from '@mui/icons-material';
import { useEstatisticasLGPD } from '@/hooks/useLGPD';

interface ComplianceDashboardProps {
  className?: string;
}

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
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ComplianceDashboard({ className }: ComplianceDashboardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { data: conformidade, isLoading } = useEstatisticasLGPD();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Card>
        <CardHeader>
          <Typography variant="h5" component="h2">
            Dashboard de Conformidade LGPD
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitore o status de conformidade com a LGPD da sua unidade
          </Typography>
        </CardHeader>
        <CardContent>
          {/* Status Geral */}
          <Box sx={{ mb: 4 }}>
            <Alert
              severity={conformidade && conformidade.success ? 'success' : 'warning'}
              sx={{ mb: 2 }}
            >
              Status:{' '}
              {conformidade && conformidade.success
                ? 'Sistema em funcionamento'
                : 'Verificação necessária'}
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">0</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuários Ativos
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Shield sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">0</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consentimentos Ativos
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <AccessTime sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6">0</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Solicitações Pendentes
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">0%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score de Conformidade
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Tabs */}
          <Box sx={{ width: '100%' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="compliance tabs">
              <Tab label="Visão Geral" />
              <Tab label="Consentimentos" />
              <Tab label="Solicitações" />
              <Tab label="Auditoria" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>
                Resumo de Conformidade
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Políticas de Privacidade"
                    secondary="Atualizadas e aprovadas"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Consentimentos" secondary="0 consentimentos ativos" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Solicitações Pendentes"
                    secondary="0 solicitações aguardando resposta"
                  />
                </ListItem>
              </List>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom>
                Gestão de Consentimentos
              </Typography>
              <Typography variant="body1">
                Visualize e gerencie os consentimentos coletados dos usuários.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Visibility />}
                sx={{ mt: 2 }}
                href="/lgpd/consentimentos"
              >
                Ver Consentimentos
              </Button>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" gutterBottom>
                Solicitações de Dados
              </Typography>
              <Typography variant="body1">
                Gerencie solicitações de acesso, portabilidade e exclusão de dados.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Description />}
                sx={{ mt: 2 }}
                href="/lgpd/solicitacoes"
              >
                Ver Solicitações
              </Button>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Typography variant="h6" gutterBottom>
                Logs de Auditoria
              </Typography>
              <Typography variant="body1">
                Acompanhe todos os acessos e operações realizadas com dados pessoais.
              </Typography>
              <Button variant="contained" startIcon={<Download />} sx={{ mt: 2 }}>
                Exportar Relatório
              </Button>
            </TabPanel>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
