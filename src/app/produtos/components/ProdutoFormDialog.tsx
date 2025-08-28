'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DSButton, DSDialog, FormRow } from '@/components/ui';
import { useCreateProduto, useUpdateProduto } from '@/hooks/use-produtos';

// Tipo local para Produto
interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  unidade_id?: string;
  created_at?: string;
  updated_at?: string;
}

const ProdutoSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  preco: z.coerce
    .number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(99999.99, 'Preço deve ser menor que R$ 100.000,00'),
  estoque: z.coerce
    .number()
    .min(0, 'Estoque não pode ser negativo')
    .max(99999, 'Estoque deve ser menor que 100.000'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  ativo: z.boolean(),
});

type ProdutoFormData = z.infer<typeof ProdutoSchema>;

interface ProdutoFormDialogProps {
  open: boolean;
  onClose: () => void;
  produto?: Produto | null;
}

const CATEGORIA_OPTIONS = [
  { value: 'shampoos', label: 'Shampoos' },
  { value: 'condicionadores', label: 'Condicionadores' },
  { value: 'finalizadores', label: 'Finalizadores' },
  { value: 'barba', label: 'Barba' },
  { value: 'hidratantes', label: 'Hidratantes' },
  { value: 'acessorios', label: 'Acessórios' },
];

export default function ProdutoFormDialog({ open, onClose, produto }: ProdutoFormDialogProps) {
  const isEditing = !!produto;

  const createProduto = useCreateProduto();
  const updateProduto = useUpdateProduto();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(ProdutoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      preco: 0,
      estoque: 0,
      categoria: '',
      ativo: true,
    },
  });

  useEffect(() => {
    if (produto) {
      reset({
        nome: produto.nome,
        descricao: produto.descricao || '',
        preco: produto.preco,
        estoque: produto.estoque,
        categoria: produto.categoria || '',
        ativo: produto.ativo,
      });
    } else {
      reset({
        nome: '',
        descricao: '',
        preco: 0,
        estoque: 0,
        categoria: '',
        ativo: true,
      });
    }
  }, [produto, reset]);

  const onSubmit = async (data: ProdutoFormData) => {
    try {
      // Converter dados para FormData
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      if (isEditing && produto) {
        await updateProduto.mutateAsync({
          id: produto.id,
          formData,
        });
      } else {
        await createProduto.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const isLoading = createProduto.isPending || updateProduto.isPending;
  const error = createProduto.error || updateProduto.error;

  return (
    <DSDialog
      open={open}
      onClose={handleClose}
      title={isEditing ? 'Editar Produto' : 'Novo Produto'}
      maxWidth="md"
      actions={
        <>
          <DSButton variant="outlined" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </DSButton>
          <DSButton
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
          </DSButton>
        </>
      }
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="nome"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome do produto"
                  fullWidth
                  required
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="descricao"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>

          <FormRow>
            <Controller
              name="preco"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Preço"
                  type="number"
                  fullWidth
                  required
                  inputProps={{
                    step: 0.01,
                    min: 0,
                  }}
                  error={!!errors.preco}
                  helperText={errors.preco?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              name="estoque"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Estoque inicial"
                  type="number"
                  fullWidth
                  required
                  inputProps={{
                    min: 0,
                  }}
                  error={!!errors.estoque}
                  helperText={errors.estoque?.message}
                  disabled={isLoading}
                />
              )}
            />
          </FormRow>

          <Grid item xs={12}>
            <Controller
              name="categoria"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Categoria"
                  fullWidth
                  required
                  error={!!errors.categoria}
                  helperText={errors.categoria?.message}
                  disabled={isLoading}
                >
                  {CATEGORIA_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="ativo"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch checked={field.value} onChange={field.onChange} disabled={isLoading} />
                  }
                  label="Produto ativo"
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </DSDialog>
  );
}
