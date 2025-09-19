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
  Alert,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Edit,
  WhatsApp,
  Phone,
  Email,
  Schedule,
  Person,
  ContentCut,
  AttachMoney,
  LocationOn,
  Star,
  Warning,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export default function AgendamentoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const agendamentoId = params.id as string;

  // Mock de dados do agendamento baseado no ID
  const agendamento = {
    id: agendamentoId,
    cliente: {
      id: '123',
      nome: 'Carlos Eduardo Silva',
      telefone: '(11) 99999-8888',
      email: 'carlos.silva@email.com',
      avatar: '/avatars/cliente1.jpg',
      frequencia: 'Cliente VIP',
    },
    profissional: {
      id: '456',
      nome: 'João Santos',
      especialidade: 'Barbeiro Sênior',
      avatar: '/avatars/profissional1.jpg',
    },
    servicos: [
      { nome: 'Corte Degradê', duracao: '30 min', preco: 35.0 },
      { nome: 'Barba Completa', duracao: '20 min', preco: 25.0 },
      { nome: 'Lavagem + Finalização', duracao: '15 min', preco: 15.0 },
    ],
    dataHora: '30/08/2025 às 14:30',
    status: 'confirmado',
    observacoes: 'Cliente prefere corte mais baixo nas laterais. Usar máquina 2.',
    valorTotal: 75.0,
    formaPagamento: 'PIX',
    local: 'Cadeira 02 - Sala Principal',
    tempoDuracao: '1h 05min',
    criado: '28/08/2025 às 10:15',
    confirmado: '29/08/2025 às 16:20',
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      confirmado: { label: 'Confirmado', color: 'success' as const, icon: <CheckCircle /> },
      pendente: { label: 'Pendente', color: 'warning' as const, icon: <Schedule /> },
      cancelado: { label: 'Cancelado', color: 'error' as const, icon: <Cancel /> },
      concluido: { label: 'Concluído', color: 'primary' as const, icon: <Star /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Chip label={config.label} color={config.color} icon={config.icon} />;
  };

  const timelineEvents = [
    {
      title: 'Agendamento Criado',
      subtitle: agendamento.criado,
      icon: <Schedule />,
      color: 'primary',
    },
    {
      title: 'Agendamento Confirmado',
      subtitle: agendamento.confirmado,
      icon: <CheckCircle />,
      color: 'success',
    },
    {
      title: 'Lembrete Enviado',
      subtitle: '30/08/2025 às 09:00',
      icon: <WhatsApp />,
      color: 'info',
    },
    {
      title: 'Agendamento Agendado',
      subtitle: agendamento.dataHora,
      icon: <ContentCut />,
      color: 'warning',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header com Navegação */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/agenda')} sx={{ mb: 2 }}>
          Voltar para Agenda
        </Button>

        <PageHeader
          title={`Agendamento #${agendamento.id}`}
          subtitle={`${agendamento.cliente.nome} • ${agendamento.dataHora}`}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Coluna Principal */}
        <Grid item xs={12} md={8}>
          {/* Informações do Cliente */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                👤 Informações do Cliente
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar src={agendamento.cliente.avatar} sx={{ width: 80, height: 80 }}>
                  {agendamento.cliente.nome.charAt(0)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {agendamento.cliente.nome}
                  </Typography>
                  <Chip label={agendamento.cliente.frequencia} size="small" color="primary" />

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

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Telefone
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {agendamento.cliente.telefone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    E-mail
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {agendamento.cliente.email}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Detalhes do Serviço */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                ✂️ Serviços Agendados
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    {agendamento.servicos.map((servico, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {servico.nome}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {servico.duracao}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            R$ {servico.preco.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell colSpan={2}>
                        <Typography variant="body1" fontWeight="bold">
                          Total
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          R$ {agendamento.valorTotal.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Observações */}
          {agendamento.observacoes && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  📝 Observações
                </Typography>
                <Alert severity="info" icon={<Warning />}>
                  {agendamento.observacoes}
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Status e Ações */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                🎯 Status e Ações
              </Typography>

              <Box sx={{ mb: 3 }}>{getStatusChip(agendamento.status)}</Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<CheckCircle />} fullWidth color="success">
                    Confirmar Agendamento
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" startIcon={<Edit />} fullWidth>
                    Editar Agendamento
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" startIcon={<Cancel />} color="error" fullWidth>
                    Cancelar Agendamento
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Informações Gerais */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                ℹ️ Informações Gerais
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Profissional
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {agendamento.profissional.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agendamento.profissional.especialidade}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Duração Total
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {agendamento.tempoDuracao}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AttachMoney color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Forma de Pagamento
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {agendamento.formaPagamento}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Local
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {agendamento.local}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Timeline do Agendamento */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                📅 Timeline
              </Typography>

              <Timeline position="right">
                {timelineEvents.map((event, index) => (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot
                        color={
                          event.color as
                            | 'primary'
                            | 'secondary'
                            | 'success'
                            | 'error'
                            | 'info'
                            | 'warning'
                        }
                      >
                        {event.icon}
                      </TimelineDot>
                      {index < timelineEvents.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" fontWeight="bold">
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.subtitle}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
