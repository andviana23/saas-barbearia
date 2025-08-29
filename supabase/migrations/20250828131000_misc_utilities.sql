-- Migration: Misc / Utilities
-- Date: 2025-08-28
-- Phase 15
-- Tables: media_files, geo_locations, imports, import_rows, export_jobs

begin;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  owner_user_id uuid references public.profiles(id) on delete set null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  storage_path text not null,
  category text check (category in ('avatar','document','report','import','export','other')),
  checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(unit_id, storage_path)
);
create index if not exists idx_media_files_unit on public.media_files(unit_id);
create index if not exists idx_media_files_owner on public.media_files(owner_user_id);

create table if not exists public.geo_locations (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  ref_type text not null check (ref_type in ('customer','appointment','unit','other')),
  ref_id uuid not null,
  latitude numeric(10,7) not null check (latitude between -90 and 90),
  longitude numeric(10,7) not null check (longitude between -180 and 180),
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_geo_locations_unit_ref on public.geo_locations(unit_id, ref_type, ref_id);
create index if not exists idx_geo_locations_captured_at on public.geo_locations(captured_at);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  initiated_by uuid references public.profiles(id) on delete set null,
  source text not null,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed','canceled')),
  total_rows integer,
  processed_rows integer default 0,
  error_count integer default 0,
  started_at timestamptz,
  finished_at timestamptz,
  log jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_imports_row_counts check (processed_rows >= 0 and error_count >= 0)
);
create index if not exists idx_imports_unit_status on public.imports(unit_id, status);

create table if not exists public.import_rows (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.imports(id) on delete cascade,
  row_number integer not null,
  raw_data jsonb not null,
  normalized_data jsonb,
  status text not null default 'pending' check (status in ('pending','valid','invalid','imported','skipped')),
  error_message text,
  created_at timestamptz not null default now(),
  unique(import_id, row_number)
);
create index if not exists idx_import_rows_import_status on public.import_rows(import_id, status);

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  initiated_by uuid references public.profiles(id) on delete set null,
  job_type text not null,
  status text not null default 'pending' check (status in ('pending','running','completed','failed','canceled')),
  params jsonb,
  result_path text,
  row_count integer,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_export_jobs_unit_status on public.export_jobs(unit_id, status);
create index if not exists idx_export_jobs_type on public.export_jobs(job_type);

-- 2. Triggers ------------------------------------------------------------------
create trigger trg_media_files_updated_at before update on public.media_files
  for each row execute procedure public.set_updated_at();
create trigger trg_imports_updated_at before update on public.imports
  for each row execute procedure public.set_updated_at();
create trigger trg_export_jobs_updated_at before update on public.export_jobs
  for each row execute procedure public.set_updated_at();

-- 3. RLS Enable ----------------------------------------------------------------
alter table public.media_files enable row level security;
alter table public.geo_locations enable row level security;
alter table public.imports enable row level security;
alter table public.import_rows enable row level security;
alter table public.export_jobs enable row level security;

-- 4. Policies ------------------------------------------------------------------
-- media_files: unit members read; owner or admin/manager/staff manage.
create policy "select_media_files_unit_members" on public.media_files
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = media_files.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_media_files_staff" on public.media_files
  for insert with check (public.has_role(media_files.unit_id, array['admin','manager','staff']));
create policy "update_media_files_owner_or_staff" on public.media_files
  for update using (
    exists (select 1 from public.profiles pr where pr.id = media_files.owner_user_id and pr.user_id = auth.uid())
    or public.has_role(media_files.unit_id, array['admin','manager','staff'])
  ) with check (
    exists (select 1 from public.profiles pr where pr.id = media_files.owner_user_id and pr.user_id = auth.uid())
    or public.has_role(media_files.unit_id, array['admin','manager','staff'])
  );
create policy "delete_media_files_staff" on public.media_files
  for delete using (public.has_role(media_files.unit_id, array['admin','manager','staff']));

-- geo_locations: read by unit members; insert by staff.
create policy "select_geo_locations_unit_members" on public.geo_locations
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = geo_locations.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_geo_locations_staff" on public.geo_locations
  for insert with check (public.has_role(geo_locations.unit_id, array['admin','manager','staff']));
-- immutable, no update/delete

-- imports / import_rows
create policy "select_imports_unit_members" on public.imports
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = imports.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_imports_staff" on public.imports
  for insert with check (public.has_role(imports.unit_id, array['admin','manager','staff']));
create policy "update_imports_staff" on public.imports
  for update using (public.has_role(imports.unit_id, array['admin','manager','staff']))
          with check (public.has_role(imports.unit_id, array['admin','manager','staff']));

create policy "select_import_rows_unit_members" on public.import_rows
  for select using (exists (
    select 1 from public.imports i join public.unit_members um on um.unit_id = i.unit_id
    join public.profiles p on p.id = um.user_id
    where i.id = import_rows.import_id and p.user_id = auth.uid()
  ));
create policy "insert_import_rows_staff" on public.import_rows
  for insert with check (exists (
    select 1 from public.imports i
    where i.id = import_rows.import_id and public.has_role(i.unit_id, array['admin','manager','staff'])
  ));
create policy "update_import_rows_staff" on public.import_rows
  for update using (exists (
    select 1 from public.imports i
    where i.id = import_rows.import_id and public.has_role(i.unit_id, array['admin','manager','staff'])
  )) with check (exists (
    select 1 from public.imports i
    where i.id = import_rows.import_id and public.has_role(i.unit_id, array['admin','manager','staff'])
  ));

-- export_jobs
create policy "select_export_jobs_unit_members" on public.export_jobs
  for select using (exists (
    select 1 from public.unit_members um join public.profiles p on p.id = um.user_id
    where um.unit_id = export_jobs.unit_id and p.user_id = auth.uid()
  ));
create policy "insert_export_jobs_staff" on public.export_jobs
  for insert with check (public.has_role(export_jobs.unit_id, array['admin','manager','staff']));
create policy "update_export_jobs_staff" on public.export_jobs
  for update using (public.has_role(export_jobs.unit_id, array['admin','manager','staff']))
          with check (public.has_role(export_jobs.unit_id, array['admin','manager','staff']));

commit;

-- Future Ideas: background job queue integration, retention policies for media, materialized views for geo clustering.
