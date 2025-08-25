'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Collapse,
} from '@mui/material'
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { notificationMicrocopy } from '@/lib/ux/microcopy'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotifications deve ser usado dentro de NotificationProvider'
    )
  }
  return context
}

// Componente de Toast individual
function NotificationToast({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <SuccessIcon />
      case 'error':
        return <ErrorIcon />
      case 'warning':
        return <WarningIcon />
      case 'info':
        return <InfoIcon />
      default:
        return <InfoIcon />
    }
  }

  const getSeverity = (): 'success' | 'error' | 'warning' | 'info' => {
    return notification.type
  }

  const handleActionClick = () => {
    if (notification.action) {
      notification.action.onClick()
      onClose()
    }
  }

  return (
    <Alert
      severity={getSeverity()}
      icon={getIcon()}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {notification.action && (
            <IconButton
              size="small"
              onClick={handleActionClick}
              sx={{ mr: 1 }}
              aria-label={notification.action.label}
            >
              {notification.action.label}
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Fechar notificação"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      }
      onClose={onClose}
      sx={{
        width: '100%',
        maxWidth: 400,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      <AlertTitle>{notification.title}</AlertTitle>
      <Collapse in={expanded || notification.message.length < 100}>
        {notification.message}
      </Collapse>
      {notification.message.length >= 100 && (
        <Box
          component="span"
          onClick={() => setExpanded(!expanded)}
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            textDecoration: 'underline',
            fontSize: '0.875rem',
          }}
        >
          {expanded ? 'Mostrar menos' : 'Mostrar mais'}
        </Box>
      )}
    </Alert>
  )
}

// Provider principal
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 6000, // 6 segundos padrão
      }

      setNotifications((prev) => [...prev, newNotification])

      // Auto-remover após duração
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, newNotification.duration)
      }
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Renderizar notificações */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 9999 }}
        >
          <NotificationToast
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  )
}

// Hook de conveniência para notificações rápidas
export function useQuickNotifications() {
  const { addNotification } = useNotifications()

  const showSuccess = useCallback(
    (title: string, message: string) => {
      addNotification({
        type: 'success',
        title,
        message,
      })
    },
    [addNotification]
  )

  const showError = useCallback(
    (title: string, message: string) => {
      addNotification({
        type: 'error',
        title,
        message,
      })
    },
    [addNotification]
  )

  const showWarning = useCallback(
    (title: string, message: string) => {
      addNotification({
        type: 'warning',
        title,
        message,
      })
    },
    [addNotification]
  )

  const showInfo = useCallback(
    (title: string, message: string) => {
      addNotification({
        type: 'info',
        title,
        message,
      })
    },
    [addNotification]
  )

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
