# RLS Cloud Testing

Guia para executar o ciclo de validação RLS contra o projeto Supabase em produção (ou staging) de forma controlada.

## 1. Variáveis necessárias

Arquivo `.env.test` (baseado em `.env.test.example`):

```
DATABASE_URL=postgres://usuario:senha@host:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=pk_anon...
SUPABASE_SERVICE_ROLE_KEY=service_role_...
TEST_USER_EMAIL=test.rls@example.com
TEST_USER_PASSWORD=SenhaForte123!
RLS_CRUD_REAL=1
RLS_CRUD_IMPERSONATE=1
RLS_REPORT_FAIL_ON=REAL
```

Observações:

- Use a connection string **read/write** (não somente pool read-only) para permitir BEGIN/ROLLBACK.
- O usuário de teste será criado via Admin API: não reutilize emails reais de clientes.

## 2. Scripts

| Script                               | Descrição                                                            |
| ------------------------------------ | -------------------------------------------------------------------- |
| `npm run supabase:test-user:create`  | Cria usuário de teste (idempotente).                                 |
| `npm run supabase:test-user:cleanup` | Remove usuário de teste.                                             |
| `npm run rls:real:cloud`             | Executa ciclo real (CRUD -> merge -> report) carregando `.env.test`. |

## 3. Execução local

1. Copie `.env.test.example` para `.env.test` preenchendo chaves reais.
2. Crie usuário de teste: `npm run supabase:test-user:create`.
3. Rode: `npm run rls:real:cloud`.
4. Verifique relatórios em `coverage/rls-report.(json|md)`.

## 4. Integração GitHub Actions

Defina em Settings > Secrets and variables > Actions (Repository Secrets):

| Secret                      | Conteúdo                                                              |
| --------------------------- | --------------------------------------------------------------------- |
| `RLS_AUDIT_DATABASE_URL`    | Connection string Postgres do projeto.                                |
| `SUPABASE_URL`              | URL base (ex: https://xyzcompany.supabase.co).                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key.                                                     |
| `SUPABASE_ANON_KEY`         | Anon key (opcional para estes scripts, mas útil para testes futuros). |
| `TEST_USER_EMAIL`           | Email do usuário de teste.                                            |
| `TEST_USER_PASSWORD`        | Senha do usuário de teste.                                            |

Workflow existente `rls-real-audit.yml` foi ajustado para criar usuário de teste antes do ciclo (ver seção 6).

## 5. Segurança

- NÃO commitar `.env.test` com chaves reais — use apenas localmente.
- Service role key concede acesso total. Trate como segredo crítico.
- Usuário de teste deve ter metadata marcando-o como test para facilitar limpeza.

## 6. Fluxo CI (resumo)

1. Checkout & instalação.
2. Criação (idempotente) do usuário de teste.
3. Execução `npm run rls:real:cycle:imp` com `DATABASE_URL` e flags.
4. Geração/merge de `allowedReal` e relatório.
5. Upload artefatos e commit opcional de mudanças.

## 7. Próximos Passos (opcionais)

- Gerar JWT do usuário de teste e executar queries via PostgREST para validar filtros row-level além do sucesso de operação.
- Adicionar script de smoke cloud específico (subset de tabelas críticas) para rodar com maior frequência.
- Métricas históricas de divergências (gravar snapshots em pasta dedicada).
