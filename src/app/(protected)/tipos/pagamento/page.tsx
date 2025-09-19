'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Percent,
  CreditCard,
  Hash,
  GripVertical,
} from 'lucide-react';
import {
  getTiposPagamento,
  deleteTipoPagamento,
  updateTipoPagamento,
} from '@/actions/tipos-pagamento';
import TipoPagamentoModal from '@/components/tipos/TipoPagamentoModal';
import type { TipoPagamento } from '@/schemas/tipos';

export default function TiposPagamentoPage() {
  const [tipos, setTipos] = useState<TipoPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoPagamento | null>(null);

  const loadTipos = async () => {
    setLoading(true);
    const result = await getTiposPagamento({
      search: searchTerm || undefined,
      ativo: undefined,
      limit: 50,
      offset: 0,
    });

    if (result.success) {
      setTipos(result.data || []);
      setError(null);
    } else {
      setError(result.error || 'Erro ao carregar tipos de pagamento');
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTipos();
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleCreate = () => {
    setEditingTipo(null);
    setModalOpen(true);
  };

  const handleEdit = (tipo: TipoPagamento) => {
    setEditingTipo(tipo);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tipo de pagamento?')) return;

    const result = await deleteTipoPagamento(id);
    if (result.success) {
      loadTipos();
    } else {
      setError(result.error || 'Erro ao excluir tipo de pagamento');
    }
  };

  const handleToggleStatus = async (tipo: TipoPagamento) => {
    const formData = new FormData();
    formData.append('id', tipo.id || '');
    formData.append('ativo', (!tipo.ativo).toString());

    const result = await updateTipoPagamento(formData);
    if (result.success) {
      loadTipos();
    } else {
      setError(result.error || 'Erro ao atualizar status');
    }
  };

  const getIcon = (icon?: string) => {
    switch (icon) {
      case 'CreditCard':
        return <CreditCard size={16} />;
      case 'DollarSign':
        return <DollarSign size={16} />;
      case 'Hash':
        return <Hash size={16} />;
      default:
        return null;
    }
  };

  const formatTaxa = (taxa: number, tipo: 'percentual' | 'fixa') => {
    if (taxa === 0) return '-';
    return tipo === 'percentual' ? `${taxa}%` : `R$ ${taxa.toFixed(2)}`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Tipos de Pagamento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure os tipos de pagamento aceitos em sua barbearia
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleCreate}>
          Novo Tipo
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
                <TableCell>Nome</TableCell>
                <TableCell>Código</TableCell>
                <TableCell align="center">Taxa %</TableCell>
                <TableCell align="center">Taxa Fixa</TableCell>
                <TableCell align="center">Parcelamento</TableCell>
                <TableCell align="center">Autorização</TableCell>
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
              ) : tipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum tipo de pagamento encontrado
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={handleCreate}
                        sx={{ mt: 1 }}
                      >
                        Criar primeiro tipo
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                tipos.map((tipo) => (
                  <TableRow key={tipo.id} hover>
                    <TableCell>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          backgroundColor: tipo.cor || '#4f8cff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {getIcon(tipo.icon)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {tipo.nome}
                        </Typography>
                        {tipo.descricao && (
                          <Typography variant="caption" color="text.secondary">
                            {tipo.descricao}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tipo.codigo}
                        size="small"
                        variant="outlined"
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {tipo.taxa_percentual > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Percent size={14} />
                          {formatTaxa(tipo.taxa_percentual, 'percentual')}
                        </Box>
                      )}
                      {tipo.taxa_percentual === 0 && '-'}
                    </TableCell>
                    <TableCell align="center">
                      {tipo.taxa_fixa > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                          }}
                        >
                          <DollarSign size={14} />
                          {formatTaxa(tipo.taxa_fixa, 'fixa')}
                        </Box>
                      )}
                      {tipo.taxa_fixa === 0 && '-'}
                    </TableCell>
                    <TableCell align="center">
                      {tipo.aceita_parcelamento ? (
                        <Chip
                          label={`Até ${tipo.max_parcelas}x`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          À vista
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {tipo.requer_autorizacao ? (
                        <Chip label="Sim" size="small" color="warning" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Não
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={tipo.ativo}
                        onChange={() => handleToggleStatus(tipo)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(tipo)}>
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(tipo.id || '')}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal */}
      <TipoPagamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadTipos}
        tipoPagamento={editingTipo}
      />
    </Box>
  );
}
