-- Migration: Payments / Financial
-- Date: 2025-08-28
-- Depends on: core_identity, customers_crm, scheduling_agenda, subscriptions_plans
-- Note: Will later add FK from subscription_cycles.invoice_id -> invoices.id (separate migration) once invoices exist.
-- Pattern: tables -> indexes -> triggers -> RLS -> policies -> commit

begin;

-- 1. Tables --------------------------------------------------------------------

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null check (type in ('card','pix','cash','transfer','boleto')),
  brand text,
  last4 text check (last4 is null or length(last4) = 4),
  expires_at date,
  external_ref text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payment_methods_customer on public.payment_methods(customer_id);

-- financial transactions ledger
create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  type text not null check (type in ('invoice','payment','refund','adjustment','payout')),
  subtype text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'BRL',
  status text not null default 'pending' check (status in ('pending','completed','failed','canceled','refunded')),
  occurred_at timestamptz not null default now(),
  source text, -- e.g. 'system','manual','import','gateway'
  reference text, -- external or internal reference
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_financial_transactions_unit on public.financial_transactions(unit_id);
create index if not exists idx_financial_transactions_customer on public.financial_transactions(customer_id);
create index if not exists idx_financial_transactions_subscription on public.financial_transactions(subscription_id);
create index if not exists idx_financial_transactions_appointment on public.financial_transactions(appointment_id);
create index if not exists idx_financial_transactions_type on public.financial_transactions(type);
create index if not exists idx_financial_transactions_status on public.financial_transactions(status);
create index if not exists idx_financial_transactions_occurred on public.financial_transactions(occurred_at);

