import { Box, Container, Typography } from '@mui/material';
import ConfiguracoesContent from './components/ConfiguracoesContent';

export default function ConfiguracoesPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Configurações
        </Typography>
        <ConfiguracoesContent />
      </Box>
    </Container>
  );
}

export const metadata = {
  title: 'Configurações | Trato',
  description: 'Central de configurações do sistema',
};
