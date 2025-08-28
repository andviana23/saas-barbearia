import {
  LoggerConfig,
  LogLevel,
  logger,
  logUserAction,
  logSecurityEvent,
  logPerformance,
  logBusinessOperation,
} from '../logger';

// Criar instância isolada para alguns testes específicos
// Wrapper para criar uma instância isolada reutilizando o constructor da instância global
class TestLoggerWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public instance: any;
  constructor(cfg: Partial<LoggerConfig>) {
    // Reutiliza o constructor da instância global sem acessar implementação interna diretamente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctor: any = (
      logger as unknown as { constructor: new (c?: Partial<LoggerConfig>) => unknown }
    ).constructor;
    this.instance = new ctor(cfg);
  }
}

describe('logger (níveis e sanitização)', () => {
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  type LoggedCtx = Record<string, unknown>;
  interface LoggedItem {
    level: string;
    msg: string;
    ctx: LoggedCtx;
  }
  let logs: LoggedItem[] = [];
  beforeEach(() => {
    logs = [];
    console.debug = jest.fn((msg: string, ctx: LoggedCtx) =>
      logs.push({ level: 'debug', msg, ctx }),
    );
    console.info = jest.fn((msg: string, ctx: LoggedCtx) => logs.push({ level: 'info', msg, ctx }));
    console.warn = jest.fn((msg: string, ctx: LoggedCtx) => logs.push({ level: 'warn', msg, ctx }));
    console.error = jest.fn((msg: string, ctx: LoggedCtx) =>
      logs.push({ level: 'error', msg, ctx }),
    );
  });
  afterEach(() => {
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  test('respeita nível configurado (INFO ignora debug)', () => {
    const tl = new TestLoggerWrapper({
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
    });
    tl.instance.debug('debug skip');
    tl.instance.info('info ok');
    expect(logs.some((l) => l.msg.includes('debug skip'))).toBe(false);
    expect(logs.some((l) => l.msg.includes('info ok'))).toBe(true);
  });

  test('DEBUG permite debug/info/warn/error', () => {
    const tl = new TestLoggerWrapper({
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableRemote: false,
    });
    tl.instance.debug('d');
    tl.instance.info('i');
    tl.instance.warn('w');
    tl.instance.error('e');
    const seq = logs.map((l) => l.level).sort();
    expect(seq).toEqual(expect.arrayContaining(['debug', 'info', 'warn', 'error']));
  });

  test('sanitiza campos sensíveis', () => {
    const tl = new TestLoggerWrapper({
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableRemote: false,
    });
    tl.instance.info('login', { password: '123', token: 'abc', email: 'a@b', normal: 'x' });
    const ctx = logs[0].ctx as Record<string, unknown>;
    expect(ctx.password).toBe('[REDACTED]');
    expect(ctx.token).toBe('[REDACTED]');
    expect(ctx.email).toBe('[REDACTED]');
    expect(ctx.normal).toBe('x');
  });
});

describe('logger wrappers utilitários', () => {
  const originalConsole = { info: console.info, warn: console.warn };
  let infos: string[] = [];
  let warns: string[] = [];
  beforeEach(() => {
    infos = [];
    warns = [];
    console.info = jest.fn((msg: string) => infos.push(msg));
    console.warn = jest.fn((msg: string) => warns.push(msg));
  });
  afterEach(() => {
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
  });

  test('logUserAction formata corretamente', () => {
    logUserAction('click-botao', { x: 1 });
    expect(infos.find((m) => m.includes('User action: click-botao'))).toBeTruthy();
  });

  test('logSecurityEvent usa warn', () => {
    logSecurityEvent('tentativa-suspeita', { ip: '1.1.1.1' });
    expect(warns.find((m) => m.includes('Security event: tentativa-suspeita'))).toBeTruthy();
  });

  test('logPerformance calcula duração', () => {
    const start = Date.now() - 42;
    logPerformance('render', start);
    const perf = infos.find((m) => m.includes('Performance: render ='));
    expect(perf).toBeTruthy();
    expect(perf?.match(/render = (\d+)ms/)).toBeTruthy();
  });

  test('logBusinessOperation formata operação', () => {
    logBusinessOperation('checkout', { total: 10 });
    expect(infos.find((m) => m.includes('Business operation: checkout'))).toBeTruthy();
  });
});
