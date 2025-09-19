'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  UserPlus,
  Edit,
  Trash2,
  ArrowRight,
} from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  servico: string;
  profissional: string;
  horarioChegada: string;
  tempoEspera: number;
  status: 'aguardando' | 'sendo_atendido' | 'finalizado';
  prioridade: 'normal' | 'alta';
  observacoes?: string;
}

export default function FilaRecepcaoPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    telefone: '',
    servico: '',
    profissional: '',
    observacoes: '',
  });

  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nome: 'João Silva',
      telefone: '(11) 99999-9999',
      servico: 'Corte + Barba',
      profissional: 'Carlos',
      horarioChegada: '14:30',
      tempoEspera: 15,
      status: 'aguardando',
      prioridade: 'normal',
    },
    {
      id: '2',
      nome: 'Pedro Santos',
      telefone: '(11) 88888-8888',
      servico: 'Corte Simples',
      profissional: 'Roberto',
      horarioChegada: '14:45',
      tempoEspera: 5,
      status: 'sendo_atendido',
      prioridade: 'alta',
    },
    {
      id: '3',
      nome: 'Maria Costa',
      telefone: '(11) 77777-7777',
      servico: 'Escova + Hidratação',
      profissional: 'Ana',
      horarioChegada: '15:00',
      tempoEspera: 0,
      status: 'aguardando',
      prioridade: 'normal',
    },
  ]);

  const clientesAguardando = clientes.filter(c => c.status === 'aguardando');
  const clientesAtendimento = clientes.filter(c => c.status === 'sendo_atendido');
  const tempoMedioEspera = clientesAguardando.length > 0 
    ? Math.round(clientesAguardando.reduce((acc, c) => acc + c.tempoEspera, 0) / clientesAguardando.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando':
        return 'warning';
      case 'sendo_atendido':
        return 'info';
      case 'finalizado':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aguardando':
        return 'Aguardando';
      case 'sendo_atendido':
        return 'Em Atendimento';
      case 'finalizado':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const handleAdicionarCliente = () => {
    const novoId = (clientes.length + 1).toString();
    const agora = new Date();
    const horario = `${agora.getHours()}:${agora.getMinutes().toString().padStart(2, '0')}`;
    
    const cliente: Cliente = {
      id: novoId,
      nome: novoCliente.nome,
      telefone: novoCliente.telefone,
      servico: novoCliente.servico,
      profissional: novoCliente.profissional,
      horarioChegada: horario,
      tempoEspera: 0,
      status: 'aguardando',
      prioridade: 'normal',
      observacoes: novoCliente.observacoes,
    };

    setClientes([...clientes, cliente]);
    setNovoCliente({
      nome: '',
      telefone: '',
      servico: '',
      profissional: '',
      observacoes: '',
    });
    setDialogOpen(false);
  };

  const handleIniciarAtendimento = (clienteId: string) => {
    setClientes(clientes.map(c => 
      c.id === clienteId 
        ? { ...c, status: 'sendo_atendido' as const }
        : c
    ));
  };

  const handleFinalizarAtendimento = (clienteId: string) => {
    setClientes(clientes.map(c => 
      c.id === clienteId 
        ? { ...c, status: 'finalizado' as const }
        : c
    ));
  };

  const handleRemoverCliente = (clienteId: string) => {
    setClientes(clientes.filter(c => c.id !== clienteId));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Fila de Recepção
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestão da fila de espera e atendimento
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlus />}
          onClick={() => setDialogOpen(true)}
        >
          Adicionar Cliente
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Users size={24} color="#1976d2" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">{clientesAguardando.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Na Fila
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Clock size={24} color="#ed6c02" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">{tempoMedioEspera}min</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tempo Médio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle size={24} color="#2e7d32" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">{clientesAtendimento.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Em Atendimento
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AlertCircle size={24} color="#d32f2f" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">
                    {clientesAguardando.filter(c => c.tempoEspera > 30).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Espera Longa
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Fila de Espera */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fila de Espera ({clientesAguardando.length})
              </Typography>
              <List>
                {clientesAguardando.map((cliente, index) => (
                  <ListItem key={cliente.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {cliente.nome}
                          {cliente.prioridade === 'alta' && (
                            <Chip label="Prioridade" color="error" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {cliente.servico} - {cliente.profissional}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Chegada: {cliente.horarioChegada} | Espera: {cliente.tempoEspera}min
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <Phone size={16} />
                        </IconButton>
                        <IconButton size="small">
                          <MessageSquare size={16} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleIniciarAtendimento(cliente.id)}
                        >
                          <ArrowRight size={16} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoverCliente(cliente.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {clientesAguardando.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Nenhum cliente na fila"
                      secondary="A fila está vazia no momento"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Em Atendimento */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Em Atendimento ({clientesAtendimento.length})
              </Typography>
              <List>
                {clientesAtendimento.map((cliente) => (
                  <ListItem key={cliente.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <CheckCircle size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={cliente.nome}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {cliente.servico} - {cliente.profissional}
                          </Typography>
                          <Chip
                            label={getStatusLabel(cliente.status)}
                            color={getStatusColor(cliente.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleFinalizarAtendimento(cliente.id)}
                      >
                        Finalizar
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {clientesAtendimento.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Nenhum atendimento em andamento"
                      secondary="Todos os profissionais estão livres"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Adicionar Cliente */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Cliente à Fila</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome do Cliente"
              value={novoCliente.nome}
              onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Telefone"
              value={novoCliente.telefone}
              onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Serviço</InputLabel>
              <Select
                value={novoCliente.servico}
                onChange={(e) => setNovoCliente({ ...novoCliente, servico: e.target.value })}
                label="Serviço"
              >
                <MenuItem value="Corte Simples">Corte Simples</MenuItem>
                <MenuItem value="Corte + Barba">Corte + Barba</MenuItem>
                <MenuItem value="Barba">Barba</MenuItem>
                <MenuItem value="Escova">Escova</MenuItem>
                <MenuItem value="Hidratação">Hidratação</MenuItem>
                <MenuItem value="Escova + Hidratação">Escova + Hidratação</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Profissional</InputLabel>
              <Select
                value={novoCliente.profissional}
                onChange={(e) => setNovoCliente({ ...novoCliente, profissional: e.target.value })}
                label="Profissional"
              >
                <MenuItem value="Carlos">Carlos</MenuItem>
                <MenuItem value="Roberto">Roberto</MenuItem>
                <MenuItem value="Ana">Ana</MenuItem>
                <MenuItem value="Mariana">Mariana</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Observações"
              value={novoCliente.observacoes}
              onChange={(e) => setNovoCliente({ ...novoCliente, observacoes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAdicionarCliente}
            variant="contained"
            disabled={!novoCliente.nome || !novoCliente.telefone || !novoCliente.servico || !novoCliente.profissional}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}