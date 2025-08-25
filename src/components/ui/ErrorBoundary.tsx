'use client'

import React from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
import { logger } from '@/lib/logging/logger'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log estruturado do erro
    logger.error('ErrorBoundary capturou um erro', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    // Fallback para console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              p: 4,
            }}
          >
            <ErrorOutline sx={{ fontSize: 64, color: 'error.main' }} />

            <Typography variant="h4" component="h1" gutterBottom>
              Ops! Algo deu errado
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos
              trabalhando para resolver o problema.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  this.setState({ hasError: false })
                  window.location.reload()
                }}
              >
                Tentar novamente
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  this.setState({ hasError: false })
                  window.location.href = '/dashboard'
                }}
              >
                Ir para Dashboard
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      )
    }

    return this.props.children
  }
}
