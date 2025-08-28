'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useCriarSolicitacao } from '@/hooks/useLGPD';

interface DataRequestFormProps {
  unidadeId: string;
  onSuccess?: () => void;
}

interface FormData {
  tipo_solicitacao: 'acesso' | 'portabilidade' | 'exclusao';
  motivo: string;
  observacoes?: string;
}

export default function DataRequestForm({ unidadeId, onSuccess }: DataRequestFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const criarSolicitacao = useCriarSolicitacao();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      tipo_solicitacao: 'acesso',
      motivo: '',
      observacoes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Calcular prazo limite (15 dias úteis conforme LGPD)
      const prazoLimite = new Date();
      prazoLimite.setDate(prazoLimite.getDate() + 15);

      const solicitacao = {
        profile_id: 'user-id', // Isso deveria vir do contexto de auth
        unidade_id: unidadeId,
        tipo_solicitacao: data.tipo_solicitacao,
        motivo: data.motivo,
        prazo_limite: prazoLimite.toISOString().split('T')[0], // YYYY-MM-DD format
        canal_solicitacao: 'web' as const,
        urgencia: 'normal' as const,
        observacoes: data.observacoes || '',
      };

      await criarSolicitacao.mutateAsync(solicitacao);
      setSubmitted(true);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent>
          <Alert severity="success">
            <Typography variant="h6">Solicitação enviada com sucesso!</Typography>
            <Typography>
              Sua solicitação foi registrada e será processada em até 15 dias úteis conforme a LGPD.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Typography variant="h5" component="h2">
          Solicitação de Dados LGPD
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Solicite acesso, portabilidade ou exclusão dos seus dados pessoais.
        </Typography>
      </CardHeader>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Controller
              name="tipo_solicitacao"
              control={control}
              rules={{ required: 'Tipo de solicitação é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo_solicitacao}>
                  <InputLabel>Tipo de Solicitação</InputLabel>
                  <Select {...field} label="Tipo de Solicitação">
                    <MenuItem value="acesso">
                      Acesso aos Dados - Visualizar dados coletados
                    </MenuItem>
                    <MenuItem value="portabilidade">
                      Portabilidade - Exportar dados em formato legível
                    </MenuItem>
                    <MenuItem value="exclusao">Exclusão - Remover dados pessoais</MenuItem>
                  </Select>
                  {errors.tipo_solicitacao && (
                    <Typography variant="caption" color="error">
                      {errors.tipo_solicitacao.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Controller
              name="motivo"
              control={control}
              rules={{
                required: 'Motivo é obrigatório',
                minLength: { value: 10, message: 'Motivo deve ter pelo menos 10 caracteres' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Motivo da Solicitação"
                  multiline
                  rows={3}
                  error={!!errors.motivo}
                  helperText={errors.motivo?.message}
                  placeholder="Descreva o motivo da sua solicitação..."
                />
              )}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Observações (Opcional)"
                  multiline
                  rows={2}
                  placeholder="Informações adicionais..."
                />
              )}
            />
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Importante:</strong> Sua solicitação será processada em até 15 dias úteis
              conforme estabelecido pela LGPD. Você receberá uma confirmação por e-mail e será
              notificado quando a solicitação for processada.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => reset()}
              disabled={criarSolicitacao.isPending}
            >
              Limpar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={criarSolicitacao.isPending}
              startIcon={criarSolicitacao.isPending ? <CircularProgress size={20} /> : null}
            >
              {criarSolicitacao.isPending ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
