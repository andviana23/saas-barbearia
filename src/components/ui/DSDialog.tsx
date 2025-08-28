'use client';
import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  DialogProps,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import DSButton from './DSButton';

export interface DSDialogProps extends Omit<DialogProps, 'open' | 'onClose' | 'title'> {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  actions?: React.ReactNode; // ações personalizadas
}

export default function DSDialog({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmar',
  maxWidth = 'sm',
  fullWidth = true,
  actions,
  ...dialogProps
}: DSDialogProps) {
  const id = 'dialog-title';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={id}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        elevation: 0,
        sx: (t) => ({
          bgcolor: 'background.paper', // #040E18
          border: `1px solid ${t.palette.divider}`, // borda sutil
          borderRadius: t.shape.borderRadius, // radius do tema
        }),
      }}
      {...dialogProps}
    >
      <DialogTitle
        id={id}
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {title}
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={(t) => ({
          py: 3,
          borderColor: t.palette.divider, // cor do divisor
        })}
      >
        {children}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          gap: 1,
        }}
      >
        {actions ? (
          actions
        ) : (
          <>
            <DSButton variant="outlined" onClick={onClose}>
              Cancelar
            </DSButton>
            {onConfirm && (
              <DSButton variant="contained" onClick={onConfirm}>
                {confirmLabel}
              </DSButton>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
