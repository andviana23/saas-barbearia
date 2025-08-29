-- Migration: Inventory / Products & Sales
-- Date: 2025-08-28
-- Depends on: core_identity, customers_crm
-- Pattern: tables -> indexes -> triggers -> RLS -> policies -> commit

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, name)
);
create index if not exists idx_product_categories_unit on public.product_categories(unit_id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  sku text,
  description text,
  cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  sale_price numeric(12,2) not null check (sale_price >= 0),
  stock_quantity numeric(12,2) not null default 0 check (stock_quantity >= 0),
  low_stock_threshold numeric(12,2) not null default 0 check (low_stock_threshold >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, name),
  unique (unit_id, sku)
);
create index if not exists idx_products_unit on public.products(unit_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);

create table if not exists public.product_stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  movement_type text not null check (movement_type in ('in','out','adjustment')),
  quantity numeric(12,2) not null check (quantity > 0),
  reason text,
  reference_type text,
  reference_id uuid,
  performed_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_product_stock_movements_product on public.product_stock_movements(product_id);
create index if not exists idx_product_stock_movements_type on public.product_stock_movements(movement_type);
create index if not exists idx_product_stock_movements_occurred on public.product_stock_movements(occurred_at);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  net_amount numeric(12,2) not null default 0 check (net_amount >= 0),
  status text not null default 'draft' check (status in ('draft','completed','canceled','refunded')),
  sold_at timestamptz,
  performed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sales_unit on public.sales(unit_id);
create index if not exists idx_sales_status on public.sales(status);
create index if not exists idx_sales_sold_at on public.sales(sold_at);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sale_items_sale on public.sale_items(sale_id);
create index if not exists idx_sale_items_product on public.sale_items(product_id);

