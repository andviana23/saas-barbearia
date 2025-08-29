-- Migration: Core / Identity (Phase 1)
-- Date: 2025-08-28
-- This file creates foundational identity / tenancy tables.
-- NOTE: Depends on Supabase auth schema (auth.users)

begin;

-- 1. Extensions ----------------------------------------------------------------
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- 2. Helper Functions -----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

-- (ADIAR DEFINIÇÃO) A função has_role será criada após as tabelas para evitar erro de relação inexistente.

-- 3. Tables ---------------------------------------------------------------------
-- units: tenant root
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'UTC',
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_units_updated_at before update on public.units
  for each row execute procedure public.set_updated_at();

-- profiles: 1-1 with auth.users (extended user data)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  phone text,
  avatar_url text,
  role text, -- optional legacy/simple role; granular roles via role_assignments
  unit_default_id uuid references public.units(id) on delete set null,
  commission_percentage numeric(5,2) check (commission_percentage is null or (commission_percentage >= 0 and commission_percentage <= 100)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);
create index if not exists idx_profiles_unit_default on public.profiles(unit_default_id);
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- roles: catalog of role codes
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,  -- e.g. 'admin','manager','professional','staff'
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- role_assignments: per unit role mapping to a profile (user)
create table if not exists public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, unit_id, role_id)
);
create index if not exists idx_role_assignments_unit on public.role_assignments(unit_id);
create index if not exists idx_role_assignments_user on public.role_assignments(user_id);

-- unit_members: membership (can be derived from role_assignments but kept explicit)
create table if not exists public.unit_members (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_manager boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (unit_id, user_id)
);
create index if not exists idx_unit_members_unit on public.unit_members(unit_id);
create index if not exists idx_unit_members_user on public.unit_members(user_id);

-- 3b. Helper Function now that dependent tables exist --------------------------
create or replace function public.has_role(unit uuid, role_codes text[])
returns boolean
security definer
set search_path = public
language plpgsql stable as $$
declare
  v_exists boolean;
begin
  select exists (
    select 1
    from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where ra.unit_id = has_role.unit
      and p.user_id = auth.uid()
      and r.code = any(role_codes)
  ) into v_exists;
  return v_exists;
end;$$;

-- 4. Row Level Security ---------------------------------------------------------
alter table public.units enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.role_assignments enable row level security;
alter table public.unit_members enable row level security;

-- Policies: Units
create policy "select_units_member" on public.units
  for select using (
    exists (
      select 1 from public.unit_members um
      join public.profiles p on p.id = um.user_id
      where um.unit_id = units.id and p.user_id = auth.uid()
    )
  );
create policy "insert_units_any_authenticated" on public.units
  for insert with check (auth.role() = 'authenticated');
create policy "update_units_manager" on public.units
  for update using (public.has_role(units.id, array['admin','manager']))
          with check (public.has_role(units.id, array['admin','manager']));

-- Policies: Profiles
create policy "select_own_or_same_unit" on public.profiles
  for select using (
    auth.uid() = user_id or (
      unit_default_id is not null and exists (
        select 1 from public.unit_members um
        join public.profiles p2 on p2.id = um.user_id
        where p2.user_id = auth.uid() and um.unit_id = profiles.unit_default_id
      )
    )
  );
create policy "insert_own_profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "update_own_profile" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies: Roles (read open, modifications by admins only)
create policy "select_roles_all" on public.roles
  for select using (true);
create policy "insert_roles_admin" on public.roles
  for insert with check (exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.profiles p on p.id = ra.user_id
    where p.user_id = auth.uid() and r.code in ('admin')
  ));

-- Policies: Role Assignments
create policy "select_role_assignments_self_or_same_unit" on public.role_assignments
  for select using (
    exists (
      select 1 from public.profiles p where p.id = role_assignments.user_id and p.user_id = auth.uid()
    ) or exists (
      select 1 from public.unit_members um
      join public.profiles p2 on p2.id = um.user_id
      where um.unit_id = role_assignments.unit_id and p2.user_id = auth.uid()
    )
  );
create policy "manage_role_assignments_admin" on public.role_assignments
  for all using (
    public.has_role(role_assignments.unit_id, array['admin','manager'])
  ) with check (
    public.has_role(role_assignments.unit_id, array['admin','manager'])
  );

-- Policies: Unit Members
create policy "select_unit_members_same_unit" on public.unit_members
  for select using (
    exists (
      select 1 from public.unit_members um2
      join public.profiles p on p.id = um2.user_id
      where um2.unit_id = unit_members.unit_id and p.user_id = auth.uid()
    )
  );
create policy "insert_unit_members_admin" on public.unit_members
  for insert with check (public.has_role(unit_members.unit_id, array['admin','manager']));
create policy "update_unit_members_admin" on public.unit_members
  for update using (public.has_role(unit_members.unit_id, array['admin','manager']))
          with check (public.has_role(unit_members.unit_id, array['admin','manager']));

-- 5. Seed Data (Optional basic roles) -------------------------------------------
insert into public.roles (code, name, description)
values
  ('admin','Administrator','Full access / manages unit'),
  ('manager','Manager','Manages schedules and staff'),
  ('professional','Professional','Provides services / appointments'),
  ('staff','Staff','Basic operational role')
on conflict (code) do nothing;

commit;

-- Rollback Guidance (manual): drop policies, tables in reverse order, then functions.
