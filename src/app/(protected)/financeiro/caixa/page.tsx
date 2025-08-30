import type { Metadata } from 'next';
import { Box, Typography, Button, Alert, Grid, Card, CardContent } from '@mui/material';
import { Plus, CreditCard, TrendingUp, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Movimentação de Caixa | Trato',
  description: 'Controle de entrada e saída do caixa',
};

export default function FinanceiroCaixaPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Movimentação de Caixa
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />}>
          Nova Movimentação
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Registre todas as entradas e saídas do caixa para controle financeiro preciso.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CreditCard size={40} color="#1976d2" />
              <Box>
                <Typography variant="h6">Saldo Atual</Typography>
                <Typography variant="h4" color="primary">
                  R$ 0,00
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp size={40} color="#2e7d32" />
              <Box>
                <Typography variant="h6">Entradas Hoje</Typography>
                <Typography variant="h4" color="success.main">
                  R$ 0,00
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Calendar size={40} color="#d32f2f" />
              <Box>
                <Typography variant="h6">Saídas Hoje</Typography>
                <Typography variant="h4" color="error.main">
                  R$ 0,00
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="body1" color="text.secondary">
        Funcionalidade em desenvolvimento. Em breve: registro de movimentações, relatórios
        detalhados e reconciliação de caixa.
      </Typography>
    </Box>
  );
}
