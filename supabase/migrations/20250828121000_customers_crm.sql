-- Migration: Customers & CRM (Phase - Customers domain)
-- Date: 2025-08-28
-- Depends on: core_identity (units, profiles) + services_catalog (optional for cross refs later)
-- Pattern: tables -> indexes -> triggers -> RLS enable -> policies -> (optional seed) -> commit

begin;

-- 0. Extensions (necessárias para índices específicos) ------------------------
create extension if not exists pg_trgm; -- para gin_trgm_ops em busca por nome

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  birth_date date,
  gender text check (gender is null or gender in ('male','female','other','prefer_not')),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, email),
  unique (unit_id, phone)
);
create index if not exists idx_customers_unit on public.customers(unit_id);
create index if not exists idx_customers_name_trgm on public.customers using gin (name gin_trgm_ops);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  address_line text not null,
  city text,
  state text,
  postal_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customer_addresses_customer on public.customer_addresses(customer_id);

create table if not exists public.customer_tags (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, name)
);
create index if not exists idx_customer_tags_unit on public.customer_tags(unit_id);

create table if not exists public.customer_tag_links (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  tag_id uuid not null references public.customer_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, tag_id)
);
create index if not exists idx_customer_tag_links_customer on public.customer_tag_links(customer_id);
create index if not exists idx_customer_tag_links_tag on public.customer_tag_links(tag_id);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_customer_notes_customer on public.customer_notes(customer_id);
create index if not exists idx_customer_notes_author on public.customer_notes(author_id);

-- 2. Triggers (updated_at) -----------------------------------------------------
create trigger trg_customers_updated_at before update on public.customers
  for each row execute procedure public.set_updated_at();
create trigger trg_customer_addresses_updated_at before update on public.customer_addresses
  for each row execute procedure public.set_updated_at();
create trigger trg_customer_tags_updated_at before update on public.customer_tags
  for each row execute procedure public.set_updated_at();

-- (customer_tag_links e customer_notes não precisam de updated_at)

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_tags enable row level security;
alter table public.customer_tag_links enable row level security;
alter table public.customer_notes enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- Helper pattern: membership via unit_members + profiles for unit bound tables.

-- customers
create policy "select_customers_same_unit" on public.customers
  for select using (
    exists (
      select 1 from public.unit_members um
      join public.profiles p on p.id = um.user_id
      where um.unit_id = customers.unit_id and p.user_id = auth.uid()
    )
  );
create policy "insert_customers_admin_manager" on public.customers
  for insert with check (public.has_role(customers.unit_id, array['admin','manager']));
create policy "update_customers_admin_manager" on public.customers
  for update using (public.has_role(customers.unit_id, array['admin','manager']))
          with check (public.has_role(customers.unit_id, array['admin','manager']));

-- customer_addresses (inherit access from parent customer)
create policy "select_customer_addresses_same_unit" on public.customer_addresses
  for select using (
    exists (
      select 1 from public.customers c
      join public.unit_members um on um.unit_id = c.unit_id
      join public.profiles p on p.id = um.user_id
      where c.id = customer_addresses.customer_id and p.user_id = auth.uid()
    )
  );
create policy "modify_customer_addresses_admin_manager" on public.customer_addresses
  for all using (
    exists (
      select 1 from public.customers c
      where c.id = customer_addresses.customer_id
        and public.has_role(c.unit_id, array['admin','manager'])
    )
  ) with check (
    exists (
      select 1 from public.customers c
      where c.id = customer_addresses.customer_id
        and public.has_role(c.unit_id, array['admin','manager'])
    )
  );

-- customer_tags
create policy "select_customer_tags_same_unit" on public.customer_tags
  for select using (
    exists (
      select 1 from public.unit_members um
      join public.profiles p on p.id = um.user_id
      where um.unit_id = customer_tags.unit_id and p.user_id = auth.uid()
    )
  );
create policy "manage_customer_tags_admin_manager" on public.customer_tags
  for all using (public.has_role(customer_tags.unit_id, array['admin','manager']))
        with check (public.has_role(customer_tags.unit_id, array['admin','manager']));

-- customer_tag_links
create policy "select_customer_tag_links_same_unit" on public.customer_tag_links
  for select using (
    exists (
      select 1 from public.customers c
      join public.unit_members um on um.unit_id = c.unit_id
      join public.profiles p on p.id = um.user_id
      where c.id = customer_tag_links.customer_id and p.user_id = auth.uid()
    )
  );
create policy "manage_customer_tag_links_admin_manager" on public.customer_tag_links
  for all using (
    exists (
      select 1 from public.customers c
      where c.id = customer_tag_links.customer_id
        and public.has_role(c.unit_id, array['admin','manager'])
    )
  ) with check (
    exists (
      select 1 from public.customers c
      where c.id = customer_tag_links.customer_id
        and public.has_role(c.unit_id, array['admin','manager'])
    )
  );

-- customer_notes (select allowed to same unit; insert limited to roles; no updates to preserve history)
create policy "select_customer_notes_same_unit" on public.customer_notes
  for select using (
    exists (
      select 1 from public.customers c
      join public.unit_members um on um.unit_id = c.unit_id
      join public.profiles p on p.id = um.user_id
      where c.id = customer_notes.customer_id and p.user_id = auth.uid()
    )
  );
create policy "insert_customer_notes_allowed_roles" on public.customer_notes
  for insert with check (
    exists (
      select 1 from public.customers c
      where c.id = customer_notes.customer_id
        and public.has_role(c.unit_id, array['admin','manager','professional','staff'])
    )
  );
-- (No update/delete policies -> default deny for immutability)

commit;

-- Rollback guidance: drop policies then tables in reverse order.
