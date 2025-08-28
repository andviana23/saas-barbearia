# Regras de Implementação

## Estrutura

- Módulos protegidos em `src/app/(protected)`.
- Rotas públicas em `src/app/(public)`.
- Features desacopladas em `components/features/<feature>`.
- UI compartilhada em `components/ui`.

## Server Actions

- Definidas em `_actions.ts` dentro do diretório do módulo.
- Validação com Zod antes de qualquer I/O.
- Retornar sempre `ActionResult`.

## Banco

- Migrations nomeadas com timestamp.
- Função `current_unit_id` garante escopo multi-tenant.
- Nenhuma query sem filtro de unidade quando aplicável.
- Tabelas de integração externas devem registrar eventos para idempotência (`*_webhook_events`).
- Views auxiliares podem expor filas (`view_*_pending`) apenas para leitura/monitoramento.

## Código

- Sem `any` não justificado.
- Imports absolutos `@/`.
- Evitar lógica de negócio em componentes – delegar para services/actions.

## Testes

- Unit: lógica pura (schemas, utils, mappers).
- Integration: Server Actions + Supabase (usa banco isolado ou schema de teste).
- E2E: Fluxos críticos (login, criar agendamento, cancelar assinatura).
- Smoke obrigatório no CI.

## Commits

- `chore(structure): ...`
- `refactor(agenda): ...`
- `feat(asaas): ...`
- `build(db): ...`
- `test: ...`
- `docs: ...`

## Observabilidade

- Capturar erros de SA críticos no Sentry.
- Planejar métricas de consumo (limites de assinatura) via serviço dedicado.
- Webhooks: logar criação de evento, processamento e erro (com `event_id`).
