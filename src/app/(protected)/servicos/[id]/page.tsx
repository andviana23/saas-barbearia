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
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Schedule,
  Star,
  AttachMoney,
  TrendingUp,
  AccessTime,
  Visibility,
  Person,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ServicoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const servicoId = params.id as string;
  const [openEdit, setOpenEdit] = useState(false);

  // Mock de dados do serviço baseado no ID
  const servico = {
    id: servicoId,
    nome: 'Corte Degradê Masculino',
    categoria: 'Cortes Masculinos',
    descricao: 'Corte moderno com degradê nas laterais e trás, mantendo volume no topo.',
    preco: 45.0,
    duracao: 45,
    status: 'ativo',
    popularidade: 'alta',
    comissao: 40,
    materiais: ['Máquina de corte', 'Tesoura profissional', 'Pente', 'Borrifador'],
    observacoes: 'Serviço mais solicitado, especialmente por clientes jovens.',
    estatisticas: {
      totalAgendamentos: 342,
      faturamentoMes: 15390.0,
      avaliacaoMedia: 4.7,
      tempoMedioExecucao: 42,
      clientesRecorrentes: 89,
    },
  };

  // Mock histórico de agendamentos recentes
  const agendamentosRecentes = [
    {
      id: '001',
      data: '30/08/2025',
      cliente: 'Carlos Silva',
      profissional: 'João Santos',
      duracao: 40,
      valor: 45.0,
      avaliacao: 5,
      status: 'concluido',
    },
    {
      id: '002',
      data: '29/08/2025',
      cliente: 'Pedro Oliveira',
      profissional: 'Maria Costa',
      duracao: 45,
      valor: 45.0,
      avaliacao: 4,
      status: 'concluido',
    },
    {
      id: '003',
      data: '28/08/2025',
      cliente: 'Lucas Santos',
      profissional: 'João Santos',
      duracao: 50,
      valor: 45.0,
      avaliacao: 5,
      status: 'concluido',
    },
    {
      id: '004',
      data: '27/08/2025',
      cliente: 'Rafael Lima',
      profissional: 'Ana Pereira',
      duracao: 38,
      valor: 45.0,
      avaliacao: 4,
      status: 'concluido',
    },
  ];

  // Mock estatísticas por profissional
  const estatisticasProfissionais = [
    {
      nome: 'João Santos',
      agendamentos: 45,
      tempoMedio: 40,
      avaliacaoMedia: 4.9,
      faturamento: 2025.0,
    },
    {
      nome: 'Maria Costa',
      agendamentos: 38,
      tempoMedio: 43,
      avaliacaoMedia: 4.6,
      faturamento: 1710.0,
    },
    {
      nome: 'Ana Pereira',
      agendamentos: 32,
      tempoMedio: 45,
      avaliacaoMedia: 4.8,
      faturamento: 1440.0,
    },
  ];

  const getStatusChip = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', color: 'success' as const },
      inativo: { label: 'Inativo', color: 'error' as const },
      manutencao: { label: 'Manutenção', color: 'warning' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPopularidadeChip = (popularidade: string) => {
    const cores = {
      alta: 'success',
      media: 'warning',
      baixa: 'error',
    };
    return (
      <Chip
        label={popularidade.charAt(0).toUpperCase() + popularidade.slice(1)}
        color={cores[popularidade as keyof typeof cores] as 'success' | 'warning' | 'error'}
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

  const demandaPorcentagem = (servico.estatisticas.totalAgendamentos / 500) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header com Navegação */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/servicos')} sx={{ mb: 2 }}>
          Voltar para Serviços
        </Button>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Detalhes do Serviço
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Informações detalhadas e estatísticas de performance
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Coluna Principal */}
        <Grid item xs={12} md={8}>
          {/* Informações do Serviço */}
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
                  ✂️ Informações do Serviço
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

              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {servico.nome}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {servico.categoria}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {getStatusChip(servico.status)}
                  {getPopularidadeChip(servico.popularidade)}
                </Box>
              </Box>

              <Typography variant="body1" paragraph>
                {servico.descricao}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Preço
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    R$ {servico.preco.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duração Estimada
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {servico.duracao} min
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Comissão do Profissional
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {servico.comissao}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tempo Médio de Execução
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {servico.estatisticas.tempoMedioExecucao} min
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Materiais Necessários
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {servico.materiais.map((material, index) => (
                      <Chip key={index} label={material} variant="outlined" size="small" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Agendamentos Recentes */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                📅 Agendamentos Recentes
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell fontWeight="bold">Data</TableCell>
                      <TableCell fontWeight="bold">Cliente</TableCell>
                      <TableCell fontWeight="bold">Profissional</TableCell>
                      <TableCell fontWeight="bold">Duração</TableCell>
                      <TableCell fontWeight="bold">Avaliação</TableCell>
                      <TableCell fontWeight="bold">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {agendamentosRecentes.map((agendamento) => (
                      <TableRow key={agendamento.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {agendamento.data}
                          </Typography>
                        </TableCell>
                        <TableCell>{agendamento.cliente}</TableCell>
                        <TableCell>{agendamento.profissional}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{agendamento.duracao} min</Typography>
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

          {/* Performance por Profissional */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                👨‍💼 Performance por Profissional
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell fontWeight="bold">Profissional</TableCell>
                      <TableCell fontWeight="bold">Agendamentos</TableCell>
                      <TableCell fontWeight="bold">Tempo Médio</TableCell>
                      <TableCell fontWeight="bold">Avaliação</TableCell>
                      <TableCell fontWeight="bold">Faturamento</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estatisticasProfissionais.map((prof, index) => (
                      <TableRow key={index} hover>
                        <TableCell fontWeight="bold">{prof.nome}</TableCell>
                        <TableCell>{prof.agendamentos}</TableCell>
                        <TableCell>{prof.tempoMedio} min</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {renderStars(Math.round(prof.avaliacaoMedia))}
                            <Typography variant="caption">({prof.avaliacaoMedia})</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            R$ {prof.faturamento.toFixed(2)}
                          </Typography>
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
          {/* Estatísticas Gerais */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                📊 Estatísticas do Mês
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Agendamentos
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {servico.estatisticas.totalAgendamentos}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Faturamento do Mês
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    R$ {servico.estatisticas.faturamentoMes.toFixed(2)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avaliação Média
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {renderStars(Math.round(servico.estatisticas.avaliacaoMedia))}
                    <Typography variant="h6" fontWeight="bold">
                      {servico.estatisticas.avaliacaoMedia}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Clientes Recorrentes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {servico.estatisticas.clientesRecorrentes}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Demanda do Serviço
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={demandaPorcentagem}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {demandaPorcentagem.toFixed(1)}% da capacidade máxima
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
                    <AccessTime color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Duração Estimada"
                    secondary={`${servico.duracao} minutos`}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <AttachMoney color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Preço" secondary={`R$ ${servico.preco.toFixed(2)}`} />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Comissão" secondary={`${servico.comissao}%`} />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Popularidade"
                    secondary={
                      servico.popularidade.charAt(0).toUpperCase() + servico.popularidade.slice(1)
                    }
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
                  <Button variant="contained" startIcon={<Schedule />} fullWidth>
                    Agendar Serviço
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" startIcon={<TrendingUp />} fullWidth>
                    Relatório Detalhado
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" startIcon={<Edit />} fullWidth>
                    Editar Serviço
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Observações */}
      {servico.observacoes && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              📝 Observações
            </Typography>
            <Typography variant="body1">{servico.observacoes}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Serviço</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nome do serviço" defaultValue={servico.nome} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select value={servico.categoria} label="Categoria">
                  <MenuItem value="Cortes Masculinos">Cortes Masculinos</MenuItem>
                  <MenuItem value="Cortes Femininos">Cortes Femininos</MenuItem>
                  <MenuItem value="Barba e Bigode">Barba e Bigode</MenuItem>
                  <MenuItem value="Tratamentos">Tratamentos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preço (R$)"
                defaultValue={servico.preco}
                type="number"
                inputProps={{ step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duração (min)"
                defaultValue={servico.duracao}
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                defaultValue={servico.descricao}
                multiline
                rows={3}
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
