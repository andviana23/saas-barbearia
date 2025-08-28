'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';

// ===== SCHEMAS =====

const CreateTemplateSchema = z.object({
  unidadeId: z.string().uuid(),
  canalId: z.string().uuid(),
  codigo: z.string().min(1),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  titulo: z.string().optional(),
  mensagem: z.string().min(1),
  ativo: z.boolean().default(true),
  enviarAutomatico: z.boolean().default(false),
  tempoAntecedencia: z.string().optional(), // PostgreSQL interval format
  variaveis: z.array(z.string()).default([]),
});

const EnviarNotificacaoSchema = z.object({
  unidadeId: z.string().uuid(),
  templateId: z.string().uuid(),
  destinatario: z.object({
    tipo: z.enum(['cliente', 'profissional']),
    id: z.string().uuid(),
    contato: z.string().min(1), // telefone, email, etc.
  }),
  dadosContexto: z.record(z.string(), z.any()).default({}),
  prioridade: z.number().min(1).max(10).default(5),
  agendarPara: z.string().datetime().optional(),
});

const UpdatePreferenciasSchema = z.object({
  clienteId: z.string().uuid(),
  canalId: z.string().uuid(),
  aceitaNotificacao: z.boolean().default(true),
  aceitaPromocoes: z.boolean().default(true),
  aceitaLembretes: z.boolean().default(true),
  whatsappNumero: z.string().optional(),
  smsNumero: z.string().optional(),
  emailEndereco: z.string().email().optional(),
  pushSubscription: z.record(z.string(), z.any()).optional(),
});

// ===== TYPES =====

export type CreateTemplateData = z.infer<typeof CreateTemplateSchema>;
export type EnviarNotificacaoData = z.infer<typeof EnviarNotificacaoSchema>;
export type UpdatePreferenciasData = z.infer<typeof UpdatePreferenciasSchema>;

export interface NotificacaoActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface NotificacaoFilters {
  status?: string;
  canalId?: string;
  templateId?: string;
  clienteId?: string;
  dataInicio?: string;
  dataFim?: string;
  prioridade?: number;
}

// ===== CANAIS E TEMPLATES =====

export async function getCanaisNotificacao(): Promise<NotificacaoActionResult> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('canais_notificacao')
      .select('*')
      .eq('ativo', true)
      .order('ordem');

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao buscar canais de notificação',
    };
  }
}

export async function getTemplatesNotificacao(unidadeId: string): Promise<NotificacaoActionResult> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('templates_notificacao')
      .select(
        `
        *,
        canais_notificacao(nome, icone, codigo)
      `,
      )
      .eq('unidade_id', unidadeId)
      .order('codigo');

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao buscar templates',
    };
  }
}

export async function createTemplate(data: CreateTemplateData): Promise<NotificacaoActionResult> {
  try {
    const supabase = createServerSupabase();
    const validatedData = CreateTemplateSchema.parse(data);

    const templateData = {
      unit_id: validatedData.unidadeId,
      canal_id: validatedData.canalId,
      codigo: validatedData.codigo,
      nome: validatedData.nome,
      descricao: validatedData.descricao,
      titulo: validatedData.titulo,
      mensagem: validatedData.mensagem,
      ativo: validatedData.ativo,
      enviar_automatico: validatedData.enviarAutomatico,
      tempo_antecedencia: validatedData.tempoAntecedencia,
      variaveis: validatedData.variaveis,
    };

    const { data: template, error } = await supabase
      .from('templates_notificacao')
      .insert(templateData)
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/configuracoes/notificacoes');

    return {
      success: true,
      data: template,
      message: 'Template criado com sucesso',
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' };
    }

    return {
      success: false,
      error: error.message || 'Erro ao criar template',
    };
  }
}

export async function updateTemplate(
  templateId: string,
  data: Partial<CreateTemplateData>,
): Promise<NotificacaoActionResult> {
  try {
    const { data: template, error } = await createServerSupabase()
      .from('templates_notificacao')
      .update({
        nome: data.nome,
        descricao: data.descricao,
        titulo: data.titulo,
        mensagem: data.mensagem,
        ativo: data.ativo,
        enviar_automatico: data.enviarAutomatico,
        tempo_antecedencia: data.tempoAntecedencia,
        variaveis: data.variaveis,
      })
      .eq('id', templateId)
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/configuracoes/notificacoes');

    return {
      success: true,
      data: template,
      message: 'Template atualizado com sucesso',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao atualizar template',
    };
  }
}

// ===== PREFERÊNCIAS =====