create table if not exists public.sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  method text not null check (method in ('cash','card','pix','transfer','voucher')),
  amount numeric(12,2) not null check (amount >= 0),
  provider text,
  provider_payment_id text,
  status text not null default 'pending' check (status in ('pending','paid','failed','canceled','refunded','partial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sale_payments_sale on public.sale_payments(sale_id);
create index if not exists idx_sale_payments_status on public.sale_payments(status);

-- 2. Triggers & Functions ------------------------------------------------------
create trigger trg_product_categories_updated_at before update on public.product_categories
  for each row execute procedure public.set_updated_at();
create trigger trg_products_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();
create trigger trg_sales_updated_at before update on public.sales
  for each row execute procedure public.set_updated_at();
create trigger trg_sale_items_updated_at before update on public.sale_items
  for each row execute procedure public.set_updated_at();
create trigger trg_sale_payments_updated_at before update on public.sale_payments
  for each row execute procedure public.set_updated_at();

-- Stock movement application
create or replace function public.apply_product_stock_movement()
returns trigger language plpgsql as $$
declare
  v_current numeric(12,2);
  v_new numeric(12,2);
begin
  -- lock product row for update
  select stock_quantity into v_current from public.products where id = new.product_id for update;
  if v_current is null then
    raise exception 'Product not found for stock movement';
  end if;
  if new.movement_type = 'in' then
    v_new := v_current + new.quantity;
  elsif new.movement_type = 'out' then
    if v_current < new.quantity then
      raise exception 'Insufficient stock (have %, need %)', v_current, new.quantity;
    end if;
    v_new := v_current - new.quantity;
  elsif new.movement_type = 'adjustment' then
    v_new := new.quantity; -- quantity becomes new absolute stock
  else
    raise exception 'Unknown movement_type %', new.movement_type;
  end if;
  update public.products set stock_quantity = v_new, updated_at = now() where id = new.product_id;
  return new;
end;$$;

create trigger trg_apply_stock_movement after insert on public.product_stock_movements
  for each row execute procedure public.apply_product_stock_movement();

-- Recalculate sale totals after item change
create or replace function public.recalc_sale_totals()
returns trigger language plpgsql as $$
declare
  v_sale_id uuid;
  v_total numeric(12,2);
  v_discount numeric(12,2);
begin
  if tg_table_name = 'sale_items' then
    if tg_op = 'INSERT' or tg_op = 'UPDATE' then
      v_sale_id := new.sale_id;
    else
      v_sale_id := old.sale_id;
    end if;
  else
    v_sale_id := new.id; -- fallback
  end if;
  select coalesce(sum(total_price),0) into v_total from public.sale_items where sale_id = v_sale_id;
  select discount_amount into v_discount from public.sales where id = v_sale_id for update;
  update public.sales set total_amount = v_total, net_amount = greatest(v_total - coalesce(v_discount,0),0), updated_at = now() where id = v_sale_id;
  return null;
end;$$;

create trigger trg_recalc_sale_totals_ai after insert or update or delete on public.sale_items
  for each row execute procedure public.recalc_sale_totals();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_stock_movements enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.sale_payments enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- product_categories
create policy "select_product_categories_same_unit" on public.product_categories
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = product_categories.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_product_categories_admin_manager" on public.product_categories
  for all using (public.has_role(product_categories.unit_id, array['admin','manager']))
        with check (public.has_role(product_categories.unit_id, array['admin','manager']));

-- products
create policy "select_products_same_unit" on public.products
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = products.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_products_admin_manager" on public.products
  for all using (public.has_role(products.unit_id, array['admin','manager']))
        with check (public.has_role(products.unit_id, array['admin','manager']));

-- product_stock_movements (append-only)
create policy "select_product_stock_movements_same_unit" on public.product_stock_movements
  for select using (exists (
    select 1 from public.products pr join public.unit_members um on um.unit_id = pr.unit_id
    join public.profiles p on p.id = um.user_id
    where pr.id = product_stock_movements.product_id and p.user_id = auth.uid()
  ));
create policy "insert_product_stock_movements_allowed" on public.product_stock_movements
  for insert with check (exists (
    select 1 from public.products pr
    where pr.id = product_stock_movements.product_id
      and public.has_role(pr.unit_id, array['admin','manager','staff'])
  ));
-- no update/delete (immutable)

-- sales
create policy "select_sales_same_unit" on public.sales
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = sales.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_sales_allowed" on public.sales
  for insert with check (public.has_role(sales.unit_id, array['admin','manager','staff']));
create policy "update_sales_admin_manager" on public.sales
  for update using (public.has_role(sales.unit_id, array['admin','manager']))
          with check (public.has_role(sales.unit_id, array['admin','manager']));

-- sale_items (inherit via sale)
create policy "select_sale_items_same_unit" on public.sale_items
  for select using (exists (
    select 1 from public.sales s join public.unit_members um on um.unit_id = s.unit_id
    join public.profiles p on p.id = um.user_id
    where s.id = sale_items.sale_id and p.user_id = auth.uid()
  ));
create policy "manage_sale_items_allowed" on public.sale_items
  for all using (exists (
    select 1 from public.sales s
    where s.id = sale_items.sale_id
      and public.has_role(s.unit_id, array['admin','manager','staff'])
  )) with check (exists (
    select 1 from public.sales s
    where s.id = sale_items.sale_id
      and public.has_role(s.unit_id, array['admin','manager','staff'])
  ));

-- sale_payments (inherit via sale)
create policy "select_sale_payments_same_unit" on public.sale_payments
  for select using (exists (
    select 1 from public.sales s join public.unit_members um on um.unit_id = s.unit_id
    join public.profiles p on p.id = um.user_id
    where s.id = sale_payments.sale_id and p.user_id = auth.uid()
  ));
create policy "manage_sale_payments_allowed" on public.sale_payments
  for all using (exists (
    select 1 from public.sales s
    where s.id = sale_payments.sale_id
      and public.has_role(s.unit_id, array['admin','manager','staff'])
  )) with check (exists (
    select 1 from public.sales s
    where s.id = sale_payments.sale_id
      and public.has_role(s.unit_id, array['admin','manager','staff'])
  ));

commit;

-- Rollback guidance: drop policies, triggers, tables (children first), then functions.
