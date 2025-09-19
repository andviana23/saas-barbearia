import * as Sentry from '@sentry/nextjs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogContext {
  userId?: string;
  unitId?: string;
  component?: string;
  operation?: string;
  requestId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: number;
  error?: Error;
  stack?: string;
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableSentry: boolean;
  enableLocalStorage: boolean;
  maxLocalEntries: number;
  minLevel: LogLevel;
}

// Configuração padrão
const DEFAULT_CONFIG: LoggerConfig = {
  enableConsole: process.env.NODE_ENV === 'development',
  enableSentry: process.env.NODE_ENV === 'production',
  enableLocalStorage: true,
  maxLocalEntries: 1000,
  minLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
};

// Mapeamento de níveis para prioridade
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

class CentralizedLogger {
  private static instance: CentralizedLogger;
  private config: LoggerConfig;
  private localEntries: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.initializeLogger();
  }

  static getInstance(config?: Partial<LoggerConfig>): CentralizedLogger {
    if (!CentralizedLogger.instance) {
      CentralizedLogger.instance = new CentralizedLogger(config);
    }
    return CentralizedLogger.instance;
  }

  private initializeLogger(): void {
    // Configurar Sentry se habilitado
    if (this.config.enableSentry && typeof window !== 'undefined') {
      // Adicionar contexto global
      Sentry.setContext('logger', {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }

    // Capturar erros não tratados
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error(
          'Uncaught Error',
          {
            operation: 'window.error',
            metadata: {
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
            },
          },
          event.error,
        );
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error(
          'Unhandled Promise Rejection',
          {
            operation: 'unhandledrejection',
            metadata: {
              reason: event.reason,
            },
          },
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        );
      });
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): LogEntry {
    return {
      level,
      message,
      context: {
        ...context,
        sessionId: this.sessionId,
      },
      timestamp: Date.now(),
      error,
      stack: error?.stack,
    };
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;

    const logData = {
      message: entry.message,
      context: entry.context,
      ...(entry.error && { error: entry.error }),
    };

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, logData);
        break;
      case 'info':
        console.info(prefix, logData);
        break;
      case 'warn':
        console.warn(prefix, logData);
        break;
      case 'error':
      case 'critical':
        console.error(prefix, logData);
        if (entry.error) {
          console.error('Stack trace:', entry.error.stack);
        }
        break;
    }
  }

  private logToSentry(entry: LogEntry): void {
    if (!this.config.enableSentry) return;

    Sentry.withScope((scope) => {
      // Configurar nível
      scope.setLevel(entry.level === 'critical' ? 'fatal' : (entry.level as any));

      // Adicionar contexto
      if (entry.context) {
        if (entry.context.userId) {
          scope.setUser({ id: entry.context.userId });
        }

        if (entry.context.component) {
          scope.setTag('component', entry.context.component);
        }

        if (entry.context.operation) {
          scope.setTag('operation', entry.context.operation);
        }

        if (entry.context.unitId) {
          scope.setContext('unit', { id: entry.context.unitId });
        }

        if (entry.context.metadata) {
          scope.setContext('metadata', entry.context.metadata);
        }
      }

      // Adicionar fingerprint para agrupamento
      if (entry.context?.operation) {
        scope.setFingerprint([entry.context.operation, entry.message]);
      }

      // Enviar para Sentry
      if (entry.error) {
        Sentry.captureException(entry.error);
      } else {
        Sentry.captureMessage(entry.message);
      }
    });
  }

  private logToLocalStorage(entry: LogEntry): void {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') return;

    try {
      this.localEntries.push(entry);

      // Manter limite de entradas
      if (this.localEntries.length > this.config.maxLocalEntries) {
        this.localEntries = this.localEntries.slice(-this.config.maxLocalEntries);
      }

      // Salvar no localStorage (apenas últimas 100 entradas para não sobrecarregar)
      const entriesToSave = this.localEntries.slice(-100).map((e) => ({
        ...e,
        error: e.error
          ? {
              message: e.error.message,
              stack: e.error.stack,
            }
          : undefined,
      }));

      localStorage.setItem('app_logs', JSON.stringify(entriesToSave));
    } catch (error) {
      console.warn('Failed to save log to localStorage:', error);
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);

    // Log para diferentes destinos
    this.logToConsole(entry);
    this.logToSentry(entry);
    this.logToLocalStorage(entry);
  }

  // Métodos públicos de logging
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log('warn', message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  critical(message: string, context?: LogContext, error?: Error): void {
    this.log('critical', message, context, error);

    // Para erros críticos, também enviar notificação imediata
    if (typeof window !== 'undefined' && this.config.enableSentry) {
      Sentry.captureMessage(`CRITICAL: ${message}`, 'fatal');
    }
  }

  // Métodos utilitários
  setUser(userId: string): void {
    if (this.config.enableSentry) {
      Sentry.setUser({ id: userId });
    }
  }

  setContext(key: string, value: any): void {
    if (this.config.enableSentry) {
      Sentry.setContext(key, value);
    }
  }

  addBreadcrumb(message: string, data?: Record<string, any>): void {
    if (this.config.enableSentry) {
      Sentry.addBreadcrumb({
        message,
        data,
        timestamp: Date.now() / 1000,
      });
    }
  }

  // Obter logs locais
  getLocalLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let logs = this.localEntries;

    if (level) {
      logs = logs.filter((entry) => entry.level === level);
    }

    if (limit) {
      logs = logs.slice(-limit);
    }

    return logs;
  }

  // Obter logs recentes com filtros (para API)
  async getRecentLogs(options?: {
    level?: LogLevel;
    limit?: number;
    since?: Date;
  }): Promise<LogEntry[]> {
    let logs = this.localEntries;

    if (options?.level) {
      logs = logs.filter((entry) => entry.level === options.level);
    }

    if (options?.since) {
      const sinceTimestamp = options.since.getTime();
      logs = logs.filter((entry) => entry.timestamp >= sinceTimestamp);
    }

    if (options?.limit) {
      logs = logs.slice(-options.limit);
    }

    return logs;
  }

  // Exportar logs para debug
  exportLogs(): string {
    return JSON.stringify(this.localEntries, null, 2);
  }

  // Limpar logs locais
  clearLocalLogs(): void {
    this.localEntries = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs');
    }
  }

  // Obter estatísticas
  getStats(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    recentErrors: number;
    sessionId: string;
  } {
    const logsByLevel = this.localEntries.reduce(
      (acc, entry) => {
        acc[entry.level] = (acc[entry.level] || 0) + 1;
        return acc;
      },
      {} as Record<LogLevel, number>,
    );

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentErrors = this.localEntries.filter(
      (entry) =>
        entry.timestamp > oneHourAgo && (entry.level === 'error' || entry.level === 'critical'),
    ).length;

    return {
      totalLogs: this.localEntries.length,
      logsByLevel,
      recentErrors,
      sessionId: this.sessionId,
    };
  }
}

