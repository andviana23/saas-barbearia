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
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Person,
  Work,
  ContentCut,
  Category,
  Business,
  Settings,
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowForward,
  Group,
  Assignment,
  Store,
  LocalOffer,
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';

interface CadastroItem {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  total: number;
  rota: string;
  cor: string;
  ultimaAtualizacao?: string;
}

export default function CadastrosPage() {
  const [cadastros] = useState<CadastroItem[]>([
    {
      id: 'clientes',
      titulo: 'Clientes',
      descricao: 'Gerencie informações dos clientes, histórico e preferências',
      icone: <Person />,
      total: 245,
      rota: '/clientes',
      cor: 'primary',
      ultimaAtualizacao: 'Hoje às 14:30',
    },
    {
      id: 'profissionais',
      titulo: 'Profissionais',
      descricao: 'Cadastre e gerencie barbeiros, cabeleireiros e especialistas',
      icone: <Work />,
      total: 8,
      rota: '/profissionais',
      cor: 'secondary',
      ultimaAtualizacao: 'Ontem às 16:45',
    },
    {
      id: 'servicos',
      titulo: 'Serviços',
      descricao: 'Configure serviços oferecidos, preços e duração',
      icone: <ContentCut />,
      total: 32,
      rota: '/servicos',
      cor: 'info',
      ultimaAtualizacao: 'Hoje às 09:15',
    },
    {
      id: 'produtos',
      titulo: 'Produtos',
      descricao: 'Gerencie produtos para venda e controle de estoque',
      icone: <Store />,
      total: 156,
      rota: '/produtos',
      cor: 'success',
      ultimaAtualizacao: 'Hoje às 11:20',
    },
    {
      id: 'categorias',
      titulo: 'Categorias',
      descricao: 'Organize serviços e produtos em categorias',
      icone: <Category />,
      total: 12,
      rota: '/categorias',
      cor: 'warning',
      ultimaAtualizacao: 'Há 3 dias',
    },
    {
      id: 'fornecedores',
      titulo: 'Fornecedores',
      descricao: 'Cadastre fornecedores de produtos e equipamentos',
      icone: <Business />,
      total: 18,
      rota: '/fornecedores',
      cor: 'error',
      ultimaAtualizacao: 'Há 1 semana',
    },
    {
      id: 'promocoes',
      titulo: 'Promoções',
      descricao: 'Configure descontos, cupons e ofertas especiais',
      icone: <LocalOffer />,
      total: 5,
      rota: '/promocoes',
      cor: 'info',
      ultimaAtualizacao: 'Há 2 dias',
    },
    {
      id: 'configuracoes',
      titulo: 'Configurações',
      descricao: 'Ajustes gerais do sistema e preferências',
      icone: <Settings />,
      total: 0,
      rota: '/configuracoes',
      cor: 'default',
      ultimaAtualizacao: 'Hoje às 08:00',
    },
  ]);

  const cadastrosPrincipais = cadastros.slice(0, 4);
  const cadastrosSecundarios = cadastros.slice(4);

  const totalRegistros = cadastros.reduce((sum, item) => sum + item.total, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Cadastros"
        subtitle="Gerencie todos os cadastros e configurações do sistema"
        actions={
          <Button variant="contained" startIcon={<Add />} size="small">
            Novo Cadastro
          </Button>
        }
      />

      {/* Resumo Geral */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Total de Registros
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {totalRegistros.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Em todos os cadastros
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  Clientes Ativos
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {cadastros.find((c) => c.id === 'clientes')?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clientes cadastrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Work color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="secondary.main">
                  Profissionais
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {cadastros.find((c) => c.id === 'profissionais')?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Equipe ativa
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ContentCut color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Serviços
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {cadastros.find((c) => c.id === 'servicos')?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Serviços disponíveis
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Cadastros Principais */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Group color="primary" sx={{ mr: 1 }} />
                Cadastros Principais
              </Typography>

              <Grid container spacing={2}>
                {cadastrosPrincipais.map((cadastro) => (
                  <Grid item xs={12} sm={6} key={cadastro.id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: `${cadastro.cor}.main`,
                              mr: 2,
                              width: 48,
                              height: 48,
                            }}
                          >
                            {cadastro.icone}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {cadastro.titulo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {cadastro.descricao}
                            </Typography>
                            <Chip
                              label={`${cadastro.total} registros`}
                              color={cadastro.cor as any}
                              size="small"
                            />
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {cadastro.ultimaAtualizacao}
                          </Typography>
                          <Button
                            size="small"
                            endIcon={<ArrowForward />}
                            onClick={() => (window.location.href = cadastro.rota)}
                          >
                            Acessar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cadastros Secundários */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Settings color="secondary" sx={{ mr: 1 }} />
                Outros Cadastros
              </Typography>

              <List>
                {cadastrosSecundarios.map((cadastro, index) => (
                  <React.Fragment key={cadastro.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: `${cadastro.cor}.main`,
                            width: 32,
                            height: 32,
                          }}
                        >
                          {React.cloneElement(cadastro.icone as React.ReactElement, {
                            sx: { fontSize: 16 },
                          })}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={cadastro.titulo}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {cadastro.total} registros
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {cadastro.ultimaAtualizacao}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" color="default">
                            <Edit />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < cadastrosSecundarios.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ações Rápidas */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Ações Rápidas
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<Person />} sx={{ py: 2 }}>
                Novo Cliente
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<Work />} sx={{ py: 2 }}>
                Novo Profissional
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<ContentCut />} sx={{ py: 2 }}>
                Novo Serviço
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<Store />} sx={{ py: 2 }}>
                Novo Produto
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
