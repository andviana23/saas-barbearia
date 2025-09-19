'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Scissors,
  Star,
  Download,
  Filter,
  BarChart3,
} from 'lucide-react';

interface DadosOperacionais {
  profissional: string;
  atendimentosRealizados: number;
  tempoMedioAtendimento: number;
  avaliacaoMedia: number;
  horasTrabalho: number;
  servicosMaisRealizados: string;
  receitaGerada: number;
  eficiencia: number;
}

interface ServicoPopular {
  nome: string;
  quantidade: number;
  tempoMedio: number;
  receita: number;
}

export default function RelatorioOperacionalPage() {
  const [periodo, setPeriodo] = useState('mes_atual');
  const [profissionalFiltro, setProfissionalFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const dadosOperacionais: DadosOperacionais[] = [
    {
      profissional: 'Carlos Silva',
      atendimentosRealizados: 45,
      tempoMedioAtendimento: 35,
      avaliacaoMedia: 4.8,
      horasTrabalho: 8.5,
      servicosMaisRealizados: 'Corte + Barba',
      receitaGerada: 1350.00,
      eficiencia: 92,
    },
    {
      profissional: 'Roberto Santos',
      tempoMedioAtendimento: 28,
      avaliacaoMedia: 4.6,
      horasTrabalho: 8.0,
      servicosMaisRealizados: 'Corte Simples',
      receitaGerada: 980.00,
      eficiencia: 88,
      atendimentosRealizados: 38,
    },
    {
      profissional: 'Ana Costa',
      atendimentosRealizados: 32,
      tempoMedioAtendimento: 45,
      avaliacaoMedia: 4.9,
      horasTrabalho: 7.5,
      servicosMaisRealizados: 'Escova + Hidratação',
      receitaGerada: 1680.00,
      eficiencia: 95,
    },
  ];

  const servicosPopulares: ServicoPopular[] = [
    {
      nome: 'Corte + Barba',
      quantidade: 28,
      tempoMedio: 45,
      receita: 1260.00,
    },
    {
      nome: 'Corte Simples',
      quantidade: 35,
      tempoMedio: 30,
      receita: 875.00,
    },
    {
      nome: 'Escova + Hidratação',
      quantidade: 18,
      tempoMedio: 60,
      receita: 1440.00,
    },
    {
      nome: 'Barba',
      quantidade: 22,
      tempoMedio: 20,
      receita: 440.00,
    },
  ];

  // Cálculos dos totais
  const totalAtendimentos = dadosOperacionais.reduce((acc, d) => acc + d.atendimentosRealizados, 0);
  const tempoMedioGeral = Math.round(
    dadosOperacionais.reduce((acc, d) => acc + d.tempoMedioAtendimento, 0) / dadosOperacionais.length
  );
  const avaliacaoMediaGeral = (
    dadosOperacionais.reduce((acc, d) => acc + d.avaliacaoMedia, 0) / dadosOperacionais.length
  ).toFixed(1);
  const eficienciaMedia = Math.round(
    dadosOperacionais.reduce((acc, d) => acc + d.eficiencia, 0) / dadosOperacionais.length
  );

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const getEficienciaColor = (eficiencia: number) => {
    if (eficiencia >= 90) return 'success';
    if (eficiencia >= 80) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Relatório Operacional
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Análise de performance e produtividade
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Download />}
          color="primary"
        >
          Exportar PDF
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  label="Período"
                >
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana_atual">Esta Semana</MenuItem>
                  <MenuItem value="mes_atual">Este Mês</MenuItem>
                  <MenuItem value="mes_anterior">Mês Anterior</MenuItem>
                  <MenuItem value="personalizado">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {periodo === 'personalizado' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Data Início"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Data Fim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Profissional</InputLabel>
                <Select
                  value={profissionalFiltro}
                  onChange={(e) => setProfissionalFiltro(e.target.value)}
                  label="Profissional"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Carlos">Carlos</MenuItem>
                  <MenuItem value="Roberto">Roberto</MenuItem>
                  <MenuItem value="Ana">Ana</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<Filter />}
                fullWidth
              >
                Aplicar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cards de Resumo Geral */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    {totalAtendimentos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Atendimentos
                  </Typography>
                </Box>
                <Users size={24} color="#2196f3" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp size={16} color="#4caf50" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +8% vs período anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {tempoMedioGeral}min
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tempo Médio
                  </Typography>
                </Box>
                <Clock size={24} color="#ff9800" />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Por atendimento
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {avaliacaoMediaGeral}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avaliação Média
                  </Typography>
                </Box>
                <Star size={24} color="#4caf50" />
              </Box>
              <Typography variant="caption" color="text.secondary">
                De 5 estrelas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {eficienciaMedia}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Eficiência Média
                  </Typography>
                </Box>
                <BarChart3 size={24} color="#2196f3" />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Produtividade geral
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Performance por Profissional */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance por Profissional
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Profissional</TableCell>
                      <TableCell align="center">Atendimentos</TableCell>
                      <TableCell align="center">Tempo Médio</TableCell>
                      <TableCell align="center">Avaliação</TableCell>
                      <TableCell align="center">Horas</TableCell>
                      <TableCell align="center">Receita</TableCell>
                      <TableCell align="center">Eficiência</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dadosOperacionais.map((dados) => (
                      <TableRow key={dados.profissional}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Scissors size={16} style={{ marginRight: 8 }} />
                            {dados.profissional}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{dados.atendimentosRealizados}</TableCell>
                        <TableCell align="center">{dados.tempoMedioAtendimento}min</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={16} color="#ffc107" style={{ marginRight: 4 }} />
                            {dados.avaliacaoMedia}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{dados.horasTrabalho}h</TableCell>
                        <TableCell align="center">{formatarMoeda(dados.receitaGerada)}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={dados.eficiencia}
                              color={getEficienciaColor(dados.eficiencia) as any}
                              sx={{ width: 60, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2">
                              {dados.eficiencia}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Serviços Mais Populares */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Serviços Mais Populares
              </Typography>
              <Box sx={{ mt: 2 }}>
                {servicosPopulares.map((servico, index) => (
                  <Paper key={servico.nome} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {index + 1}. {servico.nome}
                      </Typography>
                      <Chip
                        label={`${servico.quantidade}x`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Tempo médio: {servico.tempoMedio}min
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Receita: {formatarMoeda(servico.receita)}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas de Produtividade */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métricas de Produtividade
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {Math.round(totalAtendimentos / 30)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Atendimentos/Dia
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      96%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taxa de Ocupação
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      2.5min
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tempo Médio Espera
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      98%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taxa de Satisfação
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}