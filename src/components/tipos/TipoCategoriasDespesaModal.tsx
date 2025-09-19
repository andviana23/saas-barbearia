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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HexColorPicker } from 'react-colorful';
import {
  Save,
  X,
  Palette,
  DollarSign,
  Building,
  AlertTriangle,
  FolderTree,
  Folder,
} from 'lucide-react';
import {
  createTipoCategoriasDespesa,
  updateTipoCategoriasDespesa,
  getTiposCategoriasDespesa,
} from '@/actions/tipos-categoria-despesa-simple';

const categoriasDespesaSchema = z.object({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal'),
  icon: z.string(),
  categoria_pai_id: z.string().uuid().optional().nullable(),
  obrigatoria: z.boolean(),
  centro_custo: z.string().max(50, 'Centro de custo muito longo'),
  limite_mensal: z.number().min(0, 'Limite deve ser positivo').optional().nullable(),
  ativo: z.boolean(),
});

type CategoriaDespesaFormData = z.infer<typeof categoriasDespesaSchema>;

interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icon?: string;
  categoria_pai_id?: string;
  obrigatoria?: boolean;
  centro_custo?: string;
  limite_mensal?: number;
  ativo: boolean;
}

interface TipoCategoriasDespesaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoria?: Categoria;
}

export default function TipoCategoriasDespesaModal({
  open,
  onClose,
  onSuccess,
  categoria,
}: TipoCategoriasDespesaModalProps) {
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
  } = useForm<CategoriaDespesaFormData>({
    resolver: zodResolver(categoriasDespesaSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      cor: '#1976d2',
      icon: '',
      categoria_pai_id: null,
      obrigatoria: false,
      centro_custo: '',
      limite_mensal: null,
      ativo: true,
    },
  });

  const watchedColor = watch('cor');

  const loadCategoriasPai = useCallback(async () => {
    setLoadingCategorias(true);
    try {
      const result = await getTiposCategoriasDespesa();
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
          cor: categoria.cor || '#4f8cff',
          icon: categoria.icon || '',
          categoria_pai_id: categoria.categoria_pai_id || null,
          obrigatoria: categoria.obrigatoria || false,
          centro_custo: categoria.centro_custo || '',
          limite_mensal: categoria.limite_mensal || null,
          ativo: categoria.ativo !== false,
        });
      } else {
        reset({
          codigo: '',
          nome: '',
          descricao: '',
          cor: '#4f8cff',
          icon: '',
          categoria_pai_id: null,
          obrigatoria: false,
          centro_custo: '',
          limite_mensal: null,
          ativo: true,
        });
      }
    }
  }, [open, isEditing, categoria, reset, loadCategoriasPai]);

  const onSubmit = handleSubmit(async (data: CategoriaDespesaFormData) => {
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
      formData.append('cor', data.cor);
      formData.append('icone', data.icon || '');
      formData.append('parent_id', data.categoria_pai_id || '');
      formData.append('obrigatoria', data.obrigatoria.toString());
      formData.append('centro_custo', data.centro_custo || '');
      formData.append('limite_mensal', data.limite_mensal?.toString() || '');
      formData.append('ativo', data.ativo.toString());
      formData.append('ordem', '0');

      const result = isEditing
        ? await updateTipoCategoriasDespesa(formData)
        : await createTipoCategoriasDespesa(formData);

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
      <Folder size={16} color={categoria.cor || '#1976d2'} />
      <Typography variant="body2">
        {categoria.nome} ({categoria.codigo})
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FolderTree size={24} />
          {isEditing ? 'Editar Categoria de Despesa' : 'Nova Categoria de Despesa'}
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
                    placeholder="ALIMENTACAO"
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
                    placeholder="Alimentação"
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
                Configurações
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="centro_custo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Centro de Custo"
                    fullWidth
                    error={!!errors.centro_custo}
                    helperText={errors.centro_custo?.message}
                    placeholder="CC001"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Building size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="limite_mensal"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Limite Mensal"
                    fullWidth
                    type="number"
                    error={!!errors.limite_mensal}
                    helperText={errors.limite_mensal?.message}
                    placeholder="1000.00"
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

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="obrigatoria"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch checked={field.value} onChange={field.onChange} color="warning" />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AlertTriangle size={16} />
                          Categoria Obrigatória
                        </Box>
                      }
                    />
                  )}
                />

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
              </Box>
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
