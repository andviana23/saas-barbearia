'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
  Grid,
  Autocomplete,
  FormControl,
  FormLabel,
  InputAdornment,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HexColorPicker } from 'react-colorful';
import { Save, X, Palette, DollarSign, Target, TrendingUp, FolderTree, Folder } from 'lucide-react';
import {
  createTipoCategoriaReceita,
  updateTipoCategoriaReceita,
  getTiposCategoriasReceita,
} from '@/actions/tipos-categoria-receita';

const categoriasReceitaSchema = z.object({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal')
    .optional(),
  icon: z.string().optional(),
  categoria_pai_id: z.string().uuid().optional().nullable(),
  meta_mensal: z.number().min(0, 'Meta deve ser positiva').optional().nullable(),
  objetivo_percentual: z
    .number()
    .min(0)
    .max(100, 'Percentual deve estar entre 0 e 100')
    .optional()
    .nullable(),
  tipo_meta: z.enum(['valor', 'percentual', 'quantidade']).optional(),
  ativo: z.boolean().optional(),
});

type CategoriaReceitaFormData = z.infer<typeof categoriasReceitaSchema>;

interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icon?: string;
  categoria_pai_id?: string;
  meta_mensal?: number;
  objetivo_percentual?: number;
  tipo_meta?: 'valor' | 'percentual' | 'quantidade';
  ativo: boolean;
}

interface TipoCategoriasReceitaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoria?: Categoria;
}

