'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
} from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useEffect, useState } from 'react';

// Types
export type Professional = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  is_active: boolean;
  nickname?: string | null;
  is_manager?: boolean;
  rating?: number; // 0-5
  services_count?: number;
  avatar_url?: string | null;
  commission_percentage?: number;
  created_at?: string | null;
};

export type ProfessionalsResponse = {
  items: Professional[];
  total: number;
};

interface ProfissionaisContentProps {
  initialData: ProfessionalsResponse;
  searchParams?: Record<string, string>;
}

export function ProfissionaisContent({ initialData }: ProfissionaisContentProps) {
  const [professionals, setProfessionals] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalização inicial (nickname / rating mock)
  useEffect(() => {
    setProfessionals({
      ...initialData,
      items: initialData.items.map((p, idx) => ({
        ...p,
        nickname: p.name.split(' ')[0],
        is_manager: idx === 0,
        rating:
          typeof p.services_count === 'number'
            ? Math.min(5, Math.max(1, Math.round((p.services_count / 5) * 5)))
            : 3,
      })),
    });
  }, [initialData]);
  // Estados para futuros modais removidos por enquanto (lint)
  const [tabStatus, setTabStatus] = useState<'ativos' | 'removidos'>('ativos');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const filtered = professionals.items
    .filter((p) => (tabStatus === 'ativos' ? p.is_active : !p.is_active))
    .filter(
      (p) =>
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.phone || '').toLowerCase().includes(search.toLowerCase()),
    );

  const paginated = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleEdit = () => {
    // futuro: abrir modal edição
  };
  const handleDelete = async (professionalId: string) => {
    console.log('Delete professional:', professionalId);
  };
  const handleManageSchedule = (professionalId: string) => {
    window.location.href = `/profissionais/${professionalId}/horarios`;
  };
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: substituir por server action real
      await new Promise((r) => setTimeout(r, 400));
      setPage(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" data-testid="painel-profissionais">
      <Box sx={{ py: 3 }}>
        {/* Cabeçalho */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Cadastro de Profissionais
            </Typography>
            <Tooltip title="Gerencie profissionais, horários e disponibilidade.">
              <HelpOutlineOutlinedIcon fontSize="small" color="action" />
            </Tooltip>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" startIcon={<AddIcon />} disabled>
              Criar (em breve)
            </Button>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              color="primary"
              onClick={() => window.location.assign('/profissionais/1/horarios')}
              data-testid="btn-horarios-trabalho"
            >
              Horários de trabalho
            </Button>
          </Stack>
        </Stack>

        {/* Sub Tabs Ativos / Removidos */}
        <Tabs
          value={tabStatus}
          onChange={(_, v) => {
            setTabStatus(v);
            setPage(0);
          }}
          sx={{ mb: 1 }}
          aria-label="Filtro de status"
        >
          <Tab
            value="ativos"
            label={`Ativos (${professionals.items.filter((p) => p.is_active).length})`}
          />
          <Tab
            value="removidos"
            label={`Removidos (${professionals.items.filter((p) => !p.is_active).length})`}
          />
        </Tabs>

        {/* Barra de ferramentas superior */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" size="small" data-testid="btn-export-excel">
                Excel
              </Button>
              <Button variant="outlined" size="small" data-testid="btn-export-pdf">
                PDF
              </Button>
              <FormControl size="small" sx={{ width: 90 }}>
                <InputLabel id="select-page-size-label">{pageSize}</InputLabel>
                <Select
                  labelId="select-page-size-label"
                  label={pageSize}
                  value={pageSize}
                  data-testid="select-page-size"
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  {[10, 25, 50].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Pesquisar"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
                data-testid="input-pesquisar"
              />
              <Tooltip title="Atualizar">
                <IconButton size="small" onClick={handleRefresh} data-testid="btn-refresh">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {error && (
          <Paper variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2 }}>
            <Typography color="error" variant="body2" data-testid="erro-profissionais">
              {error}
            </Typography>
          </Paper>
        )}

        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small" aria-label="Tabela de profissionais">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>Gestor</TableCell>
                <TableCell sx={{ width: 80 }}>Foto</TableCell>
                <TableCell>Nome Completo</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Celular</TableCell>
                <TableCell>Apelido</TableCell>
                <TableCell align="center">Disp</TableCell>
                <TableCell align="center">Nota</TableCell>
                <TableCell align="right" sx={{ width: 160 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>Carregando...</Box>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box
                      sx={{
                        py: 6,
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      Nenhum profissional encontrado com os filtros atuais.
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((professional) => (
                  <TableRow key={professional.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={professional.is_manager ? 'success.main' : 'text.secondary'}
                      >
                        {professional.is_manager ? 'Sim' : 'Não'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={professional.avatar_url || undefined}
                        sx={{ width: 40, height: 40 }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {professional.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {professional.email || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {professional.phone || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{professional.nickname || '—'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {/* Disponibilidade placeholder */}
                      <Tooltip title="Disponibilidade (placeholder)">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {['', '', ''].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 6,
                                height: 6,
                                bgcolor: i % 2 === 0 ? 'primary.main' : 'divider',
                                borderRadius: 0.5,
                              }}
                            />
                          ))}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Rating
                        name={`rating-${professional.id}`}
                        value={professional.rating || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Ver Desempenho">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() =>
                              window.location.assign(`/profissionais/${professional.id}/desempenho`)
                            }
                            data-testid="btn-ver-desempenho"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Horários">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleManageSchedule(professional.id)}
                          >
                            <ScheduleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit()}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(professional.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Divider />

          {/* Paginação */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Mostrando {paginated.length === 0 ? 0 : page * pageSize + 1} até{' '}
              {page * pageSize + paginated.length} de {filtered.length} registros
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Anterior
              </Button>
              <Chip label={page + 1} size="small" />
              <Button
                size="small"
                variant="outlined"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Próximo
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* TODO: Implementar modais de criação e edição e integração real com server actions */}
        {/* <ProfissionalFormDialog 
          open={openCreateDialog} 
          onClose={() => setOpenCreateDialog(false)}
        />
        
        <ProfissionalFormDialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)}
          professional={selectedProfessional}
        /> */}
      </Box>
    </Container>
  );
}
