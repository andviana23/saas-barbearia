-- Migration: Support / Tickets (Optional Future)
-- Date: 2025-08-28
-- Phase 14
-- Tables: support_tickets, support_ticket_messages

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  subject text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed','canceled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_support_tickets_closed_time check (closed_at is null or closed_at >= opened_at)
);
create index if not exists idx_support_tickets_unit_status on public.support_tickets(unit_id, status);
create index if not exists idx_support_tickets_customer on public.support_tickets(customer_id);
create index if not exists idx_support_tickets_priority on public.support_tickets(priority);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_type text not null check (author_type in ('user','customer','system')),
  author_id uuid,
  message text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chk_support_ticket_messages_author_id_required check ((author_type <> 'system' and author_id is not null) or (author_type = 'system'))
);
create index if not exists idx_support_ticket_messages_ticket on public.support_ticket_messages(ticket_id);
create index if not exists idx_support_ticket_messages_author on public.support_ticket_messages(author_id);

-- 2. Triggers ------------------------------------------------------------------
create trigger trg_support_tickets_updated_at before update on public.support_tickets
  for each row execute procedure public.set_updated_at();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- support_tickets: members of unit can read; admin/manager/staff can create/update; close/resolution reserved to admin/manager.
create policy "select_support_tickets_unit_members" on public.support_tickets
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = support_tickets.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_support_tickets_staff" on public.support_tickets
  for insert with check (public.has_role(support_tickets.unit_id, array['admin','manager','staff']));
create policy "update_support_tickets_staff" on public.support_tickets
  for update using (public.has_role(support_tickets.unit_id, array['admin','manager','staff']))
          with check (public.has_role(support_tickets.unit_id, array['admin','manager','staff']));

-- support_ticket_messages: visible to same unit members (inherit from ticket); insert by staff or system (service role bypass) or customer self later.
create policy "select_support_ticket_messages_unit_members" on public.support_ticket_messages
  for select using (exists (
    select 1 from public.support_tickets t join public.unit_members um on um.unit_id = t.unit_id
    join public.profiles p on p.id = um.user_id
    where t.id = support_ticket_messages.ticket_id and p.user_id = auth.uid()
  ));
create policy "insert_support_ticket_messages_staff" on public.support_ticket_messages
  for insert with check (exists (
    select 1 from public.support_tickets t
    where t.id = support_ticket_messages.ticket_id
      and public.has_role(t.unit_id, array['admin','manager','staff'])
  ));
-- no update/delete (immutable conversation log)

commit;

-- Future: add customer portal access policies & assignment fields.
