# Arquitetura do Sistema

Visão geral
- Monólito Next.js (App Router) com módulos de negócio organizados em (protected) e rotas públicas em (public).
- Autenticação e sessão via Supabase (SSR) e middleware de autorização.
- Multi-tenancy por unit_id com RLS em todas as tabelas do banco.

Estrutura de pastas (resumo)
- src/
  - app/
    - (public)/: login, forgot-password, páginas de diagnóstico/teste
    - (protected)/: módulos protegidos por autenticação
      - agenda/, clientes/, profissionais/, fila/, assinaturas/, financeiro/, estoque/, servicos/, produtos/, relatorios/, configuracoes/, multi-unidades/, metas/, perfil/
      - layout.tsx: layout protegido
    - api/: rotas de API (ex.: webhooks/asaas)
    - error.tsx, not-found.tsx, layout.tsx, providers.tsx, globals.css
  - components/
    - ui/: Design System (Button, DSCard, AccessibilityControls, NotificationSystem)
    - features/: componentes de domínio (ex.: agenda)
    - layout/: cabeçalhos, navegação, etc.
  - hooks/: hooks de dados e estado (ex.: use-auth, use-agendamentos, use-clientes, use-profissionais)
  - lib/: integrações e utilitários (a11y, api, asaas, auth, database, supabase, logging, utils)
  - types/: tipos globais (api, roles, permissions, multi-unidades, subscription, database)
  - tests/, e2e/: testes unitários, integração e E2E

Fluxo de rotas (App Router)
- Públicas: /login, /signup [TODO], /forgot-password, /api/webhooks/asaas
- Protegidas (exemplos):
  - /dashboard
  - /agenda, /agenda/[id]
  - /clientes, /clientes/[id]
  - /profissionais, /profissionais/[id]
  - /servicos, /servicos/[id]
  - /fila
  - /assinaturas
  - /financeiro/(caixa|fluxo|historico|comissao)
  - /multi-unidades, /configuracoes, /relatorios, /notificacoes, /metas, /perfil, /estoque, /produtos

Design System (src/components/ui)
- Button: variantes (default, destructive, outline, secondary, ghost, link), tamanhos (default, sm, lg, icon), asChild
- DSCard, NotificationSystem, AccessibilityControls
- Padrões: acessibilidade (focus-visible), responsividade, tokens de design [TODO: detalhar tokens]

Hooks (src/hooks)
- Exemplos: use-auth, use-agendamentos, use-clientes, use-profissionais, use-unidades, use-assinaturas, use-fila, use-financeiro, use-notificacoes, use-permissoes [pode haver outros]
- Diretrizes: prefixo use, responsabilidade única, memoização seletiva, tratamento explícito de erro

Schemas (Zod)
- Zod presente em validações de server actions, serviços e componentes de formulário.
- Diretriz: todas as entradas externas devem ser validadas por Zod (inputs de forms e payloads de API)

Tipos globais (src/types)
- api.ts, dashboard.ts, database.ts, marketplace.ts, multi-unidades.ts, permissions.ts, roles.ts, subscription.ts, supabase-auth.ts, ambient.d.ts

Middleware de autorização
- Bypass: _next, static, assets, api/auth, favicon/robots/sitemap, e arquivos estáticos por extensão.
- Públicas: /login, /signup, /forgot-password, /reset-password
- Sessão: cria Supabase client SSR e chama auth.getUser() para refresh de sessão.
- Proteção: rotas não públicas seguem fluxo normal e dependem de guardas/redirects nos loaders/client.
- E2E: quando E2E_MODE=1, o middleware faz bypass completo para reduzir latência de testes E2E.
- Matcher: aplica-se a todas as rotas exceto as que iniciam com api, _next, static, assets, arquivos públicos (favicon/robots/sitemap) e qualquer arquivo com extensões estáticas. Expressão:
  - '/((?!api|_next|static|assets|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|js|css|woff|woff2|ttf|eot|map)$).*)'

Integrações
- Webhook ASAAS em /api/webhooks/asaas delega processamento a serviço central idempotente.

Observabilidade e logging
- logging/* centraliza logger, scrub de dados sensíveis e correlação [TODO: detalhar stack].

## Integração: Webhook Asaas (idempotente)
- Rotas:
  - POST /api/webhooks/asaas → valida header `asaas-access-token`, faz parse seguro do payload (texto → JSON) e enfileira o processamento idempotente; responde 200 imediatamente com `{ message: "Webhook recebido" }`.
  - GET /api/webhooks/asaas → healthcheck simples `{ message: "Webhook ASAAS ativo" }`.
- Processamento central: função de orquestração aplica idempotência persistindo o evento em `asaas_webhook_events` e atualizando `status`, `processed_at`, `last_error` e `processing_time_ms` conforme o resultado.
- Reprocessamento: job `retryAsaasWebhookEvents` reavalia eventos `failed`/`pending` em lote (default: `maxBatch=25`, `maxRetry=5`) e chama o processador em modo `reprocessExisting`.
- Runtime: a rota força `runtime = 'nodejs'` para compatibilidade com dependências de servidor.

Notas de esquema (alinhamento planejado)
- Implementação atual usa colunas como `event_id`, `event_type`, `external_id`, `payload`, `status` em `asaas_webhook_events` (idempotência por unique key em `event_id`).
- Migração planejada define `asaas_webhook_events` normalizada com `external_account_id`, `payload_json`, `status` ∈ {received, processing, processed, failed}, `retry_count` e RLS por unidade via `external_accounts`. Ajustes de código serão necessários quando esta migração estiver ativa.

## Observabilidade e Confiabilidade
- Persistência de eventos com timestamps (`received_at`, `processed_at`) e métrica `processing_time_ms` permitem cálculo de latência de processamento.
- Retentativas controladas por `retry_count` e status transicionando entre `pending/failed/processed` (ou `received/processing/processed/failed` na migração nova).
- Logs de erro sanitizados (token oculto) e sem exposição de secrets em payloads ou headers.
