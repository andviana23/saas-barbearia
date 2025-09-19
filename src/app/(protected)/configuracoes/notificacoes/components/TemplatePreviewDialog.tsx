'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Grid,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { WhatsApp, Sms, Email, Notifications, Preview as PreviewIcon } from '@mui/icons-material';

import { useNotificacaoHelpers } from '@/hooks/use-notificacoes';

// Interface para template
interface TemplateNotificacao {
  id: string;
  unidadeId: string;
  canalId: string;
  codigo: string;
  nome: string;
  descricao?: string;
  titulo?: string;
  mensagem: string;
  ativo: boolean;
  enviarAutomatico: boolean;
  tempoAntecedencia?: string;
  variaveis: string[];
  createdAt: string;
  updatedAt: string;
}

interface TemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  template?: TemplateNotificacao;
}

export default function TemplatePreviewDialog({
  open,
  onClose,
  template,
}: TemplatePreviewDialogProps) {
  const { processarVariaveis, obterVariaveisTemplate } = useNotificacaoHelpers();

  const [dadosPreview, setDadosPreview] = useState<Record<string, string>>({
    nomeCliente: 'João Silva',
    nomeUnidade: 'Barbearia Premium',
    nomeProfissional: 'Carlos Santos',
    nomeServico: 'Corte + Barba',
    dataHorario: '15/03/2024 às 14:30',
    horario: '14:30',
    descricaoPromocao: '20% OFF em todos os serviços',
    dataVencimento: '31/03/2024',
    novaDataHorario: '16/03/2024 às 15:00',
  });

  if (!template) return null;

  const getCanalIcon = (codigo: string) => {
    switch (codigo) {
      case 'whatsapp':
        return <WhatsApp color="success" />;
      case 'sms':
        return <Sms color="primary" />;
      case 'email':
        return <Email color="secondary" />;
      case 'push':
        return <Notifications color="info" />;
      default:
        return <PreviewIcon />;
    }
  };

  const getCanalColor = (codigo: string) => {
    switch (codigo) {
      case 'whatsapp':
        return '#25D366';
      case 'sms':
        return '#2196F3';
      case 'email':
        return '#9C27B0';
      case 'push':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const variaveisTemplate = obterVariaveisTemplate(template.codigo);
  const mensagemProcessada = processarVariaveis(template.mensagem, dadosPreview);
  const tituloProcessado = template.titulo ? processarVariaveis(template.titulo, dadosPreview) : '';

  const handleDadoChange = (campo: string, valor: string) => {
    setDadosPreview((prev) => ({ ...prev, [campo]: valor }));
  };

  const renderPreviewCard = () => {
    // Usando canalId para determinar o tipo de canal
    const canal = template.canalId;
    const corCanal = getCanalColor(canal);

    return (
      <Card variant="outlined" sx={{ border: `2px solid ${corCanal}` }}>
        <CardContent>
          {/* Header do Canal */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {getCanalIcon(canal)}
            <Typography variant="h6" sx={{ color: corCanal }}>
              Canal: {canal}
            </Typography>
          </Box>

          {/* Preview baseado no canal */}
          {canal === 'email' && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {tituloProcessado || 'Sem título'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {mensagemProcessada}
              </Typography>
            </Box>
          )}

          {canal === 'push' && (
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                p: 2,
                maxWidth: 300,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {tituloProcessado || 'Notificação'}
              </Typography>
              <Typography variant="body2">{mensagemProcessada}</Typography>
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Typography variant="caption" color="text.secondary">
                  agora
                </Typography>
              </Box>
            </Box>
          )}

          {(canal === 'whatsapp' || canal === 'sms') && (
            <Box
              sx={{
                backgroundColor: canal === 'whatsapp' ? '#E7FFDB' : '#E3F2FD',
                borderRadius: '18px 18px 4px 18px',
                p: 2,
                maxWidth: 300,
                marginLeft: 'auto',
                position: 'relative',
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {mensagemProcessada}
              </Typography>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} mt={1}>
                <Typography variant="caption" color="text.secondary">
                  14:30
                </Typography>
                {canal === 'whatsapp' && (
                  <Box component="span" sx={{ fontSize: '12px', color: '#4fc3f7' }}>
                    ✓✓
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PreviewIcon />
          Preview do Template: {template.nome}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Dados para Preview */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>
              Dados do Preview
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Typography variant="body2" color="text.secondary">
                Variáveis disponíveis:
              </Typography>
              {variaveisTemplate.map((variavel) => (
                <Chip
                  key={variavel}
                  label={variavel}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              {variaveisTemplate.map((variavel) => (
                <TextField
                  key={variavel}
                  label={variavel}
                  value={dadosPreview[variavel] || ''}
                  onChange={(e) => handleDadoChange(variavel, e.target.value)}
                  size="small"
                  fullWidth
                />
              ))}
            </Box>

            {/* Info do Template */}
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Informações do Template
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  <strong>Código:</strong> {template.codigo}
                </Typography>
                <Typography variant="body2">
                  <strong>Canal:</strong> {template.canalId}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong>{' '}
                  <Chip
                    label={template.ativo ? 'Ativo' : 'Inativo'}
                    size="small"
                    color={template.ativo ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Typography>
                <Typography variant="body2">
                  <strong>Envio Automático:</strong>{' '}
                  <Chip
                    label={template.enviarAutomatico ? 'Sim' : 'Não'}
                    size="small"
                    color={template.enviarAutomatico ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Typography>
                {template.tempoAntecedencia && (
                  <Typography variant="body2">
                    <strong>Antecedência:</strong> {template.tempoAntecedencia}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Preview */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>
              Preview da Mensagem
            </Typography>

            {renderPreviewCard()}

            {/* Template Original */}
            <Box mt={3}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  Template Original:
                </Typography>
                {template.titulo && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Título:</strong> {template.titulo}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  <strong>Mensagem:</strong> {template.mensagem}
                </Typography>
              </Alert>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
