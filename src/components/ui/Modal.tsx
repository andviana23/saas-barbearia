import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Breakpoint,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { ReactNode } from 'react'
import Button from './Button'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  actions?: ReactNode
  maxWidth?: Breakpoint | false
  fullWidth?: boolean
  fullScreen?: boolean
  loading?: boolean
  disableCloseButton?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  loading = false,
  disableCloseButton = false,
}: ModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          opacity: loading ? 0.7 : 1,
        },
      }}
    >
      {title && (
        <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {!disableCloseButton && (
            <IconButton
              aria-label="fechar"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'grey.500',
              }}
              disabled={loading}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          p: 3,
          pt: title ? 1 : 3,
        }}
      >
        <Box sx={{ pointerEvents: loading ? 'none' : 'auto' }}>{children}</Box>
      </DialogContent>

      {actions && (
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              width: '100%',
              justifyContent: 'flex-end',
            }}
          >
            {actions}
          </Box>
        </DialogActions>
      )}
    </Dialog>
  )
}

// Modal de Confirmação
export interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  variant = 'info',
}: ConfirmModalProps) {
  const confirmColor =
    variant === 'danger'
      ? 'error'
      : variant === 'warning'
        ? 'warning'
        : 'primary'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      loading={loading}
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant="contained"
            color={confirmColor}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <Typography>{message}</Typography>
    </Modal>
  )
}
