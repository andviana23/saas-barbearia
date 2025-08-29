-- Migration: Integrations (Asaas / External)
-- Date: 2025-08-28
-- Depends on: notifications_messaging (for webhook_events), access_control_security (roles) 
-- Adds: external_providers, external_accounts, asaas_webhook_events, payment_provider_mappings
-- Also: adds FK from webhook_events.provider -> external_providers.code

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.external_providers (
  code text primary key,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);
create index if not exists idx_external_providers_status on public.external_providers(status);

create table if not exists public.external_accounts (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  provider_code text not null references public.external_providers(code) on delete cascade,
  external_id text not null,
  status text not null default 'connected' check (status in ('connected','disconnected','error','pending')),
  config_json jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(config_json) = 'object'),
  unique (unit_id, provider_code, external_id)
);
create index if not exists idx_external_accounts_unit on public.external_accounts(unit_id);
create index if not exists idx_external_accounts_provider on public.external_accounts(provider_code);
create index if not exists idx_external_accounts_status on public.external_accounts(status);

create table if not exists public.asaas_webhook_events (
  id uuid primary key default gen_random_uuid(),
  external_account_id uuid not null references public.external_accounts(id) on delete cascade,
  event_type text not null,
  payload_json jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received' check (status in ('received','processing','processed','failed')),
  retry_count int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(payload_json) = 'object')
);
create index if not exists idx_asaas_webhook_events_account on public.asaas_webhook_events(external_account_id);
create index if not exists idx_asaas_webhook_events_status on public.asaas_webhook_events(status);
create index if not exists idx_asaas_webhook_events_received on public.asaas_webhook_events(received_at desc);

create table if not exists public.payment_provider_mappings (
  id uuid primary key default gen_random_uuid(),
  provider_code text not null references public.external_providers(code) on delete cascade,
  local_entity text not null, -- e.g. 'invoice','customer','subscription'
  external_id text not null,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_code, local_entity, external_id)
);
create index if not exists idx_payment_provider_mappings_provider on public.payment_provider_mappings(provider_code);
create index if not exists idx_payment_provider_mappings_entity on public.payment_provider_mappings(local_entity);

-- 2. Backfill / FK addition to existing webhook_events --------------------------
-- Add FK provider -> external_providers.code if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'webhook_events' AND c.conname = 'webhook_events_provider_fkey'
  ) THEN
    ALTER TABLE public.webhook_events
      ADD CONSTRAINT webhook_events_provider_fkey FOREIGN KEY (provider)
        REFERENCES public.external_providers(code) ON DELETE SET NULL;
  END IF;
END;$$;

-- 3. Triggers (updated_at) -----------------------------------------------------
create trigger trg_external_providers_updated_at before update on public.external_providers
  for each row execute procedure public.set_updated_at();
create trigger trg_external_accounts_updated_at before update on public.external_accounts
  for each row execute procedure public.set_updated_at();
create trigger trg_asaas_webhook_events_updated_at before update on public.asaas_webhook_events
  for each row execute procedure public.set_updated_at();
create trigger trg_payment_provider_mappings_updated_at before update on public.payment_provider_mappings
  for each row execute procedure public.set_updated_at();

-- 4. RLS Enable ----------------------------------------------------------------
alter table public.external_providers enable row level security;
alter table public.external_accounts enable row level security;
alter table public.asaas_webhook_events enable row level security;
alter table public.payment_provider_mappings enable row level security;

-- 5. Policies ------------------------------------------------------------------
-- external_providers: read for any authenticated; manage limited to admins (any unit) for central registry.
create policy "select_external_providers_any" on public.external_providers
  for select using (auth.role() = 'authenticated');
create policy "manage_external_providers_admins" on public.external_providers
  for all using (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name in ('admin')
  )) with check (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name in ('admin')
  ));

-- external_accounts: unit scoped; view for unit members; manage for admin/manager.
create policy "select_external_accounts_members" on public.external_accounts
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = external_accounts.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_external_accounts_admin_manager" on public.external_accounts
  for all using (public.has_role(external_accounts.unit_id, array['admin','manager']))
        with check (public.has_role(external_accounts.unit_id, array['admin','manager']));

-- asaas_webhook_events: derived from account's unit; select & insert for admin/manager; update for admin/manager (processing status). No delete.
create policy "select_asaas_webhook_events_admin_manager" on public.asaas_webhook_events
  for select using (exists (
    select 1 from public.external_accounts ea
    where ea.id = asaas_webhook_events.external_account_id
      and public.has_role(ea.unit_id, array['admin','manager'])
  ));
create policy "insert_asaas_webhook_events_admin_manager" on public.asaas_webhook_events
  for insert with check (exists (
    select 1 from public.external_accounts ea
    where ea.id = asaas_webhook_events.external_account_id
      and public.has_role(ea.unit_id, array['admin','manager'])
  ));
create policy "update_asaas_webhook_events_admin_manager" on public.asaas_webhook_events
  for update using (exists (
    select 1 from public.external_accounts ea
    where ea.id = asaas_webhook_events.external_account_id
      and public.has_role(ea.unit_id, array['admin','manager'])
  )) with check (exists (
    select 1 from public.external_accounts ea
    where ea.id = asaas_webhook_events.external_account_id
      and public.has_role(ea.unit_id, array['admin','manager'])
  ));

-- payment_provider_mappings: utilitário; view for admin/manager; manage admin/manager.
create policy "select_payment_provider_mappings_admin_manager" on public.payment_provider_mappings
  for select using (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name in ('admin','manager')
  ));
create policy "manage_payment_provider_mappings_admin_manager" on public.payment_provider_mappings
  for all using (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name in ('admin','manager')
  )) with check (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name in ('admin','manager')
  ));

commit;

-- Future: background jobs to sync external data and populate mappings.
