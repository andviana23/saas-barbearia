# Arquitetura do Sistema Trato

## Visão Geral

- Next.js 14 App Router
- Multi-tenancy por unidade_id
- Supabase PostgreSQL com RLS
- Design System MUI v6

## Estrutura de Pastas

- src/app: Rotas e Server Actions
- src/components: Componentes UI
- src/schemas: Schemas Zod
- src/hooks: React Query hooks

## Fluxo de Dados

- Validação Zod → Server Action → Supabase → UI React Query

## Segurança

- RLS em todas as tabelas
- Service Role Key apenas no backend

## Padrões de Código

- Tipagem estrita TypeScript
- Testes unitários e E2E
