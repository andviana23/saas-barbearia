'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUnit } from './use-current-unit';
import {
  getCanaisNotificacao,
  getTemplatesNotificacao,
  createTemplate,
  updateTemplate,
  getPreferenciasCliente,
  updatePreferenciasCliente,
  enviarNotificacao,
  processarFilaNotificacoes,
  getFilaNotificacoes,
  getMetricasNotificacoes,
  criarTemplatesPadrao,
  type CreateTemplateData,
  type EnviarNotificacaoData,
  type UpdatePreferenciasData,
  type NotificacaoFilters,
} from '@/actions/notificacoes';

// ===== KEYS =====
const NOTIFICACOES_KEYS = {
  all: ['notificacoes'] as const,
  canais: () => [...NOTIFICACOES_KEYS.all, 'canais'] as const,
  templates: () => [...NOTIFICACOES_KEYS.all, 'templates'] as const,
  templatesByUnit: (unidadeId: string) => [...NOTIFICACOES_KEYS.templates(), unidadeId] as const,
  preferencias: () => [...NOTIFICACOES_KEYS.all, 'preferencias'] as const,
  preferenciasCliente: (clienteId: string) =>
    [...NOTIFICACOES_KEYS.preferencias(), clienteId] as const,
  fila: () => [...NOTIFICACOES_KEYS.all, 'fila'] as const,
  filaByUnit: (unidadeId: string, filters?: NotificacaoFilters) =>
    [...NOTIFICACOES_KEYS.fila(), unidadeId, filters] as const,
  metricas: (unidadeId: string, dataInicio: string, dataFim: string) =>
    [...NOTIFICACOES_KEYS.all, 'metricas', unidadeId, dataInicio, dataFim] as const,
};

// ===== QUERIES =====

export function useCanaisNotificacao() {
  return useQuery({
    queryKey: NOTIFICACOES_KEYS.canais(),
    queryFn: getCanaisNotificacao,
    staleTime: 300000, // 5 minutos (canais não mudam frequentemente)
  });
}

export function useTemplatesNotificacao() {
  const { currentUnit } = useCurrentUnit();

  return useQuery({
    queryKey: NOTIFICACOES_KEYS.templatesByUnit(currentUnit?.id || ''),
    queryFn: () => getTemplatesNotificacao(currentUnit?.id || ''),
    enabled: !!currentUnit?.id,
    staleTime: 60000, // 1 minuto
  });
}

export function usePreferenciasCliente(clienteId: string) {
  return useQuery({
    queryKey: NOTIFICACOES_KEYS.preferenciasCliente(clienteId),
    queryFn: () => getPreferenciasCliente(clienteId),
    enabled: !!clienteId,
    staleTime: 300000, // 5 minutos
  });
}

export function useFilaNotificacoes(filters: NotificacaoFilters = {}) {
  const { currentUnit } = useCurrentUnit();

  return useQuery({
    queryKey: NOTIFICACOES_KEYS.filaByUnit(currentUnit?.id || '', filters),
    queryFn: () => getFilaNotificacoes(currentUnit?.id || '', filters),
    enabled: !!currentUnit?.id,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Atualizar a cada minuto
  });
}

export function useMetricasNotificacoes(dataInicio: string, dataFim: string) {
  const { currentUnit } = useCurrentUnit();

  return useQuery({
    queryKey: NOTIFICACOES_KEYS.metricas(currentUnit?.id || '', dataInicio, dataFim),
    queryFn: () => getMetricasNotificacoes(currentUnit?.id || '', dataInicio, dataFim),
    enabled: !!currentUnit?.id && !!dataInicio && !!dataFim,
    staleTime: 60000, // 1 minuto
  });
}

// ===== MUTATIONS =====

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { currentUnit } = useCurrentUnit();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICACOES_KEYS.templatesByUnit(currentUnit?.id || ''),
      });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const { currentUnit } = useCurrentUnit();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Partial<CreateTemplateData> }) =>
      updateTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICACOES_KEYS.templatesByUnit(currentUnit?.id || ''),
      });
    },
  });
}

export function useUpdatePreferenciasCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferenciasCliente,
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICACOES_KEYS.preferenciasCliente(variables.clienteId),
      });
    },
  });
}

