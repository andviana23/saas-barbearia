# Trato – Documentação Técnica do Sistema

Hub central com links e seções resumidas.

## Sumário

- Arquitetura & Módulos
- Padrões Backend (Server Actions / RLS)
- Padrões Frontend (App Router / Atomic Design / React Query)
- Banco de Dados & Migrations
- Observabilidade & Qualidade
- Integrações Externas (ASAAS)

## Arquitetura & Módulos

Monólito Next.js 14 (App Router) com módulos de negócio isolados em `(protected)` e rotas públicas em `(public)`. Multi-tenancy via `unit_id` (RLS ativa em todas as tabelas). Integração Supabase.

## Backend

- Server Actions por módulo em `_actions.ts` com validação Zod.
- API Routes somente para integrações externas (`/api/asaas/webhook`).
- Padrão `ActionResult<T>` para respostas consistentes.

## Frontend

- Atomic Design: `components/ui` (átomos/moléculas) e `components/features` (organisms/feature modules).
- Theming central em `src/lib/theme` (dark-mode-first MUI v6).
- Data Fetching: React Query (cache por query keys normalizadas).

## Banco de Dados

- Diretório `db/migrations` com nome `YYYYMMDDHHMM_descricao.sql`.
- Scripts: `npm run db:migrate` / `db:status`.
- Todas as tabelas com política RLS filtrando `unit_id`.

## Observabilidade

- Sentry para erros e performance.
- Métricas internas: serviço `metrics` e futuras spans.

## Integração ASAAS

Webhook assíncrono idempotente (`/api/asaas/webhook`) validando cabeçalho `x-asaas-token`.

## Qualidade & Testes

- Unit (Jest), Integration (Supabase + SA), E2E (Playwright).
- Smoke tests mínimos em pipelines CI.

## Próximos Passos

- Implementar idempotência persistente para webhook.
- Expandir schemas e validação de agendamentos.
- Consolidar plano de métricas avançadas.
