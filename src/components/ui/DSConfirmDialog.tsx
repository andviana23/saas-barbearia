'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[24],
    margin: theme.spacing(2),
    minWidth: 320,
    maxWidth: 480,
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(4),
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2, 3),
  fontSize: '1.25rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(0, 3, 3, 3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(0, 3, 3, 3),
  gap: theme.spacing(1),
  justifyContent: 'flex-end',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  marginBottom: theme.spacing(2),
  marginRight: theme.spacing(2),
}));

export type ConfirmDialogVariant = 'warning' | 'error' | 'info' | 'delete';

interface DSConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: ConfirmDialogVariant;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  showCloseButton?: boolean;
  details?: string;
}

const variantConfig = {
  warning: {
    icon: WarningIcon,
    iconColor: '#ff9800',
    iconBgColor: '#fff3e0',
    confirmColor: 'warning' as const,
  },
  error: {
    icon: ErrorIcon,
    iconColor: '#f44336',
    iconBgColor: '#ffebee',
    confirmColor: 'error' as const,
  },
  info: {
    icon: InfoIcon,
    iconColor: '#2196f3',
    iconBgColor: '#e3f2fd',
    confirmColor: 'primary' as const,
  },
  delete: {
    icon: DeleteIcon,
    iconColor: '#f44336',
    iconBgColor: '#ffebee',
    confirmColor: 'error' as const,
  },
};

export default function DSConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  showCloseButton = true,
  details,
}: DSConfirmDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <StyledDialog open={open} onClose={onClose} disableEscapeKeyDown={loading}>
      <StyledDialogTitle>
        <Box display="flex" alignItems="center">
          <IconContainer
            sx={{
              backgroundColor: config.iconBgColor,
              color: config.iconColor,
            }}
          >
            <IconComponent />
          </IconContainer>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {showCloseButton && !loading && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </StyledDialogTitle>

      <StyledDialogContent>
        <Typography variant="body1" sx={{ mb: details ? 2 : 0 }}>
          {message}
        </Typography>
        
        {details && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">{details}</Typography>
          </Alert>
        )}
      </StyledDialogContent>

      <StyledDialogActions>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          color={config.confirmColor}
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {loading ? 'Processando...' : confirmText}
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
}