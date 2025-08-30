import type { Metadata } from 'next';
import { Box, Typography, Alert, Grid, Card, CardContent, Button } from '@mui/material';
import { Percent, Users, Calculator, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cálculo de Comissão | Trato',
  description: 'Gestão e cálculo de comissões dos profissionais',
};

export default function FinanceiroComissaoPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Percent size={32} />
          <Typography variant="h4" component="h1">
            Cálculo de Comissão
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Calculator size={20} />}>
          Calcular Comissões
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure percentuais de comissão e acompanhe os ganhos dos profissionais.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Users size={40} color="#1976d2" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Profissionais Ativos
              </Typography>
              <Typography variant="h4" color="primary">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Percent size={40} color="#2e7d32" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Comissão Média
              </Typography>
              <Typography variant="h4" color="success.main">
                0%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp size={40} color="#ed6c02" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Total a Pagar
              </Typography>
              <Typography variant="h4" color="warning.main">
                R$ 0,00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Calculator size={40} color="#9c27b0" style={{ marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">
                Período Atual
              </Typography>
              <Typography variant="h4" color="secondary.main">
                Agosto
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="body1" color="text.secondary">
        Funcionalidade em desenvolvimento. Em breve: configuração de percentuais, cálculo automático
        e relatórios de comissão.
      </Typography>
    </Box>
  );
}
