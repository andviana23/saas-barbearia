'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Toolbar,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';

// Types
export type Professional = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  is_active: boolean;
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
  searchParams: Record<string, string>;
}

export function ProfissionaisContent({ initialData, searchParams }: ProfissionaisContentProps) {
  const [professionals, setProfessionals] = useState(initialData);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  const handleEdit = (professional: Professional) => {
    setSelectedProfessional(professional);
    setOpenEditDialog(true);
  };

  const handleDelete = async (professionalId: string) => {
    // TODO: Implementar exclusão via server action
    console.log('Delete professional:', professionalId);
  };

  const handleManageSchedule = (professionalId: string) => {
    window.location.href = `/profissionais/${professionalId}/horarios`;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Profissionais
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Novo Profissional
            </Button>
          </Stack>
        </Stack>

        {/* Filtros */}
        <Paper
          variant="outlined"
          component="form"
          action="/profissionais"
          method="get"
          sx={{ p: 2, mb: 3, borderRadius: 3 }}
        >
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1 }}>
              <TextField
                name="q"
                label="Pesquisar"
                placeholder="Nome, email ou telefone"
                defaultValue={searchParams.q || ''}
                fullWidth
              />

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  label="Status"
                  defaultValue={searchParams.status || ''}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="inactive">Inativo</MenuItem>
                </Select>
              </FormControl>

              <TextField
                name="role"
                label="Função"
                placeholder="Ex: Barbeiro, Manicure"
                defaultValue={searchParams.role || ''}
                sx={{ minWidth: 200 }}
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained">
                Aplicar
              </Button>
              <Button href="/profissionais" variant="text" color="inherit">
                Limpar
              </Button>
            </Stack>
          </Toolbar>
        </Paper>

        {/* Resumo */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total de Profissionais
              </Typography>
              <Typography variant="h4" color="primary.main">
                {professionals.total}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Profissionais Ativos
              </Typography>
              <Typography variant="h4" color="success.main">
                {professionals.items.filter((p) => p.is_active).length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Média de Serviços
              </Typography>
              <Typography variant="h4" color="info.main">
                {professionals.items.length > 0
                  ? Math.round(
                      professionals.items.reduce((sum, p) => sum + (p.services_count || 0), 0) /
                        professionals.items.length,
                    )
                  : 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Lista */}
        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small" aria-label="Tabela de profissionais">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}>Foto</TableCell>
                <TableCell>Profissional</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell>Função</TableCell>
                <TableCell align="center">Serviços</TableCell>
                <TableCell align="center">Comissão</TableCell>
                <TableCell align="center" sx={{ width: 100 }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ width: 150 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {professionals.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
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
                professionals.items.map((professional) => (
                  <TableRow key={professional.id} hover>
                    <TableCell>
                      <Avatar
                        src={professional.avatar_url || undefined}
                        sx={{ width: 40, height: 40 }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        {professional.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {professional.email && (
                          <Typography variant="body2" color="text.secondary">
                            {professional.email}
                          </Typography>
                        )}
                        {professional.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {professional.phone}
                          </Typography>
                        )}
                        {!professional.email && !professional.phone && (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {professional.role ? (
                        <Chip label={professional.role} size="small" variant="outlined" />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {professional.services_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {professional.commission_percentage ? (
                        <Typography variant="body2">
                          {professional.commission_percentage}%
                        </Typography>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {professional.is_active ? (
                        <Chip label="Ativo" color="success" size="small" />
                      ) : (
                        <Chip label="Inativo" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Gerenciar Horários">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleManageSchedule(professional.id)}
                          >
                            <ScheduleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(professional)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(professional.id)}
                          >
                            <DeleteIcon />
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

          {/* TODO: Implementar paginação */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Exibindo {professionals.items.length} de {professionals.total} profissionais
            </Typography>
          </Box>
        </Paper>

        {/* TODO: Implementar modais de criação e edição */}
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
