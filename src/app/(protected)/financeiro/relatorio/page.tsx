'use client';

import { Box, Typography, Alert, Grid, Card, CardContent, Button } from '@mui/material';
import { BarChart3, Download, Filter, FileText } from 'lucide-react';

export default function FinanceiroRelatorioPage() {
  const relatorios = [
    {
      titulo: 'Demonstrativo de Resultados',
      descricao: 'Receitas, despesas e lucro líquido do período',
      icone: BarChart3,
      cor: '#1976d2',
    },
    {
      titulo: 'Fluxo de Caixa Detalhado',
      descricao: 'Entradas e saídas com categorização',
      icone: FileText,
      cor: '#2e7d32',
    },
    {
      titulo: 'Relatório de Comissões',
      descricao: 'Comissões calculadas por profissional',
      icone: BarChart3,
      cor: '#ed6c02',
    },
    {
      titulo: 'Análise Comparativa',
      descricao: 'Comparação entre períodos e unidades',
      icone: FileText,
      cor: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BarChart3 size={32} />
          <Typography variant="h4" component="h1">
            Relatórios Financeiros
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Filter size={20} />}>
          Filtros
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Gere relatórios financeiros detalhados para análise e tomada de decisões estratégicas.
      </Alert>

      <Grid container spacing={3}>
        {relatorios.map((relatorio, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <relatorio.icone size={32} style={{ color: relatorio.cor }} />
                  <Typography variant="h6">{relatorio.titulo}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {relatorio.descricao}
                </Typography>
                <Button variant="contained" startIcon={<Download size={20} />} fullWidth disabled>
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Funcionalidade em desenvolvimento. Em breve: geração de relatórios em PDF/Excel, filtros
          avançados e agendamento automático.
        </Typography>
      </Box>
    </Box>
  );
}
