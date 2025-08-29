-- Stubs mínimos para simular ambiente Supabase em testes locais/CI
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $$ select '11111111-1111-1111-1111-111111111111'::uuid $$;
create table if not exists auth.users (
  id uuid primary key,
  raw_user_meta_data jsonb default '{}'::jsonb,
  email text
);
insert into auth.users (id,email) values ('11111111-1111-1111-1111-111111111111','test@example.com') on conflict do nothing;

-- Roles de domínio (para eventuais policies baseadas em ROLE)
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['admin','manager','professional','staff','read_only'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE "%s" NOLOGIN;', r);
    END IF;
  END LOOP;
END$$;
