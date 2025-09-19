'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  AttachMoney,
  Add,
  Visibility,
  Print,
  Download,
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';

interface MovimentoCaixa {
  id: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  formaPagamento: string;
  horario: string;
  profissional?: string;
}

export default function CaixaPage() {
  const [movimentos] = useState<MovimentoCaixa[]>([
    {
      id: '1',
      tipo: 'entrada',
      descricao: 'Corte + Barba - João Silva',
      valor: 45.0,
      formaPagamento: 'Cartão',
      horario: '09:30',
      profissional: 'Carlos Santos',
    },
    {
      id: '2',
      tipo: 'entrada',
      descricao: 'Corte Simples - Pedro Costa',
      valor: 25.0,
      formaPagamento: 'Dinheiro',
      horario: '10:15',
      profissional: 'Ana Lima',
    },
    {
      id: '3',
      tipo: 'saida',
      descricao: 'Compra de produtos',
      valor: 120.0,
      formaPagamento: 'Cartão',
      horario: '11:00',
    },
  ]);

  const totalEntradas = movimentos
    .filter((m) => m.tipo === 'entrada')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalSaidas = movimentos
    .filter((m) => m.tipo === 'saida')
    .reduce((sum, m) => sum + m.valor, 0);

  const saldoAtual = totalEntradas - totalSaidas;

  const getStatusColor = (tipo: string) => {
    return tipo === 'entrada' ? 'success' : 'error';
  };

  const getStatusIcon = (tipo: string) => {
    return tipo === 'entrada' ? <TrendingUp /> : <TrendingDown />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Controle de Caixa"
        subtitle="Gerencie entradas e saídas do caixa diário"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Print />} size="small">
              Imprimir
            </Button>
            <Button variant="outlined" startIcon={<Download />} size="small">
              Exportar
            </Button>
            <Button variant="contained" startIcon={<Add />} size="small">
              Nova Movimentação
            </Button>
          </Stack>
        }
      />

      {/* Resumo do Caixa */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Entradas
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                R$ {totalEntradas.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {movimentos.filter((m) => m.tipo === 'entrada').length} movimentações
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" color="error.main">
                  Saídas
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                R$ {totalSaidas.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {movimentos.filter((m) => m.tipo === 'saida').length} movimentações
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Receipt color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Saldo Atual
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={saldoAtual >= 0 ? 'success.main' : 'error.main'}
              >
                R$ {saldoAtual.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Saldo do dia
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CreditCard color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  Formas de Pagamento
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label="Cartão" size="small" />
                <Chip label="Dinheiro" size="small" />
                <Chip label="PIX" size="small" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Movimentações */}
      <Card>
        <CardContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h6">Movimentações do Dia</Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Profissional</TableCell>
                  <TableCell>Forma de Pagamento</TableCell>
                  <TableCell>Horário</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimentos.map((movimento) => (
                  <TableRow key={movimento.id}>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(movimento.tipo)}
                        label={movimento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        color={getStatusColor(movimento.tipo)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{movimento.descricao}</TableCell>
                    <TableCell>{movimento.profissional || '-'}</TableCell>
                    <TableCell>
                      <Chip label={movimento.formaPagamento} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{movimento.horario}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      <Typography
                        color={movimento.tipo === 'entrada' ? 'success.main' : 'error.main'}
                      >
                        {movimento.tipo === 'entrada' ? '+' : '-'} R$ {movimento.valor.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {movimentos.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AttachMoney sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhuma movimentação registrada
              </Typography>
              <Typography variant="body2" color="text.secondary">
                As movimentações do caixa aparecerão aqui
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
