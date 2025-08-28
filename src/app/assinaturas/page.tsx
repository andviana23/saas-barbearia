import { Suspense } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { AssinaturasContent } from './components/AssinaturasContent';
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
        <AssinaturasContent />
      </Suspense>
    </Container>
  );
}
