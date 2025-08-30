import { Box, Container, Typography } from '@mui/material';
import CategoriasProdutosContent from './components/CategoriasProdutosContent';

export default function CategoriasProdutosPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Categorias de Produtos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organize seus produtos em categorias para facilitar a gestão
        </Typography>
      </Box>

      <CategoriasProdutosContent />
    </Container>
  );
}

export const metadata = {
  title: 'Categorias de Produtos | Trato',
  description: 'Gestão de categorias de produtos',
};
