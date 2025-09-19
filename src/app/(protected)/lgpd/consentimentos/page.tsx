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
} from '@mui/material';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  ArrowBack,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Consentimento {
  id: string;
  cliente: string;
  email: string;
  tipo: string;
  status: 'ativo' | 'revogado' | 'expirado';
  dataConsentimento: string;
  dataExpiracao: string;
  finalidade: string;
}

export default function ConsentimentosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsent, setSelectedConsent] = useState<Consentimento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const consentimentos: Consentimento[] = [
    {
      id: '1',
      cliente: 'João Silva',
      email: 'joao@email.com',
      tipo: 'Marketing',
      status: 'ativo',
      dataConsentimento: '2024-01-10',
      dataExpiracao: '2025-01-10',
      finalidade: 'Envio de ofertas e promoções',
    },
    {
      id: '2',
      cliente: 'Maria Santos',
      email: 'maria@email.com',
      tipo: 'Dados Pessoais',
      status: 'ativo',
      dataConsentimento: '2024-01-08',
      dataExpiracao: '2025-01-08',
      finalidade: 'Cadastro e agendamentos',
    },
    {
      id: '3',
      cliente: 'Pedro Costa',
      email: 'pedro@email.com',
      tipo: 'Marketing',
      status: 'revogado',
      dataConsentimento: '2023-12-15',
      dataExpiracao: '2024-12-15',
      finalidade: 'Comunicações promocionais',
    },
  ];

  const filteredConsentimentos = consentimentos.filter(
    (consent) =>
      consent.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'success';
      case 'revogado':
        return 'error';
      case 'expirado':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle size={16} />;
      case 'revogado':
        return <XCircle size={16} />;
      case 'expirado':
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  const handleViewDetails = (consent: Consentimento) => {
    setSelectedConsent(consent);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedConsent(null);
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
            Consentimentos LGPD
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestão de consentimentos de proteção de dados
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
            <Button variant="contained">
              Novo Consentimento
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabela de Consentimentos */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data Consentimento</TableCell>
                  <TableCell>Data Expiração</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConsentimentos.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell>{consent.cliente}</TableCell>
                    <TableCell>{consent.email}</TableCell>
                    <TableCell>{consent.tipo}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(consent.status)}
                        label={consent.status}
                        color={getStatusColor(consent.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{consent.dataConsentimento}</TableCell>
                    <TableCell>{consent.dataExpiracao}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(consent)}
                        >
                          <Eye size={16} />
                        </IconButton>
                        <IconButton size="small">
                          <Edit size={16} />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Trash2 size={16} />
                        </IconButton>
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
        <DialogTitle>Detalhes do Consentimento</DialogTitle>
        <DialogContent>
          {selectedConsent && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações do Cliente
              </Typography>
              <Typography><strong>Nome:</strong> {selectedConsent.cliente}</Typography>
              <Typography><strong>Email:</strong> {selectedConsent.email}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Detalhes do Consentimento
              </Typography>
              <Typography><strong>Tipo:</strong> {selectedConsent.tipo}</Typography>
              <Typography><strong>Status:</strong> {selectedConsent.status}</Typography>
              <Typography><strong>Finalidade:</strong> {selectedConsent.finalidade}</Typography>
              <Typography><strong>Data do Consentimento:</strong> {selectedConsent.dataConsentimento}</Typography>
              <Typography><strong>Data de Expiração:</strong> {selectedConsent.dataExpiracao}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fechar</Button>
          <Button variant="contained">Editar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}