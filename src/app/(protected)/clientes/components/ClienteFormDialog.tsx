'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DSTextField, FormRow } from '@/components/ui';
import { useCreateCliente, useUpdateCliente } from '@/hooks/use-clientes';
import { safeValidate } from '@/lib/validation';
import { CreateClienteSchema, UpdateClienteSchema } from '@/schemas';

interface ClienteFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  cliente?: any;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function ClienteFormDialog({
  open,
  mode,
  cliente,
  onClose,
  onSuccess,
}: ClienteFormDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    observacoes: '',
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isEdit = mode === 'edit';

  // Reset form quando dialog abre/fecha
  useEffect(() => {
    if (open) {
      if (isEdit && cliente) {
        setFormData({
          nome: cliente.nome || '',
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          data_nascimento: cliente.data_nascimento || '',
          observacoes: cliente.observacoes || '',
          ativo: cliente.ativo ?? true,
        });
      } else {
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          data_nascimento: '',
          observacoes: '',
          ativo: true,
        });
      }
      setErrors({});
      setGeneralError('');
    }
  }, [open, isEdit, cliente]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setGeneralError('');

    try {
      // Validação
      const schema = isEdit ? UpdateClienteSchema : CreateClienteSchema;
      const validation = safeValidate(
        schema as any,
        isEdit ? { id: cliente.id, ...formData } : formData,
      );

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.errors?.forEach((error) => {
          fieldErrors[error.field] = error.message;
        });
        setErrors(fieldErrors);
        return;
      }

      // Converter objeto para FormData
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value.toString());
      });

      // Submissão
      const result = isEdit
        ? await updateMutation.mutateAsync({
            id: cliente.id,
            formData: formDataObj,
          })
        : await createMutation.mutateAsync(formDataObj);

      if (result.success) {
        onSuccess(isEdit ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
      } else {
        if (result.errors) {
          const fieldErrors: Record<string, string> = {};
          result.errors.forEach((error) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setGeneralError(result.message || 'Erro ao salvar cliente');
        }
      }
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'Erro desconhecido ao salvar cliente',
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</Typography>
          <IconButton onClick={handleClose} disabled={isLoading} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {generalError && <Alert severity="error">{generalError}</Alert>}

          <FormRow>
            <DSTextField
              label="Nome *"
              value={formData.nome}
              onChange={handleChange('nome')}
              error={!!errors.nome}
              helperText={errors.nome}
              disabled={isLoading}
              fullWidth
              autoFocus
            />
          </FormRow>

          <FormRow>
            <DSTextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
              fullWidth
            />

            <DSTextField
              label="Telefone"
              value={formData.telefone}
              onChange={handleChange('telefone')}
              error={!!errors.telefone}
              helperText={errors.telefone}
              disabled={isLoading}
              placeholder="(11) 99999-9999"
              fullWidth
            />
          </FormRow>

          <FormRow>
            <DSTextField
              label="Data de Nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={handleChange('data_nascimento')}
              error={!!errors.data_nascimento}
              helperText={errors.data_nascimento}
              disabled={isLoading}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </FormRow>

          <FormRow>
            <DSTextField
              label="Observações"
              value={formData.observacoes}
              onChange={handleChange('observacoes')}
              error={!!errors.observacoes}
              helperText={errors.observacoes}
              disabled={isLoading}
              multiline
              rows={3}
              fullWidth
              placeholder="Observações sobre o cliente, preferências, etc."
            />
          </FormRow>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
