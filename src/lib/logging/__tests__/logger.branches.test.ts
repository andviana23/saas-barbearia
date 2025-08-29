import { LogLevel, LoggerConfig, logger } from '../logger';

// Wrapper reutilizando o constructor da instância global (mesmo padrão usado em logger.test.ts)
class TestLoggerWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public instance: any;
  constructor(cfg: Partial<LoggerConfig>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctor: any = (
      logger as unknown as { constructor: new (c?: Partial<LoggerConfig>) => unknown }
    ).constructor;
    this.instance = new ctor(cfg);
  }
}

describe('logger branches adicionais', () => {
  const originalConsole = { info: console.info, warn: console.warn, error: console.error };
  const originalFetch = global.fetch;
  interface InfoItem {
    msg: string;
    ctx: unknown;
  }
  let infos: InfoItem[] = [];
  beforeEach(() => {
    infos = [];
    console.info = jest.fn((msg: string, ctx: unknown) => infos.push({ msg, ctx }));
    console.warn = jest.fn();
    console.error = jest.fn();
    global.fetch = jest.fn();
  });
  afterEach(() => {
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    global.fetch = originalFetch as typeof fetch;
    // limpar mocks de ambiente client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).navigator;
  });

  test('adiciona userAgent quando window definido (branch client-side)', () => {
    // Simula ambiente browser para cobrir ramo typeof window !== 'undefined'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).navigator = { userAgent: 'jest-agent' };

    const tl = new TestLoggerWrapper({
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
    });
    tl.instance.info('client ctx');
    // acessa buffer privado (TS apenas) para validar userAgent & traceId
    type Entry = { userAgent?: string; traceId?: string };
    const buf = (tl.instance as { buffer: Entry[] }).buffer;
    // jsdom pode sobrescrever userAgent, então validamos presença e padrão
    expect(buf[0]?.userAgent).toMatch(/jsdom|jest-agent/);
    expect(buf[0]?.traceId).toMatch(/^[a-z0-9]{5,}$/); // cobre generateTraceId
  });

  test('flush early return (buffer vazio) com remote habilitado não chama fetch', async () => {
    const tl = new TestLoggerWrapper({
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: true, // habilita remote mas sem logs
      flushInterval: 0,
    });
    // destroy chama flush interno (branch: buffer.length === 0)
    tl.instance.destroy();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('flush com logs e remote habilitado mas sem remoteEndpoint (branch dentro do try)', async () => {
    const tl = new TestLoggerWrapper({
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: true,
      batchSize: 1, // força flush imediato
      flushInterval: 0,
    });
    tl.instance.info('forca flush', { a: 1 });
    // fetch não deve ser chamado porque remoteEndpoint não definido (caminho alternativo do try)
    await Promise.resolve();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('chamada a warn é ignorada quando nível configurado é ERROR (branch shouldLog negativo)', () => {
    const tl = new TestLoggerWrapper({
      level: LogLevel.ERROR,
      enableConsole: true,
      enableRemote: false,
    });
    tl.instance.warn('ignorada');
    // buffer deve permanecer vazio e console.warn não chamado
    expect((tl.instance as { buffer: unknown[] }).buffer.length).toBe(0);
    expect(console.warn).not.toHaveBeenCalled();
  });
});
