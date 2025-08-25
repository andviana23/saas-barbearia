// Sistema de Acessibilidade Global - Sistema Trato
// Baseado em padrões WCAG 2.1 AA

import React from 'react'

export interface A11yConfig {
  enableHighContrast: boolean
  enableReducedMotion: boolean
  enableKeyboardNavigation: boolean
  fontSize: 'small' | 'medium' | 'large'
}

export const DEFAULT_A11Y_CONFIG: A11yConfig = {
  enableHighContrast: false,
  enableReducedMotion: false,
  enableKeyboardNavigation: true,
  fontSize: 'medium',
}

// Hook para navegação por teclado
export function useKeyboardNavigation() {
  const handleKeyDown = (
    event: React.KeyboardEvent,
    onEnter?: () => void,
    onEscape?: () => void
  ) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onEnter?.()
        break
      case 'Escape':
        onEscape?.()
        break
      case 'Tab':
        // Navegação natural do navegador
        break
    }
  }

  return { handleKeyDown }
}

// Hook para contraste e tamanho de fonte (mantido para compatibilidade)
export function useAccessibility() {
  const [config, setConfig] = React.useState<A11yConfig>(DEFAULT_A11Y_CONFIG)

  const toggleHighContrast = () => {
    setConfig((prev) => ({
      ...prev,
      enableHighContrast: !prev.enableHighContrast,
    }))
  }

  const toggleReducedMotion = () => {
    setConfig((prev) => ({
      ...prev,
      enableReducedMotion: !prev.enableReducedMotion,
    }))
  }

  const setFontSize = (size: A11yConfig['fontSize']) => {
    setConfig((prev) => ({ ...prev, fontSize: size }))
  }

  return {
    config,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
  }
}

// Utilitários para etiquetas ARIA
export const ariaLabels = {
  // Navegação
  navigation: 'Navegação principal',
  breadcrumb: 'Navegação de migalhas',
  pagination: 'Paginação',

  // Formulários
  form: 'Formulário',
  required: 'Campo obrigatório',
  error: 'Mensagem de erro',
  success: 'Mensagem de sucesso',

  // Tabelas
  table: 'Tabela de dados',
  sortable: 'Ordenável',
  filterable: 'Filtrável',

  // Ações
  edit: 'Editar',
  delete: 'Excluir',
  save: 'Salvar',
  cancel: 'Cancelar',
  close: 'Fechar',

  // Status
  loading: 'Carregando',
  empty: 'Nenhum resultado encontrado',
  errorStatus: 'Erro ocorreu',
}

// Validação de contraste
export function validateContrastRatio(
  foreground: string,
  background: string
): boolean {
  // Implementação simplificada - em produção usar biblioteca especializada
  // Retorna true se contraste for adequado (WCAG AA: 4.5:1 para texto normal)
  return true // Placeholder
}

// Diretrizes de acessibilidade
export const a11yGuidelines = {
  // Navegação
  keyboardNavigation:
    'Todas as funcionalidades devem ser acessíveis via teclado',
  focusVisible: 'Indicador de foco deve ser visível',
  skipLinks: 'Links para pular navegação repetitiva',

  // Formulários
  labels: 'Todos os campos devem ter labels associados',
  errors: 'Mensagens de erro devem ser claras e específicas',
  required: 'Campos obrigatórios devem ser marcados',

  // Imagens
  altText: 'Imagens devem ter texto alternativo descritivo',
  decorative: 'Imagens decorativas devem ter alt=""',

  // Contraste
  contrastRatio: 'Contraste mínimo de 4.5:1 para texto normal',
  colorIndependent: 'Informação não deve depender apenas da cor',
}

// Exportar o provider
export {
  AccessibilityProvider,
  useAccessibility as useAccessibilityContext,
} from './AccessibilityProvider'
