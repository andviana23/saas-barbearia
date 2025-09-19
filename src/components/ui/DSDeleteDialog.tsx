'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[24],
    margin: theme.spacing(2),
    minWidth: 400,
    maxWidth: 520,
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
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
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
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  marginBottom: theme.spacing(2),
}));

interface DSDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: string;
  message?: string;
  requireNameConfirmation?: boolean;
  loading?: boolean;
  showCloseButton?: boolean;
  consequences?: string[];
}

export default function DSDeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  message,
  requireNameConfirmation = true,
  loading = false,
  showCloseButton = true,
  consequences = [],
}: DSDeleteDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (requireNameConfirmation) {
      setIsValid(confirmationText.toLowerCase() === itemName.toLowerCase());
    } else {
      setIsValid(true);
    }
  }, [confirmationText, itemName, requireNameConfirmation]);

  useEffect(() => {
    if (!open) {
      setConfirmationText('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
    }
  };

  const defaultMessage = `Esta ação não pode ser desfeita. ${itemType} "${itemName}" será permanentemente removido${itemType.endsWith('a') ? 'a' : ''} do sistema.`;

  return (
    <StyledDialog open={open} onClose={onClose} disableEscapeKeyDown={loading}>
      <StyledDialogTitle>
        <Box display="flex" alignItems="center">
          <DeleteIcon sx={{ mr: 1 }} />
          {title}
        </Box>
        {showCloseButton && !loading && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: 'inherit',
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </StyledDialogTitle>

      <StyledDialogContent>
        <IconContainer>
          <WarningIcon fontSize="large" />
        </IconContainer>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
          {message || defaultMessage}
        </Typography>

        {consequences.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Consequências desta ação:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {consequences.map((consequence, index) => (
                <Typography key={index} component="li" variant="body2">
                  {consequence}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}

        {requireNameConfirmation && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Para confirmar, digite <strong>"{itemName}"</strong> no campo abaixo:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={`Digite "${itemName}" para confirmar`}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={loading}
              error={confirmationText.length > 0 && !isValid}
              helperText={
                confirmationText.length > 0 && !isValid
                  ? 'O nome digitado não confere'
                  : ''
              }
              autoFocus
            />
          </Box>
        )}
      </StyledDialogContent>

      <StyledDialogActions>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={loading || !isValid}
          startIcon={<DeleteIcon />}
        >
          {loading ? 'Excluindo...' : 'Excluir Permanentemente'}
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
}