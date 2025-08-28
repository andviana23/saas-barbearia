'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Support as SupportIcon,
  BugReport as BugReportIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { logUserAction } from '@/lib/logging/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  const handleGoHome = () => {
    logUserAction('error_page_navigation', {
      action: 'go_home',
      error: error.message,
    });
    router.push('/dashboard');
  };

  const handleRefresh = () => {
    logUserAction('error_page_navigation', {
      action: 'refresh',
      error: error.message,
    });
    reset();
  };

  const handleGoBack = () => {
    logUserAction('error_page_navigation', {
      action: 'go_back',
      error: error.message,
    });
    router.back();
  };

  const handleReportBug = () => {
    logUserAction('error_page_navigation', {
      action: 'report_bug',
      error: error.message,
    });
    // Em produção, abrir modal ou redirecionar para sistema de tickets
    window.open('mailto:suporte@trato.com.br?subject=Reporte de Erro', '_blank');
  };

  const handleContactSupport = () => {
    logUserAction('error_page_navigation', {
      action: 'contact_support',
      error: error.message,
    });
    // Em produção, abrir chat ou redirecionar para suporte
    window.open('https://trato.com.br/suporte', '_blank');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h1" component="h1" color="error.main" gutterBottom>
          Ops! Algo deu errado
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          Encontramos um problema inesperado
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Não se preocupe, nossa equipe foi notificada e está trabalhando para resolver.
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detalhes do Erro
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontFamily="monospace">
              {error.message || 'Erro desconhecido'}
            </Typography>
            {error.digest && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                ID do Erro: {error.digest}
              </Typography>
            )}
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Se este erro persistir, entre em contato com nosso suporte técnico.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            O que você pode fazer?
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <RefreshIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Tentar novamente"
                secondary="Clique no botão abaixo para recarregar a página"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <ArrowBackIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Voltar à página anterior"
                secondary="Retornar à tela onde você estava"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Ir para o Dashboard"
                secondary="Acessar a página principal do sistema"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          size="large"
        >
          Tentar Novamente
        </Button>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          size="large"
        >
          Voltar
        </Button>

        <Button variant="outlined" startIcon={<HomeIcon />} onClick={handleGoHome} size="large">
          Dashboard
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Precisa de Ajuda?
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              onClick={handleReportBug}
              color="warning"
            >
              Reportar Bug
            </Button>

            <Button
              variant="outlined"
              startIcon={<SupportIcon />}
              onClick={handleContactSupport}
              color="info"
            >
              Contatar Suporte
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Nossa equipe de suporte está disponível 24/7 para ajudar você.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Se este problema persistir, por favor, inclua o ID do erro ao contatar o suporte.
        </Typography>
      </Box>
    </Container>
  );
}
