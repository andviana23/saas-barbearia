-- Migration: Reporting / Analytics
-- Date: 2025-08-28
-- Depends on: previous domain tables (appointments, subscriptions, financial)
-- Note: Tabelas de agregação; normalmente populadas via jobs / funções internas.

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  snapshot_date date not null,
  metric text not null,
  value numeric(18,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, snapshot_date, metric)
);
create index if not exists idx_kpi_snapshots_unit_date on public.kpi_snapshots(unit_id, snapshot_date);
create index if not exists idx_kpi_snapshots_metric on public.kpi_snapshots(metric);

create table if not exists public.appointment_stats_daily (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  stat_date date not null,
  total int not null default 0 check (total >= 0),
  confirmed int not null default 0 check (confirmed >= 0),
  completed int not null default 0 check (completed >= 0),
  canceled int not null default 0 check (canceled >= 0),
  no_show int not null default 0 check (no_show >= 0),
  revenue numeric(14,2) not null default 0 check (revenue >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, stat_date)
);
create index if not exists idx_appointment_stats_daily_unit_date on public.appointment_stats_daily(unit_id, stat_date desc);

create table if not exists public.subscription_stats_monthly (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  month date not null, -- usar primeiro dia do mês
  active int not null default 0 check (active >= 0),
  new int not null default 0 check (new >= 0),
  churned int not null default 0 check (churned >= 0),
  mrr numeric(14,2) not null default 0 check (mrr >= 0),
  arr numeric(14,2) not null default 0 check (arr >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, month)
);
create index if not exists idx_subscription_stats_monthly_unit_month on public.subscription_stats_monthly(unit_id, month desc);

create table if not exists public.revenue_aggregation_daily (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  rev_date date not null,
  source text not null check (source in ('services','products','subscriptions','other')),
  amount numeric(14,2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, rev_date, source)
);
create index if not exists idx_revenue_aggregation_daily_unit_date on public.revenue_aggregation_daily(unit_id, rev_date desc);
create index if not exists idx_revenue_aggregation_daily_source on public.revenue_aggregation_daily(source);

-- 2. Triggers (updated_at) -----------------------------------------------------
create trigger trg_kpi_snapshots_updated_at before update on public.kpi_snapshots
  for each row execute procedure public.set_updated_at();
create trigger trg_appointment_stats_daily_updated_at before update on public.appointment_stats_daily
  for each row execute procedure public.set_updated_at();
create trigger trg_subscription_stats_monthly_updated_at before update on public.subscription_stats_monthly
  for each row execute procedure public.set_updated_at();
create trigger trg_revenue_aggregation_daily_updated_at before update on public.revenue_aggregation_daily
  for each row execute procedure public.set_updated_at();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.kpi_snapshots enable row level security;
alter table public.appointment_stats_daily enable row level security;
alter table public.subscription_stats_monthly enable row level security;
alter table public.revenue_aggregation_daily enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- Reading allowed for any member of unit; writing restricted to admin/manager (or service role bypass).

-- kpi_snapshots
create policy "select_kpi_snapshots_unit_members" on public.kpi_snapshots
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = kpi_snapshots.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_kpi_snapshots_admin_manager" on public.kpi_snapshots
  for all using (public.has_role(kpi_snapshots.unit_id, array['admin','manager']))
        with check (public.has_role(kpi_snapshots.unit_id, array['admin','manager']));

-- appointment_stats_daily
create policy "select_appointment_stats_daily_unit_members" on public.appointment_stats_daily
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = appointment_stats_daily.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_appointment_stats_daily_admin_manager" on public.appointment_stats_daily
  for all using (public.has_role(appointment_stats_daily.unit_id, array['admin','manager']))
        with check (public.has_role(appointment_stats_daily.unit_id, array['admin','manager']));

-- subscription_stats_monthly
create policy "select_subscription_stats_monthly_unit_members" on public.subscription_stats_monthly
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = subscription_stats_monthly.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_subscription_stats_monthly_admin_manager" on public.subscription_stats_monthly
  for all using (public.has_role(subscription_stats_monthly.unit_id, array['admin','manager']))
        with check (public.has_role(subscription_stats_monthly.unit_id, array['admin','manager']));

-- revenue_aggregation_daily
create policy "select_revenue_aggregation_daily_unit_members" on public.revenue_aggregation_daily
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = revenue_aggregation_daily.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_revenue_aggregation_daily_admin_manager" on public.revenue_aggregation_daily
  for all using (public.has_role(revenue_aggregation_daily.unit_id, array['admin','manager']))
        with check (public.has_role(revenue_aggregation_daily.unit_id, array['admin','manager']));

commit;

-- Future: criar materialized views combinando fontes; rotinas de ETL para popular estas tabelas.