// Instância singleton
export const logger = CentralizedLogger.getInstance();

// Hook para React
export function useLogger() {
  return {
    debug: (message: string, context?: Omit<LogContext, 'component'>) =>
      logger.debug(message, { ...context, component: 'React Component' }),

    info: (message: string, context?: Omit<LogContext, 'component'>) =>
      logger.info(message, { ...context, component: 'React Component' }),

    warn: (message: string, context?: Omit<LogContext, 'component'>, error?: Error) =>
      logger.warn(message, { ...context, component: 'React Component' }, error),

    error: (message: string, context?: Omit<LogContext, 'component'>, error?: Error) =>
      logger.error(message, { ...context, component: 'React Component' }, error),

    critical: (message: string, context?: Omit<LogContext, 'component'>, error?: Error) =>
      logger.critical(message, { ...context, component: 'React Component' }, error),

    addBreadcrumb: logger.addBreadcrumb.bind(logger),
    getStats: logger.getStats.bind(logger),
  };
}

// Decorator para logging automático
export function withLogging(operation: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();

      logger.debug(`Starting ${operation}`, {
        operation,
        component: target.constructor.name,
        metadata: { args: args.length },
      });

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        logger.info(`Completed ${operation}`, {
          operation,
          component: target.constructor.name,
          metadata: { duration, success: true },
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.error(
          `Failed ${operation}`,
          {
            operation,
            component: target.constructor.name,
            metadata: { duration, success: false },
          },
          error as Error,
        );

        throw error;
      }
    };

    return descriptor;
  };
}
