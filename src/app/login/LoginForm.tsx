'use client';

import { useState, useEffect } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Só redirecionar se realmente estiver autenticado e não estiver em processo de login
    if (isAuthenticated && !authLoading && !isSubmitting) {
      console.log('✅ Usuário autenticado, redirecionando...');
      const redirectTo = searchParams?.get('redirectTo') || '/dashboard';

      // Usar setTimeout para evitar problemas de estado
      setTimeout(() => {
        router.push(redirectTo);
      }, 100);
    }
  }, [isAuthenticated, authLoading, isSubmitting, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Suporta autofill do navegador: lê valores do formulário se estado estiver vazio
    const form = e.currentTarget;
    const formData = new FormData(form);
    const emailValue = (formData.get('email') as string) || email;
    const passwordValue = (formData.get('password') as string) || password;

    if (!emailValue || !passwordValue || isSubmitting) return;

    console.log('🔐 Iniciando login...', { email: emailValue });
    setError(null);
    setIsSubmitting(true);

    try {
      // Sincroniza estado com valores do form (autofill)
      if (!email) setEmail(emailValue);
      if (!password) setPassword(passwordValue);

      const result = await signIn(emailValue, passwordValue);
      console.log('📡 Resultado do signIn:', result);
      // Supabase signIn retorna { user, session }
      if (!result?.user) {
        setError('Email ou senha inválidos');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      setError('Erro inesperado. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  // Determinar se está carregando
  const isLoading = isSubmitting || authLoading;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Trato
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestao para Barbearias
            </Typography>
          </Box>

          <form onSubmit={handleSubmit} method="post">
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
              disabled={isLoading}
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
              disabled={isLoading}
              name="password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {isSubmitting ? 'Entrando...' : 'Carregando...'}
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
                disabled={isLoading}
              >
                Esqueceu sua senha?
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nao tem uma conta?{' '}
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
