// Sistema de Microcópias - Sistema Trato
// Princípios de usabilidade e feedback consistente

export interface MicrocopyConfig {
  tone: 'formal' | 'friendly' | 'professional';
  language: 'pt-BR' | 'en';
  showEmojis: boolean;
}

export const DEFAULT_MICROCOPY_CONFIG: MicrocopyConfig = {
  tone: 'friendly',
  language: 'pt-BR',
  showEmojis: true,
};

// Microcópias para formulários
export const formMicrocopy = {
  // Campos obrigatórios
  required: {
    label: 'Campo obrigatório',
    helper: 'Este campo é necessário para continuar',
    error: 'Por favor, preencha este campo',
  },

  // Validações
  validation: {
    email: {
      error: 'Digite um email válido',
      success: 'Email válido',
    },
    phone: {
      error: 'Digite um telefone válido',
      success: 'Telefone válido',
    },
    cnpj: {
      error: 'Digite um CNPJ válido',
      success: 'CNPJ válido',
    },
  },

  // Ações
  actions: {
    save: 'Salvar alterações',
    saveSuccess: 'Alterações salvas com sucesso!',
    saveError: 'Erro ao salvar. Tente novamente.',

    delete: 'Excluir item',
    deleteConfirm: 'Tem certeza que deseja excluir?',
    deleteSuccess: 'Item excluído com sucesso!',
    deleteError: 'Erro ao excluir. Tente novamente.',

    cancel: 'Cancelar',
    cancelConfirm: 'Deseja cancelar? Alterações não salvas serão perdidas.',

    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
  },
};

// Microcópias para tabelas
export const tableMicrocopy = {
  // Estados vazios
  empty: {
    noData: 'Nenhum resultado encontrado',
    noDataWithFilter: 'Nenhum resultado para os filtros aplicados',
    noDataWithSearch: 'Nenhum resultado para a busca realizada',
    loading: 'Carregando dados...',
    error: 'Erro ao carregar dados',
  },

  // Paginação
  pagination: {
    page: 'Página',
    of: 'de',
    showing: 'Mostrando',
    to: 'até',
    ofTotal: 'de um total de',
    items: 'itens',
    perPage: 'por página',
  },

  // Ações
  actions: {
    edit: 'Editar',
    delete: 'Excluir',
    view: 'Visualizar',
    select: 'Selecionar',
    selectAll: 'Selecionar todos',
    deselectAll: 'Desmarcar todos',
  },

  // Filtros
  filters: {
    apply: 'Aplicar filtros',
    clear: 'Limpar filtros',
    active: 'Filtros ativos',
    noFilters: 'Nenhum filtro aplicado',
  },
};

// Microcópias para notificações
export const notificationMicrocopy = {
  // Sucesso
  success: {
    created: 'Item criado com sucesso!',
    updated: 'Item atualizado com sucesso!',
    deleted: 'Item excluído com sucesso!',
    saved: 'Alterações salvas com sucesso!',
    action: 'Ação realizada com sucesso!',
  },

  // Erro
  error: {
    general: 'Ocorreu um erro. Tente novamente.',
    network: 'Erro de conexão. Verifique sua internet.',
    validation: 'Verifique os dados informados.',
    permission: 'Você não tem permissão para esta ação.',
    notFound: 'Item não encontrado.',
    server: 'Erro no servidor. Tente novamente mais tarde.',
  },

  // Aviso
  warning: {
    unsavedChanges: 'Você tem alterações não salvas.',
    deleteConfirm: 'Esta ação não pode ser desfeita.',
    sessionExpiring: 'Sua sessão expira em breve.',
    dataLoss: 'Dados não salvos serão perdidos.',
  },

  // Informação
  info: {
    processing: 'Processando...',
    loading: 'Carregando...',
    noResults: 'Nenhum resultado encontrado.',
    help: 'Precisa de ajuda? Consulte a documentação.',
  },
};

// Microcópias para agendamentos
export const appointmentMicrocopy = {
  // Status
  status: {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    inProgress: 'Em andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    noShow: 'Não compareceu',
  },

  // Ações
  actions: {
    schedule: 'Agendar horário',
    reschedule: 'Reagendar',
    cancel: 'Cancelar agendamento',
    confirm: 'Confirmar agendamento',
    start: 'Iniciar atendimento',
    finish: 'Finalizar atendimento',
  },

  // Mensagens
  messages: {
    slotAvailable: 'Horário disponível',
    slotUnavailable: 'Horário indisponível',
    conflict: 'Conflito de horário detectado',
    reminder: 'Lembrete: seu agendamento é em',
    confirmation: 'Agendamento confirmado para',
  },
};

// Microcópias para fila
export const queueMicrocopy = {
  // Status
  status: {
    waiting: 'Aguardando',
    called: 'Chamado',
    inService: 'Em atendimento',
    completed: 'Atendimento concluído',
    cancelled: 'Cancelado',
  },

  // Mensagens
  messages: {
    position: 'Sua posição na fila:',
    estimatedTime: 'Tempo estimado de espera:',
    nextInLine: 'Próximo da fila',
    called: 'Chamando próximo cliente',
    priority: 'Cliente prioritário',
  },
};

// Microcópias para financeiro
export const financialMicrocopy = {
  // Status
  status: {
    pending: 'Pendente',
    paid: 'Pago',
    overdue: 'Vencido',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  },

  // Mensagens
  messages: {
    balance: 'Saldo atual:',
    dueDate: 'Data de vencimento:',
    paymentMethod: 'Forma de pagamento:',
    receipt: 'Recibo gerado',
    invoice: 'Fatura emitida',
  },
};

// Função para aplicar configurações de microcópias
export function applyMicrocopyConfig(
  text: string,
  config: MicrocopyConfig = DEFAULT_MICROCOPY_CONFIG,
): string {
  let result = text;

  // Aplicar tom
  if (config.tone === 'formal') {
    result = result.replace(/!/g, '.');
    result = result.replace(/😊/g, '');
  }

  // Aplicar idioma
  if (config.language === 'en') {
    // Traduções básicas (em produção usar i18n)
    result = result.replace(/Salvar/g, 'Save');
    result = result.replace(/Cancelar/g, 'Cancel');
    result = result.replace(/Erro/g, 'Error');
  }

  // Aplicar emojis
  if (!config.showEmojis) {
    result = result.replace(/[😊✅❌⚠️]/g, '');
  }

  return result;
}

// Hook para usar microcópias
export function useMicrocopy(config?: MicrocopyConfig) {
  const microcopyConfig = config || DEFAULT_MICROCOPY_CONFIG;

  const getText = (key: string, category: keyof typeof formMicrocopy) => {
    const categoryData = formMicrocopy[category] as any;
    const text = categoryData[key] || key;
    return applyMicrocopyConfig(text, microcopyConfig);
  };

  return {
    getText,
    config: microcopyConfig,
  };
}
