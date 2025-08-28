'use client';

import * as React from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Stack,
  Button,
  Alert,
  InputAdornment,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { z } from 'zod';

// Schema de validação
const fechamentoSchema = z.object({
  data: z.string().min(1, 'Informe a data.'),
  responsavel: z.string().min(2, 'Informe o responsável.'),
  saldoInicial: z.coerce.number().min(0, 'Não pode ser negativo.'),
  suprimento: z.coerce.number().min(0, 'Não pode ser negativo.').default(0),
  vendasDinheiro: z.coerce.number().min(0).default(0),
  vendasPix: z.coerce.number().min(0).default(0),
  vendasDebito: z.coerce.number().min(0).default(0),
  vendasCredito: z.coerce.number().min(0).default(0),
  recebimentosOutros: z.coerce.number().min(0).default(0),
  despesas: z.coerce.number().min(0).default(0),
  sangria: z.coerce.number().min(0).default(0),
  contagemEmCaixa: z.coerce.number().min(0, 'Informe a contagem.'),
  observacoes: z.string().max(1000).optional(),
});

type FechamentoFormValues = z.infer<typeof fechamentoSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

function sum(...vals: number[]) {
  return vals.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
}

// MoneyField component removed as it was unused

export function FechamentoCaixaClient() {
  const [values, setValues] = React.useState<FechamentoFormValues>({
    data: new Date().toISOString().slice(0, 10),
    responsavel: '',
    saldoInicial: 0,
    suprimento: 0,
    vendasDinheiro: 0,
    vendasPix: 0,
    vendasDebito: 0,
    vendasCredito: 0,
    recebimentosOutros: 0,
    despesas: 0,
    sangria: 0,
    contagemEmCaixa: 0,
    observacoes: '',
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof FechamentoFormValues, string>>>(
    {},
  );
  const [submitting, setSubmitting] = React.useState(false);

  const totalVendas = sum(
    values.vendasDinheiro,
    values.vendasPix,
    values.vendasDebito,
    values.vendasCredito,
  );
  const totalEntradas = sum(
    values.saldoInicial,
    values.suprimento,
    totalVendas,
    values.recebimentosOutros,
  );
  const totalSaidas = sum(values.despesas, values.sangria);
  const esperadoEmCaixa = totalEntradas - totalSaidas;
  const divergencia = values.contagemEmCaixa - esperadoEmCaixa;

  const setField = (name: keyof FechamentoFormValues, value: string | number) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  function validate(): boolean {
    const result = fechamentoSchema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const fieldErrors: Partial<Record<keyof FechamentoFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof FechamentoFormValues;
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      if (Math.abs(divergencia) > 100 && !values.observacoes) {
        throw new Error('Divergência acima de R$ 100,00 exige justificativa nas observações.');
      }
      alert('Fechamento registrado com sucesso!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao registrar fechamento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Fechamento de Caixa
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/caixa" variant="outlined">
            Voltar ao Caixa
          </Button>
        </Stack>
      </Stack>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Dados básicos */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Dados do Fechamento
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Data"
                    type="date"
                    value={values.data}
                    onChange={(e) => setField('data', e.target.value)}
                    required
                    error={Boolean(errors.data)}
                    helperText={errors.data}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Responsável"
                    placeholder="Nome de quem efetuou o fechamento"
                    value={values.responsavel}
                    onChange={(e) => setField('responsavel', e.target.value)}
                    required
                    error={Boolean(errors.responsavel)}
                    helperText={errors.responsavel}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Resumo */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumo do Fechamento
              </Typography>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Esperado em Caixa
                </Typography>
                <Typography variant="h6">{formatCurrency(esperadoEmCaixa)}</Typography>
              </Stack>
              <Alert sx={{ mt: 2 }} severity={Math.abs(divergencia) < 0.01 ? 'success' : 'warning'}>
                {Math.abs(divergencia) < 0.01
                  ? 'Sem divergências. Fechamento consistente.'
                  : `Atenção: divergência de ${formatCurrency(divergencia)}. Justifique nas observações se necessário.`}
              </Alert>
            </Paper>
          </Grid>

          {/* Botões */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button component={Link} href="/caixa" variant="outlined" disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Registrando...' : 'Registrar Fechamento'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
