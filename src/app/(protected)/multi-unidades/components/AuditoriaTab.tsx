'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Pagination,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, FilterList, Refresh, Download } from '@mui/icons-material';
import { useAuditoriaAcessos, useRelatorioExport } from '@/hooks/use-multi-unidades';
import { AuditoriaAcesso, PaginatedResponse } from '@/types/multi-unidades';
import { AuditoriaAcessoDetalhado } from '@/types/multi-unidades';

export default function AuditoriaTab() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    profile_id: '',
    unidade_id: '',
    acao: '',
    recurso: '',
  });

  // Hook para buscar auditoria
  const {
    data: auditoria,
    isLoading,
    isError,
  } = useAuditoriaAcessos(
    filters.profile_id || undefined,
    filters.unidade_id || undefined,
    page,
    limit,
  );

  const auditoriaData = auditoria?.data as PaginatedResponse<AuditoriaAcessoDetalhado>;

  const { exportCompleto } = useRelatorioExport();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset para primeira página ao filtrar
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleExport = () => {
    exportCompleto({ ...filters });
  };

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Erro ao carregar auditoria. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros de Auditoria
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              label="ID do Profile"
              value={filters.profile_id}
              onChange={(e) => handleFilterChange('profile_id', e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />

            <TextField
              label="ID da Unidade"
              value={filters.unidade_id}
              onChange={(e) => handleFilterChange('unidade_id', e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />

            <TextField
              label="Ação"
              value={filters.acao}
              onChange={(e) => handleFilterChange('acao', e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            />

            <TextField
              label="Recurso"
              value={filters.recurso}
              onChange={(e) => handleFilterChange('recurso', e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setFilters({
                  profile_id: '',
                  unidade_id: '',
                  acao: '',
                  recurso: '',
                });
                setPage(1);
              }}
            >
              Limpar Filtros
            </Button>

            <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
              Exportar Auditoria
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabela de Auditoria */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Log de Auditoria
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data/Hora</TableCell>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Unidade</TableCell>
                      <TableCell>Ação</TableCell>
                      <TableCell>Recurso</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>User Agent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditoriaData?.data?.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.created_at).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          {entry.profile ? (
                            <Box>
                              <Typography variant="body2">{entry.profile.nome}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {entry.profile.email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.unidade ? (
                            <Typography variant="body2">{entry.unidade.nome}</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.acao}
                            size="small"
                            color={
                              entry.acao === 'SELECT'
                                ? 'info'
                                : entry.acao === 'INSERT'
                                  ? 'success'
                                  : entry.acao === 'UPDATE'
                                    ? 'warning'
                                    : entry.acao === 'DELETE'
                                      ? 'error'
                                      : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {entry.recurso}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {entry.ip_address || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ maxWidth: 200, display: 'block' }}
                          >
                            {entry.user_agent || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginação */}
              {auditoriaData?.pagination && auditoriaData.pagination.total_pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={auditoriaData.pagination.total_pages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}

              {/* Resumo */}
              {auditoriaData?.pagination && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Mostrando {auditoriaData.pagination.total} entradas de auditoria
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
