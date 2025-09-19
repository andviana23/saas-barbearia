'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  Fade,
  Grow,
  Collapse,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  CircularProgress,
  Chip,
  Paper,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

// Tipos para o sistema de notificações
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  id?: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// Context para gerenciar notificações globalmente
interface NotificationContextType {
  notifications: NotificationOptions[];
  addNotification: (notification: Omit<NotificationOptions, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function DSNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationOptions[]>([]);

  const addNotification = (notification: Omit<NotificationOptions, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove se não for persistente
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      <DSNotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useDSNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useDSNotifications deve ser usado dentro de DSNotificationProvider');
  }
  return context;
}

// Container para renderizar notificações
function DSNotificationContainer() {
  const { notifications, removeNotification } = useDSNotifications();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: 400,
        width: '100%',
      }}
    >
      <Stack spacing={1}>
        {notifications.map((notification) => (
          <DSNotification
            key={notification.id}
            {...notification}
            onClose={() => {
              notification.onClose?.();
              removeNotification(notification.id!);
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

// Componente individual de notificação
function DSNotification({
  type,
  title,
  message,
  action,
  onClose,
}: NotificationOptions) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          p: 2,
          borderLeft: `4px solid ${getColor()}`,
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[8],
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{ color: getColor(), mt: 0.25 }}>
            {getIcon()}
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {title}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
            
            {action && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={action.label}
                  onClick={action.onClick}
                  size="small"
                  variant="outlined"
                  clickable
                />
              </Box>
            )}
          </Box>
          
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Slide>
  );
}

// Componente para progresso de upload/download
interface DSProgressFeedbackProps {
  type: 'upload' | 'download' | 'sync';
  progress: number;
  fileName?: string;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  onCancel?: () => void;
  onRetry?: () => void;
}

export function DSProgressFeedback({
  type,
  progress,
  fileName,
  status = 'processing',
  onCancel,
  onRetry,
}: DSProgressFeedbackProps) {
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'upload':
        return <UploadIcon />;
      case 'download':
        return <DownloadIcon />;
      case 'sync':
        return <SyncIcon />;
      default:
        return <SyncIcon />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Aguardando...';
      case 'processing':
        return `${Math.round(progress)}%`;
      case 'completed':
        return 'Concluído';
      case 'error':
        return 'Erro';
      default:
        return '';
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color: getStatusColor() }}>
          {status === 'processing' ? (
            <CircularProgress size={24} />
          ) : (
            getIcon()
          )}
        </Box>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {fileName || `${type === 'upload' ? 'Upload' : type === 'download' ? 'Download' : 'Sincronização'}`}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(getStatusColor(), 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getStatusColor(),
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
              {getStatusText()}
            </Typography>
          </Box>
        </Box>
        
        {status === 'processing' && onCancel && (
          <IconButton size="small" onClick={onCancel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        
        {status === 'error' && onRetry && (
          <IconButton size="small" onClick={onRetry} color="primary">
            <SyncIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
}

// Hook para feedback rápido
export function useFeedback() {
  const { addNotification } = useDSNotifications();

  const showSuccess = (message: string, title?: string) => {
    return addNotification({ type: 'success', message, title });
  };

  const showError = (message: string, title?: string) => {
    return addNotification({ type: 'error', message, title, duration: 7000 });
  };

  const showWarning = (message: string, title?: string) => {
    return addNotification({ type: 'warning', message, title });
  };

  const showInfo = (message: string, title?: string) => {
    return addNotification({ type: 'info', message, title });
  };

  const showPersistent = (message: string, title?: string, type: NotificationType = 'info') => {
    return addNotification({ type, message, title, persistent: true });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPersistent,
    addNotification,
  };
}

// Componente para animações de entrada/saída
interface DSAnimatedBoxProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'grow' | 'collapse';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  in?: boolean;
}

export function DSAnimatedBox({
  children,
  animation = 'fade',
  direction = 'up',
  duration = 300,
  delay = 0,
  in: inProp = true,
}: DSAnimatedBoxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (animation === 'slide') {
    return (
      <Slide direction={direction} in={inProp && mounted} timeout={duration}>
        <Box>{children}</Box>
      </Slide>
    );
  }

  if (animation === 'grow') {
    return (
      <Grow in={inProp && mounted} timeout={duration}>
        <Box>{children}</Box>
      </Grow>
    );
  }

  if (animation === 'collapse') {
    return (
      <Collapse in={inProp && mounted} timeout={duration}>
        <Box>{children}</Box>
      </Collapse>
    );
  }

  // Default: fade
  return (
    <Fade in={inProp && mounted} timeout={duration}>
      <Box>{children}</Box>
    </Fade>
  );
}