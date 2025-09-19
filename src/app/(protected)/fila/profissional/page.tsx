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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Clock,
  CheckCircle,
  Play,
  Pause,
  Square,
  User,
  Scissors,
  Timer,
  TrendingUp,
} from 'lucide-react';

interface Atendimento {
  id: string;
  cliente: string;
  servico: string;
  duracao: number;
  tempoDecorrido: number;
  status: 'aguardando' | 'em_andamento' | 'pausado' | 'finalizado';
  horarioInicio?: string;
  observacoes?: string;
}

interface Profissional {
  id: string;
  nome: string;
  especialidades: string[];
  status: 'disponivel' | 'ocupado' | 'pausa';
}

export default function FilaProfissionalPage() {
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('1');
  const [atendimentoAtivo, setAtendimentoAtivo] = useState<string | null>('1');

  const profissionais: Profissional[] = [
    {
      id: '1',
      nome: 'Carlos Silva',
      especialidades: ['Corte Masculino', 'Barba', 'Bigode'],
      status: 'ocupado',
    },
    {
      id: '2',
      nome: 'Roberto Santos',
      especialidades: ['Corte Masculino', 'Corte Infantil'],
      status: 'disponivel',
    },
    {
      id: '3',
      nome: 'Ana Costa',
      especialidades: ['Corte Feminino', 'Escova', 'Hidratação'],
      status: 'pausa',
    },
  ];

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([
    {
      id: '1',
      cliente: 'João Silva',
      servico: 'Corte + Barba',
      duracao: 45,
      tempoDecorrido: 20,
      status: 'em_andamento',
      horarioInicio: '14:30',
    },
    {
      id: '2',
      cliente: 'Pedro Santos',
      servico: 'Corte Simples',
      duracao: 30,
      tempoDecorrido: 0,
      status: 'aguardando',
    },
    {
      id: '3',
      cliente: 'Maria Costa',
      servico: 'Escova + Hidratação',
      duracao: 60,
      tempoDecorrido: 0,
      status: 'aguardando',
    },
  ]);

  const profissionalAtual = profissionais.find(p => p.id === profissionalSelecionado);
  const atendimentosDoProf = atendimentos.filter(a => 
    profissionalSelecionado === '1' ? ['1', '2'].includes(a.id) :
    profissionalSelecionado === '2' ? [] :
    profissionalSelecionado === '3' ? ['3'].includes(a.id) : []
  );

  const atendimentoEmAndamento = atendimentosDoProf.find(a => a.status === 'em_andamento');
  const proximosAtendimentos = atendimentosDoProf.filter(a => a.status === 'aguardando');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'success';
      case 'ocupado':
        return 'info';
      case 'pausa':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'ocupado':
        return 'Ocupado';
      case 'pausa':
        return 'Em Pausa';
      default:
        return status;
    }
  };

  const handleIniciarAtendimento = (atendimentoId: string) => {
    setAtendimentos(atendimentos.map(a => 
      a.id === atendimentoId 
        ? { 
            ...a, 
            status: 'em_andamento' as const,
            horarioInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        : a
    ));
    setAtendimentoAtivo(atendimentoId);
  };

  const handlePausarAtendimento = (atendimentoId: string) => {
    setAtendimentos(atendimentos.map(a => 
      a.id === atendimentoId 
        ? { ...a, status: 'pausado' as const }
        : a
    ));
  };

  const handleRetomarAtendimento = (atendimentoId: string) => {
    setAtendimentos(atendimentos.map(a => 
      a.id === atendimentoId 
        ? { ...a, status: 'em_andamento' as const }
        : a
    ));
  };

  const handleFinalizarAtendimento = (atendimentoId: string) => {
    setAtendimentos(atendimentos.map(a => 
      a.id === atendimentoId 
        ? { ...a, status: 'finalizado' as const }
        : a
    ));
    setAtendimentoAtivo(null);
  };

  const calcularProgresso = (atendimento: Atendimento) => {
    return (atendimento.tempoDecorrido / atendimento.duracao) * 100;
  };

  const tempoRestante = (atendimento: Atendimento) => {
    return Math.max(0, atendimento.duracao - atendimento.tempoDecorrido);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Fila do Profissional
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestão de atendimentos por profissional
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Profissional</InputLabel>
          <Select
            value={profissionalSelecionado}
            onChange={(e) => setProfissionalSelecionado(e.target.value)}
            label="Profissional"
          >
            {profissionais.map((prof) => (
              <MenuItem key={prof.id} value={prof.id}>
                {prof.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Info do Profissional */}
      {profissionalAtual && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                <User size={30} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{profissionalAtual.nome}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {profissionalAtual.especialidades.map((esp, index) => (
                    <Chip key={index} label={esp} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
              <Chip
                label={getStatusLabel(profissionalAtual.status)}
                color={getStatusColor(profissionalAtual.status) as any}
                icon={
                  profissionalAtual.status === 'ocupado' ? <Scissors size={16} /> :
                  profissionalAtual.status === 'disponivel' ? <CheckCircle size={16} /> :
                  <Clock size={16} />
                }
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Atendimento Atual */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer size={20} />
                Atendimento Atual
              </Typography>
              
              {atendimentoEmAndamento ? (
                <Box>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{atendimentoEmAndamento.cliente}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {atendimentoEmAndamento.servico}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${atendimentoEmAndamento.tempoDecorrido}/${atendimentoEmAndamento.duracao}min`}
                        color="info"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progresso</Typography>
                        <Typography variant="body2">
                          {Math.round(calcularProgresso(atendimentoEmAndamento))}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={calcularProgresso(atendimentoEmAndamento)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Tempo restante: {tempoRestante(atendimentoEmAndamento)}min
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {atendimentoEmAndamento.status === 'em_andamento' ? (
                          <IconButton 
                            color="warning"
                            onClick={() => handlePausarAtendimento(atendimentoEmAndamento.id)}
                          >
                            <Pause size={20} />
                          </IconButton>
                        ) : (
                          <IconButton 
                            color="primary"
                            onClick={() => handleRetomarAtendimento(atendimentoEmAndamento.id)}
                          >
                            <Play size={20} />
                          </IconButton>
                        )}
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleFinalizarAtendimento(atendimentoEmAndamento.id)}
                        >
                          Finalizar
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle size={48} color="#4caf50" />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Nenhum atendimento em andamento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Profissional disponível para próximo cliente
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Próximos Atendimentos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={20} />
                Próximos Atendimentos ({proximosAtendimentos.length})
              </Typography>
              
              <List>
                {proximosAtendimentos.map((atendimento, index) => (
                  <ListItem key={atendimento.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={atendimento.cliente}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {atendimento.servico}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Duração estimada: {atendimento.duracao}min
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {!atendimentoEmAndamento && index === 0 && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Play size={16} />}
                          onClick={() => handleIniciarAtendimento(atendimento.id)}
                        >
                          Iniciar
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                
                {proximosAtendimentos.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Nenhum atendimento agendado"
                      secondary="Fila vazia para este profissional"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Estatísticas do Dia */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle size={24} color="#4caf50" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">8</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atendimentos Hoje
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
                <Timer size={24} color="#ff9800" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">32min</Typography>
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
                <TrendingUp size={24} color="#2196f3" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">95%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Taxa de Conclusão
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
                <Clock size={24} color="#9c27b0" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">6h 30min</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tempo Trabalhado
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}