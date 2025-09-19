import { z, type ZodSchema } from 'zod';

// Função para redirecionar para login em caso de erro de auth
let redirectToLogin: ((error: ApiError) => void) | null = null;

/**
 * Configura o handler de redirecionamento para login
 * Deve ser chamado uma vez na inicialização da aplicação
 */
export function configureAuthRedirect(handler: (error: ApiError) => void): void {
  redirectToLogin = handler;
}

export interface ApiErrorShape {
  status: number;
  message: string;
  details?: unknown;
}

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  details?: unknown;

  constructor(err: ApiErrorShape) {
    super(err.message);
    this.status = err.status;
    this.details = err.details;
    this.name = 'ApiError';
  }

  /**
   * Verifica se o erro é de autorização (401/403)
   */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Verifica se o erro é do cliente (4xx)
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Verifica se o erro é do servidor (5xx)
   */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

export interface FetchJsonOptions<
  TResponseSchema extends ZodSchema<unknown> | undefined = undefined,
  TBody = unknown,
> extends Omit<RequestInit, 'body'> {
  jsonBody?: TBody;
  schema?: TResponseSchema;
  retry?: number;
  retryDelayMs?: number;
  accept404?: boolean;
  auth?: boolean;
  /** Desabilita interceptação automática de erros de auth */
  noAuthIntercept?: boolean;
}

export type InferSchema<TSchema> = TSchema extends ZodSchema<infer TOut> ? TOut : unknown;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

function mergeHeaders(base: HeadersInit | undefined, extra: Record<string, string>): HeadersInit {
  const h = new Headers(base || {});
  Object.entries(extra).forEach(([k, v]) => {
    if (!h.has(k)) h.set(k, v);
  });
  return h;
}

export async function fetchJson<
  TSchema extends ZodSchema<unknown> | undefined = undefined,
  TBody = unknown,
>(
  input: string,
  {
    schema,
    retry = 0,
    retryDelayMs = 300,
    accept404 = false,
    auth = true,
    jsonBody,
    headers,
    ...init
  }: FetchJsonOptions<TSchema, TBody> = {},
): Promise<InferSchema<TSchema>> {
  const url = input.startsWith('http')
    ? input
    : `${process.env.NEXT_PUBLIC_API_BASE || ''}${input}`;

  const finalInit: RequestInit = {
    ...init,
    method: init.method || (jsonBody ? 'POST' : 'GET'),
    headers: mergeHeaders(headers, DEFAULT_HEADERS),
    credentials: auth ? 'include' : init.credentials,
    body: jsonBody
      ? typeof jsonBody === 'string'
        ? jsonBody
        : JSON.stringify(jsonBody)
      : undefined,
  };

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retry) {
    try {
      const res = await fetch(url, finalInit);

      if (accept404 && res.status === 404) {
        // @ts-expect-error retorno específico para aceitar 404 -> null
        return null;
      }

      if (!res.ok) {
        let details: unknown;
        try {
          details = await res.json();
        } catch {
          details = undefined;
        }

        const apiError = new ApiError({
          status: res.status,
          message: httpStatusMessage(
            res.status,
            // Detalhes podem não ser objeto
            typeof details === 'object' && details
              ? (details as Record<string, unknown>)
              : undefined,
          ),
          details,
        });

        // Interceptação de erros de autenticação
        if (apiError.isAuthError && redirectToLogin && !init.noAuthIntercept) {
          redirectToLogin(apiError);
          throw apiError;
        }

        if (shouldRetry(res.status) && attempt < retry) {
          attempt++;
          await sleep(retryDelayMs);
          continue;
        }

        throw apiError;
      }

      if (res.status === 204) {
        // @ts-expect-error retorno void para 204
        return undefined;
      }

      const data: unknown = await res.json();
      if (schema) {
        // @ts-expect-error schema parse garante tipo
        return schema.parse(data);
      }
      // @ts-expect-error sem schema não há inferência
      return data;
    } catch (err) {
      lastError = err;
      if (err instanceof ApiError) throw err;
      if (attempt < retry && isNetworkError(err)) {
        attempt++;
        await sleep(retryDelayMs);
        continue;
      }
      throw err;
    }
  }
  throw lastError as Error;
}

function shouldRetry(status: number) {
  // retry para erros transitórios
  return [408, 425, 429, 500, 502, 503, 504].includes(status);
}

function isNetworkError(err: unknown) {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; message?: string };
  return e.name === 'FetchError' || !!e.message?.toLowerCase().includes('network');
}

function httpStatusMessage(status: number, details: Record<string, unknown> | undefined): string {
  if (details && typeof (details as { message?: unknown }).message === 'string') {
    return String((details as { message?: string }).message);
  }
  switch (status) {
    case 400:
      return 'Requisição inválida';
    case 401:
      return 'Não autenticado';
    case 403:
      return 'Acesso negado';
    case 404:
      return 'Não encontrado';
    case 409:
      return 'Conflito';
    case 422:
      return 'Entidade inválida';
    case 500:
      return 'Erro interno';
    default:
      return `Erro HTTP ${status}`;
  }
}

// Helper com validação
export async function getJson<TSchema extends ZodSchema<unknown>>(
  path: string,
  schema: TSchema,
  opts?: Omit<FetchJsonOptions<TSchema, undefined>, 'schema' | 'jsonBody' | 'method'>,
) {
  return fetchJson(path, { ...opts, schema, method: 'GET' });
}

// POST com body tipado e retorno validado
export async function postJson<TBody, TSchema extends ZodSchema<unknown> | undefined = undefined>(
  path: string,
  body: TBody,
  schema?: TSchema,
  opts?: Omit<FetchJsonOptions<TSchema, TBody>, 'schema' | 'jsonBody' | 'method'>,
) {
  return fetchJson(path, { ...opts, jsonBody: body, schema, method: 'POST' });
}

// Exemplo de schema rápido (remover depois):
export const PingSchema = z.object({ pong: z.boolean() });

export async function ping() {
  return getJson('/api/ping', PingSchema, { retry: 1 });
}
