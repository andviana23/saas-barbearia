import { Box, Container, Typography } from '@mui/material';

export default function ConfiguracoesSistemaPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Configurações do Sistema
        </Typography>

        {/* TODO: Implementar PreferenciasForm component */}
        <Typography variant="body1" color="text.secondary">
          Preferências do sistema
        </Typography>
      </Box>
    </Container>
  );
}

export const metadata = {
  title: 'Configurações do Sistema | Trato',
  description: 'Preferências e configurações do sistema',
};
