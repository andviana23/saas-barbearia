-- Migration: Scheduling / Agenda
-- Date: 2025-08-28
-- Depends on: core_identity, services_catalog, customers_crm
-- Pattern: tables -> indexes -> triggers -> RLS -> policies -> commit
-- Note: 'professionals' represent profiles with role 'professional'. Implemented as a view (no extra table) to avoid duplication.

begin;

-- 0. (Optional extensions) -----------------------------------------------------
-- (Nenhuma extra aqui; se futuramente usar exclusão para conflito de agenda poderá precisar btree_gist.)

-- 1. View for professionals ----------------------------------------------------
create or replace view public.professionals as
  select p.*
  from public.profiles p
  where (p.role = 'professional') -- simple filter; granular roles still via role_assignments
    and p.is_active;
-- (RLS applied via underlying table profiles.)

-- 2. Tables --------------------------------------------------------------------

-- working hours per professional & unit
create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  break_start time,
  break_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time),
  check (break_start is null or break_end is not null),
  check (break_start is null or (break_start >= start_time and break_end <= end_time)),
  unique (unit_id, professional_id, weekday, start_time)
);
create index if not exists idx_working_hours_unit on public.working_hours(unit_id);
create index if not exists idx_working_hours_professional on public.working_hours(professional_id);

-- time offs / leaves
create table if not exists public.time_offs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_datetime > start_datetime)
);
create index if not exists idx_time_offs_unit on public.time_offs(unit_id);
create index if not exists idx_time_offs_professional on public.time_offs(professional_id);
create index if not exists idx_time_offs_range on public.time_offs(start_datetime, end_datetime);

-- appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','canceled','no_show')),
  source text not null default 'manual' check (source in ('manual','online','api','import')),
  notes text,
  total_price numeric(10,2) check (total_price is null or total_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index if not exists idx_appointments_unit on public.appointments(unit_id);
create index if not exists idx_appointments_professional on public.appointments(professional_id);
create index if not exists idx_appointments_customer on public.appointments(customer_id);
create index if not exists idx_appointments_start on public.appointments(start_time);

-- appointment services (line items)
create table if not exists public.appointment_services (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  price numeric(10,2) not null check (price >= 0),
  duration_minutes int not null check (duration_minutes > 0 and duration_minutes <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_appointment_services_appointment on public.appointment_services(appointment_id);
create index if not exists idx_appointment_services_service on public.appointment_services(service_id);

-- appointment status history
create table if not exists public.appointment_status_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  status text not null check (status in ('pending','confirmed','completed','canceled','no_show')),
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  reason text
);
create index if not exists idx_appointment_status_history_appt on public.appointment_status_history(appointment_id);

-- appointment notifications (log of sent reminders etc.)
create table if not exists public.appointment_notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  type text not null,
  channel text not null check (channel in ('email','sms','push','whatsapp')),
  sent_at timestamptz,
  status text,
  provider_message_id text,
  created_at timestamptz not null default now()
);
create index if not exists idx_appointment_notifications_appt on public.appointment_notifications(appointment_id);
create index if not exists idx_appointment_notifications_unit on public.appointment_notifications(unit_id);

-- waiting list
create table if not exists public.waiting_list (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  desired_date date not null,
  preferred_time_range tstzrange,
  status text not null default 'open' check (status in ('open','matched','canceled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_waiting_list_unit on public.waiting_list(unit_id);
create index if not exists idx_waiting_list_customer on public.waiting_list(customer_id);

-- 3. Triggers (updated_at + unit sync) -----------------------------------------
create trigger trg_working_hours_updated_at before update on public.working_hours
  for each row execute procedure public.set_updated_at();
create trigger trg_time_offs_updated_at before update on public.time_offs
  for each row execute procedure public.set_updated_at();
create trigger trg_appointments_updated_at before update on public.appointments
  for each row execute procedure public.set_updated_at();
create trigger trg_appointment_services_updated_at before update on public.appointment_services
  for each row execute procedure public.set_updated_at();
create trigger trg_waiting_list_updated_at before update on public.waiting_list
  for each row execute procedure public.set_updated_at();

-- Sync unit_id from appointment into appointment_services & appointment_notifications
create or replace function public.sync_appointment_child_unit()
returns trigger language plpgsql as $$
begin
  if (tg_table_name = 'appointment_services') then
    if (tg_op = 'INSERT') then
      select a.unit_id into new.unit_id from public.appointments a where a.id = new.appointment_id;
    else
      if (new.unit_id <> old.unit_id) then
        raise exception 'unit_id cannot be changed';
      end if;
    end if;
  elsif (tg_table_name = 'appointment_notifications') then
    if (tg_op = 'INSERT') then
      select a.unit_id into new.unit_id from public.appointments a where a.id = new.appointment_id;
    else
      if (new.unit_id <> old.unit_id) then
        raise exception 'unit_id cannot be changed';
      end if;
    end if;
  end if;
  return new;
end;$$;

create trigger trg_appt_services_sync before insert or update on public.appointment_services
  for each row execute procedure public.sync_appointment_child_unit();
create trigger trg_appt_notifications_sync before insert or update on public.appointment_notifications
  for each row execute procedure public.sync_appointment_child_unit();

-- 4. RLS Enable ----------------------------------------------------------------
alter table public.working_hours enable row level security;
alter table public.time_offs enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;
alter table public.appointment_status_history enable row level security;
alter table public.appointment_notifications enable row level security;
alter table public.waiting_list enable row level security;

-- 5. Policies ------------------------------------------------------------------
-- working_hours
create policy "select_working_hours_same_unit" on public.working_hours
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = working_hours.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_working_hours_admin_manager" on public.working_hours
  for all using (public.has_role(working_hours.unit_id, array['admin','manager']))
        with check (public.has_role(working_hours.unit_id, array['admin','manager']));

-- time_offs
create policy "select_time_offs_same_unit" on public.time_offs
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = time_offs.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_time_offs_admin_manager_professional" on public.time_offs
  for all using (
    public.has_role(time_offs.unit_id, array['admin','manager','professional'])
  ) with check (
    public.has_role(time_offs.unit_id, array['admin','manager','professional'])
  );

-- appointments
create policy "select_appointments_same_unit" on public.appointments
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = appointments.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_appointments_allowed_roles" on public.appointments
  for insert with check (public.has_role(appointments.unit_id, array['admin','manager','professional']));
create policy "update_appointments_owner_or_manager" on public.appointments
  for update using (
    public.has_role(appointments.unit_id, array['admin','manager']) OR
    (appointments.professional_id in (
      select ra.user_id from public.role_assignments ra
      join public.roles r on r.id = ra.role_id
      join public.profiles p on p.id = ra.user_id
      where ra.unit_id = appointments.unit_id
        and p.user_id = auth.uid()
        and r.code = 'professional'
    ))
  ) with check (
    public.has_role(appointments.unit_id, array['admin','manager']) OR
    (appointments.professional_id in (
      select ra.user_id from public.role_assignments ra
      join public.roles r on r.id = ra.role_id
      join public.profiles p on p.id = ra.user_id
      where ra.unit_id = appointments.unit_id
        and p.user_id = auth.uid()
        and r.code = 'professional'
    ))
  );

-- appointment_services
create policy "select_appointment_services_same_unit" on public.appointment_services
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = appointment_services.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_appointment_services_allowed_roles" on public.appointment_services
  for all using (public.has_role(appointment_services.unit_id, array['admin','manager','professional']))
        with check (public.has_role(appointment_services.unit_id, array['admin','manager','professional']));

-- appointment_status_history (append-only)
create policy "select_appt_status_history_same_unit" on public.appointment_status_history
  for select using (exists (
    select 1 from public.appointments a
    join public.unit_members um on um.unit_id = a.unit_id
    join public.profiles p on p.id = um.user_id
    where a.id = appointment_status_history.appointment_id and p.user_id = auth.uid()
  ));
create policy "insert_appt_status_history_allowed_roles" on public.appointment_status_history
  for insert with check (exists (
    select 1 from public.appointments a
    where a.id = appointment_status_history.appointment_id
      and public.has_role(a.unit_id, array['admin','manager','professional'])
  ));
-- no update/delete policies (immutable log)

-- appointment_notifications (read within unit, insert by allowed roles)
create policy "select_appt_notifications_same_unit" on public.appointment_notifications
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = appointment_notifications.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_appt_notifications_allowed_roles" on public.appointment_notifications
  for insert with check (public.has_role(appointment_notifications.unit_id, array['admin','manager','professional']));

-- waiting_list
create policy "select_waiting_list_same_unit" on public.waiting_list
  for select using (exists (
    select 1 from public.unit_members um
    join public.profiles p on p.id = um.user_id
    where um.unit_id = waiting_list.unit_id and p.user_id = auth.uid()
  ));
create policy "manage_waiting_list_admin_manager_staff" on public.waiting_list
  for all using (public.has_role(waiting_list.unit_id, array['admin','manager','staff']))
        with check (public.has_role(waiting_list.unit_id, array['admin','manager','staff']));

commit;

-- Rollback guidance: drop policies, triggers, tables (children first), then view.
