'use client';

import { useState, useTransition } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Alert,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HexColorPicker } from 'react-colorful';
import { CreditCard, DollarSign, Percent, Hash, Palette, Lock, CheckCircle2 } from 'lucide-react';
import { createTipoPagamentoSchema, updateTipoPagamentoSchema } from '@/schemas/tipos';
import { createTipoPagamento, updateTipoPagamento } from '@/actions/tipos-pagamento';
import type { TipoPagamento } from '@/schemas/tipos';

interface TipoPagamentoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipoPagamento?: TipoPagamento | null;
}

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  codigo: z.string().min(1, 'Código é obrigatório'),
  taxa_percentual: z.number().min(0, 'Taxa não pode ser negativa'),
  taxa_fixa: z.number().min(0, 'Taxa fixa não pode ser negativa'),
  aceita_parcelamento: z.boolean(),
  max_parcelas: z.number().int().min(1, 'Mínimo 1 parcela'),
  requer_autorizacao: z.boolean(),
  ativo: z.boolean(),
  icon: z.string().optional(),
  cor: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const iconsOptions = [
  { value: 'CreditCard', label: 'Cartão de Crédito', icon: <CreditCard size={16} /> },
  { value: 'DollarSign', label: 'Dinheiro', icon: <DollarSign size={16} /> },
  { value: 'Hash', label: 'PIX', icon: <Hash size={16} /> },
];

export default function TipoPagamentoModal({
  open,
  onClose,
  onSuccess,
  tipoPagamento,
}: TipoPagamentoModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isEditing = !!tipoPagamento;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: tipoPagamento?.nome || '',
      descricao: tipoPagamento?.descricao || '',
      codigo: tipoPagamento?.codigo || '',
      taxa_percentual: tipoPagamento?.taxa_percentual || 0,
      taxa_fixa: tipoPagamento?.taxa_fixa || 0,
      aceita_parcelamento: tipoPagamento?.aceita_parcelamento || false,
      max_parcelas: tipoPagamento?.max_parcelas || 1,
      requer_autorizacao: tipoPagamento?.requer_autorizacao || false,
      ativo: tipoPagamento?.ativo ?? true,
      icon: tipoPagamento?.icon || '',
      cor: tipoPagamento?.cor || '#1976d2',
    },
  });

  const aceitaParcelamento = watch('aceita_parcelamento');
  const corAtual = watch('cor');

  const handleClose = () => {
    reset();
    setError(null);
    setShowColorPicker(false);
    onClose();
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      setError(null);

      const formData = new FormData();
      if (isEditing && tipoPagamento?.id) {
        formData.append('id', tipoPagamento.id);
      }

      formData.append('nome', data.nome);
      if (data.descricao) formData.append('descricao', data.descricao);
      formData.append('codigo', data.codigo);
      formData.append('taxa_percentual', data.taxa_percentual.toString());
      formData.append('taxa_fixa', data.taxa_fixa.toString());
      formData.append('aceita_parcelamento', data.aceita_parcelamento.toString());
      formData.append('max_parcelas', data.max_parcelas.toString());
      formData.append('requer_autorizacao', data.requer_autorizacao.toString());
      formData.append('ativo', data.ativo.toString());
      if (data.icon) formData.append('icon', data.icon);
      if (data.cor) formData.append('cor', data.cor);

      const result = isEditing
        ? await updateTipoPagamento(formData)
        : await createTipoPagamento(formData);

      if (result.success) {
        handleClose();
        onSuccess();
      } else {
        setError(result.error || 'Erro ao salvar tipo de pagamento');
      }
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Tipo de Pagamento' : 'Novo Tipo de Pagamento'}</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <strong>Informações Básicas</strong>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome"
                    fullWidth
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCard size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="codigo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código"
                    fullWidth
                    error={!!errors.codigo}
                    helperText={errors.codigo?.message || 'Ex: PIX, DINHEIRO, CARTAO_CREDITO'}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                    rows={2}
                    error={!!errors.descricao}
                    helperText={errors.descricao?.message}
                  />
                )}
              />
            </Grid>

            {/* Taxas e Configurações */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2, mt: 2 }}>
                <strong>Taxas e Configurações</strong>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="taxa_percentual"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Taxa Percentual"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    error={!!errors.taxa_percentual}
                    helperText={errors.taxa_percentual?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Percent size={20} />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="taxa_fixa"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Taxa Fixa"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.taxa_fixa}
                    helperText={errors.taxa_fixa?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DollarSign size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="aceita_parcelamento"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Aceita Parcelamento"
                  />
                )}
              />
            </Grid>

            {aceitaParcelamento && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="max_parcelas"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Máximo de Parcelas"
                      type="number"
                      fullWidth
                      inputProps={{ min: 1, max: 24 }}
                      error={!!errors.max_parcelas}
                      helperText={errors.max_parcelas?.message}
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Controller
                name="requer_autorizacao"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Lock size={16} />
                        Requer Autorização
                      </Box>
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="ativo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle2 size={16} />
                        Ativo
                      </Box>
                    }
                  />
                )}
              />
            </Grid>

            {/* Aparência */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2, mt: 2 }}>
                <strong>Aparência</strong>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Ícone</InputLabel>
                    <Select {...field} label="Ícone">
                      <MenuItem value="">Nenhum</MenuItem>
                      {iconsOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.icon}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  startIcon={<Palette size={16} />}
                  sx={{
                    mb: 1,
                    '&::before': {
                      content: '""',
                      width: 16,
                      height: 16,
                      backgroundColor: corAtual || '#4f8cff',
                      borderRadius: 1,
                      marginRight: 1,
                    },
                  }}
                >
                  Escolher Cor
                </Button>
                {corAtual && (
                  <Box>
                    <Chip
                      label={corAtual}
                      size="small"
                      sx={{ backgroundColor: corAtual, color: 'white' }}
                    />
                  </Box>
                )}
                {showColorPicker && (
                  <Box sx={{ mt: 2 }}>
                    <HexColorPicker
                      color={corAtual || '#1976d2'}
                      onChange={(color) => setValue('cor', color)}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
