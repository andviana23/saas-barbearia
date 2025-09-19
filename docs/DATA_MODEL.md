# Modelo de Dados (Visão Lógica)

Entidades-chave (multi-tenant por unit_id)
- units, unit_members
- customers, customer_tags
- professionals, professional_services
- service_categories, services, service_pricings
- appointments, appointment_services, appointment_notifications, working_hours, waiting_list
- products, product_categories, sales
- subscriptions, invoices
- financial_transactions, cashbox_sessions
- notifications
- campaigns, discounts
- unit_settings (feature flags/config)
- kpi_snapshots, appointment_stats_daily, subscription_stats_monthly, revenue_aggregation_daily
- external_providers, external_accounts, asaas_webhook_events, payment_provider_mappings (integrações)
- support_tickets
- media_files, geo_locations, imports, export_jobs

Relacionamentos (resumo)
- Todas as tabelas de domínio possuem unit_id → units.id
- customers → appointments (1:N)
- professionals → appointments (N:N via appointment_services/professional_services)
- services → appointment_services (1:N)
- subscriptions → invoices (1:N)
- sales/financial_transactions relacionam-se a clientes/serviços/produtos conforme o fluxo de negócio [TODO detalhar]

Regras de Integridade
- FKs consistentes; índices por unit_id para partição lógica e performance
- Soft-delete/histórico: [TODO mapear tabelas com deleted_at/audit]

## Detalhes: Integrações e Webhooks
- external_providers: catálogo de provedores externos (code, name, status). Índices por status e unicidade por name.
- external_accounts: conexão da unidade com um provedor (unit_id, provider_code, external_id, status, config_json). Unique (unit_id, provider_code, external_id).
- asaas_webhook_events: recebimento e processamento de eventos do provedor (external_account_id → external_accounts.id, event_type, payload_json, received_at, processed_at, status, retry_count, last_error).
  - Idempotência: o serviço de aplicação persiste cada evento e evita duplicidade via chave única lógica no event_id (implementação atual) e normalização planejada por external_account_id + atributos de negócio.
  - Monitoramento: métricas de tempo de processamento e contagem de retries.
- payment_provider_mappings: mapeamento entre entidades locais e IDs externos (provider_code, local_entity, external_id) com unicidade por combinação.

RLS (resumo)
- Padrão: with check/using baseadas em unit_id, delegando a funções de autorização (ex.: public.has_role(unit_id, roles))
- Exceções por domínio:
  - Agenda permite role 'professional' em inserções/leitura relacionadas ao próprio escopo
  - Financeiro e assinaturas restringem mutações a admin/manager, leitura parcial a staff
- Integrações (políticas específicas):
  - asaas_webhook_events: select/insert/update permitidos para admin/manager da unidade associada via external_accounts.external_account_id; delete não permitido.
  - external_accounts: leitura para membros da unidade; gestão (insert/update/delete) para admin/manager.
  - external_providers: leitura para autenticados; gestão restrita a admin centrais.
- Ambiente local pode usar funções auxiliares (user_has_unit_access_local) para desenvolvimento
