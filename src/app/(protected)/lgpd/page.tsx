'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import {
  Shield,
  FileText,
  Users,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export default function LGPDPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalConsentimentos: 1247,
    consentimentosAtivos: 1180,
    solicitacoesPendentes: 12,
    dadosProcessados: '2.3GB',
  };

  const recentActivities = [
    {
      id: 1,
      type: 'consent',
      description: 'Novo consentimento de marketing',
      user: 'João Silva',
      date: '2024-01-15',
      status: 'approved',
    },
    {
      id: 2,
      type: 'request',
      description: 'Solicitação de exclusão de dados',
      user: 'Maria Santos',
      date: '2024-01-14',
      status: 'pending',
    },
    {
      id: 3,
      type: 'export',
      description: 'Exportação de dados pessoais',
      user: 'Pedro Costa',
      date: '2024-01-13',
      status: 'completed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'consent':
        return <CheckCircle size={16} />;
      case 'request':
        return <AlertTriangle size={16} />;
      case 'export':
        return <Download size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        LGPD - Proteção de Dados
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestão de conformidade com a Lei Geral de Proteção de Dados
      </Typography>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Users size={20} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {stats.totalConsentimentos}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total de Consentimentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle size={20} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {stats.consentimentosAtivos}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Consentimentos Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AlertTriangle size={20} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {stats.solicitacoesPendentes}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Solicitações Pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Shield size={20} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {stats.dadosProcessados}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Dados Processados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ações Rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileText size={16} />}
                  href="/lgpd/consentimentos"
                  fullWidth
                >
                  Gerenciar Consentimentos
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Users size={16} />}
                  href="/lgpd/solicitacoes"
                  fullWidth
                >
                  Solicitações de Dados
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  fullWidth
                >
                  Exportar Relatório
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Shield size={16} />}
                  fullWidth
                >
                  Auditoria de Dados
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Atividades Recentes
              </Typography>
              
              <List dense>
                {recentActivities.map((activity, index) => (
                  <Box key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={`${activity.user} - ${activity.date}`}
                      />
                      <Chip
                        label={activity.status}
                        color={getStatusColor(activity.status) as any}
                        size="small"
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas de Conformidade */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Conformidade LGPD:</strong> Todos os sistemas estão em conformidade. 
          Próxima auditoria agendada para 15/02/2024.
        </Typography>
      </Alert>

      <Alert severity="warning">
        <Typography variant="body2">
          <strong>Atenção:</strong> {stats.solicitacoesPendentes} solicitações de dados 
          aguardando processamento. Prazo legal: 15 dias.
        </Typography>
      </Alert>
    </Box>
  );
}