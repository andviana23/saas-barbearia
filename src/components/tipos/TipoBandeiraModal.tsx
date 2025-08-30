'use client';

import { useState, useTransition } from 'react';
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
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HexColorPicker } from 'react-colorful';
import { CreditCard, Percent, Palette, Link2, Hash, CheckCircle2 } from 'lucide-react';
import { createTipoBandeiraSchema, updateTipoBandeiraSchema } from '@/schemas/tipos';
import { createTipoBandeira, updateTipoBandeira } from '@/actions/tipos-bandeira';
import type { TipoBandeira } from '@/schemas/tipos';

interface TipoBandeiraModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipoBandeira?: TipoBandeira | null;
}

type FormData = {
  nome: string;
  descricao?: string;
  codigo: string;
  taxa_percentual: number;
  ativo: boolean;
  logo_url?: string;
  cor_primaria?: string;
  prefixo_cartao?: string;
  comprimento_cartao?: number;
};

// Dados das principais bandeiras para sugestões
const bandeirasPredefinidas = [
  {
    nome: 'Visa',
    codigo: 'VISA',
    prefixo_cartao: '4',
    comprimento_cartao: 16,
    cor_primaria: '#1A1F71',
  },
  {
    nome: 'Mastercard',
    codigo: 'MASTERCARD',
    prefixo_cartao: '5',
    comprimento_cartao: 16,
    cor_primaria: '#EB001B',
  },
  {
    nome: 'Elo',
    codigo: 'ELO',
    prefixo_cartao: '6',
    comprimento_cartao: 16,
    cor_primaria: '#FFCB00',
  },
  {
    nome: 'American Express',
    codigo: 'AMEX',
    prefixo_cartao: '3',
    comprimento_cartao: 15,
    cor_primaria: '#006FCF',
  },
  {
    nome: 'Hipercard',
    codigo: 'HIPERCARD',
    prefixo_cartao: '6',
    comprimento_cartao: 16,
    cor_primaria: '#FF6900',
  },
];

export default function TipoBandeiraModal({
  open,
  onClose,
  onSuccess,
  tipoBandeira,
}: TipoBandeiraModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isEditing = !!tipoBandeira;
  const formSchema = isEditing
    ? updateTipoBandeiraSchema.omit({ id: true })
    : createTipoBandeiraSchema;

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
      nome: tipoBandeira?.nome || '',
      descricao: tipoBandeira?.descricao || '',
      codigo: tipoBandeira?.codigo || '',
      taxa_percentual: tipoBandeira?.taxa_percentual || 0,
      ativo: tipoBandeira?.ativo ?? true,
      logo_url: tipoBandeira?.logo_url || '',
      cor_primaria: tipoBandeira?.cor_primaria || '#1976d2',
      prefixo_cartao: tipoBandeira?.prefixo_cartao || '',
      comprimento_cartao: tipoBandeira?.comprimento_cartao || 16,
    },
  });

  const corAtual = watch('cor_primaria');
  const nomeAtual = watch('nome');

  const handleClose = () => {
    reset();
    setError(null);
    setShowColorPicker(false);
    setShowSuggestions(false);
    onClose();
  };

  const handleSuggestionClick = (bandeira: (typeof bandeirasPredefinidas)[0]) => {
    setValue('nome', bandeira.nome);
    setValue('codigo', bandeira.codigo);
    setValue('prefixo_cartao', bandeira.prefixo_cartao);
    setValue('comprimento_cartao', bandeira.comprimento_cartao);
    setValue('cor_primaria', bandeira.cor_primaria);
    setShowSuggestions(false);
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      setError(null);

      const formData = new FormData();
      if (isEditing && tipoBandeira?.id) {
        formData.append('id', tipoBandeira.id);
      }

      formData.append('nome', data.nome);
      if (data.descricao) formData.append('descricao', data.descricao);
      formData.append('codigo', data.codigo);
      formData.append('taxa_percentual', data.taxa_percentual.toString());
      formData.append('ativo', data.ativo.toString());
      if (data.logo_url) formData.append('logo_url', data.logo_url);
      if (data.cor_primaria) formData.append('cor_primaria', data.cor_primaria);
      if (data.prefixo_cartao) formData.append('prefixo_cartao', data.prefixo_cartao);
      if (data.comprimento_cartao)
        formData.append('comprimento_cartao', data.comprimento_cartao.toString());

      const result = isEditing
        ? await updateTipoBandeira(formData)
        : await createTipoBandeira(formData);

      if (result.success) {
        handleClose();
        onSuccess();
      } else {
        setError(result.error || 'Erro ao salvar bandeira');
      }
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Bandeira de Cartão' : 'Nova Bandeira de Cartão'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Sugestões de Bandeiras */}
          {!isEditing && showSuggestions && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <Button size="small" onClick={() => setShowSuggestions(false)}>
                  Fechar
                </Button>
              }
            >
              <Box>
                <strong>Bandeiras Predefinidas:</strong>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {bandeirasPredefinidas.map((bandeira) => (
                    <Chip
                      key={bandeira.codigo}
                      label={bandeira.nome}
                      onClick={() => handleSuggestionClick(bandeira)}
                      sx={{
                        backgroundColor: bandeira.cor_primaria,
                        color: 'white',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <strong>Informações Básicas</strong>
                {!isEditing && !showSuggestions && (
                  <Button size="small" variant="outlined" onClick={() => setShowSuggestions(true)}>
                    Ver Sugestões
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome da Bandeira"
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
                    helperText={errors.codigo?.message || 'Ex: VISA, MASTERCARD, ELO'}
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

            {/* Configurações Técnicas */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2, mt: 2 }}>
                <strong>Configurações Técnicas</strong>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="prefixo_cartao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Prefixo do Cartão"
                    fullWidth
                    error={!!errors.prefixo_cartao}
                    helperText={errors.prefixo_cartao?.message || 'Ex: 4 (Visa), 5 (Mastercard)'}
                    inputProps={{ maxLength: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Hash size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="comprimento_cartao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Comprimento do Cartão"
                    type="number"
                    fullWidth
                    inputProps={{ min: 13, max: 19 }}
                    error={!!errors.comprimento_cartao}
                    helperText={errors.comprimento_cartao?.message || '13-19 dígitos'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="taxa_percentual"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Taxa da Bandeira"
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
                name="logo_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL do Logo"
                    fullWidth
                    error={!!errors.logo_url}
                    helperText={errors.logo_url?.message || 'URL da imagem do logo da bandeira'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Link2 size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
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
                      backgroundColor: corAtual || '#1976d2',
                      borderRadius: 1,
                      marginRight: 1,
                    },
                  }}
                >
                  Cor Primária
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
                      onChange={(color) => setValue('cor_primaria', color)}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Preview do Card */}
            {nomeAtual && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Preview:
                  </Typography>
                  <Box
                    sx={{
                      width: 300,
                      height: 180,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${corAtual || '#1976d2'}, ${corAtual ? corAtual + '80' : '#1976d280'})`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 2,
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {nomeAtual}
                      </Typography>
                      <CreditCard size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        •••• •••• •••• ••••
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        VALID THRU 12/28
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}
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
