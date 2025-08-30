import type { Metadata } from 'next';
import {
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { History } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Histórico de Caixa | Trato',
  description: 'Histórico de operações do caixa',
};

export default function FinanceiroHistoricoPage() {
  // Dados mockados para demonstração
  const historico = [
    {
      id: 1,
      data: '29/08/2025',
      hora: '09:15',
      tipo: 'Entrada',
      descricao: 'Pagamento - João Silva',
      valor: 'R$ 45,00',
      usuario: 'Maria Santos',
      status: 'Confirmado',
    },
    {
      id: 2,
      data: '29/08/2025',
      hora: '10:30',
      tipo: 'Saída',
      descricao: 'Compra de produtos',
      valor: 'R$ 120,00',
      usuario: 'Carlos Lima',
      status: 'Confirmado',
    },
    {
      id: 3,
      data: '28/08/2025',
      hora: '16:45',
      tipo: 'Entrada',
      descricao: 'Pagamento - Ana Costa',
      valor: 'R$ 65,00',
      usuario: 'Maria Santos',
      status: 'Confirmado',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <History size={32} />
        <Typography variant="h4" component="h1">
          Histórico de Caixa
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Visualize todas as operações de caixa registradas no sistema com filtros avançados.
      </Alert>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Usuário</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historico.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{item.data}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.hora}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.tipo}
                    color={item.tipo === 'Entrada' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell align="right">
                  <Typography
                    color={item.tipo === 'Entrada' ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                  >
                    {item.valor}
                  </Typography>
                </TableCell>
                <TableCell>{item.usuario}</TableCell>
                <TableCell>
                  <Chip label={item.status} color="success" variant="outlined" size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
