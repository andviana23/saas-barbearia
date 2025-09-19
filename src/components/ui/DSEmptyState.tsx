'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  HelpOutline as HelpIcon,
  CloudOff as OfflineIcon,
  WifiOff as NoConnectionIcon,
  Inbox as InboxIcon,
  Assignment as TaskIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface DSEmptyStateProps {
  variant?: 'default' | 'search' | 'filter' | 'error' | 'offline' | 'loading';
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    startIcon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    startIcon?: React.ReactNode;
  };
  size?: 'small' | 'medium' | 'large';
  fullHeight?: boolean;
  illustration?: React.ReactNode;
}

export function DSEmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'medium',
  fullHeight = false,
  illustration,
}: DSEmptyStateProps) {
  const theme = useTheme();

  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <SearchIcon />;
      case 'filter':
        return <FilterIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'offline':
        return <OfflineIcon />;
      default:
        return <InboxIcon />;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 48;
      case 'medium':
        return 64;
      case 'large':
        return 80;
      default:
        return 64;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return 3;
      case 'medium':
        return 4;
      case 'large':
        return 6;
      default:
        return 4;
    }
  };

  const iconElement = icon || getDefaultIcon();
  const iconSize = getIconSize();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullHeight ? '60vh' : 'auto',
        p: getPadding(),
        textAlign: 'center',
      }}
    >
      <Box sx={{ maxWidth: 400, width: '100%' }}>
        {illustration && (
          <Box sx={{ mb: 3 }}>
            {illustration}
          </Box>
        )}
        
        {!illustration && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: iconSize + 16,
              height: iconSize + 16,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              mx: 'auto',
              mb: 3,
            }}
          >
            {React.cloneElement(iconElement as React.ReactElement, {
              sx: { fontSize: iconSize },
            })}
          </Box>
        )}

        <Typography
          variant={size === 'large' ? 'h5' : size === 'small' ? 'h6' : 'h6'}
          component="h3"
          gutterBottom
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: action || secondaryAction ? 3 : 0, lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        )}

        {(action || secondaryAction) && (
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            alignItems="center"
          >
            {action && (
              <Button
                variant={action.variant || 'contained'}
                onClick={action.onClick}
                startIcon={action.startIcon}
                size={size === 'small' ? 'small' : 'medium'}
              >
                {action.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outlined'}
                onClick={secondaryAction.onClick}
                startIcon={secondaryAction.startIcon}
                size={size === 'small' ? 'small' : 'medium'}
              >
                {secondaryAction.label}
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

// Componentes específicos para diferentes contextos
export function DSEmptySearch({
  searchTerm,
  onClearSearch,
  onCreateNew,
  createLabel = 'Criar novo',
}: {
  searchTerm?: string;
  onClearSearch?: () => void;
  onCreateNew?: () => void;
  createLabel?: string;
}) {
  return (
    <DSEmptyState
      variant="search"
      title="Nenhum resultado encontrado"
      description={
        searchTerm
          ? `Não encontramos resultados para "${searchTerm}". Tente ajustar sua busca ou criar um novo item.`
          : 'Tente ajustar os termos da sua busca.'
      }
      action={
        onCreateNew
          ? {
              label: createLabel,
              onClick: onCreateNew,
              startIcon: <AddIcon />,
            }
          : undefined
      }
      secondaryAction={
        onClearSearch
          ? {
              label: 'Limpar busca',
              onClick: onClearSearch,
              variant: 'text',
            }
          : undefined
      }
    />
  );
}

export function DSEmptyFilter({
  onClearFilters,
  onCreateNew,
  createLabel = 'Criar novo',
}: {
  onClearFilters?: () => void;
  onCreateNew?: () => void;
  createLabel?: string;
}) {
  return (
    <DSEmptyState
      variant="filter"
      title="Nenhum item corresponde aos filtros"
      description="Tente ajustar ou remover alguns filtros para ver mais resultados."
      action={
        onClearFilters
          ? {
              label: 'Limpar filtros',
              onClick: onClearFilters,
              startIcon: <RefreshIcon />,
            }
          : undefined
      }
      secondaryAction={
        onCreateNew
          ? {
              label: createLabel,
              onClick: onCreateNew,
              startIcon: <AddIcon />,
              variant: 'outlined',
            }
          : undefined
      }
    />
  );
}

export function DSEmptyError({
  title = 'Algo deu errado',
  description = 'Ocorreu um erro ao carregar os dados. Tente novamente.',
  onRetry,
  onGoBack,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}) {
  return (
    <DSEmptyState
      variant="error"
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: 'Tentar novamente',
              onClick: onRetry,
              startIcon: <RefreshIcon />,
            }
          : undefined
      }
      secondaryAction={
        onGoBack
          ? {
              label: 'Voltar',
              onClick: onGoBack,
              variant: 'text',
            }
          : undefined
      }
    />
  );
}

export function DSEmptyOffline({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <DSEmptyState
      variant="offline"
      icon={<NoConnectionIcon />}
      title="Sem conexão"
      description="Verifique sua conexão com a internet e tente novamente."
      action={
        onRetry
          ? {
              label: 'Tentar novamente',
              onClick: onRetry,
              startIcon: <RefreshIcon />,
            }
          : undefined
      }
    />
  );
}

// Componentes específicos para diferentes seções do app
export function DSEmptyAgendamentos({
  onCreateNew,
}: {
  onCreateNew?: () => void;
}) {
  return (
    <DSEmptyState
      icon={<EventIcon />}
      title="Nenhum agendamento encontrado"
      description="Comece criando seu primeiro agendamento ou aguarde novos clientes agendarem."
      action={
        onCreateNew
          ? {
              label: 'Novo agendamento',
              onClick: onCreateNew,
              startIcon: <AddIcon />,
            }
          : undefined
      }
      size="large"
    />
  );
}

export function DSEmptyClientes({
  onCreateNew,
}: {
  onCreateNew?: () => void;
}) {
  return (
    <DSEmptyState
      icon={<PeopleIcon />}
      title="Nenhum cliente cadastrado"
      description="Adicione seus primeiros clientes para começar a gerenciar agendamentos e histórico."
      action={
        onCreateNew
          ? {
              label: 'Adicionar cliente',
              onClick: onCreateNew,
              startIcon: <AddIcon />,
            }
          : undefined
      }
      size="large"
    />
  );
}

export function DSEmptyFinanceiro({
  onViewReports,
}: {
  onViewReports?: () => void;
}) {
  return (
    <DSEmptyState
      icon={<MoneyIcon />}
      title="Nenhuma movimentação financeira"
      description="Quando você tiver agendamentos e vendas, as informações financeiras aparecerão aqui."
      action={
        onViewReports
          ? {
              label: 'Ver relatórios',
              onClick: onViewReports,
              variant: 'outlined',
            }
          : undefined
      }
      size="large"
    />
  );
}

export function DSEmptyNotificacoes({
  onConfigureNotifications,
}: {
  onConfigureNotifications?: () => void;
}) {
  return (
    <DSEmptyState
      icon={<NotificationIcon />}
      title="Nenhuma notificação"
      description="Você está em dia! Não há notificações pendentes no momento."
      action={
        onConfigureNotifications
          ? {
              label: 'Configurar notificações',
              onClick: onConfigureNotifications,
              startIcon: <SettingsIcon />,
              variant: 'outlined',
            }
          : undefined
      }
    />
  );
}