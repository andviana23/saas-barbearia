'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
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
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Download, Refresh, TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  useRelatoriosConsolidados,
  useFaturamentoConsolidado,
  useServicosConsolidado,
  useProfissionaisConsolidado,
  useRelatorioExport,
} from '@/hooks/use-multi-unidades';
import { RelatorioConsolidadoFilters } from '@/types/multi-unidades';

export default function RelatoriosTab() {
  const [filters, setFilters] = useState<RelatorioConsolidadoFilters>({
    data_inicio: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    data_fim: dayjs().format('YYYY-MM-DD'),
  });

  // Hooks para buscar dados
  const { data: relatorios, isLoading, isError } = useRelatoriosConsolidados(filters);
  const { data: faturamento } = useFaturamentoConsolidado(filters);
  const { data: servicos } = useServicosConsolidado(filters);
  const { data: profissionais } = useProfissionaisConsolidado(filters);

  const { exportFaturamento, exportServicos, exportProfissionais, exportCompleto } =
    useRelatorioExport();

  const handleFilterChange = (key: keyof RelatorioConsolidadoFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (key: 'data_inicio' | 'data_fim', value: dayjs.Dayjs | Date | null) => {
    if (value) {
      const dayjsValue = dayjs.isDayjs(value) ? value : dayjs(value);
      handleFilterChange(key, dayjsValue.format('YYYY-MM-DD'));
    }
  };

  const handleExport = (type: 'faturamento' | 'servicos' | 'profissionais' | 'completo') => {
    switch (type) {
      case 'faturamento':
        exportFaturamento(filters);
        break;
      case 'servicos':
        exportServicos(filters);
        break;
      case 'profissionais':
        exportProfissionais(filters);
        break;
      case 'completo':
        exportCompleto(filters);
        break;
    }
  };

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Erro ao carregar relatórios consolidados. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filtros do Relatório
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Data Início"
                  value={dayjs(filters.data_inicio)}
                  onChange={(value) => handleDateChange('data_inicio', value)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Data Fim"
                  value={dayjs(filters.data_fim)}
                  onChange={(value) => handleDateChange('data_fim', value)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Unidade</InputLabel>
                  <Select
                    value={filters.unidade_id || ''}
                    label="Unidade"
                    onChange={(e) => handleFilterChange('unidade_id', e.target.value || undefined)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {/* Aqui seriam listadas as unidades disponíveis */}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filters.categoria || ''}
                    label="Categoria"
                    onChange={(e) => handleFilterChange('categoria', e.target.value || undefined)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {/* Aqui seriam listadas as categorias disponíveis */}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => {
                  // Recarregar dados
                }}
              >
                Atualizar
              </Button>

              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExport('completo')}
              >
                Exportar Completo
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Resumo Geral */}
        {relatorios?.data && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" component="div" color="primary">
                    {relatorios.data.total_unidades}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unidades Analisadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" component="div" color="success.main">
                    {relatorios.data.faturamento
                      .reduce((total, f) => total + f.faturamento_total, 0)
                      .toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Faturamento Total (R$)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" component="div" color="info.main">
                    {relatorios.data.faturamento.reduce(
                      (total, f) => total + f.total_agendamentos,
                      0,
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Agendamentos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" component="div" color="warning.main">
                    {relatorios.data.profissionais.reduce(
                      (total, p) => total + p.total_profissionais,
                      0,
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Profissionais
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Abas de Relatórios */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExport('faturamento')}
              >
                Exportar Faturamento
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExport('servicos')}
              >
                Exportar Serviços
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExport('profissionais')}
              >
                Exportar Profissionais
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Relatório de Faturamento */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Faturamento por Unidade
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
                      <TableCell align="right">Agendamentos</TableCell>
                      <TableCell align="right">Concluídos</TableCell>
                      <TableCell align="right">Faturamento (R$)</TableCell>
                      <TableCell align="right">Ticket Médio (R$)</TableCell>
                      <TableCell align="right">Clientes</TableCell>
                      <TableCell align="right">Profissionais</TableCell>
                      <TableCell align="right">Período</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {faturamento?.data?.map((row) => (
                      <TableRow key={row.unidade_id}>
                        <TableCell>{row.unidade_nome}</TableCell>
                        <TableCell align="right">{row.total_agendamentos}</TableCell>
                        <TableCell align="right">{row.agendamentos_concluidos}</TableCell>
                        <TableCell align="right">R$ {row.faturamento_total.toFixed(2)}</TableCell>
                        <TableCell align="right">R$ {row.ticket_medio.toFixed(2)}</TableCell>
                        <TableCell align="right">{row.total_clientes}</TableCell>
                        <TableCell align="right">{row.total_profissionais}</TableCell>
                        <TableCell align="right">{dayjs(row.mes_ano).format('MMM/YYYY')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Relatório de Serviços */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Serviços por Unidade
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
                      <TableCell>Categoria</TableCell>
                      <TableCell align="right">Total de Serviços</TableCell>
                      <TableCell align="right">Preço Médio (R$)</TableCell>
                      <TableCell align="right">Valor Total (R$)</TableCell>
                      <TableCell align="right">Serviços Únicos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {servicos?.data?.map((row) => (
                      <TableRow key={`${row.unidade_id}-${row.categoria}`}>
                        <TableCell>{row.unidade_nome}</TableCell>
                        <TableCell>{row.categoria || 'Sem categoria'}</TableCell>
                        <TableCell align="right">{row.total_servicos}</TableCell>
                        <TableCell align="right">R$ {row.preco_medio.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          R$ {row.valor_total_catalogo.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">{row.servicos_unicos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Relatório de Profissionais */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profissionais por Unidade
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
                      <TableCell>Papel</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Ativos</TableCell>
                      <TableCell align="right">Inativos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profissionais?.data?.map((row) => (
                      <TableRow key={`${row.unidade_id}-${row.papel}`}>
                        <TableCell>{row.unidade_nome}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.papel}
                            size="small"
                            color={row.papel === 'admin' ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">{row.total_profissionais}</TableCell>
                        <TableCell align="right">{row.profissionais_ativos}</TableCell>
                        <TableCell align="right">{row.profissionais_inativos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}
