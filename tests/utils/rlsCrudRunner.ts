/**
 * Runner simplificado para simular (placeholder) execuções de CRUD sob diferentes roles.
 * Próximo passo: substituir por chamadas reais ao banco (pg) com SET ROLE ou JWT Supabase.
 */
export interface CrudAttempt {
  table: string;
  role: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  payload?: Record<string, unknown>;
}

export interface CrudResult {
  success: boolean;
  error?: string;
}

// Tipagem leve para evitar dependência direta de tipos pg no build de testes sem DB
interface PgLikeClient {
  query: (sql: string) => Promise<{ rows?: unknown[] }>;
  connect: () => Promise<void>;
}
let pgClient: PgLikeClient | null = null;
async function getClient() {
  if (pgClient) return pgClient;
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) return null; // permanece modo simulado
  try {
    const { Client } = await import('pg');
    pgClient = new Client({ connectionString: url });
    await pgClient.connect();
    return pgClient;
  } catch (e) {
    // Falha na dependência pg -> continuar em modo simulado
    return null;
  }
}

export async function executeCrud(attempt: CrudAttempt): Promise<CrudResult> {
  // Gate: por padrão permanecemos em modo simulado até que RLS_CRUD_REAL=1
  const forceSimulated = process.env.RLS_CRUD_REAL !== '1';
  if (forceSimulated) {
    return { success: attempt.role !== 'public' && attempt.role !== 'anon' };
  }

  const client = await getClient();
  if (!client) {
    // Sem client mas variável solicitou real -> tratamos como falha (não mascarar diferença)
    return { success: false, error: 'Sem conexão DB para execução real' };
  }

  // Execução real: usamos transação e ROLLBACK para não persistir.
  const op = attempt.operation;
  const table = attempt.table.includes('.') ? attempt.table : `public.${attempt.table}`;
  const started = Date.now();
  let impersonated = false;
  let impersonationError: string | null = null;
  try {
    await client.query('BEGIN');
    // Impersonação opcional: habilitar com RLS_CRUD_IMPERSONATE=1
    // Estratégias simples: tentar SET LOCAL ROLE <role>. Ignorar se falhar.
    if (process.env.RLS_CRUD_IMPERSONATE === '1') {
      try {
        // Evita tentar roles inválidas triviais
        if (!['public', 'anon', ''].includes(attempt.role)) {
          await client.query(`SET LOCAL ROLE "${attempt.role}";`);
          impersonated = true;
        }
      } catch (impErr) {
        impersonationError = impErr instanceof Error ? impErr.message : 'impersonation failed';
      }
    }
    let sql: string;
    switch (op) {
      case 'select':
        sql = `SELECT * FROM ${table} LIMIT 1;`;
        break;
      case 'insert':
        // Inserção mínima tentativa (assume colunas id serial ou defaults) -> usar RETURNING para evitar conflitos
        sql = `INSERT INTO ${table} DEFAULT VALUES RETURNING *;`;
        break;
      case 'update':
        sql = `UPDATE ${table} SET /* no-op */ (SELECT 1) = (SELECT 1) WHERE 1=0;`;
        break;
      case 'delete':
        sql = `DELETE FROM ${table} WHERE 1=0;`;
        break;
      default:
        throw new Error('Operação desconhecida');
    }
    await client.query(sql);
    await client.query('ROLLBACK');
    const result: CrudResult = { success: true };
    recordRealResult(attempt, result, {
      started,
      impersonated,
      impersonationError,
    });
    return result;
  } catch (e) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    const msg = e instanceof Error ? e.message : 'Erro desconhecido';
    const result: CrudResult = { success: false, error: msg };
    recordRealResult(attempt, result, {
      started,
      impersonated,
      impersonationError,
    });
    return result;
  }
}

// Registro de execução real em JSONL (somente quando RLS_CRUD_REAL=1). Posteriormente consolidado em allowedReal.
function recordRealResult(
  attempt: CrudAttempt,
  result: CrudResult,
  meta: { started: number; impersonated: boolean; impersonationError: string | null },
) {
  try {
    if (process.env.RLS_CRUD_REAL !== '1') return;
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(process.cwd(), 'coverage');
    fs.mkdirSync(dir, { recursive: true });
    const logFile = path.join(dir, 'rls-exec-log.jsonl');
    const durationMs = Date.now() - meta.started;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      table: attempt.table,
      role: attempt.role,
      operation: attempt.operation,
      success: result.success,
      error: result.error || null,
      durationMs,
      impersonated: meta.impersonated,
      impersonationError: meta.impersonationError,
    });
    fs.appendFileSync(logFile, line + '\n');
  } catch (_) {
    // silencioso
  }
}
