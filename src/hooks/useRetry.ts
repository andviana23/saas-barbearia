'use client';

import { useState, useCallback } from 'react';

export interface RetryOptions {
  /** Número máximo de tentativas */
  maxAttempts?: number;
  /** Delay inicial entre tentativas (em ms) */
  initialDelay?: number;
  /** Multiplicador para backoff exponencial */
  backoffMultiplier?: number;
  /** Delay máximo entre tentativas (em ms) */
  maxDelay?: number;
  /** Função para determinar se deve tentar novamente */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface RetryState {
  /** Se está executando uma operação */
  isLoading: boolean;
  /** Número da tentativa atual */
  currentAttempt: number;
  /** Último erro ocorrido */
  lastError: Error | null;
  /** Se todas as tentativas falharam */
  hasExhaustedRetries: boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  shouldRetry: (error: Error) => {
    // Retry para erros de rede e timeouts
    return (
      error.name === 'NetworkError' ||
      error.name === 'TimeoutError' ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
  },
};

/**
 * Hook para implementar retry automático com backoff exponencial
 *
 * @example
 * ```tsx
 * const { execute, state, retry, reset } = useRetry({
 *   maxAttempts: 3,
 *   initialDelay: 1000,
 * });
 *
 * const handleSubmit = async () => {
 *   try {
 *     const result = await execute(async () => {
 *       return await api.createUser(userData);
 *     });
 *     console.log('Sucesso:', result);
 *   } catch (error) {
 *     console.error('Falhou após todas as tentativas:', error);
 *   }
 * };
 * ```
 */
export function useRetry<T = any>(options: RetryOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    currentAttempt: 0,
    lastError: null,
    hasExhaustedRetries: false,
  });

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const calculateDelay = (attempt: number): number => {
    const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  };

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        currentAttempt: 0,
        lastError: null,
        hasExhaustedRetries: false,
      }));

      for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        setState((prev) => ({ ...prev, currentAttempt: attempt }));

        try {
          const result = await operation();
          setState((prev) => ({
            ...prev,
            isLoading: false,
            lastError: null,
          }));
          return result;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          setState((prev) => ({ ...prev, lastError: err }));

          // Se é a última tentativa ou não deve tentar novamente
          if (attempt === config.maxAttempts || !config.shouldRetry(err, attempt)) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              hasExhaustedRetries: attempt === config.maxAttempts,
            }));
            throw err;
          }

          // Aguardar antes da próxima tentativa
          const delay = calculateDelay(attempt);
          await sleep(delay);
        }
      }

      // Nunca deveria chegar aqui, mas TypeScript exige
      throw new Error('Unexpected end of retry loop');
    },
    [config],
  );

  const retry = useCallback(
    async (operation: () => Promise<T>): Promise<T> => {
      return execute(operation);
    },
    [execute],
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      currentAttempt: 0,
      lastError: null,
      hasExhaustedRetries: false,
    });
  }, []);

  return {
    /** Executa a operação com retry automático */
    execute,
    /** Estado atual do retry */
    state,
    /** Tenta novamente a última operação */
    retry,
    /** Reseta o estado */
    reset,
  };
}

/**
 * Hook simplificado para operações que precisam de retry manual
 */
export function useManualRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const triggerRetry = useCallback(() => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Reset do estado após um pequeno delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 100);
  }, []);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retryCount,
    isRetrying,
    triggerRetry,
    reset,
  };
}