export default function TipoCategoriasReceitaModal({
  open,
  onClose,
  onSuccess,
  categoria,
}: TipoCategoriasReceitaModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [categoriasPai, setCategoriasPai] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  const isEditing = !!categoria;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoriaReceitaFormData>({
    resolver: zodResolver(categoriasReceitaSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      cor: '#4caf50',
      icon: '',
      categoria_pai_id: null,
      meta_mensal: null,
      objetivo_percentual: null,
      tipo_meta: 'valor',
      ativo: true,
    },
  });

  const watchedColor = watch('cor');
  const watchedTipoMeta = watch('tipo_meta');

  const loadCategoriasPai = useCallback(async () => {
    setLoadingCategorias(true);
    try {
      const result = await getTiposCategoriasReceita();
      if (result.success) {
        const categorias = (result.data || []).filter(
          (cat: Categoria) => !isEditing || cat.id !== categoria?.id,
        );
        setCategoriasPai(categorias);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias pai:', error);
    }
    setLoadingCategorias(false);
  }, [isEditing, categoria?.id]);

  useEffect(() => {
    if (open) {
      loadCategoriasPai();

      if (isEditing && categoria) {
        reset({
          codigo: categoria.codigo || '',
          nome: categoria.nome || '',
          descricao: categoria.descricao || '',
          cor: categoria.cor || '#4caf50',
          icon: categoria.icon || '',
          categoria_pai_id: categoria.categoria_pai_id || null,
          meta_mensal: categoria.meta_mensal || null,
          objetivo_percentual: categoria.objetivo_percentual || null,
          tipo_meta: categoria.tipo_meta || 'valor',
          ativo: categoria.ativo !== false,
        });
      } else {
        reset({
          codigo: '',
          nome: '',
          descricao: '',
          cor: '#4caf50',
          icon: '',
          categoria_pai_id: null,
          meta_mensal: null,
          objetivo_percentual: null,
          tipo_meta: 'valor',
          ativo: true,
        });
      }
    }
  }, [open, isEditing, categoria, reset, loadCategoriasPai]);

  const onSubmit = handleSubmit(async (data: CategoriaReceitaFormData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (isEditing) {
        formData.append('id', categoria!.id);
      }

      formData.append('codigo', data.codigo);
      formData.append('nome', data.nome);
      formData.append('descricao', data.descricao || '');
      formData.append('cor_primaria', data.cor || '#4caf50');
      formData.append('icone', data.icon || '');
      formData.append('parent_id', data.categoria_pai_id || '');
      formData.append('meta_mensal', data.meta_mensal?.toString() || '');
      formData.append('objetivo_percentual', data.objetivo_percentual?.toString() || '');
      formData.append('tipo_meta', data.tipo_meta || 'valor');
      formData.append('ativo', (data.ativo !== false).toString());
      formData.append('ordem', '0');

      const result = isEditing
        ? await updateTipoCategoriaReceita(formData)
        : await createTipoCategoriaReceita(formData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Erro ao salvar categoria');
      }
    } catch (error) {
      setError('Erro interno do sistema');
      console.error('Erro ao salvar categoria:', error);
    }

    setLoading(false);
  });

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setShowColorPicker(false);
    }
  };

  const renderTreeOption = (categoria: Categoria) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
      <Folder size={16} color={categoria.cor || '#4caf50'} />
      <Typography variant="body2">
        {categoria.nome} ({categoria.codigo})
      </Typography>
    </Box>
  );

  const tiposMeta = [
    { value: 'valor', label: 'Valor (R$)', icon: DollarSign },
    { value: 'percentual', label: 'Percentual (%)', icon: TrendingUp },
    { value: 'quantidade', label: 'Quantidade', icon: Target },
  ];

  const iconsDisponiveis = [
    { value: 'dollar-sign', label: 'Dinheiro' },
    { value: 'credit-card', label: 'Cartão' },
    { value: 'trending-up', label: 'Crescimento' },
    { value: 'target', label: 'Meta' },
    { value: 'star', label: 'Estrela' },
    { value: 'award', label: 'Prêmio' },
    { value: 'gift', label: 'Presente' },
    { value: 'briefcase', label: 'Negócio' },
    { value: 'users', label: 'Clientes' },
    { value: 'scissors', label: 'Serviços' },
    { value: 'shopping-bag', label: 'Produtos' },
    { value: 'percent', label: 'Comissão' },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FolderTree size={24} />
          {isEditing ? 'Editar Categoria de Receita' : 'Nova Categoria de Receita'}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
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
                    required
                    error={!!errors.codigo}
                    helperText={errors.codigo?.message}
                    placeholder="SERVICOS"
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                )}
              />
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
                    required
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                    placeholder="Serviços de Barbearia"
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
                    placeholder="Descrição opcional da categoria"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Hierarquia
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="categoria_pai_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    value={categoriasPai.find((cat) => cat.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                    options={categoriasPai}
                    getOptionLabel={(option) => `${option.nome} (${option.codigo})`}
                    renderOption={(props, option) => <li {...props}>{renderTreeOption(option)}</li>}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categoria Pai (opcional)"
                        placeholder="Selecione uma categoria pai"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCategorias ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Metas e Objetivos
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="tipo_meta"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Tipo de Meta"
                    fullWidth
                    error={!!errors.tipo_meta}
                    helperText={errors.tipo_meta?.message}
                  >
                    {tiposMeta.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <tipo.icon size={16} />
                          {tipo.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {watchedTipoMeta === 'valor' && (
              <Grid item xs={12} sm={4}>
                <Controller
                  name="meta_mensal"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meta Mensal"
                      fullWidth
                      type="number"
                      error={!!errors.meta_mensal}
                      helperText={errors.meta_mensal?.message}
                      placeholder="5000.00"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DollarSign size={20} />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                      }
                    />
                  )}
                />
              </Grid>
            )}

            {watchedTipoMeta === 'percentual' && (
              <Grid item xs={12} sm={4}>
                <Controller
                  name="objetivo_percentual"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Objetivo Percentual"
                      fullWidth
                      type="number"
                      error={!!errors.objetivo_percentual}
                      helperText={errors.objetivo_percentual?.message}
                      placeholder="15"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                      }
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Aparência
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>Cor da Categoria</FormLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    sx={{
                      minWidth: 120,
                      backgroundColor: watchedColor,
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: watchedColor,
                        opacity: 0.8,
                      },
                    }}
                    startIcon={<Palette size={16} />}
                  >
                    {watchedColor}
                  </Button>
                </Box>
                {showColorPicker && (
                  <Box sx={{ mt: 2 }}>
                    <HexColorPicker
                      color={watchedColor}
                      onChange={(color) => setValue('cor', color)}
                    />
                  </Box>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    value={iconsDisponiveis.find((icon) => icon.value === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue?.value || '')}
                    options={iconsDisponiveis}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ícone (opcional)"
                        placeholder="Selecione um ícone"
                      />
                    )}
                  />
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
                      <Switch checked={field.value} onChange={field.onChange} color="success" />
                    }
                    label="Categoria Ativa"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading} startIcon={<X size={16} />}>
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Save size={16} />}
        >
          {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
