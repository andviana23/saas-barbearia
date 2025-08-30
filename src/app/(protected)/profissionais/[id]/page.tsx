'use client';

import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  WhatsApp,
  Phone,
  Email,
  Schedule,
  Star,
  AttachMoney,
  TrendingUp,
  Person,
  CalendarMonth,
  AccessTime,
  Visibility,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfissionalDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const profissionalId = params.id as string;
  const [openEdit, setOpenEdit] = useState(false);

  // Mock de dados do profissional baseado no ID
  const profissional = {
    id: profissionalId,
    nome: 'João Santos',
    telefone: '(11) 98888-7777',
    email: 'joao.santos@tratohub.com',
    avatar: '/avatars/profissional1.jpg',
    especialidade: 'Barbeiro Sênior',
    dataAdmissao: '15/06/2023',
    status: 'ativo',
    nivel: 'Senior',
    comissao: 40,
    horarioTrabalho: {
      entrada: '08:00',
      saida: '18:00',
      diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    },
    especialidades: ['Corte Masculino', 'Barba', 'Sobrancelha', 'Bigode'],
    observacoes: 'Profissional experiente, especialista em cortes modernos e clássicos.',
    estatisticas: {
      totalClientes: 145,
      faturamentoMes: 8500.0,
      avaliacaoMedia: 4.9,
      agendamentosHoje: 8,
      metaMensal: 12000.0,
    },
  };

  // Mock agenda do dia
  const agendaHoje = [
    {
      id: '001',
      horario: '09:00',
      cliente: 'Carlos Silva',
      servicos: ['Corte Degradê', 'Barba'],
      duracao: '1h',
      valor: 60.0,
      status: 'confirmado',
    },
    {
      id: '002',
      horario: '10:30',
      cliente: 'Pedro Oliveira',
      servicos: ['Corte Social'],
      duracao: '30min',
      valor: 35.0,
      status: 'confirmado',
    },
    {
      id: '003',
      horario: '14:00',
      cliente: 'Ana Costa',
      servicos: ['Corte Feminino', 'Escova'],
      duracao: '1h 30min',
      valor: 80.0,
      status: 'pendente',
    },
    {
      id: '004',
      horario: '16:00',
      cliente: 'Lucas Santos',
      servicos: ['Corte + Barba'],
      duracao: '45min',
      valor: 55.0,
      status: 'confirmado',
    },
  ];

  const getStatusChip = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', color: 'success' as const },
      inativo: { label: 'Inativo', color: 'error' as const },
      afastado: { label: 'Afastado', color: 'warning' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getNivelChip = (nivel: string) => {
    const cores = {
      Junior: 'info',
      Pleno: 'primary',
      Senior: 'secondary',
    };
    return (
      <Chip
        label={nivel}
        color={cores[nivel as keyof typeof cores] as 'info' | 'primary' | 'secondary'}
        size="small"
      />
    );
  };

  const getAgendamentoStatusChip = (status: string) => {
    const statusConfig = {
      confirmado: { label: 'Confirmado', color: 'success' as const },
      pendente: { label: 'Pendente', color: 'warning' as const },
      cancelado: { label: 'Cancelado', color: 'error' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        sx={{
          color: index < rating ? 'warning.main' : 'grey.300',
          fontSize: 16,
        }}
      />
    ));
  };

  const progressoMeta =
    (profissional.estatisticas.faturamentoMes / profissional.estatisticas.metaMensal) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header com Navegação */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/profissionais')}
          sx={{ mb: 2 }}
        >
          Voltar para Profissionais
        </Button>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Perfil do Profissional
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Informações detalhadas e performance
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Coluna Principal */}
        <Grid item xs={12} md={8}>
          {/* Informações Pessoais */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  👨‍💼 Informações Profissionais
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setOpenEdit(true)}
                >
                  Editar
                </Button>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar src={profissional.avatar} sx={{ width: 100, height: 100 }}>
                  {profissional.nome.charAt(0)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {profissional.nome}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {profissional.especialidade}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {getStatusChip(profissional.status)}
                    {getNivelChip(profissional.nivel)}
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button size="small" startIcon={<WhatsApp />} color="success">
                      WhatsApp
                    </Button>
                    <Button size="small" startIcon={<Phone />}>
                      Ligar
                    </Button>
                    <Button size="small" startIcon={<Email />}>
                      E-mail
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    E-mail
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {profissional.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Telefone
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {profissional.telefone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Admissão
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {profissional.dataAdmissao}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Comissão
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {profissional.comissao}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Especialidades
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {profissional.especialidades.map((esp, index) => (
                      <Chip key={index} label={esp} variant="outlined" size="small" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Agenda do Dia */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                📅 Agenda de Hoje
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    {agendaHoje.map((agendamento) => (
                      <TableRow key={agendamento.id} hover>
                        <TableCell>
                          <Typography variant="h6" fontWeight="bold">
                            {agendamento.horario}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {agendamento.duracao}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {agendamento.cliente}
                          </Typography>
                          <Box>
                            {agendamento.servicos.map((servico, index) => (
                              <Typography key={index} variant="caption" color="text.secondary">
                                • {servico}
                              </Typography>
                            ))}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            R$ {agendamento.valor.toFixed(2)}
                          </Typography>
                        </TableCell>

                        <TableCell>{getAgendamentoStatusChip(agendamento.status)}</TableCell>

                        <TableCell>
                          <Button size="small" startIcon={<Visibility />}>
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Estatísticas de Performance */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                📊 Performance do Mês
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Faturamento Atual
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    R$ {profissional.estatisticas.faturamentoMes.toFixed(2)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Meta Mensal: R$ {profissional.estatisticas.metaMensal.toFixed(2)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progressoMeta}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progressoMeta.toFixed(1)}% da meta alcançada
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Clientes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {profissional.estatisticas.totalClientes}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avaliação Média
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {renderStars(Math.round(profissional.estatisticas.avaliacaoMedia))}
                    <Typography variant="h6" fontWeight="bold">
                      {profissional.estatisticas.avaliacaoMedia}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Agendamentos Hoje
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {profissional.estatisticas.agendamentosHoje}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Horário de Trabalho */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                ⏰ Horário de Trabalho
              </Typography>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <AccessTime color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Horário"
                    secondary={`${profissional.horarioTrabalho.entrada} às ${profissional.horarioTrabalho.saida}`}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CalendarMonth color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dias de Trabalho"
                    secondary={profissional.horarioTrabalho.diasSemana.join(', ')}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Nível" secondary={profissional.nivel} />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <AttachMoney color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Comissão" secondary={`${profissional.comissao}%`} />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                ⚡ Ações Rápidas
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<Schedule />} fullWidth>
                    Ver Agenda Completa
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" startIcon={<TrendingUp />} fullWidth>
                    Relatório de Performance
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" startIcon={<Edit />} fullWidth>
                    Editar Informações
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Observações */}
      {profissional.observacoes && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              📝 Observações
            </Typography>
            <Typography variant="body1">{profissional.observacoes}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Profissional</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nome completo" defaultValue={profissional.nome} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="E-mail" defaultValue={profissional.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Telefone" defaultValue={profissional.telefone} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Especialidade"
                defaultValue={profissional.especialidade}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Comissão (%)"
                defaultValue={profissional.comissao}
                type="number"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => setOpenEdit(false)}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
