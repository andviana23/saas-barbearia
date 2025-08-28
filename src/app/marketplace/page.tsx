import { Suspense } from 'react';
import { Box, Container, Typography } from '@mui/material';
import MarketplaceContent from './components/MarketplaceContent';

export const metadata = {
  title: 'Marketplace de Serviços | Trato',
  description: 'Descubra e reserve serviços em diferentes unidades da rede Trato',
};

export default function MarketplacePage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Marketplace de Serviços
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Descubra e reserve serviços em diferentes unidades da nossa rede
        </Typography>
      </Box>

      <Suspense fallback={<div>Carregando marketplace...</div>}>
        <MarketplaceContent />
      </Suspense>
    </Container>
  );
}
