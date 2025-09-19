# Guia de Tecnologias e Integrações

## Stack Principal

- Next.js 14 (App Router)
- TypeScript + Zod
- MUI v6 (dark-first)
- Supabase (Auth, DB, Storage, RLS)
- React Query v5
- Sentry (Observabilidade)

## Supabase

- Client server-side em `lib/supabase/server`.
- RLS reforçada via função `current_unit_id`.

## Integração ASAAS

- Rota: `POST /api/asaas/webhook`
- Header obrigatório: `x-asaas-token`
- Tabela de idempotência: `asaas_webhook_events` (armazena payload bruto, status, retry_count).
- View de pendentes: `view_asaas_webhook_events_pending`.
- Fluxo mínimo: receber -> inserir (unique event_id) -> processar -> marcar `processed`.
- Próximos passos: roteamento por `event_type`, reprocessamento de falhas, métricas de latência.

## Outras Dependências

- Day.js / date-fns para manipulação de datas.
- Jest + Testing Library + Playwright para testes.
- MSW para mocks HTTP em testes.
- Zod para validação em server actions e schemas de domínio.

## Convenções

- Imports absolutos prefixados por `@/`.
- Actions somente em `_actions.ts` por módulo.
- Migrations padronizadas: `YYYYMMDDHHMM_<descricao>.sql`.
- Logs de integrações devem conter `event_id` e status final.
- Evitar lógica de negócio em componentes React; concentrar em services + actions.

## Observabilidade

- Sentry para erros e (futuro) performance tracing.
- Registrar erros de processamento de webhook com contexto: `event_id`, `event_type`.
- Métricas planejadas: tempo médio processamento webhook, taxa de falhas, retries.
