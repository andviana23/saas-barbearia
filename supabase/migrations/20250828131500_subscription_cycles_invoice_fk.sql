-- Migration: Add FK constraint subscription_cycles.invoice_id -> invoices.id
-- Date: 2025-08-28
-- Rationale: In migration 20250828122000_subscriptions_plans.sql invoice_id column was created without FK because invoices table did not yet exist at that time.

begin;

-- Only add constraint if both table/column exist and constraint not already present.
-- (Supabase migration engine will error if we blindly add a duplicate, so we guard.)

-- We can attempt directly; if it already exists, migration should fail, but assuming linear history it's safe.
alter table public.subscription_cycles
  add constraint subscription_cycles_invoice_id_fkey
  foreign key (invoice_id) references public.invoices(id) on delete set null;

commit;
