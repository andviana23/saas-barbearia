'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CardIcon,
  Pix as PixIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTransacao, useTiposPagamento } from '@/hooks/use-transacoes';
import { useNotifications } from '@/components/ui/NotificationSystem';
import { useCurrentUnit } from '@/hooks/use-current-unit';

// ===== SCHEMAS =====

const CheckoutFormSchema = z.object({
  clienteId: z.string().optional(),
  profissionalId: z.string().uuid('Selecione um profissional'),
  tipoPagamentoId: z.string().uuid('Selecione uma forma de pagamento'),
  observacoes: z.string().max(500).optional(),
});

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

// ===== TYPES =====

export interface CheckoutItem {
  id: string;
  tipo: 'servico' | 'produto';
  nome: string;
  valorUnitario: number;
  quantidade: number;
  comissaoPercentual?: number;
  servicoId?: string;
  produtoId?: string;
}

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  initialItems?: CheckoutItem[];
  cliente?: { id: string; nome: string; email: string };
  profissionais: Array<{ id: string; nome: string }>;
  servicos: Array<{
    id: string;
    nome: string;
    preco: number;
    comissao_percentual?: number;
  }>;
  produtos: Array<{ id: string; nome: string; preco: number }>;
}

// ===== COMPONENTE =====

export default function CheckoutDialog({
  open,
  onClose,
  initialItems = [],
  cliente,
  profissionais,
  servicos,
  produtos,
}: CheckoutDialogProps) {
  const [itens, setItens] = useState<CheckoutItem[]>(initialItems);
  const [showItemSelector, setShowItemSelector] = useState(false);

  const { currentUnit } = useCurrentUnit();
  const { data: tiposPagamento } = useTiposPagamento();
  const createTransacao = useCreateTransacao();
  const { addNotification } = useNotifications();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      clienteId: cliente?.id,
      profissionalId: '',
      tipoPagamentoId: '',
      observacoes: '',
    },
  });

  // Resetar form quando dialog abrir
  useEffect(() => {
    if (open) {
      setItens(initialItems);
      reset({
        clienteId: cliente?.id,
        profissionalId: '',
        tipoPagamentoId: '',
        observacoes: '',
      });
    }
  }, [open, initialItems, cliente, reset]);

  // ===== HANDLERS =====

  const adicionarItem = (tipo: 'servico' | 'produto', itemId: string) => {
    const item =
      tipo === 'servico'
        ? servicos.find((s) => s.id === itemId)
        : produtos.find((p) => p.id === itemId);

    if (!item) return;

    const novoItem: CheckoutItem = {
      id: Math.random().toString(36),
      tipo,
      nome: item.nome,
      valorUnitario: item.preco,
      quantidade: 1,
      comissaoPercentual: undefined,
      servicoId: tipo === 'servico' ? item.id : undefined,
      produtoId: tipo === 'produto' ? item.id : undefined,
    };

    setItens((prev) => [...prev, novoItem]);
    setShowItemSelector(false);
  };

  const removerItem = (itemId: string) => {
    setItens((prev) => prev.filter((item) => item.id !== itemId));
  };

  const atualizarQuantidade = (itemId: string, quantidade: number) => {
    if (quantidade < 1) return;
    setItens((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantidade } : item)));
  };

  const atualizarValor = (itemId: string, valorUnitario: number) => {
    if (valorUnitario < 0) return;
    setItens((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, valorUnitario } : item)),
    );
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + item.valorUnitario * item.quantidade, 0);
  };

  const handleCheckout = async (data: CheckoutFormData) => {
    if (itens.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Atenção',
        message: 'Adicione pelo menos um item ao carrinho',
      });
      return;
    }

    if (!currentUnit) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Unidade não selecionada',
      });
      return;
    }

    try {
      const transacaoData = {
        unidadeId: currentUnit.id,
        clienteId: data.clienteId,
        profissionalId: data.profissionalId,
        tipo: 'venda' as const,
        valor: calcularTotal(),
        descricao: `Venda - ${itens.map((i) => i.nome).join(', ')}`,
        tipoPagamentoId: data.tipoPagamentoId,
        observacoes: data.observacoes,
        itens: itens.map((item) => ({
          tipoItem: item.tipo,
          servicoId: item.servicoId,
          produtoId: item.produtoId,
          nome: item.nome,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          comissaoPercentual: item.comissaoPercentual,
        })),
      };

      const result = await createTransacao.mutateAsync(transacaoData);

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: 'Venda registrada com sucesso',
        });
        onClose();
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || 'Erro ao processar venda',
      });
    }
  };

  const getTipoPagamentoIcon = (codigo: string) => {
    switch (codigo) {
      case 'dinheiro':
        return <MoneyIcon />;
      case 'asaas_pix':
        return <PixIcon />;
      case 'asaas_cartao':
        return <CardIcon />;
      case 'maquininha':
        return <PaymentIcon />;
      case 'transferencia':
        return <BankIcon />;
      default:
        return <ReceiptIcon />;
    }
  };

  // ===== RENDER =====

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Checkout - PDV</Typography>
          {cliente && <Chip label={cliente.nome} size="small" variant="outlined" />}
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSubmit(handleCheckout)}>
          {/* Seção de Itens */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Itens ({itens.length})</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowItemSelector(!showItemSelector)}
                size="small"
              >
                Adicionar
              </Button>
            </Box>

            {/* Seletor de Itens */}
            {showItemSelector && (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Serviços
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {servicos.map((servico) => (
                      <Chip
                        key={servico.id}
                        label={`${servico.nome} - ${new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(servico.preco)}`}
                        onClick={() => adicionarItem('servico', servico.id)}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Produtos
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {produtos.map((produto) => (
                      <Chip
                        key={produto.id}
                        label={`${produto.nome} - ${new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(produto.preco)}`}
                        onClick={() => adicionarItem('produto', produto.id)}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Lista de Itens */}
            <Box>
              {itens.length === 0 ? (
                <Alert severity="info">
                  {/* prettier-ignore */}
                  <Typography variant="body2">Nenhum item no carrinho. Clique em &quot;Adicionar&quot; para incluir itens.</Typography>
                </Alert>
              ) : (
                itens.map((item) => (
                  <Card key={item.id} variant="outlined" sx={{ mb: 1 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2">{item.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.tipo === 'servico' ? 'Serviço' : 'Produto'}
                          </Typography>
                        </Grid>

                        <Grid item xs={6} sm={2}>
                          <Box display="flex" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
                              {item.quantidade}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Grid>

                        <Grid item xs={6} sm={2}>
                          <TextField
                            size="small"
                            type="number"
                            value={item.valorUnitario}
                            onChange={(e) => atualizarValor(item.id, Number(e.target.value))}
                            InputProps={{
                              startAdornment: 'R$ ',
                            }}
                            inputProps={{ step: 0.01, min: 0 }}
                          />
                        </Grid>

                        <Grid item xs={8} sm={2}>
                          <Typography variant="h6">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.valorUnitario * item.quantidade)}
                          </Typography>
                        </Grid>

                        <Grid item xs={4} sm={2}>
                          <IconButton
                            size="small"
                            onClick={() => removerItem(item.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>

            {/* Total */}
            {itens.length > 0 && (
              <Box mt={2}>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h5" color="primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(calcularTotal())}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Dados da Venda */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Dados da Venda
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="profissionalId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.profissionalId}>
                      <InputLabel>Profissional *</InputLabel>
                      <Select {...field} label="Profissional *">
                        {profissionais.map((prof) => (
                          <MenuItem key={prof.id} value={prof.id}>
                            {prof.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="tipoPagamentoId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipoPagamentoId}>
                      <InputLabel>Forma de Pagamento *</InputLabel>
                      <Select {...field} label="Forma de Pagamento *">
                        {tiposPagamento?.data?.map((tipo) => (
                          <MenuItem key={tipo.id} value={tipo.id}>
                            <Box display="flex" alignItems="center">
                              {getTipoPagamentoIcon(tipo.codigo)}
                              <Box ml={1}>{tipo.nome}</Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="observacoes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      label="Observações"
                      placeholder="Observações sobre a venda..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit(handleCheckout)}
          variant="contained"
          disabled={createTransacao.isPending || itens.length === 0}
          startIcon={createTransacao.isPending ? <CircularProgress size={20} /> : <ReceiptIcon />}
        >
          {createTransacao.isPending ? 'Processando...' : 'Finalizar Venda'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
