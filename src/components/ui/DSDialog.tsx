'use client'
import * as React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'

export default function DSDialog({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmar',
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  onConfirm?: () => void
  confirmLabel?: string
}) {
  const id = 'dialog-title'
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby={id}>
      <DialogTitle id={id}>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          Cancelar
        </Button>
        {onConfirm && <Button onClick={onConfirm}>{confirmLabel}</Button>}
      </DialogActions>
    </Dialog>
  )
}
