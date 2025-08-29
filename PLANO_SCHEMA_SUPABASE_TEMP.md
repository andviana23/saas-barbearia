# Supabase Schema Rebuild Plan (TEMPORARY)

> Este arquivo é temporário. Objetivo: listar todas as entidades (tabelas) em inglês a recriar no novo Supabase, agrupadas por domínio. Sem SQL agora. Após concluir criação e migrações, apagar este arquivo.

## Principles

- Naming: snake_case para tabelas e colunas; singular para coluna FK (ex: user_id), plural para tabelas (users, appointments).
- Timestamps padrão: created_at (timestamptz, default now()), updated_at (timestamptz, trigger), deleted_at (nullable) quando soft delete necessário.
- Multitenancy: unit_id (ou tenant_id se preferir) em todas as tabelas de domínio pertencentes a uma unidade.
- RLS: habilitar e aplicar policies por unit_id + user roles.
- Auditing: audit_logs tabela genérica para eventos relevantes.

## 1. Core / Identity

- [x] users (auth base – usar auth.users do Supabase; criar view app_users se precisar enriquecer)
- [x] profiles (dados estendidos do usuário: name, phone, avatar_url, role, unit_default_id, commission_percentage, is_active)
- [x] roles (definição de papéis custom se precisar além de enum simples)
- [x] role_assignments (user_id, role_id, unit_id)
- [x] units (unidades / barbershops: name, timezone, status)
- [x] unit_members (unit_id, user_id, is_manager, joined_at)

## 2. Services & Catalog

- [x] service_categories (unit_id, name, order)
- [x] services (unit_id, category_id, name, description, duration_minutes, base_price, is_active)
- [x] service_pricings (service_id, valid_from, valid_to, price) – histórico de preço
- [x] professional_services (service_id, professional_id, custom_price, active)

## 3. Customers & CRM

- [x] customers (unit_id, name, phone, email, birth_date, gender, notes, is_active)
- [x] customer_addresses (customer_id, address_line, city, state, postal_code)
- [x] customer_tags (unit_id, name, color)
- [x] customer_tag_links (customer_id, tag_id)
- [x] customer_notes (customer_id, author_id, note, created_at)

## 4. Scheduling / Agenda

- [x] professionals (alias para profiles filtrando role? (opcional) ou materialized view) – se optar por tabela própria: professional_id PK + user_id FK
- [x] working_hours (professional_id, weekday, start_time, end_time, break_start, break_end)
- [x] time_offs (professional_id, start_datetime, end_datetime, reason)
- [x] appointments (unit_id, customer_id, professional_id, start_time, end_time, status, source, notes, total_price)
- [x] appointment_services (appointment_id, service_id, quantity, price, duration_minutes)
- [x] appointment_status_history (appointment_id, status, changed_by, changed_at, reason)
- [x] appointment_notifications (appointment_id, type, channel, sent_at, status, provider_message_id)
- [x] waiting_list (unit_id, customer_id, desired_date, preferred_time_range, status, notes)

## 5. Subscriptions / Plans

- [x] subscription_plans (unit_id/null global, name, description, interval_type, interval_count, price, currency, status)
- [x] plan_benefits (plan_id, benefit_type, value, metadata)
- [x] subscriptions (unit_id, customer_id, plan_id, status, start_date, end_date, next_billing_date, cancel_at_period_end, external_provider_id)
- [x] subscription_cycles (subscription_id, cycle_start, cycle_end, status, invoice_id)
- [x] subscription_payments (subscription_id, payment_date, amount, method, provider, provider_payment_id, status)
- [x] subscription_usage (subscription_id, benefit_type, used_value, period_start, period_end)

## 6. Payments / Financial

- [x] payment_methods (customer_id, type, brand, last4, expires_at, external_ref, is_default)
- [x] financial_transactions (unit_id, customer_id?, appointment_id?, subscription_id?, type, subtype, amount, currency, status, occurred_at, source, reference)
- [x] cashbox_sessions (unit_id, opened_by, opened_at, closed_by, closed_at, opening_amount, closing_amount, status)
- [x] cashbox_transactions (cashbox_session_id, type, amount, description, reference_type, reference_id, performed_by, occurred_at)
- [x] invoices (unit_id, customer_id, subscription_id?, appointment_id?, total_amount, currency, status, due_date, paid_at, external_invoice_id)
- [x] invoice_items (invoice_id, item_type, description, quantity, unit_price, total_price, reference_type, reference_id)
- [x] refunds (financial_transaction_id, amount, reason, processed_at, status)

## 7. Inventory / Products & Sales (se aplicável)

- [x] product_categories (unit_id, name, order)
- [x] products (unit_id, category_id, name, sku, description, cost_price, sale_price, stock_quantity, low_stock_threshold, is_active)
- [x] product_stock_movements (product_id, movement_type, quantity, reason, reference_type, reference_id, performed_by, occurred_at)
- [x] sales (unit_id, customer_id?, total_amount, discount_amount, net_amount, status, sold_at, performed_by)
- [x] sale_items (sale_id, product_id, quantity, unit_price, total_price)
- [x] sale_payments (sale_id, method, amount, provider, provider_payment_id, status)

## 8. Notifications & Messaging

- [x] notification_templates (unit_id/null, code, channel, subject, body, active)
- [x] notifications (unit_id, user_id?, customer_id?, type, channel, title, body, status, sent_at, provider_message_id)
- [x] notification_preferences (profile_id, channel, enabled)
- [x] webhook_events (provider, event_type, payload_json, received_at, processed_at, status, retry_count)

