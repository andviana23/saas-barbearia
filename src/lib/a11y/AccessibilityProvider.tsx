'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { A11yConfig, DEFAULT_A11Y_CONFIG } from './index'

interface AccessibilityContextType {
  config: A11yConfig
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  setFontSize: (size: A11yConfig['fontSize']) => void
  toggleKeyboardNavigation: () => void
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined)

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const [config, setConfig] = useState<A11yConfig>(DEFAULT_A11Y_CONFIG)

  // Carregar configurações salvas no localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('trato-a11y-config')
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        setConfig((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.warn('Erro ao carregar configurações de acessibilidade:', error)
    }
  }, [])

  // Salvar configurações no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trato-a11y-config', JSON.stringify(config))
    } catch (error) {
      console.warn('Erro ao salvar configurações de acessibilidade:', error)
    }
  }, [config])

  // Aplicar configurações ao documento
  useEffect(() => {
    const root = document.documentElement

    // Alto contraste
    if (config.enableHighContrast) {
      root.setAttribute('data-high-contrast', 'true')
    } else {
      root.removeAttribute('data-high-contrast')
    }

    // Movimento reduzido
    if (config.enableReducedMotion) {
      root.setAttribute('data-reduced-motion', 'true')
    } else {
      root.removeAttribute('data-reduced-motion')
    }

    // Tamanho da fonte
    root.setAttribute('data-font-size', config.fontSize)

    // Navegação por teclado
    if (config.enableKeyboardNavigation) {
      root.setAttribute('data-keyboard-navigation', 'true')
    } else {
      root.removeAttribute('data-keyboard-navigation')
    }
  }, [config])

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

  const toggleKeyboardNavigation = () => {
    setConfig((prev) => ({
      ...prev,
      enableKeyboardNavigation: !prev.enableKeyboardNavigation,
    }))
  }

  const value: AccessibilityContextType = {
    config,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    toggleKeyboardNavigation,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error(
      'useAccessibility deve ser usado dentro de um AccessibilityProvider'
    )
  }
  return context
}
