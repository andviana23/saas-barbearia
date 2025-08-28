'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  useCreateTemplate,
  useUpdateTemplate,
  useNotificacaoHelpers,
} from '@/hooks/use-notificacoes';
import { useCurrentUnit } from '@/hooks/use-current-unit';
import { useNotifications } from '@/components/ui/NotificationSystem';

const TemplateFormSchema = z.object({
  canalId: z.string().min(1, 'Selecione um canal'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  titulo: z.string().optional(),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  ativo: z.boolean().default(true),
  enviarAutomatico: z.boolean().default(false),
  tempoAntecedencia: z.string().optional(),
});

type TemplateFormData = z.infer<typeof TemplateFormSchema>;

interface TemplateFormDialogProps {
  open: boolean;
  onClose: () => void;
  template?: any;
  canais: any[];
}

const templatesPadrao = [
  {
    codigo: 'agendamento_confirmado',
    nome: 'Agendamento Confirmado',
    descricao: 'Confirmação de agendamento para o cliente',
  },
  {
    codigo: 'lembrete_horario',
    nome: 'Lembrete de Agendamento',
    descricao: 'Lembrete enviado antes do agendamento',
  },
  {
    codigo: 'sua_vez_fila',
    nome: 'Sua Vez na Fila',
    descricao: 'Notificação quando é a vez do cliente na fila',
  },
  {
    codigo: 'promocao_desconto',
    nome: 'Promoção e Desconto',
    descricao: 'Notificação de promoções e descontos',
  },
  {
    codigo: 'reagendamento',
    nome: 'Reagendamento',
    descricao: 'Confirmação de reagendamento',
  },
  {
    codigo: 'cancelamento',
    nome: 'Cancelamento',
    descricao: 'Notificação de cancelamento',
  },
];

export default function TemplateFormDialog({
  open,
  onClose,
  template,
  canais,
}: TemplateFormDialogProps) {
  const { currentUnit } = useCurrentUnit();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const { addNotification } = useNotifications();
  const { obterVariaveisTemplate, validarTemplate } = useNotificacaoHelpers();

  const isEditing = !!template;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(TemplateFormSchema) as any,
    defaultValues: {
      canalId: template?.canal_id || '',
      codigo: template?.codigo || '',
      nome: template?.nome || '',
      descricao: template?.descricao || '',
      titulo: template?.titulo || '',
      mensagem: template?.mensagem || '',
      ativo: template?.ativo ?? true,
      enviarAutomatico: template?.enviar_automatico ?? false,
      tempoAntecedencia: template?.tempo_antecedencia || '',
    },
  });

  const watchedCodigo = watch('codigo');
  const watchedMensagem = watch('mensagem');

  React.useEffect(() => {
    if (open) {
      if (template) {
        reset({
          canalId: template.canal_id || '',
          codigo: template.codigo || '',
          nome: template.nome || '',
          descricao: template.descricao || '',
          titulo: template.titulo || '',
          mensagem: template.mensagem || '',
          ativo: template.ativo ?? true,
          enviarAutomatico: template.enviar_automatico ?? false,
          tempoAntecedencia: template.tempo_antecedencia || '',
        });
      } else {
        reset({
          canalId: '',
          codigo: '',
          nome: '',
          descricao: '',
          titulo: '',
          mensagem: '',
          ativo: true,
          enviarAutomatico: false,
          tempoAntecedencia: '',
        });
      }
    }
  }, [open, template, reset]);

  const handleTemplatePadraoSelect = (templatePadrao: any) => {
    setValue('codigo', templatePadrao.codigo);
    setValue('nome', templatePadrao.nome);
    setValue('descricao', templatePadrao.descricao);

    // Definir mensagem padrão baseada no código
    const variaveis = obterVariaveisTemplate(templatePadrao.codigo);
    const mensagemPadrao = gerarMensagemPadrao(templatePadrao.codigo, variaveis);
    setValue('mensagem', mensagemPadrao);
  };

  const gerarMensagemPadrao = (codigo: string, variaveis: string[]): string => {
    const mensagensPadrao: Record<string, string> = {
      agendamento_confirmado:
        'Olá {{nomeCliente}}! Seu agendamento foi confirmado para {{dataHorario}} com {{nomeProfissional}}. Serviço: {{nomeServico}}. Nos vemos em breve!',
      lembrete_horario:
        'Olá {{nomeCliente}}! Lembrando que você tem agendamento hoje às {{horario}} com {{nomeProfissional}}. Te esperamos na {{nomeUnidade}}!',
      sua_vez_fila:
        'Olá {{nomeCliente}}! É sua vez de ser atendido. Por favor, dirija-se ao {{nomeProfissional}}.',
      promocao_desconto:
        'Olá {{nomeCliente}}! Temos uma promoção especial para você: {{descricaoPromocao}}. Válida até {{dataVencimento}}. Agende já!',
      reagendamento:
        'Olá {{nomeCliente}}! Seu agendamento foi reagendado para {{novaDataHorario}} com {{nomeProfissional}}.',
      cancelamento:
        'Olá {{nomeCliente}}! Seu agendamento com {{nomeProfissional}} foi cancelado. Entre em contato conosco se precisar reagendar.',
    };

    return mensagensPadrao[codigo] || `Olá {{nomeCliente}}! Mensagem da {{nomeUnidade}}.`;
  };

  const onSubmit = async (data: TemplateFormData) => {
    if (!currentUnit) return;

    // Validar template
    const variaveis = obterVariaveisTemplate(data.codigo);
    const erros = validarTemplate(data.mensagem, variaveis);

    if (erros.length > 0) {
      addNotification({
        type: 'warning',
        title: 'Validação',
        message: `Problemas encontrados: ${erros.join(', ')}`,
      });
      // Continuar mesmo com avisos - são apenas sugestões
    }

    try {
      const templateData = {
        unidadeId: currentUnit.id,
        canalId: data.canalId,
        codigo: data.codigo,
        nome: data.nome,
        descricao: data.descricao,
        titulo: data.titulo,
        mensagem: data.mensagem,
        ativo: data.ativo,
        enviarAutomatico: data.enviarAutomatico,
        tempoAntecedencia: data.tempoAntecedencia,
        variaveis,
      };

      let result;
      if (isEditing) {
        result = await updateTemplate.mutateAsync({
          templateId: template.id,
          data: templateData,
        });
      } else {
        result = await createTemplate.mutateAsync(templateData);
      }

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: isEditing ? 'Template atualizado com sucesso' : 'Template criado com sucesso',
        });
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} template`,
      });
    }
  };

  const variaveisDisponiveis = obterVariaveisTemplate(watchedCodigo);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Template' : 'Novo Template'}</DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Templates Padrão (apenas para criação) */}
          {!isEditing && (
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Templates Padrão (clique para usar)
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {templatesPadrao.map((tp) => (
                  <Chip
                    key={tp.codigo}
                    label={tp.nome}
                    onClick={() => handleTemplatePadraoSelect(tp)}
                    clickable
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="canalId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.canalId}>
                    <InputLabel>Canal *</InputLabel>
                    <Select {...field} label="Canal *">
                      {canais.map((canal) => (
                        <MenuItem key={canal.id} value={canal.id}>
                          {canal.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="codigo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Código *"
                    placeholder="agendamento_confirmado"
                    error={!!errors.codigo}
                    helperText={errors.codigo?.message || 'Identificador único (sem espaços)'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nome *"
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="descricao"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Descrição" multiline rows={2} />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="titulo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Título (para Email e Push)"
                    helperText="Título da notificação (usado em emails e push notifications)"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="mensagem"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Mensagem *"
                    multiline
                    rows={4}
                    error={!!errors.mensagem}
                    helperText={
                      errors.mensagem?.message ||
                      'Use variáveis como {{nomeCliente}} para personalizar'
                    }
                  />
                )}
              />
            </Grid>

            {/* Variáveis Disponíveis */}
            {variaveisDisponiveis.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Variáveis Disponíveis:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {variaveisDisponiveis.map((variavel) => (
                    <Chip
                      key={variavel}
                      label={`{{${variavel}}}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Controller
                name="tempoAntecedencia"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tempo de Antecedência"
                    placeholder="2 hours, 30 minutes, 1 day"
                    helperText="Para lembretes automáticos (ex: 2 hours)"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Controller
                  name="ativo"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Template Ativo"
                    />
                  )}
                />

                <Controller
                  name="enviarAutomatico"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Envio Automático"
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Validação */}
          {watchedMensagem && variaveisDisponiveis.length > 0 && (
            <Box mt={2}>
              <Alert
                severity={
                  validarTemplate(watchedMensagem, variaveisDisponiveis).length > 0
                    ? 'warning'
                    : 'success'
                }
              >
                {validarTemplate(watchedMensagem, variaveisDisponiveis).length === 0
                  ? 'Template válido!'
                  : `Avisos: ${validarTemplate(watchedMensagem, variaveisDisponiveis).join(', ')}`}
              </Alert>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={createTemplate.isPending || updateTemplate.isPending}
        >
          {createTemplate.isPending || updateTemplate.isPending
            ? isEditing
              ? 'Salvando...'
              : 'Criando...'
            : isEditing
              ? 'Salvar'
              : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
