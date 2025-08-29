import { LogLevel, LoggerConfig } from '../logger';

// Criar wrapper para acessar flush/buffer caminhos remotos
class TestLoggerWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public instance: any;
  constructor(cfg: Partial<LoggerConfig>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctor: any = (
      require('../logger').logger as unknown as {
        constructor: new (c?: Partial<LoggerConfig>) => unknown;
      }
    ).constructor;
    this.instance = new ctor(cfg);
  }
}

describe('logger flush remoto', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('envia buffer quando batchSize atingido', async () => {
    const tl = new TestLoggerWrapper({
      level: LogLevel.DEBUG,
      enableConsole: false,
      enableRemote: true,
      remoteEndpoint: 'https://example/logs',
      batchSize: 2,
      flushInterval: 0,
    });
    tl.instance.debug('a');
    tl.instance.info('b'); // dispara flush pelo tamanho
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('flush por destroy chama fetch quando há itens', async () => {
    const tl = new TestLoggerWrapper({
      level: LogLevel.INFO,
      enableConsole: false,
      enableRemote: true,
      remoteEndpoint: 'https://example/logs',
      batchSize: 5,
      flushInterval: 0,
    });
    tl.instance.info('only-one');
    tl.instance.destroy();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('falha em fetch faz fallback console', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = jest.fn().mockRejectedValue(new Error('netfail')) as unknown as typeof fetch;
    const tl = new TestLoggerWrapper({
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: true,
      remoteEndpoint: 'https://example/logs',
      batchSize: 1,
      flushInterval: 0,
    });
    tl.instance.info('x'); // batchSize 1 -> flush imediato
    // aguarda microtasks (flush é async)
    await Promise.resolve();
    await Promise.resolve();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
