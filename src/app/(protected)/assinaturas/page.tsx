import { Suspense } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import PageHeader from '@/components/ui/PageHeader';
import { CircularProgress } from '@mui/material';

export default function AssinaturasPage() {
  return (
    <Container maxWidth="xl">
      <PageHeader title="Assinaturas" subtitle="Gerencie planos e assinaturas do sistema" />

      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        }
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Sistema de Assinaturas
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1">
              Módulo de assinaturas em desenvolvimento. Aqui você poderá gerenciar:
            </Typography>
            <ul>
              <li>Planos de assinatura</li>
              <li>Assinantes ativos</li>
              <li>Cobrança recorrente</li>
              <li>Dashboard de métricas</li>
            </ul>
          </Paper>
        </Box>
      </Suspense>
    </Container>
  );
}
