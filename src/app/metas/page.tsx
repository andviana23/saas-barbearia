import type { Metadata } from 'next';
import { Box, Typography, Alert, Grid, Card, CardContent, Button } from '@mui/material';
import { Plus, Target, TrendingUp, Users, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Metas de Desempenho | Trato',
  description: 'Configuração e acompanhamento de metas',
};

export default function MetasPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Target size={32} />
          <Typography variant="h4" component="h1">
            Metas de Desempenho
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />}>
          Nova Meta
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure metas para a equipe e acompanhe o progresso em tempo real.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp size={40} color="#1976d2" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Meta de Faturamento
              </Typography>
              <Typography variant="h4" color="primary">
                R$ 0,00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Meta do mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Users size={40} color="#2e7d32" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Meta de Clientes
              </Typography>
              <Typography variant="h4" color="success.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Novos clientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Calendar size={40} color="#ed6c02" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Meta de Agendamentos
              </Typography>
              <Typography variant="h4" color="warning.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por dia
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="body1" color="text.secondary">
        Funcionalidade em desenvolvimento. Em breve: definição de metas por período, acompanhamento
        visual e notificações de progresso.
      </Typography>
    </Box>
  );
}
