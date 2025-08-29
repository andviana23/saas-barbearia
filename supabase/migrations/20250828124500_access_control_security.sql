-- Migration: Access Control / Security
-- Date: 2025-08-28
-- Depends on: core_identity
-- Contains: api_keys, audit_logs, sessions_extended

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  token_hash text not null, -- store only hash (e.g., SHA-256/argon2), never raw token
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  scopes text[] default '{}',
  description text,
  constraint chk_api_keys_revoked check (revoked_at is null or revoked_at >= created_at),
  unique (unit_id, name),
  unique (token_hash)
);
create index if not exists idx_api_keys_unit on public.api_keys(unit_id);
create index if not exists idx_api_keys_revoked on public.api_keys(revoked_at);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  -- indexes will help filtering by unit & time
  check (jsonb_typeof(metadata) = 'object')
);
create index if not exists idx_audit_logs_unit_occurred on public.audit_logs(unit_id, occurred_at desc);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

create table if not exists public.sessions_extended (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device text,
  ip text,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device)
);
create index if not exists idx_sessions_extended_user on public.sessions_extended(user_id);
create index if not exists idx_sessions_extended_last_seen on public.sessions_extended(last_seen_at desc);

-- 2. Triggers ------------------------------------------------------------------
create trigger trg_sessions_extended_updated_at before update on public.sessions_extended
  for each row execute procedure public.set_updated_at();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.api_keys enable row level security;
alter table public.audit_logs enable row level security;
alter table public.sessions_extended enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- api_keys: Only admins/managers of the unit can view/manage. Insert/Update/Delete restricted likewise.
create policy "select_api_keys_admin_manager" on public.api_keys
  for select using (public.has_role(api_keys.unit_id, array['admin','manager']));
create policy "manage_api_keys_admin_manager" on public.api_keys
  for all using (public.has_role(api_keys.unit_id, array['admin','manager']))
        with check (public.has_role(api_keys.unit_id, array['admin','manager']));

-- audit_logs: Select allowed to admins/managers of the unit. Global (unit_id null) only visible to global admins (role on some unit) - simplified by requiring any admin/manager role and unit_id is null.
create policy "select_audit_logs_admin_manager" on public.audit_logs
  for select using (
    (audit_logs.unit_id is not null and public.has_role(audit_logs.unit_id, array['admin','manager']))
    OR (audit_logs.unit_id is null and exists (
      select 1 from public.role_assignments ra
      join public.roles r on r.id = ra.role_id
      join public.profiles p on p.id = ra.user_id
      where p.user_id = auth.uid() and r.name in ('admin','manager')
    ))
  );
-- Insert: allow any authenticated user to record; rely on server functions for critical logs. (Need membership if unit_id provided)
create policy "insert_audit_logs_any_member" on public.audit_logs
  for insert with check (
    (audit_logs.unit_id is null) OR exists (
      select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
      where um.unit_id = audit_logs.unit_id and p.user_id = auth.uid()
    )
  );
-- No update/delete (immutable)

-- sessions_extended: Owner can select & update their own; admins/managers can view for oversight.
create policy "select_sessions_extended_owner_or_admin" on public.sessions_extended
  for select using (
    exists (select 1 from public.profiles p where p.id = sessions_extended.user_id and p.user_id = auth.uid())
    OR exists (
      select 1 from public.role_assignments ra
      join public.profiles p2 on p2.id = ra.user_id
      join public.roles r on r.id = ra.role_id
      where p2.user_id = auth.uid() and r.name in ('admin','manager')
    )
  );
create policy "insert_sessions_extended_owner" on public.sessions_extended
  for insert with check (
    exists (select 1 from public.profiles p where p.id = sessions_extended.user_id and p.user_id = auth.uid())
  );
create policy "update_sessions_extended_owner" on public.sessions_extended
  for update using (
    exists (select 1 from public.profiles p where p.id = sessions_extended.user_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.profiles p where p.id = sessions_extended.user_id and p.user_id = auth.uid())
  );
-- Optional: Admins can delete stale sessions
create policy "delete_sessions_extended_admin_manager" on public.sessions_extended
  for delete using (
    exists (
      select 1 from public.role_assignments ra
      join public.profiles p2 on p2.id = ra.user_id
      join public.roles r on r.id = ra.role_id
      where p2.user_id = auth.uid() and r.name in ('admin','manager')
    )
  );

commit;

-- Future considerations:
-- * Add automatic purge job for old audit_logs & sessions.
-- * Implement function to rotate api_keys and soft-revoke with grace period.
