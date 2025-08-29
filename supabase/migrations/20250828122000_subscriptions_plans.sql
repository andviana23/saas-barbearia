-- Migration: Subscriptions / Plans
-- Date: 2025-08-28
-- Depends on: core_identity (units, profiles), customers_crm (customers)
-- Note: invoices ainda não existem; invoice_id em subscription_cycles será criado sem FK agora (adicionar depois).
-- Pattern: tables -> indexes -> triggers -> RLS -> policies -> commit

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade, -- null = global plan
  name text not null,
  description text,
  interval_type text not null check (interval_type in ('day','week','month','year')),
  interval_count int not null default 1 check (interval_count > 0 and interval_count <= 36),
  price numeric(10,2) not null check (price >= 0),
  currency text not null default 'BRL',
  status text not null default 'draft' check (status in ('draft','active','inactive','archived')),
  trial_days int default 0 check (trial_days >= 0 and trial_days <= 365),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, name)
);
create index if not exists idx_subscription_plans_unit on public.subscription_plans(unit_id);
create index if not exists idx_subscription_plans_status on public.subscription_plans(status);

create table if not exists public.plan_benefits (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.subscription_plans(id) on delete cascade,
  benefit_type text not null,
  value numeric(12,2),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_plan_benefits_plan on public.plan_benefits(plan_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  status text not null default 'trial' check (status in ('trial','active','paused','canceled','expired')),
  start_date date not null default current_date,
  end_date date,
  next_billing_date date,
  cancel_at_period_end boolean not null default false,
  external_provider_id text,
  trial_end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscriptions_unit on public.subscriptions(unit_id);
create index if not exists idx_subscriptions_customer on public.subscriptions(customer_id);
create index if not exists idx_subscriptions_plan on public.subscriptions(plan_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
-- ensure only one active/trial subscription per customer per plan
create unique index if not exists uq_subscriptions_active_per_plan_customer on public.subscriptions(customer_id, plan_id)
  where status in ('trial','active');

create table if not exists public.subscription_cycles (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  cycle_start date not null,
  cycle_end date not null,
  status text not null default 'open' check (status in ('open','billed','closed')),
  invoice_id uuid, -- add FK to invoices later
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cycle_end > cycle_start),
  unique (subscription_id, cycle_start)
);
create index if not exists idx_subscription_cycles_subscription on public.subscription_cycles(subscription_id);
create index if not exists idx_subscription_cycles_status on public.subscription_cycles(status);

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  payment_date date not null,
  amount numeric(10,2) not null check (amount >= 0),
  method text, -- e.g. 'card','pix','cash','transfer'
  provider text, -- e.g. 'asaas'
  provider_payment_id text,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscription_payments_subscription on public.subscription_payments(subscription_id);
create index if not exists idx_subscription_payments_status on public.subscription_payments(status);

create table if not exists public.subscription_usage (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  benefit_type text not null,
  used_value numeric(12,2) not null default 0 check (used_value >= 0),
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (subscription_id, benefit_type, period_start, period_end)
);
create index if not exists idx_subscription_usage_subscription on public.subscription_usage(subscription_id);
create index if not exists idx_subscription_usage_benefit on public.subscription_usage(benefit_type);

-- 2. Triggers (updated_at) -----------------------------------------------------
create trigger trg_subscription_plans_updated_at before update on public.subscription_plans
  for each row execute procedure public.set_updated_at();
create trigger trg_plan_benefits_updated_at before update on public.plan_benefits
  for each row execute procedure public.set_updated_at();
create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();
create trigger trg_subscription_cycles_updated_at before update on public.subscription_cycles
  for each row execute procedure public.set_updated_at();
create trigger trg_subscription_payments_updated_at before update on public.subscription_payments
  for each row execute procedure public.set_updated_at();
create trigger trg_subscription_usage_updated_at before update on public.subscription_usage
  for each row execute procedure public.set_updated_at();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.subscription_plans enable row level security;
alter table public.plan_benefits enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_cycles enable row level security;
alter table public.subscription_payments enable row level security;
alter table public.subscription_usage enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- subscription_plans: global (unit_id null) readable por qualquer autenticado; unit scoped restrito a membros.
create policy "select_subscription_plans" on public.subscription_plans
  for select using (
    unit_id is null OR exists (
      select 1 from public.unit_members um
      join public.profiles p on p.id = um.user_id
      where um.unit_id = subscription_plans.unit_id and p.user_id = auth.uid()
    )
  );
-- inserir/gerenciar planos unit scoped: admin/manager. Global: somente admin em qualquer unidade.
create policy "manage_subscription_plans_unit" on public.subscription_plans
  for all using (
    (unit_id is not null and public.has_role(subscription_plans.unit_id, array['admin','manager']))
    OR (
      unit_id is null and exists (
        select 1 from public.role_assignments ra
        join public.roles r on r.id = ra.role_id
        join public.profiles p on p.id = ra.user_id
        where p.user_id = auth.uid() and r.code = 'admin'
      )
    )
  ) with check (
    (unit_id is not null and public.has_role(subscription_plans.unit_id, array['admin','manager']))
    OR (
      unit_id is null and exists (
        select 1 from public.role_assignments ra
        join public.roles r on r.id = ra.role_id
        join public.profiles p on p.id = ra.user_id
        where p.user_id = auth.uid() and r.code = 'admin'
      )
    )
  );

-- plan_benefits (inherit via plan)
create policy "select_plan_benefits" on public.plan_benefits
  for select using (exists (
    select 1 from public.subscription_plans sp
    where sp.id = plan_benefits.plan_id and (
      sp.unit_id is null OR exists (
        select 1 from public.unit_members um
        join public.profiles p on p.id = um.user_id
        where um.unit_id = sp.unit_id and p.user_id = auth.uid()
      )
    )
  ));
create policy "manage_plan_benefits" on public.plan_benefits
  for all using (exists (
    select 1 from public.subscription_plans sp
    where sp.id = plan_benefits.plan_id and (
      (sp.unit_id is not null and public.has_role(sp.unit_id, array['admin','manager'])) OR (
        sp.unit_id is null and exists (
          select 1 from public.role_assignments ra
          join public.roles r on r.id = ra.role_id
          join public.profiles p on p.id = ra.user_id
          where p.user_id = auth.uid() and r.code = 'admin'
        )
      )
    )
  )) with check (exists (
    select 1 from public.subscription_plans sp
    where sp.id = plan_benefits.plan_id and (
      (sp.unit_id is not null and public.has_role(sp.unit_id, array['admin','manager'])) OR (
        sp.unit_id is null and exists (
          select 1 from public.role_assignments ra
          join public.roles r on r.id = ra.role_id
          join public.profiles p on p.id = ra.user_id
          where p.user_id = auth.uid() and r.code = 'admin'
        )
      )
    )
  ));

-- subscriptions
create policy "select_subscriptions_same_unit" on public.subscriptions
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = subscriptions.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_subscriptions_allowed_roles" on public.subscriptions
  for insert with check (public.has_role(subscriptions.unit_id, array['admin','manager','staff']));
create policy "update_subscriptions_admin_manager" on public.subscriptions
  for update using (public.has_role(subscriptions.unit_id, array['admin','manager']))
          with check (public.has_role(subscriptions.unit_id, array['admin','manager']));

-- subscription_cycles
create policy "select_subscription_cycles_same_unit" on public.subscription_cycles
  for select using (exists (
    select 1 from public.subscriptions s
    join public.unit_members um on um.unit_id = s.unit_id
    join public.profiles p on p.id = um.user_id
    where s.id = subscription_cycles.subscription_id and p.user_id = auth.uid()
  ));
create policy "manage_subscription_cycles_admin_manager" on public.subscription_cycles
  for all using (exists (
    select 1 from public.subscriptions s
    where s.id = subscription_cycles.subscription_id and public.has_role(s.unit_id, array['admin','manager'])
  )) with check (exists (
    select 1 from public.subscriptions s
    where s.id = subscription_cycles.subscription_id and public.has_role(s.unit_id, array['admin','manager'])
  ));

-- subscription_payments
create policy "select_subscription_payments_same_unit" on public.subscription_payments
  for select using (exists (
    select 1 from public.subscriptions s
    join public.unit_members um on um.unit_id = s.unit_id
    join public.profiles p on p.id = um.user_id
    where s.id = subscription_payments.subscription_id and p.user_id = auth.uid()
  ));
create policy "manage_subscription_payments_admin_manager" on public.subscription_payments
  for all using (exists (
    select 1 from public.subscriptions s
    where s.id = subscription_payments.subscription_id and public.has_role(s.unit_id, array['admin','manager'])
  )) with check (exists (
    select 1 from public.subscriptions s
    where s.id = subscription_payments.subscription_id and public.has_role(s.unit_id, array['admin','manager'])
  ));

-- subscription_usage (append/update for tracking usage)
create policy "select_subscription_usage_same_unit" on public.subscription_usage
  for select using (exists (
    select 1 from public.subscriptions s
    join public.unit_members um on um.unit_id = s.unit_id
    join public.profiles p on p.id = um.user_id
    where s.id = subscription_usage.subscription_id and p.user_id = auth.uid()
  ));
create policy "manage_subscription_usage_allowed" on public.subscription_usage
  for all using (exists (
    select 1 from public.subscriptions s
    where s.id = subscription_usage.subscription_id and public.has_role(s.unit_id, array['admin','manager','staff'])
  )) with check (exists (
    select 1 from public.subscriptions s
    where s.id = subscription_usage.subscription_id and public.has_role(s.unit_id, array['admin','manager','staff'])
  ));

commit;

-- Rollback guidance: drop policies, tables (children first), then indexes.
