import { Box, Container, Typography } from '@mui/material';
import ProdutosContent from './components/ProdutosContent';

export default function ProdutosPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Produtos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestão completa de produtos e controle de estoque
        </Typography>
      </Box>

      <ProdutosContent />
    </Container>
  );
}

export const metadata = {
  title: 'Produtos | Trato',
  description: 'Gestão de produtos e controle de estoque',
};
