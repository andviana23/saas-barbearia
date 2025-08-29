-- Migration: Services & Catalog (Phase 2 subset) - service_categories, services, service_pricings, professional_services
-- Date: 2025-08-28
-- Depends on: core_identity migration (units, profiles, roles, unit_members, has_role function)

begin;

-- 1. Tables ---------------------------------------------------------------------
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, name)
);
create index if not exists idx_service_categories_unit on public.service_categories(unit_id);
create trigger trg_service_categories_updated_at before update on public.service_categories
  for each row execute procedure public.set_updated_at();

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  category_id uuid references public.service_categories(id) on delete set null,
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0 and duration_minutes <= 600),
  base_price numeric(10,2) not null check (base_price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, name)
);
create index if not exists idx_services_unit on public.services(unit_id);
create index if not exists idx_services_category on public.services(category_id);
create trigger trg_services_updated_at before update on public.services
  for each row execute procedure public.set_updated_at();

-- Historical / versioned pricing per service
create table if not exists public.service_pricings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  valid_from date not null,
  valid_to date,
  price numeric(10,2) not null check (price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, valid_from),
  check (valid_to is null or valid_to >= valid_from)
);
create index if not exists idx_service_pricings_service on public.service_pricings(service_id);
create index if not exists idx_service_pricings_unit on public.service_pricings(unit_id);
create trigger trg_service_pricings_updated_at before update on public.service_pricings
  for each row execute procedure public.set_updated_at();

-- Mapping of which professionals can perform which services (with optional custom price)
-- professional_id references profiles (assuming professionals derived from profiles with role)
create table if not exists public.professional_services (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  custom_price numeric(10,2) check (custom_price is null or custom_price >= 0),
  custom_duration_minutes int check (custom_duration_minutes is null or (custom_duration_minutes > 0 and custom_duration_minutes <= 600)),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, professional_id)
);
create index if not exists idx_professional_services_service on public.professional_services(service_id);
create index if not exists idx_professional_services_professional on public.professional_services(professional_id);
create index if not exists idx_professional_services_unit on public.professional_services(unit_id);
create trigger trg_professional_services_updated_at before update on public.professional_services
  for each row execute procedure public.set_updated_at();

-- 2. RLS ------------------------------------------------------------------------
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_pricings enable row level security;
alter table public.professional_services enable row level security;

-- Shared membership expression: user must belong to the unit
-- (Reuse logic via EXISTS with unit_members + profiles)

-- Policies: service_categories
create policy "select_service_categories_same_unit" on public.service_categories
  for select using (
    exists (
      select 1 from public.unit_members um
      join public.profiles p on p.id = um.user_id
      where um.unit_id = service_categories.unit_id and p.user_id = auth.uid()
    )
  );
create policy "insert_service_categories_admin_manager" on public.service_categories
  for insert with check (public.has_role(service_categories.unit_id, array['admin','manager']));
create policy "update_service_categories_admin_manager" on public.service_categories
  for update using (public.has_role(service_categories.unit_id, array['admin','manager']))
          with check (public.has_role(service_categories.unit_id, array['admin','manager']));

-- Policies: services
create policy "select_services_same_unit" on public.services
  for select using (
    exists (
      select 1 from public.unit_members um
      join public.profiles p on p.id = um.user_id
      where um.unit_id = services.unit_id and p.user_id = auth.uid()
    )
  );
create policy "insert_services_admin_manager" on public.services
  for insert with check (public.has_role(services.unit_id, array['admin','manager']));
create policy "update_services_admin_manager" on public.services
  for update using (public.has_role(services.unit_id, array['admin','manager']))
          with check (public.has_role(services.unit_id, array['admin','manager']));

-- Policies: service_pricings
create policy "select_service_pricings_same_unit" on public.service_pricings
  for select using (
    exists (
      select 1 from public.unit_members um
      join public.profiles p on p.id = um.user_id
      where um.unit_id = service_pricings.unit_id and p.user_id = auth.uid()
    )
  );
create policy "manage_service_pricings_admin_manager" on public.service_pricings
  for all using (public.has_role(service_pricings.unit_id, array['admin','manager']))
        with check (public.has_role(service_pricings.unit_id, array['admin','manager']));

-- Policies: professional_services
create policy "select_professional_services_same_unit" on public.professional_services
  for select using (
    exists (
      select 1 from public.unit_members um
      join public.profiles p on p.id = um.user_id
      where um.unit_id = professional_services.unit_id and p.user_id = auth.uid()
    )
  );
create policy "manage_professional_services_admin_manager" on public.professional_services
  for all using (public.has_role(professional_services.unit_id, array['admin','manager']))
        with check (public.has_role(professional_services.unit_id, array['admin','manager']));

-- 3. Triggers to auto-populate unit_id in dependent tables ----------------------
-- Ensure unit_id in service_pricings matches service.unit_id
create or replace function public.sync_service_pricing_unit()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    select s.unit_id into new.unit_id from public.services s where s.id = new.service_id;
  else
    if (new.unit_id <> old.unit_id) then
      raise exception 'unit_id cannot be changed';
    end if;
  end if;
  return new;
end;$$;

create trigger trg_service_pricings_sync before insert or update on public.service_pricings
  for each row execute procedure public.sync_service_pricing_unit();

-- Ensure unit_id in professional_services matches service.unit_id
create or replace function public.sync_professional_service_unit()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    select s.unit_id into new.unit_id from public.services s where s.id = new.service_id;
  else
    if (new.unit_id <> old.unit_id) then
      raise exception 'unit_id cannot be changed';
    end if;
  end if;
  return new;
end;$$;

create trigger trg_professional_services_sync before insert or update on public.professional_services
  for each row execute procedure public.sync_professional_service_unit();

commit;

-- Rollback guidance: drop triggers (sync_*), drop tables in reverse dependency order.
