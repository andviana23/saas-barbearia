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
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
  WhatsApp,
  Sms,
  Email,
  Notifications,
} from '@mui/icons-material';

import EmptyState from '@/components/ui/EmptyState';
import {
  useTemplatesNotificacao,
  useCanaisNotificacao,
  useUpdateTemplate,
} from '@/hooks/use-notificacoes';
import { useNotifications } from '@/components/ui/NotificationSystem';
import TemplateFormDialog from './TemplateFormDialog';
import TemplatePreviewDialog from './TemplatePreviewDialog';

export default function TemplatesTab() {
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { data: templates, isLoading } = useTemplatesNotificacao();
  const { data: canais } = useCanaisNotificacao();
  const updateTemplate = useUpdateTemplate();
  const { addNotification } = useNotifications();

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
        return null;
    }
  };

  const getCanalColor = (codigo: string): 'success' | 'primary' | 'secondary' | 'info' => {
    switch (codigo) {
      case 'whatsapp':
        return 'success';
      case 'sms':
        return 'primary';
      case 'email':
        return 'secondary';
      case 'push':
        return 'info';
      default:
        return 'primary';
    }
  };

  const handleToggleAtivo = async (template: any) => {
    try {
      const result = await updateTemplate.mutateAsync({
        templateId: template.id,
        data: { ativo: !template.ativo },
      });

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: `Template ${template.ativo ? 'desativado' : 'ativado'} com sucesso`,
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao atualizar template',
      });
    }
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setFormOpen(true);
  };

  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTemplate(null);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedTemplate(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>Carregando templates...</Typography>
      </Box>
    );
  }

  if (!templates?.data || templates.data.length === 0) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Templates de Notificação</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
            Novo Template
          </Button>
        </Box>

        <EmptyState
          title="Nenhum template encontrado"
          description="Crie templates para enviar notificações personalizadas aos seus clientes"
          action={{
            label: 'Criar Primeiro Template',
            onClick: handleCreateNew,
          }}
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          {/* prettier-ignore */}
          <Typography variant="body2">
            <strong>Dica:</strong> Use o botão &quot;Criar Templates Padrão&quot; no cabeçalho da página para criar templates prontos para agendamento, lembretes e promoções.
          </Typography>
        </Alert>

        <TemplateFormDialog
          open={formOpen}
          onClose={handleCloseForm}
          template={selectedTemplate}
          canais={canais?.data || []}
        />
      </Box>
    );
  }

  // Agrupar templates por código
  const templatesPorCodigo = templates.data.reduce(
    (acc: Record<string, any[]>, template: any) => {
      if (!acc[template.codigo]) {
        acc[template.codigo] = [];
      }
      acc[template.codigo].push(template);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Templates de Notificação ({templates.data.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Novo Template
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        {/* prettier-ignore */}
        <Typography variant="body2">
          Os templates são organizados por tipo (código) e podem ser configurados para diferentes canais. Use variáveis como <code>{'{{nomeCliente}}'}</code> para personalizar as mensagens.
        </Typography>
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Template</TableCell>
              <TableCell>Canal</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Envio Automático</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.data.map((template: any) => (
              <TableRow key={template.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{template.nome}</Typography>
                    {template.descricao && (
                      <Typography variant="caption" color="text.secondary">
                        {template.descricao}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getCanalIcon(template.canais_notificacao?.codigo)}
                    <Chip
                      label={template.canais_notificacao?.nome}
                      size="small"
                      color={getCanalColor(template.canais_notificacao?.codigo)}
                      variant="outlined"
                    />
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip label={template.codigo} size="small" variant="outlined" />
                </TableCell>

                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={template.ativo}
                        onChange={() => handleToggleAtivo(template)}
                        size="small"
                      />
                    }
                    label={template.ativo ? 'Ativo' : 'Inativo'}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={template.enviar_automatico ? 'Sim' : 'Não'}
                    size="small"
                    color={template.enviar_automatico ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handlePreviewTemplate(template)}
                      title="Visualizar"
                    >
                      <PreviewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditTemplate(template)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TemplateFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        template={selectedTemplate}
        canais={canais?.data || []}
      />

      <TemplatePreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        template={selectedTemplate}
      />
    </Box>
  );
}
