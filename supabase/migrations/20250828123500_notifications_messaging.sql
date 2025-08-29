-- Migration: Notifications & Messaging
-- Date: 2025-08-28
-- Depends on: core_identity, customers_crm (for profiles, customers)
-- Note: external_providers will be created later; provider field kept as text for now (FK can be added in later migration).

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  code text not null,
  channel text not null check (channel in ('email','sms','push','whatsapp','inapp')),
  subject text,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, code)
);
-- Unique for global templates (unit_id null)
create unique index if not exists ux_notification_templates_global_code on public.notification_templates(code) where unit_id is null;
create index if not exists idx_notification_templates_unit on public.notification_templates(unit_id);
create index if not exists idx_notification_templates_active on public.notification_templates(active);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  type text not null,
  channel text not null check (channel in ('email','sms','push','whatsapp','inapp')),
  title text,
  body text,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','canceled')),
  sent_at timestamptz,
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_notifications_unit on public.notifications(unit_id);
create index if not exists idx_notifications_status on public.notifications(status);
create index if not exists idx_notifications_channel on public.notifications(channel);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_customer on public.notifications(customer_id);
create index if not exists idx_notifications_provider_msg on public.notifications(provider_message_id);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null check (channel in ('email','sms','push','whatsapp','inapp')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, channel)
);
create index if not exists idx_notification_preferences_profile on public.notification_preferences(profile_id);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  payload_json jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received' check (status in ('received','processing','processed','failed')),
  retry_count int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_webhook_events_provider on public.webhook_events(provider);
create index if not exists idx_webhook_events_status on public.webhook_events(status);
create index if not exists idx_webhook_events_received_at on public.webhook_events(received_at);

-- 2. Triggers ------------------------------------------------------------------
create trigger trg_notification_templates_updated_at before update on public.notification_templates
  for each row execute procedure public.set_updated_at();
create trigger trg_notifications_updated_at before update on public.notifications
  for each row execute procedure public.set_updated_at();
create trigger trg_notification_preferences_updated_at before update on public.notification_preferences
  for each row execute procedure public.set_updated_at();
create trigger trg_webhook_events_updated_at before update on public.webhook_events
  for each row execute procedure public.set_updated_at();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.notification_templates enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.webhook_events enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- notification_templates
-- Select: global (unit_id null) visible to any authenticated; unit-specific visible to unit members
create policy "select_notification_templates" on public.notification_templates
  for select using (
    (unit_id is null) OR exists (
      select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
      where um.unit_id = notification_templates.unit_id and p.user_id = auth.uid()
    )
  );
-- Insert/Update/Delete only for admins/managers of the unit (disallow global modifications via RLS)
create policy "manage_notification_templates_unit" on public.notification_templates
  for all using (
    unit_id is not null and public.has_role(notification_templates.unit_id, array['admin','manager'])
  ) with check (
    unit_id is not null and public.has_role(notification_templates.unit_id, array['admin','manager'])
  );

-- notifications
-- Select: membership OR recipient user OR customer (if customer portal in future -> limited). For now membership or user.
create policy "select_notifications" on public.notifications
  for select using (
    exists (
      select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
      where um.unit_id = notifications.unit_id and p.user_id = auth.uid()
    ) OR exists (
      select 1 from public.profiles p2 where p2.id = notifications.user_id and p2.user_id = auth.uid()
    )
  );
-- Insert: staff roles or higher
create policy "insert_notifications" on public.notifications
  for insert with check (
    public.has_role(notifications.unit_id, array['admin','manager','staff'])
  );
-- Update: admin/manager (e.g., to set status, sent_at, error_message)
create policy "update_notifications" on public.notifications
  for update using (public.has_role(notifications.unit_id, array['admin','manager']))
          with check (public.has_role(notifications.unit_id, array['admin','manager']));

-- notification_preferences
-- Select: owner or admin/manager of owner unit(s)
create policy "select_notification_preferences" on public.notification_preferences
  for select using (
    exists (select 1 from public.profiles p where p.id = notification_preferences.profile_id and p.user_id = auth.uid())
    OR exists (
      select 1 from public.role_assignments ra
      join public.profiles p2 on p2.id = ra.user_id
      where p2.user_id = auth.uid() and ra.role_id in (
        select r.id from public.roles r where r.name in ('admin','manager')
      )
    )
  );
-- Upsert by owner
create policy "manage_notification_preferences_owner" on public.notification_preferences
  for all using (
    exists (select 1 from public.profiles p where p.id = notification_preferences.profile_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.profiles p where p.id = notification_preferences.profile_id and p.user_id = auth.uid())
  );

-- webhook_events
-- Select: admins/managers of any unit (since not unit scoped yet). We map via roles table.
create policy "select_webhook_events_admin_manager" on public.webhook_events
  for select using (
    exists (
      select 1 from public.role_assignments ra
      join public.profiles p on p.id = ra.user_id
      join public.roles r on r.id = ra.role_id
      where p.user_id = auth.uid() and r.name in ('admin','manager')
    )
  );
-- Insert: restrict to admins/managers (service role also bypasses RLS if using) 
create policy "insert_webhook_events_admin_manager" on public.webhook_events
  for insert with check (
    exists (
      select 1 from public.role_assignments ra
      join public.profiles p on p.id = ra.user_id
      join public.roles r on r.id = ra.role_id
      where p.user_id = auth.uid() and r.name in ('admin','manager')
    )
  );
-- Update: admins/managers to set processed status / retries
create policy "update_webhook_events_admin_manager" on public.webhook_events
  for update using (
    exists (
      select 1 from public.role_assignments ra
      join public.profiles p on p.id = ra.user_id
      join public.roles r on r.id = ra.role_id
      where p.user_id = auth.uid() and r.name in ('admin','manager')
    )
  ) with check (
    exists (
      select 1 from public.role_assignments ra
      join public.profiles p on p.id = ra.user_id
      join public.roles r on r.id = ra.role_id
      where p.user_id = auth.uid() and r.name in ('admin','manager')
    )
  );
-- No delete policy (immutable audit trail)

commit;

-- Future enhancements:
-- * Add FK webhook_events.provider -> external_providers.code after integrations migration.
-- * Add per-unit scoping for webhook_events if needed.
