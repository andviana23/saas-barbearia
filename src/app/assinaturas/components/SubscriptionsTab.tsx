'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Skeleton,
  Alert,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Toolbar,
  Menu,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  PlayArrow as RenewIcon,
} from '@mui/icons-material';
import { Subscription, SubscriptionPlan } from '@/types/subscription';
import { useCancelSubscription } from '@/hooks/use-subscriptions';
import { ViewSubscriptionDialog } from './ViewSubscriptionDialog';
import { EditSubscriptionDialog } from './EditSubscriptionDialog';
import dayjs from 'dayjs';

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
  plans: SubscriptionPlan[];
  isLoading: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function SubscriptionsTab({
  subscriptions,
  plans,
  isLoading,
  pagination,
}: SubscriptionsTabProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Estados para seleção múltipla
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  const cancelSubscription = useCancelSubscription();

  // Filtrar e buscar assinaturas
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      // Filtro de busca
      const searchMatch =
        searchTerm === '' ||
        subscription.unidade?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.unidade?.cnpj?.includes(searchTerm) ||
        plans
          .find((p) => p.id === subscription.planId)
          ?.name.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filtro de status
      const statusMatch = statusFilter === 'all' || subscription.status === statusFilter;

      // Filtro de plano
      const planMatch = planFilter === 'all' || subscription.planId === planFilter;

      // Filtro de pagamento
      const paymentMatch = paymentFilter === 'all' || subscription.paymentMethod === paymentFilter;

      return searchMatch && statusMatch && planMatch && paymentMatch;
    });
  }, [subscriptions, searchTerm, statusFilter, planFilter, paymentFilter, plans]);

  // Funções de seleção múltipla
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(filteredSubscriptions.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Ações em massa
  const handleBulkCancel = async () => {
    if (window.confirm(`Tem certeza que deseja cancelar ${selectedIds.length} assinaturas?`)) {
      for (const id of selectedIds) {
        await cancelSubscription.mutateAsync(id);
      }
      setSelectedIds([]);
      setBulkMenuAnchor(null);
    }
  };

  const handleBulkExport = () => {
    const selectedSubscriptions = filteredSubscriptions.filter((s) => selectedIds.includes(s.id));
    const csvContent = generateCSV(selectedSubscriptions);
    downloadCSV(csvContent, 'assinaturas.csv');
    setBulkMenuAnchor(null);
  };

  const generateCSV = (data: Subscription[]) => {
    const headers = ['Unidade', 'CNPJ', 'Plano', 'Status', 'Início', 'Próxima Cobrança', 'Valor'];
    const rows = data.map((subscription) => {
      const plan = plans.find((p) => p.id === subscription.planId);
      return [
        subscription.unidade?.name || 'N/A',
        subscription.unidade?.cnpj || 'N/A',
        plan?.name || 'N/A',
        getStatusLabel(subscription.status),
        formatDate(subscription.startDate),
        formatDate(subscription.nextBillingDate),
        plan ? formatCurrency(plan.price) : 'N/A',
      ];
    });

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setViewDialogOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditDialogOpen(true);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      await cancelSubscription.mutateAsync(subscriptionId);
    }
  };

  const handleCloseView = () => {
    setViewDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedSubscription(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'suspended':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'trial':
        return 'Trial';
      case 'suspended':
        return 'Suspensa';
      case 'cancelled':
        return 'Cancelada';
      case 'expired':
        return 'Expirada';
      default:
        return status;
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return 'Mensal';
      case 'quarterly':
        return 'Trimestral';
      case 'yearly':
        return 'Anual';
      default:
        return cycle;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'credit_card':
        return 'Cartão';
      case 'bank_slip':
        return 'Boleto';
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={400} />
        <Box mt={2}>
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
        </Box>
      </Box>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Alert severity="info">
        Nenhuma assinatura encontrada. Crie a primeira assinatura para começar.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filtros e Busca */}
      <Paper sx={{ mb: 3 }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 2, py: 2 }}>
          <TextField
            size="small"
            placeholder="Buscar por unidade, CNPJ ou plano..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Ativa</MenuItem>
              <MenuItem value="trial">Trial</MenuItem>
              <MenuItem value="suspended">Suspensa</MenuItem>
              <MenuItem value="cancelled">Cancelada</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Plano</InputLabel>
            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              label="Plano"
            >
              <MenuItem value="all">Todos</MenuItem>
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Pagamento</InputLabel>
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              label="Pagamento"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="pix">PIX</MenuItem>
              <MenuItem value="credit_card">Cartão</MenuItem>
              <MenuItem value="bank_slip">Boleto</MenuItem>
            </Select>
          </FormControl>

          {selectedIds.length > 0 && (
            <>
              <Chip
                label={`${selectedIds.length} selecionadas`}
                onDelete={() => setSelectedIds([])}
                color="primary"
              />
              <Button
                startIcon={<MoreIcon />}
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                variant="contained"
                size="small"
              >
                Ações
              </Button>
            </>
          )}

          <Button
            startIcon={<ExportIcon />}
            onClick={() => {
              const csvContent = generateCSV(filteredSubscriptions);
              downloadCSV(csvContent, 'todas-assinaturas.csv');
            }}
            variant="outlined"
            size="small"
          >
            Exportar
          </Button>
        </Toolbar>
      </Paper>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total de Assinaturas
              </Typography>
              <Typography variant="h4" component="h2">
                {filteredSubscriptions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Assinaturas Ativas
              </Typography>
              <Typography variant="h4" component="h2" color="success.main">
                {subscriptions.filter((s) => s.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Em Trial
              </Typography>
              <Typography variant="h4" component="h2" color="info.main">
                {subscriptions.filter((s) => s.status === 'trial').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Suspensas
              </Typography>
              <Typography variant="h4" component="h2" color="warning.main">
                {subscriptions.filter((s) => s.status === 'suspended').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Assinaturas */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      filteredSubscriptions.length > 0 &&
                      selectedIds.length === filteredSubscriptions.length
                    }
                    indeterminate={
                      selectedIds.length > 0 && selectedIds.length < filteredSubscriptions.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Unidade</TableCell>
                <TableCell>Plano</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Próxima Cobrança</TableCell>
                <TableCell>Ciclo</TableCell>
                <TableCell>Pagamento</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscriptions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((subscription) => {
                  const plan = plans.find((p) => p.id === subscription.planId);
                  const isSelected = selectedIds.includes(subscription.id);
                  return (
                    <TableRow key={subscription.id} selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectOne(subscription.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {subscription.unidade?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {subscription.unidade?.cnpj || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{plan?.name || 'N/A'}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {plan ? formatCurrency(plan.price) : 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusLabel(subscription.status)}
                          color={getStatusColor(subscription.status)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(subscription.startDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(subscription.nextBillingDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getBillingCycleLabel(subscription.billingCycle)}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getPaymentMethodLabel(subscription.paymentMethod)}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {plan ? formatCurrency(plan.price) : 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Ver detalhes">
                            <IconButton
                              size="small"
                              onClick={() => handleViewSubscription(subscription)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleEditSubscription(subscription)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          {subscription.status === 'active' && (
                            <Tooltip title="Cancelar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelSubscription(subscription.id)}
                                disabled={cancelSubscription.isPending}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginação */}
        {pagination && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />
        )}
      </Paper>

      {/* Menu de Ações em Massa */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        <MenuItem onClick={handleBulkExport}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar Selecionadas</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleBulkCancel} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Cancelar Selecionadas</ListItemText>
        </MenuItem>
      </Menu>

      {/* Diálogos */}
      {selectedSubscription && (
        <>
          <ViewSubscriptionDialog
            open={viewDialogOpen}
            onClose={handleCloseView}
            subscription={selectedSubscription}
            plan={plans.find((p) => p.id === selectedSubscription.planId)}
          />

          <EditSubscriptionDialog
            open={editDialogOpen}
            onClose={handleCloseEdit}
            subscription={selectedSubscription}
            plans={plans}
          />
        </>
      )}
    </Box>
  );
}
