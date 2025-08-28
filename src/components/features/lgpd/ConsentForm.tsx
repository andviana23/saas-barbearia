'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { type CreateLGPDConsentimento } from '@/schemas/lgpd';
import { useCriarConsentimento } from '@/hooks/useLGPD';

interface ConsentFormProps {
  unidadeId: string;
  onSuccess?: () => void;
}

interface FormData {
  marketing: boolean;
  analytics: boolean;
  aceite_termos: boolean;
  aceite_privacidade: boolean;
}

export default function ConsentForm({ unidadeId, onSuccess }: ConsentFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const criarConsentimento = useCriarConsentimento();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      marketing: false,
      analytics: false,
      aceite_termos: false,
      aceite_privacidade: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Converter dados do formulário para o formato esperado pelo hook
      if (data.marketing) {
        const marketingConsent: CreateLGPDConsentimento = {
          profile_id: 'user-id', // Isso deveria vir do contexto de auth
          unidade_id: unidadeId,
          tipo_consentimento: 'marketing',
          finalidade: 'Envio de comunicações comerciais e ofertas promocionais',
          consentimento_dado: true,
          revogado: false,
          origem: 'web',
          versao_termos: '1.0',
        };
        await criarConsentimento.mutateAsync(marketingConsent);
      }

      if (data.analytics) {
        const analyticsConsent: CreateLGPDConsentimento = {
          profile_id: 'user-id', // Isso deveria vir do contexto de auth
          unidade_id: unidadeId,
          tipo_consentimento: 'analytics',
          finalidade: 'Análise de uso do sistema para melhorias',
          consentimento_dado: true,
          revogado: false,
          origem: 'web',
          versao_termos: '1.0',
        };
        await criarConsentimento.mutateAsync(analyticsConsent);
      }

      setSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar consentimento:', error);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent>
          <Alert severity="success">
            <Typography variant="h6">Consentimento registrado com sucesso!</Typography>
            <Typography>
              Suas preferências de privacidade foram salvas. Você pode alterar estas configurações a
              qualquer momento.
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
          Termos de Consentimento LGPD
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Por favor, leia e aceite os termos para continuar usando nossos serviços.
        </Typography>
      </CardHeader>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Finalidades do Tratamento de Dados
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Controller
                name="marketing"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Marketing e Comunicação (Opcional)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Envio de promoções, novidades e comunicações comerciais via e-mail, SMS ou
                          WhatsApp.
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Controller
                name="analytics"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Analytics e Melhorias (Opcional)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Análise de uso do sistema para melhorias de performance e experiência do
                          usuário.
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aceite dos Termos (Obrigatório)
              </Typography>

              <Controller
                name="aceite_termos"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} color="primary" />}
                    label={<Typography variant="body1">Li e aceito os Termos de Uso</Typography>}
                  />
                )}
              />

              <Controller
                name="aceite_privacidade"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} color="primary" />}
                    label={
                      <Typography variant="body1">Li e aceito a Política de Privacidade</Typography>
                    }
                  />
                )}
              />
            </Box>
          </Box>

          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Por favor, corrija os erros antes de continuar.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={criarConsentimento.isPending}
              startIcon={criarConsentimento.isPending ? <CircularProgress size={20} /> : null}
            >
              {criarConsentimento.isPending ? 'Salvando...' : 'Salvar Preferências'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
