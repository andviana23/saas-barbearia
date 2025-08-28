import { Box, Container, Typography } from '@mui/material';

export default function ConfiguracoesPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Configurações
        </Typography>

        {/* TODO: Implementar ConfiguracoesContent component */}
        <Typography variant="body1" color="text.secondary">
          Central de configurações
        </Typography>
      </Box>
    </Container>
  );
}

export const metadata = {
  title: 'Configurações | Trato',
  description: 'Central de configurações do sistema',
};
