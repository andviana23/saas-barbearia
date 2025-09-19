'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[24],
    margin: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(4),
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2),
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
}));

interface DSModalProps extends Omit<DialogProps, 'title'> {
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export default function DSModal({
  title,
  children,
  actions,
  onClose,
  showCloseButton = true,
  maxWidth = 'sm',
  ...props
}: DSModalProps) {
  return (
    <StyledDialog maxWidth={maxWidth} onClose={onClose} {...props}>
      {title && (
        <StyledDialogTitle>
          {title}
          {showCloseButton && onClose && (
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
      )}

      <StyledDialogContent>{children}</StyledDialogContent>

      {actions && <StyledDialogActions>{actions}</StyledDialogActions>}
    </StyledDialog>
  );
}
