'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import { TrendingUp, TrendingDown, Remove, Compare, Download } from '@mui/icons-material';
import { useUnidadesComparison, useRelatorioExport } from '@/hooks/use-multi-unidades';

export default function BenchmarkTab() {
  const [selectedUnidades, setSelectedUnidades] = useState<string[]>([]);
  const [comparisonType, setComparisonType] = useState<
    'faturamento' | 'servicos' | 'profissionais' | 'geral'
  >('geral');

  // Mock de unidades para demonstração
  const mockUnidades = [
    { id: '1', nome: 'Unidade Centro' },
    { id: '2', nome: 'Unidade Norte' },
    { id: '3', nome: 'Unidade Sul' },
    { id: '4', nome: 'Unidade Leste' },
  ];

  // Hook para comparação de unidades
  const { comparisonData, isLoading, isError } = useUnidadesComparison(selectedUnidades);

  const { exportCompleto } = useRelatorioExport();

  const handleUnidadeToggle = (unidadeId: string) => {
    setSelectedUnidades((prev) =>
      prev.includes(unidadeId) ? prev.filter((id) => id !== unidadeId) : [...prev, unidadeId],
    );
  };

  const handleExport = () => {
    exportCompleto({ unidade_id: selectedUnidades.join(',') });
  };

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Erro ao carregar benchmarks. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Seleção de Unidades */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Selecionar Unidades para Comparação
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {mockUnidades.map((unidade) => (
              <Grid item xs={12} sm={6} md={3} key={unidade.id}>
                <Card
                  variant={selectedUnidades.includes(unidade.id) ? 'elevation' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                  onClick={() => handleUnidadeToggle(unidade.id)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2">{unidade.nome}</Typography>
                    <Chip
                      label={selectedUnidades.includes(unidade.id) ? 'Selecionada' : 'Selecionar'}
                      color={selectedUnidades.includes(unidade.id) ? 'primary' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Tipo de Comparação</InputLabel>
              <Select
                value={comparisonType}
                label="Tipo de Comparação"
                onChange={(e) => setComparisonType(e.target.value as any)}
              >
                <MenuItem value="geral">Geral</MenuItem>
                <MenuItem value="faturamento">Faturamento</MenuItem>
                <MenuItem value="servicos">Serviços</MenuItem>
                <MenuItem value="profissionais">Profissionais</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Compare />}
              disabled={selectedUnidades.length < 2}
            >
              Comparar ({selectedUnidades.length})
            </Button>

            <Button
              variant="outlined"
              startIcon={<Download />}
              disabled={selectedUnidades.length === 0}
              onClick={handleExport}
            >
              Exportar Comparação
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Resultados da Comparação */}
      {selectedUnidades.length >= 2 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resultados da Comparação
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Unidade</TableCell>
                      <TableCell align="right">Faturamento</TableCell>
                      <TableCell align="right">Serviços</TableCell>
                      <TableCell align="right">Profissionais</TableCell>
                      <TableCell align="right">Eficiência</TableCell>
                      <TableCell align="right">Ranking</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparisonData.map((unidade, index) => (
                      <TableRow key={unidade.unidadeId}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {mockUnidades.find((u) => u.id === unidade.unidadeId)?.nome}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          R$ {Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">{Math.floor(Math.random() * 50 + 20)}</TableCell>
                        <TableCell align="right">{Math.floor(Math.random() * 20 + 5)}</TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={Math.floor(Math.random() * 100)}
                              sx={{ width: 60, mr: 1 }}
                            />
                            <Typography variant="body2">
                              {Math.floor(Math.random() * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`#${index + 1}`}
                            color={index === 0 ? 'success' : index === 1 ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Métricas de Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>

              <Box sx={{ mt: 2 }}>
                {mockUnidades.slice(0, 3).map((unidade, index) => (
                  <Box key={unidade.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={`#${index + 1}`}
                      color={index === 0 ? 'success' : index === 1 ? 'warning' : 'info'}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {unidade.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        R$ {Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
                      </Typography>
                    </Box>
                    <TrendingUp color="success" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Áreas de Melhoria
              </Typography>

              <Box sx={{ mt: 2 }}>
                {[
                  'Eficiência Operacional',
                  'Satisfação do Cliente',
                  'Retenção de Profissionais',
                ].map((area, index) => (
                  <Box key={area} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingDown color="warning" sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">{area}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.floor(Math.random() * 30 + 10)}% abaixo da média
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Insights e Recomendações */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Insights e Recomendações
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Melhor Performance
                </Typography>
                <Typography variant="caption">
                  Unidade Centro lidera em faturamento e eficiência operacional
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Oportunidade de Melhoria
                </Typography>
                <Typography variant="caption">
                  Unidade Norte pode melhorar em satisfação do cliente
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Crescimento Sustentável
                </Typography>
                <Typography variant="caption">
                  Todas as unidades mostram crescimento positivo
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
