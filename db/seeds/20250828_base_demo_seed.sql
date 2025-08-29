-- Seed: Base Demo Consolidada (migrada de supabase/sql/001_base_demo_seed.sql)
-- Objetivo: dados mínimos para navegação (unidade, roles, admin demo, clientes, profissionais, serviços, planos)
-- Idempotente: usa ON CONFLICT / NOT EXISTS. Não envolve transação explícita (runner trata erros isoladamente).

-- 1. Unidade demo
insert into public.units (id, name, timezone, status)
values ('550e8400-e29b-41d4-a716-446655440000','Barbearia Trato Demo','America/Sao_Paulo','active')
on conflict (id) do nothing;

-- 2. Roles catálogo (reforço)
insert into public.roles (code,name,description) values
  ('admin','Administrator','Full access / manages unit'),
  ('manager','Manager','Manages schedules and staff'),
  ('professional','Professional','Provides services / appointments'),
  ('staff','Staff','Basic operational role'),
  ('read_only','Read Only','Visualização somente')
on conflict (code) do nothing;

-- 3/4. Profile admin demo (fallback em qualquer auth.users livre)
insert into public.profiles (id, user_id, name, role, unit_default_id, is_active)
select '11111111-1111-1111-1111-111111111111', u.id, 'Admin Demo', 'admin', '550e8400-e29b-41d4-a716-446655440000', true
from auth.users u
where not exists (select 1 from public.profiles p where p.id = '11111111-1111-1111-1111-111111111111')
limit 1;

-- 5. Membership + role assignment admin
insert into public.unit_members (unit_id, user_id, is_manager)
select '550e8400-e29b-41d4-a716-446655440000', p.id, true
from public.profiles p
where p.id = '11111111-1111-1111-1111-111111111111'
on conflict (unit_id, user_id) do nothing;

insert into public.role_assignments (user_id, unit_id, role_id)
select p.id, '550e8400-e29b-41d4-a716-446655440000', r.id
from public.profiles p
join public.roles r on r.code = 'admin'
where p.id = '11111111-1111-1111-1111-111111111111'
on conflict (user_id, unit_id, role_id) do nothing;

-- 6. Clientes demo
insert into public.customers (id, unit_id, name, phone, email, is_active, created_at, updated_at)
select gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', c.name, c.phone, c.email, true, now(), now()
from (values
  ('João Cliente','11988887777','joao@example.com'),
  ('Maria Cliente','11977776666','maria@example.com'),
  ('Pedro Cliente','11966665555','pedro@example.com')
) as c(name,phone,email)
where not exists (
  select 1 from public.customers existing
  where existing.unit_id = '550e8400-e29b-41d4-a716-446655440000' and existing.email = c.email
);

-- 7. Perfis profissionais (convertendo até 3 auth.users livres)
with available as (
  select u.id as user_id
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where p.id is null
  limit 3
), desired as (
  select row_number() over () as rn, user_id from available
), spec as (
  select d.user_id,
    case d.rn
      when 1 then 'Carlos Profissional'
      when 2 then 'Ana Profissional'
      when 3 then 'Bruno Profissional'
    end as name
  from desired d
)
insert into public.profiles (id, user_id, name, role, unit_default_id, is_active)
select gen_random_uuid(), s.user_id, s.name, 'professional', '550e8400-e29b-41d4-a716-446655440000', true
from spec s
where not exists (select 1 from public.profiles p2 where p2.user_id = s.user_id);

insert into public.unit_members (unit_id, user_id, is_manager)
select '550e8400-e29b-41d4-a716-446655440000', pr.id, false
from public.profiles pr
where pr.role = 'professional' and pr.unit_default_id = '550e8400-e29b-41d4-a716-446655440000'
on conflict (unit_id, user_id) do nothing;

insert into public.role_assignments (user_id, unit_id, role_id)
select pr.id, '550e8400-e29b-41d4-a716-446655440000', r.id
from public.profiles pr
join public.roles r on r.code = 'professional'
where pr.role = 'professional' and pr.unit_default_id = '550e8400-e29b-41d4-a716-446655440000'
on conflict (user_id, unit_id, role_id) do nothing;

-- 8. Serviços demo
insert into public.services (id, unit_id, name, description, duration_minutes, base_price, is_active, created_at, updated_at)
select gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', s.name, s.description, s.duration, s.price, true, now(), now()
from (values
  ('Corte Masculino','Corte clássico masculino',30, 35.00),
  ('Barba Premium','Barba + toalha quente + óleo',25, 28.00),
  ('Combo Corte + Barba','Pacote especial com desconto',55, 58.00)
) as s(name,description,duration,price)
where not exists (
  select 1 from public.services existing
  where existing.unit_id = '550e8400-e29b-41d4-a716-446655440000' and existing.name = s.name
);

-- 9. Planos de assinatura
insert into public.subscription_plans (id, unit_id, name, description, interval_type, interval_count, price, currency, status, created_at, updated_at)
select gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', sp.name, sp.description, 'month', 1, sp.price, 'BRL', 'active', now(), now()
from (values
  ('Plano Bronze','Base de entrada', 49.90),
  ('Plano Prata','Intermediário', 89.90),
  ('Plano Ouro','Plano avançado com benefícios', 129.90)
) as sp(name,description,price)
where not exists (
  select 1 from public.subscription_plans existing
  where existing.unit_id = '550e8400-e29b-41d4-a716-446655440000' and existing.name = sp.name
);

-- FIM
