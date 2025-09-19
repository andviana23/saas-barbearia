# Política de Segurança

Variáveis Sensíveis
- Todas as chaves/API em .env.local (nunca commitar)
- Exemplos: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ASAAS_WEBHOOK_TOKEN [TODO nomes exatos]

Multi-tenant (RLS)
- Isolamento por unit_id em todas as tabelas de domínio
- Políticas usam funções de autorização (ex.: public.has_role(unit_id, roles)) e, localmente, user_has_unit_access_local

Aplicação (Next.js)
- Middleware protege rotas por padrão e realiza refresh de sessão SSR
- Rotas públicas explicitamente liberadas (login, forgot-password, webhooks)
- Redirecionamentos seguros com redirectTo

Logs & Telemetria
- Remoção/scrub de dados sensíveis (tokens, chaves)
- Não registrar payloads completos de webhooks com dados pessoais

Checklist
- [ ] Nenhuma chave exposta em logs ou client bundle
- [ ] Rotas privadas protegidas por middleware/guards
- [ ] Validação de input com Zod em endpoints e formulários
- [ ] Revisão de políticas RLS por release

Resposta a vulnerabilidades
- Reporte para o e-mail da equipe de segurança [TODO contato]