export async function getPreferenciasCliente(clienteId: string): Promise<NotificacaoActionResult> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('preferencias_notificacao')
      .select(
        `
        *,
        canais_notificacao(nome, icone, codigo)
      `,
      )
      .eq('cliente_id', clienteId);

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao buscar preferências',
    };
  }
}

export async function updatePreferenciasCliente(
  data: UpdatePreferenciasData,
): Promise<NotificacaoActionResult> {
  try {
    const validatedData = UpdatePreferenciasSchema.parse(data);

    const preferenciasData = {
      cliente_id: validatedData.clienteId,
      canal_id: validatedData.canalId,
      aceita_notificacao: validatedData.aceitaNotificacao,
      aceita_promocoes: validatedData.aceitaPromocoes,
      aceita_lembretes: validatedData.aceitaLembretes,
      whatsapp_numero: validatedData.whatsappNumero,
      sms_numero: validatedData.smsNumero,
      email_endereco: validatedData.emailEndereco,
      push_subscription: validatedData.pushSubscription,
    };

    const { data: preferencias, error } = await createServerSupabase()
      .from('preferencias_notificacao')
      .upsert(preferenciasData)
      .select('*')
      .single();

    if (error) throw error;

    return {
      success: true,
      data: preferencias,
      message: 'Preferências atualizadas com sucesso',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao atualizar preferências',
    };
  }
}

// ===== ENVIO DE NOTIFICAÇÕES =====

export async function enviarNotificacao(
  data: EnviarNotificacaoData,
): Promise<NotificacaoActionResult> {
  try {
    const validatedData = EnviarNotificacaoSchema.parse(data);

    // Buscar o template
    const { data: template, error: templateError } = await createServerSupabase()
      .from('templates_notificacao')
      .select(
        `
        *,
        canais_notificacao(codigo, nome)
      `,
      )
      .eq('id', validatedData.templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Template não encontrado');
    }

    // Processar o conteúdo do template
    const { data: conteudoProcessado, error: processError } = await createServerSupabase().rpc(
      'processar_template',
      {
        template_mensagem: template.mensagem,
        dados: validatedData.dadosContexto,
      },
    );

    if (processError) {
      console.error('Erro ao processar template:', processError);
      // Fallback: usar mensagem original
    }

    const tituloProcessado = template.titulo
      ? await processarTexto(template.titulo, validatedData.dadosContexto)
      : undefined;

    // Criar item na fila
    const filaData = {
      unit_id: validatedData.unidadeId,
      cliente_id:
        validatedData.destinatario.tipo === 'cliente' ? validatedData.destinatario.id : null,
      destinatario: validatedData.destinatario,
      template_id: validatedData.templateId,
      canal_id: template.canal_id,
      titulo: tituloProcessado,
      mensagem: conteudoProcessado || template.mensagem,
      dados_contexto: validatedData.dadosContexto,
      prioridade: validatedData.prioridade,
      agendar_para: validatedData.agendarPara,
      status: validatedData.agendarPara ? 'agendado' : 'pendente',
      proximo_envio: validatedData.agendarPara || new Date().toISOString(),
    };

    const { data: filaItem, error: filaError } = await createServerSupabase()
      .from('fila_notificacoes')
      .insert(filaData)
      .select('*')
      .single();

    if (filaError) throw filaError;

    // Se não estiver agendado, tentar enviar imediatamente
    if (!validatedData.agendarPara) {
      await processarFilaNotificacoes();
    }

    return {
      success: true,
      data: filaItem,
      message: 'Notificação adicionada à fila com sucesso',
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' };
    }

    return {
      success: false,
      error: error.message || 'Erro ao enviar notificação',
    };
  }
}

// Helper para processar texto com variáveis
async function processarTexto(texto: string, dados: Record<string, any>): Promise<string> {
  let resultado = texto;

  for (const [chave, valor] of Object.entries(dados)) {
    const placeholder = `{{${chave}}}`;
    resultado = resultado.replace(new RegExp(placeholder, 'g'), String(valor));
  }

  return resultado;
}

// ===== PROCESSAMENTO DA FILA =====

