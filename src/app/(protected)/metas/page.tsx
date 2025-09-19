'use client';

import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  Add,
  TrendingUp,
  AttachMoney,
  Person,
  CalendarMonth,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';

export default function MetasPage() {
  // Mock das metas
  const metas = [
    {
      id: 1,
      titulo: 'Receita Mensal',
      valor: 50000,
      valorAtual: 32000,
      tipo: 'financeiro',
      periodo: 'Agosto 2025',
      progresso: 64,
      status: 'ativo',
      cor: 'success',
      icone: <AttachMoney />,
    },
    {
      id: 2,
      titulo: 'Novos Clientes',
      valor: 100,
      valorAtual: 45,
      tipo: 'clientes',
      periodo: 'Agosto 2025',
      progresso: 45,
      status: 'ativo',
      cor: 'primary',
      icone: <Person />,
    },
    {
      id: 3,
      titulo: 'Agendamentos Diários',
      valor: 25,
      valorAtual: 18,
      tipo: 'operacional',
      periodo: 'Meta Diária',
      progresso: 72,
      status: 'ativo',
      cor: 'info',
      icone: <CalendarMonth />,
    },
    {
      id: 4,
      titulo: 'Receita Q3 2025',
      valor: 150000,
      valorAtual: 150000,
      tipo: 'financeiro',
      periodo: 'Julho-Setembro',
      progresso: 100,
      status: 'concluida',
      cor: 'success',
      icone: <CheckCircle />,
    },
  ];

  // Estatísticas gerais
  const estatisticas = {
    metasAtivas: 3,
    metasConcluidas: 1,
    metasAtrasadas: 0,
    progressoMedio: 60,
  };

  const formatarValor = (valor: number, tipo: string) => {
    if (tipo === 'financeiro') {
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return valor.toString();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header da Página */}
      <PageHeader title="Metas e Objetivos" subtitle="Defina e acompanhe suas metas de negócio" />

      {/* Estatísticas Gerais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <Schedule />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.metasAtivas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Metas Ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.metasConcluidas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Concluídas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.progressoMedio}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progresso Médio
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                size="large"
                onClick={() => alert('Funcionalidade de criar meta em desenvolvimento!')}
              >
                Nova Meta
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Metas */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        📊 Suas Metas
      </Typography>

      <Grid container spacing={3}>
        {metas.map((meta) => (
          <Grid item xs={12} md={6} key={meta.id}>
            <Card
              sx={{
                borderLeft: 4,
                borderLeftColor: `${meta.cor}.main`,
                position: 'relative',
              }}
            >
              <CardContent>
                {/* Header do Card */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: `${meta.cor}.light`, mr: 2 }}>{meta.icone}</Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {meta.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {meta.periodo}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {/* Status */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={meta.status === 'concluida' ? 'Concluída' : 'Ativa'}
                    color={meta.status === 'concluida' ? 'success' : 'primary'}
                    size="small"
                  />
                </Box>

                {/* Progresso */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progresso
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {meta.progresso}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={meta.progresso}
                    color="primary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Valores */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Atual
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color={`${meta.cor}.main`}>
                      {formatarValor(meta.valorAtual, meta.tipo)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Meta
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatarValor(meta.valor, meta.tipo)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Histórico de Metas */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            📈 Histórico Recente
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Meta de Receita Q3 2025 concluída"
                secondary="Alcançou R$ 150.000,00 em 30/08/2025"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <TrendingUp color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Meta de Novos Clientes em progresso"
                secondary="45 de 100 clientes (45% concluído)"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Schedule color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Meta de Agendamentos Diários atualizada"
                secondary="Aumentada de 20 para 25 agendamentos por dia"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Dicas para Metas */}
      <Card sx={{ mt: 4, bgcolor: 'info.light' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            💡 Dicas para Metas Eficazes
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                🎯 Seja Específico
              </Typography>
              <Typography variant="body2">
                Defina metas claras e mensuráveis, como &ldquo;Aumentar receita em 20%&rdquo; ao
                invés de &ldquo;Melhorar vendas&rdquo;.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                📅 Estabeleça Prazos
              </Typography>
              <Typography variant="body2">
                Toda meta deve ter um prazo definido para manter o foco e a urgência necessária.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                📊 Acompanhe Regularmente
              </Typography>
              <Typography variant="body2">
                Monitore o progresso semanalmente e ajuste estratégias conforme necessário.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
