import { Suspense } from 'react';
import { Box, Container, Typography } from '@mui/material';
import MultiUnidadesContent from './components/MultiUnidadesContent';

export const metadata = {
  title: 'Gestão Multi-unidades | Trato',
  description: 'Relatórios consolidados, benchmarks e gestão de permissões hierárquicas',
};

export default function MultiUnidadesPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Gestão Multi-unidades
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Relatórios consolidados, benchmarks e gestão de permissões hierárquicas
        </Typography>
      </Box>

      <Suspense fallback={<div>Carregando gestão multi-unidades...</div>}>
        <MultiUnidadesContent />
      </Suspense>
    </Container>
  );
}
