import type { Metadata } from 'next';
import { Box, Typography, Alert, Grid, Card, CardContent } from '@mui/material';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fluxo de Caixa | Trato',
  description: 'Análise do fluxo de caixa consolidado',
};

export default function FinanceiroFluxoPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <TrendingUp size={32} />
        <Typography variant="h4" component="h1">
          Fluxo de Caixa
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Acompanhe o fluxo consolidado de entradas e saídas para tomada de decisões financeiras.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <DollarSign size={40} color="#1976d2" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Saldo Inicial
              </Typography>
              <Typography variant="h4" color="primary">
                R$ 0,00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp size={40} color="#2e7d32" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Total Entradas
              </Typography>
              <Typography variant="h4" color="success.main">
                R$ 0,00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown size={40} color="#d32f2f" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Total Saídas
              </Typography>
              <Typography variant="h4" color="error.main">
                R$ 0,00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Calendar size={40} color="#ed6c02" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Saldo Final
              </Typography>
              <Typography variant="h4" color="warning.main">
                R$ 0,00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="body1" color="text.secondary">
        Funcionalidade em desenvolvimento. Em breve: gráficos de fluxo de caixa, projeções futuras e
        análises comparativas.
      </Typography>
    </Box>
  );
}
