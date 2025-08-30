'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { DSButton, DSTextField } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp?.get('redirectTo') || '/dashboard';

  const { status, authLoading, signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && status === 'SIGNED_IN') {
      const safe = redirectTo === '/login' ? '/dashboard' : redirectTo;
      setTimeout(() => router.replace(safe), 0);
    }
  }, [authLoading, status, redirectTo, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const emailValue = (formData.get('email') as string) || email;
      const passwordValue = (formData.get('password') as string) || password;

      if (!emailValue || !passwordValue) {
        setError('Email e senha são obrigatórios');
        return;
      }

      await signInWithPassword(emailValue, passwordValue);
    } catch (err: unknown) {
      console.error('[login] erro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Email ou senha inválidos';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false); // nunca deixe o botão travado
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={(theme) => ({
          maxWidth: 420,
          width: '100%',
          borderRadius: `${4}px`, // radius.md do design system
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(45, 45, 45, 0.95)' // background.paper dark com transparência
              : 'rgba(255, 255, 255, 0.95)', // background.paper light com transparência
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(16px)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0,0,0,0.6)'
              : '0 8px 24px rgba(0,0,0,0.12)',
        })}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Logo da Empresa */}
            <Box sx={{ mb: 3 }}>
              <Image
                src="/images/logo.png"
                alt="Trato - Logo"
                width={120}
                height={120}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </Box>

            <Typography variant="h4" component="h1" gutterBottom>
              Trato
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestão para Barbearias
            </Typography>
          </Box>

          <form onSubmit={onSubmit} method="post">
            <DSTextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
              name="email"
            />

            <DSTextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              name="password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <DSButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </DSButton>

            <Box sx={{ textAlign: 'center' }}>
              <DSButton
                onClick={() => router.push('/forgot-password')}
                color="primary"
                variant="text"
                sx={{ textTransform: 'none' }}
                disabled={isSubmitting}
              >
                Esqueceu sua senha?
              </DSButton>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Não tem uma conta?{' '}
                <Link href="/signup" style={{ textDecoration: 'none' }}>
                  Cadastre-se
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
