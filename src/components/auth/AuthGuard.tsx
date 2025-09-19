'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/auth/AuthContext';
import { Box, CircularProgress, Alert } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, authLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    console.log('🔐 AuthGuard verificando:', { user, authLoading, requireAuth });

    if (!authLoading && !user && requireAuth) {
      console.log('🔐 Redirecionando para login...');
      const currentPath = window.location.pathname;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, requireAuth, router]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Se não requer autenticação ou usuário está autenticado, mostrar conteúdo
  if (!requireAuth || user) {
    return <>{children}</>;
  }

  // Se não está autenticado e não está carregando, não mostrar nada (redirecionando)
  return null;
}
