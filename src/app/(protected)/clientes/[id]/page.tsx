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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  WhatsApp,
  Phone,
  Email,
  CalendarMonth,
  Star,
  ContentCut,
  TrendingUp,
  Add,
  Visibility,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClienteDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const clienteId = params.id as string;
  const [openEdit, setOpenEdit] = useState(false);

  // Mock de dados do cliente baseado no ID
  const cliente = {
    id: clienteId,
    nome: 'Carlos Eduardo Silva',
    telefone: '(11) 99999-8888',
    email: 'carlos.silva@email.com',
    avatar: '/avatars/cliente1.jpg',
    dataNascimento: '15/03/1985',
    cpf: '123.456.789-00',
    endereco: {
      rua: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      cep: '01234-567',
    },
    cadastrado: '15/01/2024',
    ultimaVisita: '25/08/2025',
    status: 'ativo',
    categoria: 'VIP',
    observacoes: 'Cliente preferencial, sempre pontual. Prefere cortes conservadores.',
    estatisticas: {
      totalAgendamentos: 28,
      valorGasto: 2450.0,
      frequenciaMedia: 'Quinzenal',
      avaliacaoMedia: 4.8,
    },
  };

  // Mock histórico de agendamentos
  const historico = [
    {
      id: '001',
      data: '25/08/2025',
      servicos: ['Corte Degradê', 'Barba Completa'],
      profissional: 'João Santos',
      valor: 60.0,
      status: 'concluido',
      avaliacao: 5,
    },
    {
      id: '002',
      data: '10/08/2025',
      servicos: ['Corte Social', 'Lavagem'],
      profissional: 'Maria Oliveira',
      valor: 45.0,
      status: 'concluido',
      avaliacao: 4,
    },
    {
      id: '003',
      data: '28/07/2025',
      servicos: ['Corte Degradê', 'Barba Completa', 'Sobrancelha'],
      profissional: 'João Santos',
      valor: 85.0,
      status: 'concluido',
      avaliacao: 5,
    },
    {
      id: '004',
      data: '12/07/2025',
      servicos: ['Corte Social'],
      profissional: 'Carlos Lima',
      valor: 35.0,
      status: 'concluido',
      avaliacao: 4,
    },
  ];

  const getStatusChip = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', color: 'success' as const },
      inativo: { label: 'Inativo', color: 'error' as const },
      bloqueado: { label: 'Bloqueado', color: 'warning' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getCategoriaChip = (categoria: string) => {
    const cores = {
      VIP: 'primary',
      Premium: 'secondary',
      Regular: 'default',
    };
    return (
      <Chip
        label={categoria}
        color={cores[categoria as keyof typeof cores] as 'primary' | 'secondary' | 'default'}
        size="small"
      />
    );
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header com Navegação */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/clientes')} sx={{ mb: 2 }}>
          Voltar para Clientes
        </Button>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Perfil do Cliente
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Informações detalhadas e histórico de atendimentos
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
                  👤 Informações Pessoais
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
                <Avatar src={cliente.avatar} sx={{ width: 100, height: 100 }}>
                  {cliente.nome.charAt(0)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {cliente.nome}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {getStatusChip(cliente.status)}
                    {getCategoriaChip(cliente.categoria)}
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
                    {cliente.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Telefone
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {cliente.telefone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Nascimento
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {cliente.dataNascimento}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    CPF
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {cliente.cpf}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Endereço
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {cliente.endereco.rua}, {cliente.endereco.bairro}
                  </Typography>
                  <Typography variant="body2">
                    {cliente.endereco.cidade} - {cliente.endereco.cep}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Histórico de Agendamentos */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                📅 Histórico de Agendamentos
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    {historico.map((agendamento) => (
                      <TableRow key={agendamento.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {agendamento.data}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{agendamento.id}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box>
                            {agendamento.servicos.map((servico, index) => (
                              <Typography key={index} variant="body2">
                                • {servico}
                              </Typography>
                            ))}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{agendamento.profissional}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            R$ {agendamento.valor.toFixed(2)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {renderStars(agendamento.avaliacao)}
                            <Typography variant="caption">({agendamento.avaliacao})</Typography>
                          </Box>
                        </TableCell>

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
          {/* Estatísticas */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                📊 Estatísticas
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Agendamentos
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {cliente.estatisticas.totalAgendamentos}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total Gasto
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    R$ {cliente.estatisticas.valorGasto.toFixed(2)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Frequência Média
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {cliente.estatisticas.frequenciaMedia}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avaliação Média
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {renderStars(Math.round(cliente.estatisticas.avaliacaoMedia))}
                    <Typography variant="h6" fontWeight="bold">
                      {cliente.estatisticas.avaliacaoMedia}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fidelidade do Cliente
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(cliente.estatisticas.totalAgendamentos / 50) * 100}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {cliente.estatisticas.totalAgendamentos}/50 para próximo nível
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                ℹ️ Informações Adicionais
              </Typography>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CalendarMonth color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Cliente desde" secondary={cliente.cadastrado} />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <ContentCut color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Última visita" secondary={cliente.ultimaVisita} />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ticket médio"
                    secondary={`R$ ${(cliente.estatisticas.valorGasto / cliente.estatisticas.totalAgendamentos).toFixed(2)}`}
                  />
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
                  <Button variant="contained" startIcon={<Add />} fullWidth>
                    Novo Agendamento
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" startIcon={<WhatsApp />} color="success" fullWidth>
                    Enviar Mensagem
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
      {cliente.observacoes && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              📝 Observações
            </Typography>
            <Typography variant="body1">{cliente.observacoes}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nome completo" defaultValue={cliente.nome} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="E-mail" defaultValue={cliente.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Telefone" defaultValue={cliente.telefone} />
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