export async function processarFilaNotificacoes(): Promise<NotificacaoActionResult> {
  try {
    // Buscar itens pendentes para envio
    const { data: itens, error } = await createServerSupabase()
      .from('fila_notificacoes')
      .select(
        `
        *,
        canais_notificacao(codigo, nome, configuracao),
        templates_notificacao(codigo, nome)
      `,
      )
      .in('status', ['pendente', 'erro'])
      .lte('proximo_envio', new Date().toISOString())
      .lt('tentativas', createServerSupabase().rpc('fila_notificacoes.max_tentativas'))
      .order('prioridade')
      .order('created_at')
      .limit(50); // Processar em lotes

    if (error) throw error;

    if (!itens || itens.length === 0) {
      return { success: true, message: 'Nenhum item na fila para processar' };
    }

    let processados = 0;
    let erros = 0;

    for (const item of itens) {
      try {
        // Marcar como enviando
        await createServerSupabase()
          .from('fila_notificacoes')
          .update({
            status: 'enviando',
            tentativas: item.tentativas + 1,
          })
          .eq('id', item.id);

        // Processar baseado no canal
        const sucesso = await enviarPorCanal(item);

        if (sucesso) {
          // Marcar como enviado
          await createServerSupabase()
            .from('fila_notificacoes')
            .update({
              status: 'enviado',
              enviado_em: new Date().toISOString(),
            })
            .eq('id', item.id);

          // Criar log de sucesso
          await createServerSupabase()
            .from('logs_notificacao')
            .insert({
              fila_id: item.id,
              evento: 'enviado',
              detalhes: { success: true },
            });

          processados++;
        } else {
          throw new Error('Falha no envio');
        }
      } catch (itemError: any) {
        erros++;

        // Calcular próximo envio (backoff exponencial)
        const proximoEnvio = new Date();
        proximoEnvio.setMinutes(proximoEnvio.getMinutes() + Math.pow(2, item.tentativas) * 5);

        // Atualizar status
        const novoStatus = item.tentativas + 1 >= item.max_tentativas ? 'erro' : 'pendente';

        await createServerSupabase()
          .from('fila_notificacoes')
          .update({
            status: novoStatus,
            erro_mensagem: itemError.message,
            proximo_envio: proximoEnvio.toISOString(),
          })
          .eq('id', item.id);

        // Criar log de erro
        await createServerSupabase()
          .from('logs_notificacao')
          .insert({
            fila_id: item.id,
            evento: 'falhou',
            detalhes: {
              error: itemError.message,
              tentativa: item.tentativas + 1,
            },
          });
      }
    }

    return {
      success: true,
      data: { processados, erros },
      message: `Processados: ${processados}, Erros: ${erros}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao processar fila',
    };
  }
}

// Simular envio por canal (implementar integrações reais)
async function enviarPorCanal(item: any): Promise<boolean> {
  const canal = item.canais_notificacao.codigo;

  try {
    switch (canal) {
      case 'whatsapp':
        // TODO: Implementar WhatsApp Business API
        console.log('Enviando WhatsApp:', {
          destinatario: item.destinatario.contato,
          mensagem: item.mensagem,
        });
        return true;

      case 'sms':
        // TODO: Implementar provedor de SMS
        console.log('Enviando SMS:', {
          destinatario: item.destinatario.contato,
          mensagem: item.mensagem,
        });
        return true;

      case 'email':
        // TODO: Implementar SMTP
        console.log('Enviando Email:', {
          destinatario: item.destinatario.contato,
          titulo: item.titulo,
          mensagem: item.mensagem,
        });
        return true;

      case 'push':
        // TODO: Implementar Push Notifications
        console.log('Enviando Push:', {
          titulo: item.titulo,
          mensagem: item.mensagem,
        });
        return true;

      default:
        throw new Error(`Canal ${canal} não suportado`);
    }
  } catch (error) {
    console.error(`Erro ao enviar via ${canal}:`, error);
    return false;
  }
}

// ===== RELATÓRIOS =====

export async function getFilaNotificacoes(
  unidadeId: string,
  filters: NotificacaoFilters = {},
): Promise<NotificacaoActionResult> {
  try {
    const supabase = createServerSupabase();
    let query = supabase
      .from('view_relatorio_notificacoes')
      .select('*')
      .eq('unidade_id', unidadeId);

    // Aplicar filtros
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.canalId) {
      query = query.eq('canal_id', filters.canalId);
    }
    if (filters.templateId) {
      query = query.eq('template_id', filters.templateId);
    }
    if (filters.clienteId) {
      query = query.eq('cliente_id', filters.clienteId);
    }
    if (filters.dataInicio) {
      query = query.gte('created_at', filters.dataInicio);
    }
    if (filters.dataFim) {
      query = query.lte('created_at', filters.dataFim);
    }
    if (filters.prioridade) {
      query = query.eq('prioridade', filters.prioridade);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao buscar fila de notificações',
    };
  }
}

export async function getMetricasNotificacoes(
  unidadeId: string,
  dataInicio: string,
  dataFim: string,
): Promise<NotificacaoActionResult> {
  try {
    const { data: notificacoes, error } = await createServerSupabase()
      .from('view_relatorio_notificacoes')
      .select('*')
      .eq('unidade_id', unidadeId)
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim);

    if (error) throw error;

    // Calcular métricas
    const total = notificacoes?.length || 0;
    const enviadas = notificacoes?.filter((n) => n.status === 'enviado').length || 0;
    const pendentes = notificacoes?.filter((n) => n.status === 'pendente').length || 0;
    const erros = notificacoes?.filter((n) => n.status === 'erro').length || 0;
    const taxaSuccesso = total > 0 ? (enviadas / total) * 100 : 0;

    // Por canal
    const porCanal =
      notificacoes?.reduce((acc, n) => {
        const canal = n.canal_nome;
        if (!acc[canal]) {
          acc[canal] = { nome: canal, total: 0, enviadas: 0, erros: 0 };
        }
        acc[canal].total++;
        if (n.status === 'enviado') acc[canal].enviadas++;
        if (n.status === 'erro') acc[canal].erros++;
        return acc;
      }, {} as any) || {};

    // Por template
    const porTemplate =
      notificacoes?.reduce((acc, n) => {
        const template = n.template_nome;
        if (!acc[template]) {
          acc[template] = { nome: template, total: 0, enviadas: 0 };
        }
        acc[template].total++;
        if (n.status === 'enviado') acc[template].enviadas++;
        return acc;
      }, {} as any) || {};

    return {
      success: true,
      data: {
        resumo: {
          total,
          enviadas,
          pendentes,
          erros,
          taxaSuccesso: Math.round(taxaSuccesso * 100) / 100,
        },
        porCanal: Object.values(porCanal),
        porTemplate: Object.values(porTemplate),
        notificacoes: notificacoes || [],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao gerar métricas de notificações',
    };
  }
}

// ===== TEMPLATES PADRÃO =====

export async function criarTemplatesPadrao(unidadeId: string): Promise<NotificacaoActionResult> {
  try {
    const { data: canais } = await getCanaisNotificacao();

    if (!canais || canais.length === 0) {
      throw new Error('Nenhum canal de notificação encontrado');
    }

    const templatesPadrao = [
      {
        codigo: 'agendamento_confirmado',
        nome: 'Agendamento Confirmado',
        titulo: 'Agendamento Confirmado - {{nomeUnidade}}',
        mensagem:
          'Olá {{nomeCliente}}! Seu agendamento foi confirmado para {{dataHorario}} com {{nomeProfissional}}. Serviço: {{nomeServico}}. Nos vemos em breve!',
        variaveis: ['nomeCliente', 'dataHorario', 'nomeProfissional', 'nomeServico', 'nomeUnidade'],
        enviarAutomatico: true,
      },
      {
        codigo: 'lembrete_horario',
        nome: 'Lembrete de Agendamento',
        titulo: 'Lembrete - Seu agendamento é hoje!',
        mensagem:
          'Olá {{nomeCliente}}! Lembrando que você tem agendamento hoje às {{horario}} com {{nomeProfissional}}. Te esperamos na {{nomeUnidade}}!',
        variaveis: ['nomeCliente', 'horario', 'nomeProfissional', 'nomeUnidade'],
        enviarAutomatico: true,
        tempoAntecedencia: '2 hours',
      },
      {
        codigo: 'sua_vez_fila',
        nome: 'Sua Vez na Fila',
        titulo: 'É sua vez!',
        mensagem:
          'Olá {{nomeCliente}}! É sua vez de ser atendido. Por favor, dirija-se ao {{nomeProfissional}}.',
        variaveis: ['nomeCliente', 'nomeProfissional'],
        enviarAutomatico: true,
      },
      {
        codigo: 'promocao_desconto',
        nome: 'Promoção e Desconto',
        titulo: 'Promoção Especial - {{nomeUnidade}}',
        mensagem:
          'Olá {{nomeCliente}}! Temos uma promoção especial para você: {{descricaoPromocao}}. Válida até {{dataVencimento}}. Agende já!',
        variaveis: ['nomeCliente', 'descricaoPromocao', 'dataVencimento', 'nomeUnidade'],
        enviarAutomatico: false,
      },
    ];

    const templatesCreated = [];

    for (const canal of canais) {
      for (const templateBase of templatesPadrao) {
        try {
          const templateData = {
            ...templateBase,
            unidadeId,
            canalId: canal.id,
            descricao: `Template padrão para ${canal.nome}`,
            ativo: true,
          };

          const result = await createTemplate(templateData);
          if (result.success) {
            templatesCreated.push(result.data);
          }
        } catch (error) {
          // Ignorar erros de duplicação (template já existe)
          console.log(`Template ${templateBase.codigo} já existe para canal ${canal.nome}`);
        }
      }
    }

    return {
      success: true,
      data: templatesCreated,
      message: `${templatesCreated.length} templates criados`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao criar templates padrão',
    };
  }
}
