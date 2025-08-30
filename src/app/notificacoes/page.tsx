import type { Metadata } from 'next';
import {
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import { Bell, Settings, Check, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Central de Notificações | Trato',
  description: 'Gerenciamento de notificações do sistema',
};

export default function NotificacoesPage() {
  const notificacoes = [
    {
      id: 1,
      titulo: 'Agendamento confirmado',
      descricao: 'João Silva confirmou o agendamento para hoje às 14:00',
      tipo: 'success',
      lida: false,
    },
    {
      id: 2,
      titulo: 'Meta de faturamento atingida',
      descricao: 'Parabéns! Você atingiu 80% da meta mensal',
      tipo: 'info',
      lida: false,
    },
    {
      id: 3,
      titulo: 'Estoque baixo',
      descricao: 'Produto "Shampoo Premium" com apenas 2 unidades',
      tipo: 'warning',
      lida: true,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Bell size={32} />
          <Typography variant="h4" component="h1">
            Central de Notificações
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Settings size={20} />}>
          Configurações
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Acompanhe todas as notificações importantes do sistema em um só lugar.
      </Alert>

      <List>
        {notificacoes.map((notificacao) => (
          <ListItem
            key={notificacao.id}
            sx={{
              border: 1,
              borderColor: 'grey.300',
              borderRadius: 1,
              mb: 1,
              bgcolor: notificacao.lida ? 'grey.50' : 'background.paper',
            }}
          >
            <ListItemIcon>
              {notificacao.lida ? (
                <Check color="#2e7d32" />
              ) : (
                <Info color={notificacao.tipo === 'success' ? '#2e7d32' : '#1976d2'} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={notificacao.titulo}
              secondary={notificacao.descricao}
              primaryTypographyProps={{
                fontWeight: notificacao.lida ? 'normal' : 'bold',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Funcionalidade em desenvolvimento. Em breve: notificações push, filtros por tipo e
          configurações personalizadas.
        </Typography>
      </Box>
    </Box>
  );
}
