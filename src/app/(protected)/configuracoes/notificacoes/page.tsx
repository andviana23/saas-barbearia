'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Message as MessageIcon,
  Queue as QueueIcon,
  Assessment as MetricsIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import PageHeader from '@/components/ui/PageHeader';
import {
  useCanaisNotificacao,
  useTemplatesNotificacao,
  useCriarTemplatesPadrao,
  useProcessarFila,
} from '@/hooks/use-notificacoes';
import { useNotifications } from '@/components/ui/NotificationSystem';
import TemplatesTab from './components/TemplatesTab';
import FilaTab from './components/FilaTab';
import MetricasTab from './components/MetricasTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notificacoes-tabpanel-${index}`}
      aria-labelledby={`notificacoes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NotificacoesPage() {
  const [tabValue, setTabValue] = useState(0);

  const { data: canais, isLoading: loadingCanais } = useCanaisNotificacao();
  const { data: templates, isLoading: loadingTemplates } = useTemplatesNotificacao();
  const criarTemplatesPadrao = useCriarTemplatesPadrao();
  const processarFila = useProcessarFila();
  const { addNotification } = useNotifications();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCriarTemplatesPadrao = async () => {
    try {
      const result = await criarTemplatesPadrao.mutateAsync();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: result.message || 'Templates padrão criados com sucesso',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || 'Erro ao criar templates padrão',
      });
    }
  };

  const handleProcessarFila = async () => {
    try {
      const result = await processarFila.mutateAsync();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: result.message || 'Fila processada com sucesso',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || 'Erro ao processar fila',
      });
    }
  };

  if (loadingCanais || loadingTemplates) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Sistema de Notificações"
        subtitle="Gerencie templates, configure canais e monitore envios"
      />

      <Box display="flex" justifyContent="flex-end" mb={2}>
        {
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<QueueIcon />}
              onClick={handleProcessarFila}
              disabled={processarFila.isPending}
            >
              {processarFila.isPending ? 'Processando...' : 'Processar Fila'}
            </Button>

            {(!templates?.data || templates.data.length === 0) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCriarTemplatesPadrao}
                disabled={criarTemplatesPadrao.isPending}
              >
                {criarTemplatesPadrao.isPending ? 'Criando...' : 'Criar Templates Padrão'}
              </Button>
            )}
          </Box>
        }
      </Box>

      {/* Status dos Canais */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status dos Canais
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2}>
            {canais?.data?.map((canal: any) => (
              <Alert
                key={canal.id}
                severity={canal.ativo ? 'success' : 'warning'}
                variant="outlined"
                sx={{ minWidth: 200 }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="medium">
                    {canal.nome}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {canal.ativo ? 'Ativo' : 'Inativo'}
                  </Typography>
                </Box>
              </Alert>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<SettingsIcon />} label="Templates" id="notificacoes-tab-0" />
            <Tab icon={<QueueIcon />} label="Fila de Envios" id="notificacoes-tab-1" />
            <Tab icon={<MetricsIcon />} label="Métricas" id="notificacoes-tab-2" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TemplatesTab />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FilaTab />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <MetricasTab />
        </TabPanel>
      </Card>
    </Box>
  );
}
