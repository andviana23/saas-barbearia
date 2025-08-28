'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
    } catch (err: any) {
      console.error('[login] erro:', err);
      setError(err?.message || 'Email ou senha inválidos');
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
        sx={(t) => ({
          maxWidth: 420,
          width: '100%',
          borderRadius: 1.5,
          bgcolor: 'rgba(4, 14, 24, 0.60)',
          border: `1px solid ${t.palette.divider}`,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        })}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Trato
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestão para Barbearias
            </Typography>
          </Box>

          <form onSubmit={onSubmit} method="post">
            <TextField
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

            <TextField
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

            <Button
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
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                onClick={() => router.push('/forgot-password')}
                color="primary"
                sx={{ textTransform: 'none' }}
                disabled={isSubmitting}
              >
                Esqueceu sua senha?
              </Button>
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
