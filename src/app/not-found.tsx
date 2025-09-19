'use client';

import Link from 'next/link';
import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';

export default function NotFound() {
  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 600,
          textAlign: 'center',
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 6 }}>
          {/* Logo */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 1,
              }}
            >
              ✂️ Trato Hub
            </Typography>
          </Box>

          {/* Erro 404 */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '8rem',
              fontWeight: 'bold',
              color: 'error.main',
              mb: 2,
              lineHeight: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 2,
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            Página não encontrada
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              fontSize: '1.1rem',
            }}
          >
            A página que você está procurando não existe ou foi movida.
            <br />
            Verifique o endereço digitado ou volte ao dashboard principal.
          </Typography>

          {/* Botões de Ação */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              component={Link}
              href="/dashboard"
              variant="contained"
              size="large"
              startIcon={<Home />}
              sx={{ minWidth: 200 }}
            >
              Voltar ao Dashboard
            </Button>

            <Button
              onClick={() => window.history.back()}
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              sx={{ minWidth: 150 }}
            >
              Página Anterior
            </Button>
          </Box>

          {/* Links úteis */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Links úteis:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/agenda" style={{ textDecoration: 'none' }}>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ '&:hover': { textDecoration: 'underline' } }}
                >
                  Agenda
                </Typography>
              </Link>
              <Link href="/clientes" style={{ textDecoration: 'none' }}>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ '&:hover': { textDecoration: 'underline' } }}
                >
                  Clientes
                </Typography>
              </Link>
              <Link href="/caixa" style={{ textDecoration: 'none' }}>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ '&:hover': { textDecoration: 'underline' } }}
                >
                  Caixa
                </Typography>
              </Link>
              <Link href="/ajuda" style={{ textDecoration: 'none' }}>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ '&:hover': { textDecoration: 'underline' } }}
                >
                  Ajuda
                </Typography>
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