export function useEnviarNotificacao() {
  const queryClient = useQueryClient();
  const { currentUnit } = useCurrentUnit();

  return useMutation({
    mutationFn: enviarNotificacao,
    onSuccess: () => {
      // Invalidar fila para mostrar nova notificação
      queryClient.invalidateQueries({
        queryKey: NOTIFICACOES_KEYS.filaByUnit(currentUnit?.id || ''),
      });
    },
  });
}

export function useProcessarFila() {
  const queryClient = useQueryClient();
  const { currentUnit } = useCurrentUnit();

  return useMutation({
    mutationFn: processarFilaNotificacoes,
    onSuccess: () => {
      // Invalidar fila e métricas
      queryClient.invalidateQueries({ queryKey: NOTIFICACOES_KEYS.fila() });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'notificacoes' && query.queryKey[1] === 'metricas',
      });
    },
  });
}

export function useCriarTemplatesPadrao() {
  const queryClient = useQueryClient();
  const { currentUnit } = useCurrentUnit();

  return useMutation({
    mutationFn: () => criarTemplatesPadrao(currentUnit?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICACOES_KEYS.templatesByUnit(currentUnit?.id || ''),
      });
    },
  });
}

// ===== HELPERS =====

export function useNotificacaoHelpers() {
  const { data: canais } = useCanaisNotificacao();

  const getCanalPorCodigo = (codigo: string) => {
    return canais?.data?.find((canal: any) => canal.codigo === codigo);
  };

  const formatarStatus = (status: string) => {
    const statusMap = {
      pendente: { label: 'Pendente', color: 'warning' as const },
      enviando: { label: 'Enviando', color: 'info' as const },
      enviado: { label: 'Enviado', color: 'success' as const },
      erro: { label: 'Erro', color: 'error' as const },
      cancelado: { label: 'Cancelado', color: 'default' as const },
      agendado: { label: 'Agendado', color: 'primary' as const },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        color: 'default' as const,
      }
    );
  };

  const formatarPrioridade = (prioridade: number) => {
    if (prioridade <= 3) return { label: 'Alta', color: 'error' as const };
    if (prioridade <= 6) return { label: 'Média', color: 'warning' as const };
    return { label: 'Baixa', color: 'success' as const };
  };

  const formatarTempo = (timestamp: string) => {
    const data = new Date(timestamp);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));

    if (diffMinutos < 1) return 'agora';
    if (diffMinutos < 60) return `${diffMinutos}m atrás`;

    const diffHoras = Math.floor(diffMinutos / 60);
    if (diffHoras < 24) return `${diffHoras}h atrás`;

    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias}d atrás`;
  };

  const obterVariaveisTemplate = (codigo: string): string[] => {
    const variaveisPadrao: Record<string, string[]> = {
      agendamento_confirmado: [
        'nomeCliente',
        'dataHorario',
        'nomeProfissional',
        'nomeServico',
        'nomeUnidade',
      ],
      lembrete_horario: ['nomeCliente', 'horario', 'nomeProfissional', 'nomeUnidade'],
      sua_vez_fila: ['nomeCliente', 'nomeProfissional'],
      promocao_desconto: ['nomeCliente', 'descricaoPromocao', 'dataVencimento', 'nomeUnidade'],
    };

    return variaveisPadrao[codigo] || ['nomeCliente', 'nomeUnidade'];
  };

  const processarVariaveis = (texto: string, dados: Record<string, any>): string => {
    let resultado = texto;

    for (const [chave, valor] of Object.entries(dados)) {
      const placeholder = `{{${chave}}}`;
      resultado = resultado.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        String(valor || ''),
      );
    }

    // Remover variáveis não substituídas
    resultado = resultado.replace(/\{\{[^}]+\}\}/g, '');

    return resultado;
  };

  const validarTemplate = (mensagem: string, variaveis: string[]): string[] => {
    const erros: string[] = [];

    if (!mensagem.trim()) {
      erros.push('Mensagem não pode estar vazia');
    }

    // Verificar se todas as variáveis declaradas estão sendo usadas
    for (const variavel of variaveis) {
      const placeholder = `{{${variavel}}}`;
      if (!mensagem.includes(placeholder)) {
        erros.push(`Variável ${variavel} não está sendo usada na mensagem`);
      }
    }

    // Verificar se há variáveis na mensagem que não estão declaradas
    const variaveisUsadas = mensagem.match(/\{\{([^}]+)\}\}/g) || [];
    for (const variavel of variaveisUsadas) {
      const nomeVariavel = variavel.replace(/[{}]/g, '');
      if (!variaveis.includes(nomeVariavel)) {
        erros.push(`Variável ${nomeVariavel} não está declarada`);
      }
    }

    return erros;
  };

  const calcularProximoEnvio = (tentativas: number): Date => {
    const agora = new Date();
    // Backoff exponencial: 5min, 10min, 20min, 40min...
    const delayMinutos = Math.pow(2, tentativas) * 5;
    agora.setMinutes(agora.getMinutes() + delayMinutos);
    return agora;
  };

  return {
    getCanalPorCodigo,
    formatarStatus,
    formatarPrioridade,
    formatarTempo,
    obterVariaveisTemplate,
    processarVariaveis,
    validarTemplate,
    calcularProximoEnvio,
  };
}

// ===== TEMPLATES RÁPIDOS =====

export function useEnvioRapido() {
  const enviarNotificacao = useEnviarNotificacao();
  const { currentUnit } = useCurrentUnit();

  const enviarConfirmacaoAgendamento = async (dados: {
    clienteId: string;
    nomeCliente: string;
    dataHorario: string;
    nomeProfissional: string;
    nomeServico: string;
    contato: string;
  }) => {
    if (!currentUnit) return;

    return enviarNotificacao.mutateAsync({
      unidadeId: currentUnit.id,
      templateId: 'agendamento_confirmado', // Será resolvido pelo código
      destinatario: {
        tipo: 'cliente',
        id: dados.clienteId,
        contato: dados.contato,
      },
      dadosContexto: {
        nomeCliente: dados.nomeCliente,
        dataHorario: dados.dataHorario,
        nomeProfissional: dados.nomeProfissional,
        nomeServico: dados.nomeServico,
        nomeUnidade: currentUnit.name,
      },
      prioridade: 2, // Alta prioridade para confirmações
    });
  };

  const enviarLembreteAgendamento = async (dados: {
    clienteId: string;
    nomeCliente: string;
    horario: string;
    nomeProfissional: string;
    contato: string;
  }) => {
    if (!currentUnit) return;

    return enviarNotificacao.mutateAsync({
      unidadeId: currentUnit.id,
      templateId: 'lembrete_horario',
      destinatario: {
        tipo: 'cliente',
        id: dados.clienteId,
        contato: dados.contato,
      },
      dadosContexto: {
        nomeCliente: dados.nomeCliente,
        horario: dados.horario,
        nomeProfissional: dados.nomeProfissional,
        nomeUnidade: currentUnit.name,
      },
      prioridade: 3,
    });
  };

  const enviarChamadaFila = async (dados: {
    clienteId: string;
    nomeCliente: string;
    nomeProfissional: string;
    contato: string;
  }) => {
    if (!currentUnit) return;

    return enviarNotificacao.mutateAsync({
      unidadeId: currentUnit.id,
      templateId: 'sua_vez_fila',
      destinatario: {
        tipo: 'cliente',
        id: dados.clienteId,
        contato: dados.contato,
      },
      dadosContexto: {
        nomeCliente: dados.nomeCliente,
        nomeProfissional: dados.nomeProfissional,
      },
      prioridade: 1, // Máxima prioridade para fila
    });
  };

  const enviarPromocao = async (dados: {
    clienteId: string;
    nomeCliente: string;
    descricaoPromocao: string;
    dataVencimento: string;
    contato: string;
    agendarPara?: string;
  }) => {
    if (!currentUnit) return;

    return enviarNotificacao.mutateAsync({
      unidadeId: currentUnit.id,
      templateId: 'promocao_desconto',
      destinatario: {
        tipo: 'cliente',
        id: dados.clienteId,
        contato: dados.contato,
      },
      dadosContexto: {
        nomeCliente: dados.nomeCliente,
        descricaoPromocao: dados.descricaoPromocao,
        dataVencimento: dados.dataVencimento,
        nomeUnidade: currentUnit.name,
      },
      prioridade: 7, // Baixa prioridade para promoções
      agendarPara: dados.agendarPara,
    });
  };

  return {
    enviarConfirmacaoAgendamento,
    enviarLembreteAgendamento,
    enviarChamadaFila,
    enviarPromocao,
    isLoading: enviarNotificacao.isPending,
  };
}
