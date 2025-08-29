-- Migration: Marketing / Engagement
-- Date: 2025-08-28
-- Domain: campaigns, campaign_targets, discounts, discount_usages
-- Note: Opcional / futuro. Inclui policies alinhadas ao padrão (unit scoped + roles)

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  channel text not null check (channel in ('email','sms','push','whatsapp','inapp')),
  status text not null default 'draft' check (status in ('draft','scheduled','sending','sent','canceled','failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, name)
);
create index if not exists idx_campaigns_unit on public.campaigns(unit_id);
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaigns_scheduled on public.campaigns(scheduled_at);

create table if not exists public.campaign_targets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  target_type text not null check (target_type in ('customer','user','segment')), -- segment futuro
  target_id uuid,
  status text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, target_type, target_id)
);
create index if not exists idx_campaign_targets_campaign on public.campaign_targets(campaign_id);
create index if not exists idx_campaign_targets_status on public.campaign_targets(status);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  code text not null,
  type text not null check (type in ('percentage','fixed_amount')),
  value numeric(12,2) not null check (value > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit > 0),
  used_count int not null default 0 check (used_count >= 0),
  status text not null default 'active' check (status in ('active','expired','inactive','exhausted','scheduled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_discounts_dates check (ends_at is null or starts_at is null or ends_at >= starts_at),
  unique (unit_id, code)
);
create index if not exists idx_discounts_unit on public.discounts(unit_id);
create index if not exists idx_discounts_code on public.discounts(code);
create index if not exists idx_discounts_status on public.discounts(status);
create index if not exists idx_discounts_period on public.discounts(starts_at, ends_at);

create table if not exists public.discount_usages (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discounts(id) on delete cascade,
  entity_type text not null check (entity_type in ('sale','invoice','subscription','appointment')),
  entity_id uuid not null,
  used_at timestamptz not null default now(),
  amount_applied numeric(12,2) not null check (amount_applied >= 0),
  created_at timestamptz not null default now(),
  unique (discount_id, entity_type, entity_id)
);
create index if not exists idx_discount_usages_discount on public.discount_usages(discount_id);
create index if not exists idx_discount_usages_entity on public.discount_usages(entity_type, entity_id);

-- 2. Trigger Functions ---------------------------------------------------------
-- Increment used_count when a usage record is inserted.
create or replace function public.increment_discount_used_count()
returns trigger language plpgsql as $$
declare
  v_limit int;
  v_used int;
  v_status text;
  v_starts timestamptz;
  v_ends timestamptz;
  v_now timestamptz := now();
begin
  select usage_limit, used_count, status, starts_at, ends_at
    into v_limit, v_used, v_status, v_starts, v_ends
  from public.discounts where id = new.discount_id for update;

  if v_status not in ('active','scheduled') then
    raise exception 'Discount not active (status=%).', v_status;
  end if;
  if v_starts is not null and v_now < v_starts then
    raise exception 'Discount not started yet';
  end if;
  if v_ends is not null and v_now > v_ends then
    raise exception 'Discount expired';
  end if;
  if v_limit is not null and v_used >= v_limit then
    raise exception 'Discount usage limit reached';
  end if;

  update public.discounts
     set used_count = used_count + 1,
         status = case
           when v_limit is not null and used_count + 1 >= v_limit then 'exhausted'
           when v_ends is not null and v_now > v_ends then 'expired'
           else status end,
         updated_at = now()
   where id = new.discount_id;
  return new;
end;$$;

-- 3. Triggers (updated_at + usage) ---------------------------------------------
create trigger trg_campaigns_updated_at before update on public.campaigns
  for each row execute procedure public.set_updated_at();
create trigger trg_campaign_targets_updated_at before update on public.campaign_targets
  for each row execute procedure public.set_updated_at();
create trigger trg_discounts_updated_at before update on public.discounts
  for each row execute procedure public.set_updated_at();
create trigger trg_discount_usages_increment after insert on public.discount_usages
  for each row execute procedure public.increment_discount_used_count();

-- 4. RLS Enable ----------------------------------------------------------------
alter table public.campaigns enable row level security;
alter table public.campaign_targets enable row level security;
alter table public.discounts enable row level security;
alter table public.discount_usages enable row level security;

-- 5. Policies ------------------------------------------------------------------
-- campaigns
create policy "select_campaigns_unit_members" on public.campaigns
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = campaigns.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_campaigns_admin_manager" on public.campaigns
  for all using (public.has_role(campaigns.unit_id, array['admin','manager']))
        with check (public.has_role(campaigns.unit_id, array['admin','manager']));

-- campaign_targets (inherit by campaign)
create policy "select_campaign_targets_unit_members" on public.campaign_targets
  for select using (exists (
    select 1 from public.campaigns c join public.unit_members um on um.unit_id = c.unit_id
    join public.profiles p on p.id = um.user_id
    where c.id = campaign_targets.campaign_id and p.user_id = auth.uid()
  ));
create policy "manage_campaign_targets_admin_manager" on public.campaign_targets
  for all using (exists (
    select 1 from public.campaigns c
    where c.id = campaign_targets.campaign_id
      and public.has_role(c.unit_id, array['admin','manager'])
  )) with check (exists (
    select 1 from public.campaigns c
    where c.id = campaign_targets.campaign_id
      and public.has_role(c.unit_id, array['admin','manager'])
  ));

-- discounts
create policy "select_discounts_unit_members" on public.discounts
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = discounts.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_discounts_admin_manager" on public.discounts
  for all using (public.has_role(discounts.unit_id, array['admin','manager']))
        with check (public.has_role(discounts.unit_id, array['admin','manager']));

-- discount_usages (append-only, inherits discount)
create policy "select_discount_usages_unit_members" on public.discount_usages
  for select using (exists (
    select 1 from public.discounts d join public.unit_members um on um.unit_id = d.unit_id
    join public.profiles p on p.id = um.user_id
    where d.id = discount_usages.discount_id and p.user_id = auth.uid()
  ));
create policy "insert_discount_usages_admin_manager_staff" on public.discount_usages
  for insert with check (exists (
    select 1 from public.discounts d
    where d.id = discount_usages.discount_id
      and public.has_role(d.unit_id, array['admin','manager','staff'])
  ));
-- no update/delete

commit;

-- Future: materialized view for campaign performance metrics (open_rate, etc.)