-- cashbox sessions (opening/closing cashier)
create table if not exists public.cashbox_sessions (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete restrict,
  opened_at timestamptz not null default now(),
  closed_by uuid references public.profiles(id) on delete set null,
  closed_at timestamptz,
  opening_amount numeric(12,2) not null default 0 check (opening_amount >= 0),
  closing_amount numeric(12,2) check (closing_amount is null or closing_amount >= 0),
  status text not null default 'open' check (status in ('open','closed','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ( (status = 'open' and closed_at is null) or (status <> 'open') )
);
create index if not exists idx_cashbox_sessions_unit on public.cashbox_sessions(unit_id);
create index if not exists idx_cashbox_sessions_status on public.cashbox_sessions(status);

-- cashbox transactions (movements inside a session)
create table if not exists public.cashbox_transactions (
  id uuid primary key default gen_random_uuid(),
  cashbox_session_id uuid not null references public.cashbox_sessions(id) on delete cascade,
  type text not null check (type in ('in','out','adjustment')),
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  reference_type text,
  reference_id uuid,
  performed_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_cashbox_transactions_session on public.cashbox_transactions(cashbox_session_id);
create index if not exists idx_cashbox_transactions_type on public.cashbox_transactions(type);

-- invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  currency text not null default 'BRL',
  status text not null default 'draft' check (status in ('draft','issued','paid','canceled','overdue','partially_paid')),
  due_date date,
  paid_at timestamptz,
  external_invoice_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_invoices_unit on public.invoices(unit_id);
create index if not exists idx_invoices_customer on public.invoices(customer_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_subscription on public.invoices(subscription_id);
create index if not exists idx_invoices_appointment on public.invoices(appointment_id);

-- invoice items
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  item_type text not null, -- e.g. 'service','product','subscription','adjustment'
  description text,
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);
create index if not exists idx_invoice_items_reference on public.invoice_items(reference_type, reference_id);

-- refunds (linked to a financial transaction - usually payment or invoice)
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  financial_transaction_id uuid not null references public.financial_transactions(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  reason text,
  processed_at timestamptz,
  status text not null default 'pending' check (status in ('pending','processed','failed','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_refunds_transaction on public.refunds(financial_transaction_id);
create index if not exists idx_refunds_status on public.refunds(status);

-- 2. Triggers (updated_at) -----------------------------------------------------
create trigger trg_payment_methods_updated_at before update on public.payment_methods
  for each row execute procedure public.set_updated_at();
create trigger trg_financial_transactions_updated_at before update on public.financial_transactions
  for each row execute procedure public.set_updated_at();
create trigger trg_cashbox_sessions_updated_at before update on public.cashbox_sessions
  for each row execute procedure public.set_updated_at();
create trigger trg_cashbox_transactions_updated_at before update on public.cashbox_transactions
  for each row execute procedure public.set_updated_at();
create trigger trg_invoices_updated_at before update on public.invoices
  for each row execute procedure public.set_updated_at();
create trigger trg_invoice_items_updated_at before update on public.invoice_items
  for each row execute procedure public.set_updated_at();
create trigger trg_refunds_updated_at before update on public.refunds
  for each row execute procedure public.set_updated_at();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.payment_methods enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.cashbox_sessions enable row level security;
alter table public.cashbox_transactions enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.refunds enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- payment_methods (inherit via customer)
create policy "select_payment_methods_customer_unit" on public.payment_methods
  for select using (exists (
    select 1 from public.customers c
    join public.unit_members um on um.unit_id = c.unit_id
    join public.profiles p on p.id = um.user_id
    where c.id = payment_methods.customer_id and p.user_id = auth.uid()
  ));
create policy "manage_payment_methods_admin_manager_staff" on public.payment_methods
  for all using (exists (
    select 1 from public.customers c
    where c.id = payment_methods.customer_id
      and public.has_role(c.unit_id, array['admin','manager','staff'])
  )) with check (exists (
    select 1 from public.customers c
    where c.id = payment_methods.customer_id
      and public.has_role(c.unit_id, array['admin','manager','staff'])
  ));

-- financial_transactions
create policy "select_financial_transactions_same_unit" on public.financial_transactions
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = financial_transactions.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_financial_transactions_allowed" on public.financial_transactions
  for insert with check (public.has_role(financial_transactions.unit_id, array['admin','manager','staff']));
create policy "update_financial_transactions_admin_manager" on public.financial_transactions
  for update using (public.has_role(financial_transactions.unit_id, array['admin','manager']))
          with check (public.has_role(financial_transactions.unit_id, array['admin','manager']));

-- cashbox_sessions
create policy "select_cashbox_sessions_same_unit" on public.cashbox_sessions
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = cashbox_sessions.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_cashbox_sessions_admin_manager" on public.cashbox_sessions
  for all using (public.has_role(cashbox_sessions.unit_id, array['admin','manager']))
        with check (public.has_role(cashbox_sessions.unit_id, array['admin','manager']));

-- cashbox_transactions (inherit via session)
create policy "select_cashbox_transactions_same_unit" on public.cashbox_transactions
  for select using (exists (
    select 1 from public.cashbox_sessions s
    join public.unit_members um on um.unit_id = s.unit_id
    join public.profiles p on p.id = um.user_id
    where s.id = cashbox_transactions.cashbox_session_id and p.user_id = auth.uid()
  ));
create policy "manage_cashbox_transactions_admin_manager_staff" on public.cashbox_transactions
  for all using (exists (
    select 1 from public.cashbox_sessions s
    where s.id = cashbox_transactions.cashbox_session_id
      and public.has_role(s.unit_id, array['admin','manager','staff'])
  )) with check (exists (
    select 1 from public.cashbox_sessions s
    where s.id = cashbox_transactions.cashbox_session_id
      and public.has_role(s.unit_id, array['admin','manager','staff'])
  ));

-- invoices
create policy "select_invoices_same_unit" on public.invoices
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = invoices.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_invoices_allowed_roles" on public.invoices
  for insert with check (public.has_role(invoices.unit_id, array['admin','manager','staff']));
create policy "update_invoices_admin_manager" on public.invoices
  for update using (public.has_role(invoices.unit_id, array['admin','manager']))
          with check (public.has_role(invoices.unit_id, array['admin','manager']));

-- invoice_items
create policy "select_invoice_items_same_unit" on public.invoice_items
  for select using (exists (
    select 1 from public.invoices i
    join public.unit_members um on um.unit_id = i.unit_id
    join public.profiles p on p.id = um.user_id
    where i.id = invoice_items.invoice_id and p.user_id = auth.uid()
  ));
create policy "manage_invoice_items_admin_manager_staff" on public.invoice_items
  for all using (exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id
      and public.has_role(i.unit_id, array['admin','manager','staff'])
  )) with check (exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id
      and public.has_role(i.unit_id, array['admin','manager','staff'])
  ));

-- refunds (inherit via financial transaction)
create policy "select_refunds_same_unit" on public.refunds
  for select using (exists (
    select 1 from public.financial_transactions ft
    join public.unit_members um on um.unit_id = ft.unit_id
    join public.profiles p on p.id = um.user_id
    where ft.id = refunds.financial_transaction_id and p.user_id = auth.uid()
  ));
create policy "manage_refunds_admin_manager" on public.refunds
  for all using (exists (
    select 1 from public.financial_transactions ft
    where ft.id = refunds.financial_transaction_id
      and public.has_role(ft.unit_id, array['admin','manager'])
  )) with check (exists (
    select 1 from public.financial_transactions ft
    where ft.id = refunds.financial_transaction_id
      and public.has_role(ft.unit_id, array['admin','manager'])
  ));

commit;

-- Rollback guidance: drop policies, triggers, tables (child first), then indexes.
