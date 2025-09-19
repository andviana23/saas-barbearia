# Autenticação e Controle de Acesso

Fluxo de Login
- Página: /login (pública) com formulário de autenticação.
- Parâmetro redirectTo preservado; após sucesso, redireciona ao destino seguro (se redirectTo === /login, cai em /dashboard).
- Sessão gerida via cookies do Supabase (SSR) e renovada automaticamente pelo middleware.

Rotas Públicas
- /login, /signup [TODO], /forgot-password, /reset-password
- /api/webhooks/asaas (pública por sessão, autenticada via header asaas-access-token)
- Assets e arquivos estáticos: /_next, /static, /assets, favicon.ico, robots.txt, sitemap.xml e extensões de arquivos

Middleware (src/middleware.ts)
- Ignora assets e rotas públicas explicitadas.
- Cria client Supabase SSR com forwarding de cookies e chama supabase.auth.getUser() para manter sessão válida.
- Em E2E (E2E_MODE=1), realiza bypass completo para reduzir latência.

Redirecionamentos
- Páginas protegidas devem redirecionar usuários não autenticados para /login?redirectTo=<rota>.
- Guards/client podem usar router.push com o caminho atual, garantindo retorno pós-login.

Multi-tenancy e RLS (unit_id)
- Isolamento por unit_id em todas as tabelas com RLS habilitada.
- Padrão de política (exemplos de migrações):
  - with check (public.has_role(<tabela>.unit_id, array['admin','manager','staff']))
  - using/with check (user_has_unit_access(unit_id)) em ambientes locais de desenvolvimento
- Regras específicas por domínio:
  - Agenda: appointments e relacionados permitem profissional em escopos específicos (ex.: professional)
  - Financeiro: transações e invoices normalmente exigem admin/manager; staff pode inserir/visualizar conforme tabela

RLS: Integrações (external_providers, external_accounts, asaas_webhook_events, payment_provider_mappings)
- external_providers
  - Select: permitido para qualquer usuário autenticado
  - Manage (insert/update/delete): restrito a admins centrais (registro global)
- external_accounts
  - Select: permitido a membros da unidade (unit_members)
  - Manage (insert/update/delete): restrito a admin/manager da unidade (public.has_role(unit_id, ['admin','manager']))
- asaas_webhook_events
  - Select: admin/manager cuja unidade corresponda à conta externa vinculada
  - Insert: admin/manager com vínculo à unidade da external_account
  - Update: admin/manager (para transicionar status e retries)
  - Delete: não permitido (sem política)
- payment_provider_mappings
  - Select: admin/manager
  - Manage (insert/update/delete): admin/manager

Notas sobre o Webhook Asaas
- A rota POST /api/webhooks/asaas autentica via header asaas-access-token (não via sessão) e valida o payload antes de enfileirar o processamento.
- Inserções na tabela asaas_webhook_events obedecem às políticas de RLS descritas acima; em produção, o handler deve operar com credenciais server-side adequadas (ex.: service role) ou via RPC segura para cumprir RLS com segurança.
- Exclusão de eventos não é suportada; reprocessamentos devem ocorrer via serviço de retry com controle de idempotência e incremento de retry_count.

Práticas recomendadas
- Validação de toda entrada com Zod antes de acessar serviços/banco
- Nunca confiar em dados do cliente para unit_id; derive do contexto de sessão/perfil
- No servidor, sempre filtrar por unit_id antes de retornar dados
