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
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  Eye,
  Check,
  X,
  ArrowBack,
  Download,
  Trash2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Solicitacao {
  id: string;
  cliente: string;
  email: string;
  tipo: 'acesso' | 'retificacao' | 'exclusao' | 'portabilidade';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'rejeitada';
  dataSolicitacao: string;
  prazoLegal: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta';
}

export default function SolicitacoesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Solicitacao | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const solicitacoes: Solicitacao[] = [
    {
      id: '1',
      cliente: 'João Silva',
      email: 'joao@email.com',
      tipo: 'exclusao',
      status: 'pendente',
      dataSolicitacao: '2024-01-10',
      prazoLegal: '2024-01-25',
      descricao: 'Solicitação de exclusão completa dos dados pessoais',
      prioridade: 'alta',
    },
    {
      id: '2',
      cliente: 'Maria Santos',
      email: 'maria@email.com',
      tipo: 'acesso',
      status: 'em_andamento',
      dataSolicitacao: '2024-01-08',
      prazoLegal: '2024-01-23',
      descricao: 'Solicitação de acesso aos dados pessoais armazenados',
      prioridade: 'media',
    },
    {
      id: '3',
      cliente: 'Pedro Costa',
      email: 'pedro@email.com',
      tipo: 'retificacao',
      status: 'concluida',
      dataSolicitacao: '2024-01-05',
      prazoLegal: '2024-01-20',
      descricao: 'Correção de dados pessoais incorretos',
      prioridade: 'baixa',
    },
    {
      id: '4',
      cliente: 'Ana Oliveira',
      email: 'ana@email.com',
      tipo: 'portabilidade',
      status: 'pendente',
      dataSolicitacao: '2024-01-12',
      prazoLegal: '2024-01-27',
      descricao: 'Exportação de dados em formato estruturado',
      prioridade: 'media',
    },
  ];

  const filteredSolicitacoes = solicitacoes.filter((request) => {
    const matchesSearch = 
      request.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'success';
      case 'em_andamento':
        return 'info';
      case 'pendente':
        return 'warning';
      case 'rejeitada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <Check size={16} />;
      case 'em_andamento':
        return <Clock size={16} />;
      case 'pendente':
        return <AlertTriangle size={16} />;
      case 'rejeitada':
        return <X size={16} />;
      default:
        return null;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'acesso':
        return 'Acesso aos Dados';
      case 'retificacao':
        return 'Retificação';
      case 'exclusao':
        return 'Exclusão';
      case 'portabilidade':
        return 'Portabilidade';
      default:
        return tipo;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baixa':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleViewDetails = (request: Solicitacao) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const isOverdue = (prazoLegal: string) => {
    return new Date(prazoLegal) < new Date();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/lgpd')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1">
            Solicitações LGPD
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestão de solicitações de direitos dos titulares
          </Typography>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Buscar por cliente, email ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="em_andamento">Em Andamento</MenuItem>
                <MenuItem value="concluida">Concluída</MenuItem>
                <MenuItem value="rejeitada">Rejeitada</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tabela de Solicitações */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Prioridade</TableCell>
                  <TableCell>Data Solicitação</TableCell>
                  <TableCell>Prazo Legal</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSolicitacoes.map((request) => (
                  <TableRow 
                    key={request.id}
                    sx={{
                      backgroundColor: isOverdue(request.prazoLegal) && request.status !== 'concluida' 
                        ? 'rgba(244, 67, 54, 0.1)' 
                        : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {request.cliente}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getTipoLabel(request.tipo)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status.replace('_', ' ')}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.prioridade}
                        color={getPrioridadeColor(request.prioridade) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{request.dataSolicitacao}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color={isOverdue(request.prazoLegal) && request.status !== 'concluida' ? 'error' : 'inherit'}
                      >
                        {request.prazoLegal}
                        {isOverdue(request.prazoLegal) && request.status !== 'concluida' && ' (Vencido)'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye size={16} />
                        </IconButton>
                        {request.status === 'pendente' && (
                          <>
                            <IconButton size="small" color="success">
                              <Check size={16} />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <X size={16} />
                            </IconButton>
                          </>
                        )}
                        {request.tipo === 'portabilidade' && request.status === 'concluida' && (
                          <IconButton size="small">
                            <Download size={16} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes da Solicitação</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações do Solicitante
              </Typography>
              <Typography><strong>Nome:</strong> {selectedRequest.cliente}</Typography>
              <Typography><strong>Email:</strong> {selectedRequest.email}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Detalhes da Solicitação
              </Typography>
              <Typography><strong>Tipo:</strong> {getTipoLabel(selectedRequest.tipo)}</Typography>
              <Typography><strong>Status:</strong> {selectedRequest.status}</Typography>
              <Typography><strong>Prioridade:</strong> {selectedRequest.prioridade}</Typography>
              <Typography><strong>Data da Solicitação:</strong> {selectedRequest.dataSolicitacao}</Typography>
              <Typography><strong>Prazo Legal:</strong> {selectedRequest.prazoLegal}</Typography>
              <Typography><strong>Descrição:</strong> {selectedRequest.descricao}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fechar</Button>
          {selectedRequest?.status === 'pendente' && (
            <>
              <Button variant="outlined" color="error">
                Rejeitar
              </Button>
              <Button variant="contained" color="success">
                Aprovar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}