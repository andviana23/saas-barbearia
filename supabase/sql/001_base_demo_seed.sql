-- Base Demo Seed (idempotente)
-- Objetivo: garantir dados mínimos para navegação (unidade, roles, perfil admin demo, clientes, profissionais, serviços, planos)
-- Execução: pode ser chamada múltiplas vezes sem efeitos colaterais

begin;

-- 1. Unidade demo (se ainda não existir)
insert into public.units (id, name, timezone, status)
values ('550e8400-e29b-41d4-a716-446655440000','Barbearia Trato Demo','America/Sao_Paulo','active')
on conflict (id) do nothing;

-- 2. Roles catálogo (reforço caso migration inicial não tenha rodado)
insert into public.roles (code,name,description) values
  ('admin','Administrator','Full access / manages unit'),
  ('manager','Manager','Manages schedules and staff'),
  ('professional','Professional','Provides services / appointments'),
  ('staff','Staff','Basic operational role'),
  ('read_only','Read Only','Visualização somente')
on conflict (code) do nothing;

-- 3. Usuário auth fictício (apenas se ambiente permitir) - placeholder UUID
-- NOTA: Em Supabase real, auth.users é gerido pelo serviço de auth. Aqui apenas cria vínculo se já existir usuário.
-- Se quiser forçar criação, usar CLI/admin API fora deste seed.

-- 4. Profile admin demo (associa a um user_id existente se coincidir) - usando first auth user fallback
-- Estratégia: pegar qualquer user existente se não houver profile demo
insert into public.profiles (id, user_id, name, role, unit_default_id, is_active)
select '11111111-1111-1111-1111-111111111111', u.id, 'Admin Demo', 'admin', '550e8400-e29b-41d4-a716-446655440000', true
from auth.users u
where not exists (select 1 from public.profiles p where p.id = '11111111-1111-1111-1111-111111111111')
limit 1;

-- 5. Vincular membership + role assignment admin se profile existir
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

-- Schema real: public.customers(id, unit_id, name, phone, email, ... , is_active, created_at, updated_at)
-- Ajuste: usar unit_id fixo da unidade demo e colunas em inglês.
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

-- A tabela 'professionals' é uma VIEW sobre profiles (role = 'professional').
-- Para ambiente demo: cria perfis profissionais somente se houver auth.users livres.
-- Estratégia: pegar até 3 usuários auth não usados ainda como profiles com role professional.
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
where not exists (
  select 1 from public.profiles p2
  where p2.user_id = s.user_id
);

-- Vincula membership e role_assignments professional (se entries criadas)
insert into public.unit_members (unit_id, user_id, is_manager)
select '550e8400-e29b-41d4-a716-446655440000', pr.id, false
from public.profiles pr
where pr.role = 'professional'
  and pr.unit_default_id = '550e8400-e29b-41d4-a716-446655440000'
on conflict (unit_id, user_id) do nothing;

insert into public.role_assignments (user_id, unit_id, role_id)
select pr.id, '550e8400-e29b-41d4-a716-446655440000', r.id
from public.profiles pr
join public.roles r on r.code = 'professional'
where pr.role = 'professional'
  and pr.unit_default_id = '550e8400-e29b-41d4-a716-446655440000'
on conflict (user_id, unit_id, role_id) do nothing;

-- Schema real services: (id, unit_id, category_id, name, description, duration_minutes, base_price, is_active, ...)
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

-- Schema real subscription_plans: (id, unit_id, name, description, interval_type, interval_count, price, currency, status, ...)
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

commit;
