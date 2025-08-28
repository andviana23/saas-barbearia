import { Box, Container, Typography } from '@mui/material';

export default function ConfiguracoesPerfilPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Minha Conta
        </Typography>

        {/* TODO: Implementar PerfilForm component */}
        <Typography variant="body1" color="text.secondary">
          Configurações de perfil
        </Typography>
      </Box>
    </Container>
  );
}

export const metadata = {
  title: 'Minha Conta | Trato',
  description: 'Configurações de perfil do usuário',
};
