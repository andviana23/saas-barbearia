'use client';

import React from 'react';
import { Button, Box, Typography, Alert, CircularProgress, Chip } from '@mui/material';
import { Refresh, Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';

export interface RetryButtonProps {
  /** Se está carregando */
  isLoading?: boolean;
  /** Erro atual */
  error?: Error | null;
  /** Número de tentativas realizadas */
  attemptCount?: number;
  /** Número máximo de tentativas */
  maxAttempts?: number;
  /** Função para tentar novamente */
  onRetry: () => void;
  /** Função para cancelar/resetar */
  onCancel?: () => void;
  /** Variante do botão */
  variant?: 'contained' | 'outlined' | 'text';
  /** Tamanho do botão */
  size?: 'small' | 'medium' | 'large';
  /** Texto customizado do botão */
  retryText?: string;
  /** Se deve mostrar o contador de tentativas */
  showAttemptCount?: boolean;
  /** Se deve mostrar detalhes do erro */
  showErrorDetails?: boolean;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  isLoading = false,
  error,
  attemptCount = 0,
  maxAttempts = 3,
  onRetry,
  onCancel,
  variant = 'outlined',
  size = 'medium',
  retryText = 'Tentar novamente',
  showAttemptCount = true,
  showErrorDetails = false,
}) => {
  const hasExhaustedRetries = attemptCount >= maxAttempts;
  const hasError = !!error;

  const getErrorMessage = () => {
    if (!error) return '';

    // Mensagens amigáveis para erros comuns
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Erro de conexão. Verifique sua internet.';
    }

    if (error.message.includes('timeout')) {
      return 'Operação demorou muito para responder.';
    }

    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return 'Sessão expirada. Faça login novamente.';
    }

    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return 'Você não tem permissão para esta operação.';
    }

    if (error.message.includes('500')) {
      return 'Erro interno do servidor. Tente novamente.';
    }

    return showErrorDetails ? error.message : 'Ocorreu um erro inesperado.';
  };

  const getAlertSeverity = () => {
    if (hasExhaustedRetries) return 'error';
    if (hasError) return 'warning';
    return 'info';
  };

  const getIcon = () => {
    if (isLoading) return <CircularProgress size={20} />;
    if (hasExhaustedRetries) return <ErrorIcon />;
    if (hasError) return <Warning />;
    return <Refresh />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Alert com informações do erro */}
      {hasError && (
        <Alert
          severity={getAlertSeverity()}
          sx={{ mb: 2 }}
          action={
            showAttemptCount && (
              <Chip
                size="small"
                label={`${attemptCount}/${maxAttempts}`}
                color={hasExhaustedRetries ? 'error' : 'warning'}
                variant="outlined"
              />
            )
          }
        >
          <Typography variant="body2">{getErrorMessage()}</Typography>
        </Alert>
      )}

      {/* Botões de ação */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          variant={variant}
          size={size}
          onClick={onRetry}
          disabled={isLoading || hasExhaustedRetries}
          startIcon={getIcon()}
          color={hasError ? 'warning' : 'primary'}
        >
          {isLoading ? 'Tentando...' : retryText}
        </Button>

        {onCancel && (
          <Button variant="text" size={size} onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
      </Box>

      {/* Mensagem de sucesso após retry */}
      {!hasError && attemptCount > 0 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle fontSize="small" />
            <Typography variant="body2">Operação realizada com sucesso!</Typography>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default RetryButton;
