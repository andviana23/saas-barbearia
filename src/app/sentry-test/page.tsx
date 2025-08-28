'use client';

import { Box, Container, Stack, Typography } from '@mui/material';
import * as Sentry from '@sentry/nextjs';
import { DSButton } from '@/components/ui';

export default function SentryTestPage() {
  const handleThrowError = () => {
    throw new Error('Sentry client test error');
  };

  const handleCaptureException = () => {
    Sentry.captureException(new Error('captureException client'));
  };

  const handleServerTest = async () => {
    try {
      const response = await fetch('/api/sentry-test');
      if (!response.ok) {
        console.log('Server error response received:', response.status);
      }
    } catch (error) {
      console.log('Network error calling API:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Sentry Test
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
          Use os botões abaixo para testar se os erros estão sendo enviados corretamente ao Sentry.
        </Typography>

        <Stack spacing={3} alignItems="center">
          <DSButton
            variant="contained"
            color="error"
            size="large"
            onClick={handleThrowError}
            sx={{ minWidth: 300 }}
          >
            Lançar Erro Não Tratado (Client)
          </DSButton>

          <DSButton
            variant="contained"
            color="warning"
            size="large"
            onClick={handleCaptureException}
            sx={{ minWidth: 300 }}
          >
            Capturar Exceção (Client)
          </DSButton>

          <DSButton
            variant="contained"
            color="info"
            size="large"
            onClick={handleServerTest}
            sx={{ minWidth: 300 }}
          >
            Testar Erro do Servidor
          </DSButton>
        </Stack>

        <Typography
          variant="caption"
          sx={{ mt: 4, display: 'block', textAlign: 'center', color: 'text.secondary' }}
        >
          Verifique o painel do Sentry para confirmar se os eventos estão sendo registrados.
        </Typography>
      </Box>
    </Container>
  );
}
