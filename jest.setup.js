import '@testing-library/jest-dom';

// Polyfill para MSW funcionar no Node.js
// TransformStream polyfill (necessário para MSW)
if (typeof TransformStream === 'undefined') {
  // @ts-ignore
  global.TransformStream = class TransformStream {
    constructor() {}
  };
}

// Polyfill TextEncoder/TextDecoder para libs (pg) em ambiente Node <18 ou jsdom
if (typeof TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TextEncoder, TextDecoder } = require('util');
  // @ts-ignore
  global.TextEncoder = TextEncoder;
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}

// Polyfill Response se ausente antes de mocks
if (typeof Response === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetchPkg = require('node-fetch');
  const fetchFn = fetchPkg.default || fetchPkg; // v2 vs v3
  const ResponseCtor = fetchPkg.Response || (fetchFn && fetchFn.Response);
  const HeadersCtor = fetchPkg.Headers || (fetchFn && fetchFn.Headers);
  const RequestCtor = fetchPkg.Request || (fetchFn && fetchFn.Request);
  if (fetchFn) {
    // @ts-ignore
    global.fetch = fetchFn;
  }
  if (HeadersCtor) {
    // @ts-ignore
    global.Headers = HeadersCtor;
  }
  if (RequestCtor) {
    // @ts-ignore
    global.Request = RequestCtor;
  }
  if (ResponseCtor) {
    // @ts-ignore
    global.Response = ResponseCtor;
  }
}

// Fallback mínimo se ainda não definido
if (typeof Response === 'undefined') {
  // @ts-ignore
  global.Response = class {};
}
if (typeof Headers === 'undefined') {
  // @ts-ignore
  global.Headers = class {};
}
if (typeof Request === 'undefined') {
  // @ts-ignore
  global.Request = class {};
}

// Mock BroadcastChannel for MSW
if (typeof BroadcastChannel === 'undefined') {
  // @ts-ignore
  global.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
      this.name = name;
    }
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  };
}
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock React Hook Form
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {}, isValid: true },
    setValue: jest.fn(),
    watch: jest.fn(),
    reset: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    rpc: jest.fn(),
  },
}));

// Mock toast notifications (tolerar ausência do pacote)
try {
  jest.mock('sonner', () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    },
  }));
} catch {
  // ignore if module not found
}

// Mock date-fns
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn((date, pattern) => {
    if (pattern === 'dd/MM/yyyy') return '01/01/2024';
    if (pattern === 'yyyy-MM-dd') return '2024-01-01';
    return date.toISOString();
  }),
  formatDistanceToNow: jest.fn(() => 'há 2 dias'),
}));

// Se @sentry/nextjs não estiver instalado, ignorar silenciosamente (actionLogger possui fallback)
try {
  require.resolve('@sentry/nextjs');
} catch {
  // noop
}

// Usar mocks em __mocks__ para @tanstack/react-query (não redefinir aqui)

// (MSW desabilitado temporariamente para testes unitários simples que não requerem fetch)

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
