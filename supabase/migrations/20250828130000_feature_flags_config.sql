-- Migration: Feature Flags / Config
-- Date: 2025-08-28
-- Phase 13
-- Tables: feature_flags, unit_settings, system_settings

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.feature_flags (
  code text primary key,
  description text,
  enabled_globally boolean not null default false,
  enabled_for_units jsonb, -- array of unit_id UUIDs
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_feature_flags_units_json check (enabled_for_units is null or jsonb_typeof(enabled_for_units) = 'array')
);
create index if not exists idx_feature_flags_enabled_global on public.feature_flags(enabled_globally);

create table if not exists public.unit_settings (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  key text not null,
  value_text text,
  value_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_unit_settings_json_obj check (value_json is null or jsonb_typeof(value_json) = 'object'),
  unique (unit_id, key)
);
create index if not exists idx_unit_settings_unit on public.unit_settings(unit_id);

create table if not exists public.system_settings (
  key text primary key,
  value_text text,
  value_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_system_settings_json_obj check (value_json is null or jsonb_typeof(value_json) = 'object')
);

-- 2. Triggers ------------------------------------------------------------------
create trigger trg_feature_flags_updated_at before update on public.feature_flags
  for each row execute procedure public.set_updated_at();
create trigger trg_unit_settings_updated_at before update on public.unit_settings
  for each row execute procedure public.set_updated_at();
create trigger trg_system_settings_updated_at before update on public.system_settings
  for each row execute procedure public.set_updated_at();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.feature_flags enable row level security;
alter table public.unit_settings enable row level security;
alter table public.system_settings enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- feature_flags: all authenticated can read; only admins (any unit) manage
create policy "select_feature_flags_any" on public.feature_flags
  for select using (auth.role() = 'authenticated');
create policy "manage_feature_flags_admin" on public.feature_flags
  for all using (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name = 'admin'
  )) with check (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name = 'admin'
  ));

-- unit_settings: read for unit members; manage admin/manager
create policy "select_unit_settings_members" on public.unit_settings
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = unit_settings.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_unit_settings_admin_manager" on public.unit_settings
  for all using (public.has_role(unit_settings.unit_id, array['admin','manager']))
        with check (public.has_role(unit_settings.unit_id, array['admin','manager']));

-- system_settings: read for admins/managers; manage admin only
create policy "select_system_settings_admin_manager" on public.system_settings
  for select using (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name in ('admin','manager')
  ));
create policy "manage_system_settings_admin" on public.system_settings
  for all using (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name = 'admin'
  )) with check (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.name = 'admin'
  ));

commit;

-- Future: view merging system + unit settings + feature flags effective toggles.