## 9. Reporting / Analytics

- [x] kpi_snapshots (unit_id, date, metric, value)
- [x] appointment_stats_daily (unit_id, date, total, confirmed, completed, canceled, no_show, revenue)
- [x] subscription_stats_monthly (unit_id, month, active, new, churned, mrr, arr)
- [x] revenue_aggregation_daily (unit_id, date, source, amount)

## 10. Access Control / Security

- [x] api_keys (unit_id, name, token_hash, created_by, last_used_at, revoked_at)
- [x] audit_logs (unit_id?, actor_id, action, entity_type, entity_id, metadata, occurred_at)
- [x] sessions_extended (user_id, device, ip, user_agent, last_seen_at)

## 11. Integrations (Asaas / External)

- [x] external_providers (code, name, status)
- [x] external_accounts (unit_id, provider_code, external_id, status, config_json, connected_at)
- [x] asaas_webhook_events (external_account_id, event_type, payload_json, received_at, processed_at, status)
- [x] payment_provider_mappings (provider_code, local_entity, external_id, last_sync_at)

## 12. Marketing / Engagement (opcional futuro)

- [x] campaigns (unit_id, name, channel, status, scheduled_at, sent_at)
- [x] campaign_targets (campaign_id, target_type, target_id, status)
- [x] discounts (unit_id, code, type, value, starts_at, ends_at, usage_limit, used_count, status)
- [x] discount_usages (discount_id, entity_type, entity_id, used_at, amount_applied)

## 13. Feature Flags / Config

- [x] feature_flags (code, description, enabled_globally, enabled_for_units JSONB)
- [x] unit_settings (unit_id, key, value_text, value_json)
- [x] system_settings (key, value_text, value_json)

## 14. Support / Tickets (opcional futuro)

- [x] support_tickets (unit_id, customer_id?, subject, status, priority, opened_at, closed_at)
- [x] support_ticket_messages (ticket_id, author_type, author_id, message, sent_at)

## 15. Misc / Utilities

- [x] media_files (unit_id?, owner_id?, path, mime_type, size_bytes, uploaded_at, variants_json)
- [x] imports (unit_id, type, file_path, status, started_at, finished_at, stats_json)
- [x] export_jobs (unit_id, type, params_json, status, started_at, finished_at, file_path)
- [x] geo_locations (entity_type, entity_id, lat, lng, captured_at, accuracy_m)

---

### Dependency Overview (Key FKs)

- profiles.user_id -> auth.users.id
- role_assignments.role_id -> roles.id; role_assignments.user_id -> profiles.id
- unit_members.unit_id -> units.id; unit_members.user_id -> profiles.id
- services.category_id -> service_categories.id
- professional_services.professional_id -> profiles.id (ou professionals.id se tabela separada)
- appointments.customer_id -> customers.id; appointments.professional_id -> profiles.id; appointments.unit_id -> units.id
- appointment_services.appointment_id -> appointments.id; appointment_services.service_id -> services.id
- subscriptions.plan_id -> subscription_plans.id; subscriptions.customer_id -> customers.id
- subscription_payments.subscription_id -> subscriptions.id
- financial_transactions.subscription_id/appointment_id -> respectivas tabelas
- cashbox_transactions.cashbox_session_id -> cashbox_sessions.id
- invoice_items.invoice_id -> invoices.id
- sale_items.sale_id -> sales.id; sale_items.product_id -> products.id
- sale_payments.sale_id -> sales.id
- notifications.customer_id -> customers.id; notifications.user_id -> profiles.id
- webhook_events.provider -> external_providers.code
- asaas_webhook_events.external_account_id -> external_accounts.id
- campaign_targets.campaign_id -> campaigns.id
- discount_usages.discount_id -> discounts.id
- support_ticket_messages.ticket_id -> support_tickets.id

> Nota: Todas as dependências acima já foram implementadas nas migrações em `supabase/migrations/`. Este arquivo agora serve apenas como referência histórica e pode ser removido após validação final de integridade (FKs e RLS). Nenhuma criação adicional necessária para esta lista.

### Phased Creation Plan

Phase 1 (Foundations): users/profiles, units, unit\*members, roles, role_assignments, service_categories, services, customers.
Phase 2 (Scheduling): working_hours, time_offs, appointments, appointment_services, appointment_status_history.
Phase 3 (Financial Core): subscription_plans, subscriptions (+cycles, payments, usage), financial_transactions, invoices, invoice_items.
Phase 4 (Sales & Inventory): products, product_stock_movements, sales, sale_items, sale_payments.
Phase 5 (Notifications & Integrations): notification_templates, notifications, webhook_events, external_providers, external_accounts, asaas_webhook_events.
Phase 6 (Reporting & Analytics): kpi_snapshots, appointment_stats_daily, subscription_stats_monthly, revenue_aggregation_daily.
Phase 7 (Enhancements): cashbox\*\* tables, audit_logs, api_keys, feature_flags, unit_settings, system_settings.
Phase 8 (Optional Future): campaigns, discounts, support_tickets, media_files, imports/exports, geo_locations.

### Next Step

Validar esta lista, ajustar nomes ou remover módulos não necessários para o MVP. Em seguida gerar scripts SQL fase a fase.

(REMEMBER: Delete this file after schema is created.)
