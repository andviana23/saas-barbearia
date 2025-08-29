// Utilitário central de scrub para PII antes de enviar a Sentry / logs estruturados
// Regras: remove campos sensíveis, trunca strings longas, limita arrays, mascara emails e telefones.
export interface ScrubOptions {
  maxString?: number;
  maxArray?: number;
}

const DEFAULTS: Required<ScrubOptions> = { maxString: 200, maxArray: 20 };

const SENSITIVE_KEYS = /password|secret|token|key|authorization|cpf|cnpj|card/i;

export function scrub(value: unknown, opts: ScrubOptions = {}): unknown {
  const cfg = { ...DEFAULTS, ...opts };
  if (value == null) return value;
  if (typeof value === 'string') {
    let v = value;
    // mascara email simples
    const emailMatch = v.match(/^[^@]+@[^@]+\.[^@]+$/);
    if (emailMatch) {
      const [user, domain] = v.split('@');
      v = `${user.slice(0, 2)}***@${domain}`;
    }
    if (v.length > cfg.maxString) v = v.slice(0, cfg.maxString) + '…';
    return v;
  }
  if (Array.isArray(value)) return value.slice(0, cfg.maxArray).map((x) => scrub(x, cfg));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.test(k)) continue;
      out[k] = scrub(v, cfg);
    }
    return out;
  }
  return value;
}

export function buildLogEnvelope(event: {
  type: string;
  level?: string;
  action?: string;
  userId?: string;
  unitId?: string;
  error?: string;
  durationMs?: number;
  input?: unknown;
  meta?: Record<string, unknown>;
}) {
  return {
    ts: new Date().toISOString(),
    ...event,
    input: scrub(event.input),
    meta: scrub(event.meta),
  };
}
