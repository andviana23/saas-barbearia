// Sistema de Logs Estruturados - Sistema Trato
// Captura ações críticas sem expor PII

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogCategory {
  AUTH = 'auth',
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  BUSINESS = 'business',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context: Record<string, any>;
  userId?: string;
  unidadeId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  traceId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
}

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableRemote: false,
  batchSize: 10,
  flushInterval: 5000, // 5 segundos
};

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
    this.startFlushTimer();
  }

  private startFlushTimer() {
    if (this.config.enableRemote && this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized = { ...context };

    // Remover campos sensíveis
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'credential',
      'cpf',
      'cnpj',
      'rg',
      'passport',
      'ssn',
      'email',
      'phone',
      'address',
      'birthDate',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context: Record<string, any> = {},
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context: this.sanitizeContext(context),
      traceId: this.generateTraceId(),
    };

    // Adicionar contexto do usuário se disponível
    if (typeof window !== 'undefined') {
      // Client-side
      entry.userAgent = navigator.userAgent;
    }

    return entry;
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private logToConsole(entry: LogEntry) {
    if (!this.config.enableConsole) return;

    const { timestamp, level, category, message, context } = entry;
    const logMessage = `[${timestamp}] ${level.toUpperCase()} [${category}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, context);
        break;
      case LogLevel.INFO:
        console.info(logMessage, context);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, context);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, context);
        break;
    }
  }

  private addToBuffer(entry: LogEntry) {
    this.buffer.push(entry);

    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0 || !this.config.enableRemote) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logsToSend),
        });
      }
    } catch (error) {
      // Fallback para console se falhar
      console.error('Falha ao enviar logs remotos:', error);
      logsToSend.forEach((entry) => this.logToConsole(entry));
    }
  }

  // Métodos públicos de logging
  debug(
    message: string,
    context: Record<string, any> = {},
    category: LogCategory = LogCategory.SYSTEM,
  ) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, category, message, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  info(
    message: string,
    context: Record<string, any> = {},
    category: LogCategory = LogCategory.SYSTEM,
  ) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, category, message, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  warn(
    message: string,
    context: Record<string, any> = {},
    category: LogCategory = LogCategory.SYSTEM,
  ) {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, category, message, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  error(
    message: string,
    context: Record<string, any> = {},
    category: LogCategory = LogCategory.SYSTEM,
  ) {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, category, message, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  // Métodos específicos para categorias
  auth(message: string, context: Record<string, any> = {}) {
    this.info(message, context, LogCategory.AUTH);
  }

  userAction(action: string, context: Record<string, any> = {}) {
    this.info(`User action: ${action}`, context, LogCategory.USER_ACTION);
  }

  security(event: string, context: Record<string, any> = {}) {
    this.warn(`Security event: ${event}`, context, LogCategory.SECURITY);
  }

  performance(metric: string, value: number, context: Record<string, any> = {}) {
    this.info(`Performance: ${metric} = ${value}ms`, context, LogCategory.PERFORMANCE);
  }

  business(operation: string, context: Record<string, any> = {}) {
    this.info(`Business operation: ${operation}`, context, LogCategory.BUSINESS);
  }

  // Método para limpar recursos
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Instância global do logger
export const logger = new Logger();

// Hook para usar o logger em componentes React
export function useLogger() {
  return {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    auth: logger.auth.bind(logger),
    userAction: logger.userAction.bind(logger),
    security: logger.security.bind(logger),
    performance: logger.performance.bind(logger),
    business: logger.business.bind(logger),
  };
}

// Utilitários para logging automático
export function logUserAction(action: string, details: Record<string, any> = {}) {
  logger.userAction(action, details);
}

export function logSecurityEvent(event: string, details: Record<string, any> = {}) {
  logger.security(event, details);
}

export function logPerformance(metric: string, startTime: number) {
  const duration = Date.now() - startTime;
  logger.performance(metric, duration);
}

export function logBusinessOperation(operation: string, details: Record<string, any> = {}) {
  logger.business(operation, details);
}
