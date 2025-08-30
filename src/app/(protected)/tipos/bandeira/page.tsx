'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Switch,
  TextField,
  InputAdornment,
  Stack,
  Tooltip,
  Paper,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Plus, Search, Edit, Trash2, Percent, GripVertical, ExternalLink } from 'lucide-react';
import { getTiposBandeira, deleteTipoBandeira, updateTipoBandeira } from '@/actions/tipos-bandeira';
import TipoBandeiraModal from '@/components/tipos/TipoBandeiraModal';
import type { TipoBandeira } from '@/schemas/tipos';

export default function TiposBandeiraPage() {
  const [bandeiras, setBandeiras] = useState<TipoBandeira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBandeira, setEditingBandeira] = useState<TipoBandeira | null>(null);

  const loadBandeiras = useCallback(async () => {
    setLoading(true);
    const result = await getTiposBandeira({
      limit: 100,
      offset: 0,
      search: searchTerm || undefined,
      ativo: undefined,
    });

    if (result.success) {
      setBandeiras(result.data || []);
      setError(null);
    } else {
      setError(result.error || 'Erro ao carregar bandeiras de cartão');
    }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBandeiras();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadBandeiras]);

  const handleCreate = () => {
    setEditingBandeira(null);
    setModalOpen(true);
  };

  const handleEdit = (bandeira: TipoBandeira) => {
    setEditingBandeira(bandeira);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta bandeira de cartão?')) return;

    const result = await deleteTipoBandeira(id);
    if (result.success) {
      loadBandeiras();
    } else {
      setError(result.error || 'Erro ao excluir bandeira de cartão');
    }
  };

  const handleToggleStatus = async (bandeira: TipoBandeira) => {
    const formData = new FormData();
    formData.append('id', bandeira.id || '');
    formData.append('ativo', (!bandeira.ativo).toString());

    const result = await updateTipoBandeira(formData);
    if (result.success) {
      loadBandeiras();
    } else {
      setError(result.error || 'Erro ao atualizar status');
    }
  };

  const formatTaxa = (taxa: number) => {
    if (taxa === 0) return '-';
    return `${taxa}%`;
  };

  const getBandeiraInfo = (bandeira: TipoBandeira) => {
    return {
      nome: bandeira.nome,
      cor: bandeira.cor_primaria || '#1976d2',
      prefixo: bandeira.prefixo_cartao || '',
      logo: bandeira.logo_url,
    };
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Bandeiras de Cartão
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure as bandeiras de cartão aceitas na sua barbearia
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleCreate}>
          Nova Bandeira
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabela */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={40}>
                  <GripVertical size={16} />
                </TableCell>
                <TableCell>Bandeira</TableCell>
                <TableCell>Código</TableCell>
                <TableCell align="center">Prefixo</TableCell>
                <TableCell align="center">Comprimento</TableCell>
                <TableCell align="center">Taxa</TableCell>
                <TableCell align="center">Logo</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center" width={120}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : bandeiras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma bandeira de cartão encontrada
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={handleCreate}
                        sx={{ mt: 1 }}
                      >
                        Criar primeira bandeira
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                bandeiras.map((bandeira) => {
                  const info = getBandeiraInfo(bandeira);
                  return (
                    <TableRow key={bandeira.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            backgroundColor: info.cor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {info.logo ? (
                            <Avatar
                              src={info.logo}
                              alt={info.nome}
                              sx={{ width: 32, height: 32 }}
                              variant="rounded"
                            />
                          ) : (
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: info.cor,
                                fontSize: '12px',
                                fontWeight: 'bold',
                              }}
                              variant="rounded"
                            >
                              {info.nome.slice(0, 2).toUpperCase()}
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {bandeira.nome}
                            </Typography>
                            {bandeira.descricao && (
                              <Typography variant="caption" color="text.secondary">
                                {bandeira.descricao}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bandeira.codigo}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontFamily: 'monospace',
                            backgroundColor: `${info.cor}20`,
                            borderColor: info.cor,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {bandeira.prefixo_cartao ? (
                          <Chip
                            label={bandeira.prefixo_cartao}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {bandeira.comprimento_cartao ? (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {bandeira.comprimento_cartao} dígitos
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {bandeira.taxa_percentual > 0 ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Percent size={14} />
                            {formatTaxa(bandeira.taxa_percentual)}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {bandeira.logo_url ? (
                          <Tooltip title="Ver logo">
                            <IconButton
                              size="small"
                              onClick={() => window.open(bandeira.logo_url, '_blank')}
                            >
                              <ExternalLink size={16} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sem logo
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={bandeira.ativo}
                          onChange={() => handleToggleStatus(bandeira)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEdit(bandeira)}>
                              <Edit size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(bandeira.id || '')}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal */}
      <TipoBandeiraModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadBandeiras}
        tipoBandeira={editingBandeira}
      />
    </Box>
  );
}
