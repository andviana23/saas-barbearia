import { Box, Container, Typography } from '@mui/material';
import EstoqueContent from './components/EstoqueContent';

export default function EstoquePage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Controle de Estoque
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitore e gerencie o estoque de todos os produtos
        </Typography>
      </Box>

      <EstoqueContent />
    </Container>
  );
}

export const metadata = {
  title: 'Controle de Estoque | Trato',
  description: 'Gestão e controle de estoque de produtos',
};
