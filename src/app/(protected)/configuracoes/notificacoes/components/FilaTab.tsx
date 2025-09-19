'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  WhatsApp,
  Sms,
  Email,
  Notifications,
  Schedule,
  CheckCircle,
  Error as ErrorIcon,
  Pending,
} from '@mui/icons-material';

import EmptyState from '@/components/ui/EmptyState';
import {
  useFilaNotificacoes,
  useCanaisNotificacao,
  useTemplatesNotificacao,
  useProcessarFila,
  useNotificacaoHelpers,
} from '@/hooks/use-notificacoes';
import { useNotifications } from '@/components/ui/NotificationSystem';

// Interfaces para tipagem
interface ItemFila {
  id: string;
  status: 'pendente' | 'enviado' | 'erro' | 'agendado';
  canalId: string;
  templateId: string;
  destinatario: string;
  mensagem: string;
  tentativas: number;
  dataAgendamento?: string;
  dataEnvio?: string;
  erro?: string;
  createdAt: string;
  updatedAt: string;
}

interface CanalNotificacao {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  configuracao: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface TemplateNotificacao {
  id: string;
  codigo: string;
  nome: string;
  mensagem: string;
  ativo: boolean;
  canalId: string;
  createdAt: string;
  updatedAt: string;
}

export default function FilaTab() {
  const [filters, setFilters] = useState({
    status: '',
    canalId: '',
    templateId: '',
    dataInicio: '',
    dataFim: '',
  });

  const { data: fila, isLoading, refetch } = useFilaNotificacoes(filters);
  const { data: canais } = useCanaisNotificacao();
  const { data: templates } = useTemplatesNotificacao();
  const processarFila = useProcessarFila();
  const { addNotification } = useNotifications();
  const { formatarStatus, formatarPrioridade, formatarTempo } = useNotificacaoHelpers();

  const getCanalIcon = (codigo: string) => {
    switch (codigo) {
      case 'whatsapp':
        return <WhatsApp color="success" fontSize="small" />;
      case 'sms':
        return <Sms color="primary" fontSize="small" />;
      case 'email':
        return <Email color="secondary" fontSize="small" />;
      case 'push':
        return <Notifications color="info" fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
        return <CheckCircle color="success" fontSize="small" />;
      case 'erro':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'enviando':
        return <PlayIcon color="info" fontSize="small" />;
      case 'agendado':
        return <Schedule color="primary" fontSize="small" />;
      default:
        return <Pending color="warning" fontSize="small" />;
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleProcessarFila = async () => {
    try {
      const result = await processarFila.mutateAsync();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: result.message || 'Fila processada com sucesso',
        });
        refetch();
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Erro ao processar fila',
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      canalId: '',
      templateId: '',
      dataInicio: '',
      dataFim: '',
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>Carregando fila de notificações...</Typography>
      </Box>
    );
  }

  // Calcular estatísticas da fila
  const stats = {
    total: fila?.data?.length || 0,
    pendentes: fila?.data?.filter((item: ItemFila) => item.status === 'pendente').length || 0,
    enviadas: fila?.data?.filter((item: ItemFila) => item.status === 'enviado').length || 0,
    erros: fila?.data?.filter((item: ItemFila) => item.status === 'erro').length || 0,
    agendadas: fila?.data?.filter((item: ItemFila) => item.status === 'agendado').length || 0,
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Fila de Notificações</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={handleProcessarFila}
            disabled={processarFila.isPending}
          >
            {processarFila.isPending ? 'Processando...' : 'Processar Fila'}
          </Button>
        </Box>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.pendentes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.enviadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enviadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats.erros}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Erros
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stats.agendadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agendadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="enviando">Enviando</MenuItem>
                  <MenuItem value="enviado">Enviado</MenuItem>
                  <MenuItem value="erro">Erro</MenuItem>
                  <MenuItem value="agendado">Agendado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Canal</InputLabel>
                <Select
                  value={filters.canalId}
                  label="Canal"
                  onChange={(e) => handleFilterChange('canalId', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {canais?.data?.map((canal: CanalNotificacao) => (
                    <MenuItem key={canal.id} value={canal.id}>
                      {canal.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Template</InputLabel>
                <Select
                  value={filters.templateId}
                  label="Template"
                  onChange={(e) => handleFilterChange('templateId', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {templates?.data?.map((template: TemplateNotificacao) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Data Início"
                type="date"
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Data Fim"
                type="date"
                value={filters.dataFim}
                onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button fullWidth variant="outlined" onClick={clearFilters}>
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela da Fila */}
      {!fila?.data || fila.data.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação na fila"
          description="Quando notificações forem criadas, elas aparecerão aqui"
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Destinatário</TableCell>
                <TableCell>Template</TableCell>
                <TableCell>Canal</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Tentativas</TableCell>
                <TableCell>Criado</TableCell>
                <TableCell>Próximo Envio</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fila.data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {item.cliente_nome || 'Cliente não identificado'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.destinatario?.contato}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant="body2">{item.template_nome}</Typography>
                      <Chip label={item.template_codigo} size="small" variant="outlined" />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getCanalIcon(item.canal_icone)}
                      <Typography variant="body2">{item.canal_nome}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(item.status)}
                      <Chip
                        label={formatarStatus(item.status).label}
                        size="small"
                        color={formatarStatus(item.status).color}
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={formatarPrioridade(item.prioridade).label}
                      size="small"
                      color={formatarPrioridade(item.prioridade).color}
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {item.tentativas}/{item.max_tentativas}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{formatarTempo(item.created_at)}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {item.proximo_envio && new Date(item.proximo_envio) > new Date()
                        ? formatarTempo(item.proximo_envio)
                        : 'Agora'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <IconButton size="small" title="Ver detalhes">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
