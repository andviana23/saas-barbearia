'use client';
// Página de desempenho individual do profissional
// Ajuste: adicionar estados de loading / erro e corrigir uso de DSLineArea
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Avatar,
  Button,
  Alert,
  CircularProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// Removidos ícones de expansão pois modal foi simplificado
import { DSLineArea } from '@/components/ui/DSChartWrapper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PercentIcon from '@mui/icons-material/Percent';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import GroupIcon from '@mui/icons-material/Group';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface Props {
  profissionalId: string;
}

interface PerformanceMetrics {
  nome: string;
  avatar: string | null;
  faturamento: number;
  comissao: number;
  metaFaturamento: number;
  assinaturaAtiva: boolean;
  produtosVendidos: number;
  extrasExecutados: number;
  clientesAtendidos: number;
  clientesSemPreferencia: number;
  desempenhoMensal: { dia: number; valor: number }[];
}

export default function DesempenhoProfissionalPage({ profissionalId }: Props) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<null | 'comissao'>(null);
  const [periodo, setPeriodo] = useState<'7' | '14' | '30'>('30');
  // Dados brutos (mantidos caso queiramos evoluir depois), mas o modal agora só mostra o resumo.
  const [commissionData, setCommissionData] = useState<
    {
      id: string;
      cliente: string;
      valorPago: number;
      comissao: number;
      itens: { descricao: string; qtd: number; valorUnit: number }[];
    }[]
  >([]);

  useEffect(() => {
    let active = true;
    // Simulação de chamada assíncrona – substituir por server action / fetch real
    (async () => {
      try {
        setLoading(true);
        // delay artificial
        await new Promise((r) => setTimeout(r, 500));
        // mock
        const mock: PerformanceMetrics = {
          nome: 'João Silva',
          avatar: null,
          faturamento: 12850.75,
          comissao: 5140.3,
          metaFaturamento: 15000,
          assinaturaAtiva: true,
          produtosVendidos: 74,
          extrasExecutados: 22,
          clientesAtendidos: 180,
          clientesSemPreferencia: 45,
          desempenhoMensal: Array.from({ length: 30 }, (_, i) => ({
            dia: i + 1,
            valor: Math.round(200 + Math.random() * 400),
          })),
        };
        if (active) {
          setMetrics(mock);
          // mock commission list
          setCommissionData(
            Array.from({ length: 12 }, (_, i) => ({
              id: String(i + 1),
              cliente: `Cliente ${i + 1}`,
              valorPago: 60 + Math.round(Math.random() * 140),
              comissao: 20 + Math.round(Math.random() * 40),
              itens: [
                { descricao: 'Corte', qtd: 1, valorUnit: 40 },
                { descricao: 'Barba', qtd: 1, valorUnit: 30 },
                ...(Math.random() > 0.5
                  ? [{ descricao: 'Produto Styling', qtd: 1, valorUnit: 35 }]
                  : []),
              ],
            })),
          );
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro inesperado ao carregar desempenho';
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [profissionalId]);

  const progressoMeta = useMemo(() => {
    if (!metrics) return 0;
    return Math.min(100, Math.round((metrics.faturamento / metrics.metaFaturamento) * 100));
  }, [metrics]);

  const lineData = useMemo(() => {
    const dias = parseInt(periodo, 10);
    if (!metrics) return Array.from({ length: dias }, (_, i) => ({ x: i + 1, y: 0 }));
    const slice = metrics.desempenhoMensal.slice(-dias);
    return slice.map((p) => ({ x: p.dia, y: p.valor }));
  }, [metrics, periodo]);

  return (
    <Container maxWidth="xl" data-testid="painel-desempenho-profissional">
      <Box sx={{ py: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            href="/profissionais"
            size="small"
          >
            Voltar
          </Button>
          {loading ? (
            <Skeleton variant="circular" width={56} height={56} />
          ) : (
            <Avatar sx={{ width: 56, height: 56 }} src={metrics?.avatar || undefined}>
              {metrics?.nome?.charAt(0)}
            </Avatar>
          )}
          <Box>
            {loading ? (
              <Skeleton width={220} height={36} />
            ) : (
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {metrics?.nome}
              </Typography>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`ID: ${profissionalId}`} size="small" variant="outlined" />
              {!loading && metrics && (
                <Chip
                  label={metrics.assinaturaAtiva ? 'Assinatura Ativa' : 'Sem Assinatura'}
                  color={metrics.assinaturaAtiva ? 'success' : 'default'}
                  size="small"
                />
              )}
            </Stack>
          </Box>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} data-testid="erro-desempenho">
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          {loading && !metrics
            ? Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={250}
                  height={130}
                  sx={{ borderRadius: 5 }}
                />
              ))
            : metrics && (
                <>
                  <MetricCard
                    title="Faturamento"
                    value={metrics.faturamento}
                    prefix="R$"
                    icon={<MonetizationOnIcon color="primary" />}
                    trend={+5.4}
                  />
                  <MetricCard
                    title="Comissão"
                    value={metrics.comissao}
                    prefix="R$"
                    icon={<PercentIcon color="secondary" />}
                    trend={+3.1}
                    onClick={() => setOpenModal('comissao')}
                    clickable
                  />
                  <MetricCard
                    title="Meta"
                    value={metrics.metaFaturamento}
                    prefix="R$"
                    icon={<TrendingUpIcon color="info" />}
                    extra={`${progressoMeta}%`}
                  />
                  <MetricCard
                    title="Produtos Vendidos"
                    value={metrics.produtosVendidos}
                    icon={<ShoppingBagIcon color="warning" />}
                  />
                  <MetricCard
                    title="Serviços Extra"
                    value={metrics.extrasExecutados}
                    icon={<AssignmentTurnedInIcon color="success" />}
                  />
                  <MetricCard
                    title="Clientes Atendidos"
                    value={metrics.clientesAtendidos}
                    icon={<GroupIcon color="primary" />}
                  />
                  <MetricCard
                    title="Clientes sem Preferência"
                    value={metrics.clientesSemPreferencia}
                    icon={<StarBorderIcon color="action" />}
                  />
                </>
              )}
        </Box>

        <Box
          sx={{
            mt: 4,
            borderRadius: 5, // maior arredondamento
            p: 2.5,
            background: (t) => t.palette.background.paper,
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Desempenho de Atendimentos no Mês
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Atendimentos
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as '7' | '14' | '30')}
                sx={{
                  fontSize: 12.5,
                  borderRadius: 3,
                  '.MuiSelect-select': { py: 0.9 },
                }}
              >
                <MenuItem value="7">Últimos 7 dias</MenuItem>
                <MenuItem value="14">Últimos 14 dias</MenuItem>
                <MenuItem value="30">Últimos 30 dias</MenuItem>
              </Select>
            </FormControl>
            {loading && <CircularProgress size={20} />}
          </Stack>
          {error ? (
            <Alert severity="warning" variant="outlined" data-testid="erro-grafico">
              Não foi possível carregar o gráfico.
            </Alert>
          ) : (
            <Box
              sx={{
                borderRadius: 4,
                background: (t) =>
                  `linear-gradient(180deg, ${t.palette.background.default} 0%, ${t.palette.background.paper} 100%)`,
                border: '1px solid',
                borderColor: 'divider',
                p: { xs: 1, md: 2 },
                overflow: 'hidden',
              }}
            >
              <DSLineArea
                variant="flat"
                compact
                height={300}
                data={lineData}
                label="Atendimentos"
                valueType="number"
              />
            </Box>
          )}
        </Box>
      </Box>
      <CommissionResumoModal
        open={openModal === 'comissao'}
        onClose={() => setOpenModal(null)}
        data={commissionData}
      />
    </Container>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  icon?: React.ReactNode;
  trend?: number;
  extra?: string;
  onClick?: () => void;
  clickable?: boolean;
}

function MetricCard({
  title,
  value,
  prefix,
  icon,
  trend,
  extra,
  onClick,
  clickable,
}: MetricCardProps) {
  return (
    <Paper
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      sx={{
        p: 2,
        // Borda suavizada (usa token global 12px em vez de cápsula exagerada)
        borderRadius: (t) => t.shape.borderRadius,
        width: 220,
        height: 118,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all .2s',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': clickable
          ? {
              boxShadow: 6,
              borderColor: 'primary.main',
            }
          : undefined,
      }}
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ lineHeight: 1.1, fontSize: 20, textAlign: 'center', width: '100%' }}
        >
          {prefix}
          {value.toLocaleString('pt-BR', {
            minimumFractionDigits: prefix ? 2 : 0,
            maximumFractionDigits: prefix ? 2 : 0,
          })}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 0.4 }}
        >
          {trend !== undefined && (
            <Typography
              variant="caption"
              color={trend >= 0 ? 'success.main' : 'error.main'}
              fontWeight={600}
            >
              {trend >= 0 ? '+' : ''}
              {trend}%
            </Typography>
          )}
          {extra && <Chip label={extra} size="small" color="default" variant="outlined" />}
        </Stack>
      </Box>
    </Paper>
  );
}

// Modal estilizado de Resumo de Comissão (padrão oficial)
function CommissionResumoModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: {
    id: string;
    cliente: string;
    valorPago: number;
    comissao: number;
    itens: { descricao: string; qtd: number; valorUnit: number }[];
  }[];
}) {
  // Deriva números básicos. Placeholder simples; substituir com dados reais depois.
  const resumo = useMemo(() => {
    let valorServicos = 0;
    let valorProdutos = 0;
    data.forEach((c) => {
      c.itens.forEach((it) => {
        const total = it.qtd * it.valorUnit;
        if (/produto/i.test(it.descricao)) valorProdutos += total;
        else valorServicos += total;
      });
    });
    const gorjetas = 10;
    const pacotes = 0;
    const bonificacoes = 0;
    const remuneracoes = 0;
    const assinaturas = 0;
    const desconto = 55; // desconto (linha específica)
    const deducoes = 0;
    const comandas = valorServicos + valorProdutos > 0 ? 55 : 0; // placeholder
    const vales = 0;
    const recebimentos =
      valorServicos +
      valorProdutos +
      gorjetas +
      pacotes +
      bonificacoes +
      remuneracoes +
      assinaturas;
    const descontosGrupo = desconto + deducoes + comandas + vales;
    const saldo = recebimentos - descontosGrupo;
    return {
      entradas: [
        { label: 'Serviços', valor: valorServicos },
        { label: 'Produtos', valor: valorProdutos },
        { label: 'Pacotes', valor: pacotes },
        { label: 'Gorjetas', valor: gorjetas },
        { label: 'Bonificações', valor: bonificacoes },
        { label: 'Remunerações', valor: remuneracoes },
        { label: 'Assinaturas', valor: assinaturas },
      ],
      saidas: [
        { label: 'Desconto', valor: desconto },
        { label: 'Deduções', valor: deducoes },
        { label: 'Comandas', valor: comandas },
        { label: 'Vales', valor: vales },
      ],
      recebimentos,
      descontosGrupo,
      saldo,
    };
  }, [data]);

  const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderLinha = (item: { label: string; valor: number }, tipo: 'entrada' | 'saida') => {
    const isZero = item.valor === 0;
    const color = tipo === 'entrada' ? 'success.main' : 'error.main';
    return (
      <Stack
        key={item.label}
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ py: 0.6, minHeight: 30 }}
        role="row"
      >
        <Typography
          role="cell"
          sx={{
            flex: 1,
            fontSize: 13.5,
            fontWeight: 500,
            color,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {item.label}
          {isZero && (
            <Box
              component="span"
              sx={{
                fontSize: 10,
                px: 0.8,
                py: 0.2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              sem valores
            </Box>
          )}
        </Typography>
        <Typography role="cell" sx={{ fontSize: 13.5, fontWeight: 600 }}>
          {moeda(item.valor)}
        </Typography>
      </Stack>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-testid="modal-comissao-resumo"
      aria-labelledby="titulo-resumo-comissao"
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          borderRadius: 2.5,
          border: (t) => `1px solid ${t.palette.divider}`,
        },
      }}
    >
      <DialogTitle
        id="titulo-resumo-comissao"
        sx={{ pr: 7, fontSize: 16, fontWeight: 600, pb: 1.2, position: 'relative' }}
      >
        Resumo de Comissão
        <Typography
          component="p"
          variant="caption"
          sx={{ color: 'text.secondary', mt: 0.4, fontWeight: 400, display: 'block' }}
        >
          Período selecionado • valores brutos e deduções
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Fechar"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 0, px: 2.5 }} dividers>
        {/* Entradas */}
        <Divider
          textAlign="center"
          sx={{
            my: 1.5,
            '&:before, &:after': { borderColor: 'divider' },
            fontSize: 11,
            opacity: 0.8,
          }}
        >
          ENTRADAS
        </Divider>
        <Box role="table" aria-label="Entradas de comissão" sx={{ mb: 1 }}>
          {resumo.entradas.map((e) => renderLinha(e, 'entrada'))}
        </Box>
        <Divider
          textAlign="center"
          sx={{
            my: 1.5,
            '&:before, &:after': { borderColor: 'divider' },
            fontSize: 11,
            opacity: 0.8,
          }}
        >
          SAÍDAS
        </Divider>
        <Box role="table" aria-label="Saídas de comissão">
          {resumo.saidas.map((s) => renderLinha(s, 'saida'))}
        </Box>
        {/* Saldo */}
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            sx={{ fontSize: 12, letterSpacing: 0.5, fontWeight: 600, color: 'text.secondary' }}
          >
            SALDO
          </Typography>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{moeda(resumo.saldo)}</Typography>
        </Box>
        {/* Recebimentos / Descontos destaque */}
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1.5,
              py: 1,
              borderRadius: 2,
              fontSize: 12.5,
              bgcolor: 'rgba(16,94,74,0.25)',
              border: '1px solid',
              borderColor: 'success.main',
              color: 'success.main',
              fontWeight: 600,
            }}
          >
            <span>RECEBIMENTOS</span>
            <span>{moeda(resumo.recebimentos)}</span>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1.5,
              py: 1,
              borderRadius: 2,
              fontSize: 12.5,
              bgcolor: 'rgba(122,0,24,0.25)',
              border: '1px solid',
              borderColor: 'error.main',
              color: 'error.main',
              fontWeight: 600,
            }}
          >
            <span>DESCONTOS</span>
            <span>{moeda(resumo.descontosGrupo)}</span>
          </Box>
        </Stack>
        {/* Ações */}
        <Stack direction="row" spacing={1.2} justifyContent="flex-end" sx={{ mt: 3, mb: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => {
              // Export simples CSV mock
              try {
                const linhas: string[] = [];
                linhas.push('Tipo,Categoria,Valor');
                resumo.entradas.forEach((e) => linhas.push(`Entrada,${e.label},${e.valor}`));
                resumo.saidas.forEach((s) => linhas.push(`Saída,${s.label},${s.valor}`));
                linhas.push(`Resumo,Recebimentos,${resumo.recebimentos}`);
                linhas.push(`Resumo,Descontos,${resumo.descontosGrupo}`);
                linhas.push(`Resumo,Saldo,${resumo.saldo}`);
                const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'resumo-comissao.csv';
                a.click();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error('Falha ao exportar CSV', err);
              }
            }}
          >
            Exportar
          </Button>
          <Button size="small" variant="contained" onClick={onClose} autoFocus>
            Fechar
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// Pequeno componente de resumo (evita repetição)
// Componente ResumoBox removido (não utilizado na versão simplificada do modal)
