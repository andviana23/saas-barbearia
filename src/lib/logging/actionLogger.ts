// Import Sentry com fallback silencioso para ambiente de teste sem pacote
// Tipo mínimo para evitar uso de any
interface MinimalSentryLike {
  addBreadcrumb?: (breadcrumb: unknown) => void;
  captureMessage?: (message: string, context?: unknown) => void;
}
let Sentry: MinimalSentryLike;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require('@sentry/nextjs');
} catch {
  Sentry = {
    addBreadcrumb: () => {},
    captureMessage: () => {},
  };
}

export interface ActionLogContext {
  action: string;
  userId?: string;
  unitId?: string;
  durationMs?: number;
  inputRedacted?: unknown;
  error?: string;
  meta?: Record<string, unknown>;
}

function redact(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.length > 200 ? value.slice(0, 200) + '…' : value;
  }
  if (Array.isArray(value)) return value.slice(0, 10).map(redact);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      if (/password|secret|token|key/i.test(k)) return; // skip sensitive
      out[k] = redact(v);
    });
    return out;
  }
  return value;
}

export function logActionSuccess(ctx: ActionLogContext) {
  const payload = { level: 'info', type: 'action.success', ...ctx };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
  Sentry.addBreadcrumb?.({ category: 'action', level: 'info', data: payload, message: ctx.action });
}

export function logActionError(ctx: ActionLogContext) {
  const payload = { level: 'error', type: 'action.error', ...ctx };
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(payload));
  Sentry.captureMessage?.(`ActionError:${ctx.action}`, {
    level: 'error',
    extra: payload,
  });
}

export async function withActionLogging<T>(
  actionName: string,
  fn: () => Promise<T>,
  baseCtx: Omit<ActionLogContext, 'action' | 'error' | 'durationMs'> & { input?: unknown } = {},
): Promise<T> {
  const start = Date.now();
  try {
    const res = await fn();
    logActionSuccess({
      action: actionName,
      userId: baseCtx.userId,
      unitId: baseCtx.unitId,
      meta: baseCtx.meta,
      durationMs: Date.now() - start,
      inputRedacted: redact(baseCtx.input),
    });
    return res;
  } catch (err) {
    logActionError({
      action: actionName,
      userId: baseCtx.userId,
      unitId: baseCtx.unitId,
      meta: baseCtx.meta,
      durationMs: Date.now() - start,
      inputRedacted: redact(baseCtx.input),
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
