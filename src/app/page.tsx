'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stack, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { DSButton } from '@/components/ui';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar automaticamente para o login após 2 segundos
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Stack p={4} gap={3} alignItems="center" justifyContent="center" minHeight="100vh">
      <Typography variant="h1" textAlign="center">
        Trato
      </Typography>
      <Typography variant="h4" color="text.secondary" textAlign="center">
        Sistema de Gestao para Barbearias
      </Typography>

      <CircularProgress sx={{ mt: 2 }} />

      <Typography color="text.secondary" textAlign="center">
        Redirecionando para o login...
      </Typography>

      <Stack direction="row" gap={2} mt={3}>
        <DSButton variant="contained" component={Link} href="/dashboard" size="large">
          Ir para Dashboard
        </DSButton>
        <DSButton variant="outlined" component={Link} href="/login" size="large">
          Fazer Login
        </DSButton>
      </Stack>
    </Stack>
  );
}
