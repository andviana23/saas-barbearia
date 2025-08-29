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

-- 6. Clientes demo
insert into public.customers (id, nome, email, telefone, created_at, updated_at)
select gen_random_uuid(), c.nome, c.email, c.telefone, now(), now()
from (values
  ('João Cliente','joao@example.com','11988887777'),
  ('Maria Cliente','maria@example.com','11977776666'),
  ('Pedro Cliente','pedro@example.com','11966665555')
) as c(nome,email,telefone)
where not exists (
  select 1 from public.customers existing where existing.email = c.email
);

-- 7. Profissionais demo
insert into public.professionals (id, nome, email, ativo, created_at, updated_at)
select gen_random_uuid(), p.nome, p.email, true, now(), now()
from (values
  ('Carlos Profissional','carlos@demo.local'),
  ('Ana Profissional','ana@demo.local'),
  ('Bruno Profissional','bruno@demo.local')
) as p(nome,email)
where not exists (
  select 1 from public.professionals existing where existing.email = p.email
);

-- 8. Serviços demo (categoria simples se houver coluna category)
insert into public.services (id, nome, descricao, ativo, created_at, updated_at)
select gen_random_uuid(), s.nome, s.descricao, true, now(), now()
from (values
  ('Corte Masculino','Corte clássico masculino'),
  ('Barba Premium','Barba + toalha quente + óleo'),
  ('Combo Corte + Barba','Pacote especial com desconto')
) as s(nome,descricao)
where not exists (
  select 1 from public.services existing where existing.nome = s.nome
);

-- 9. Planos / subscription_plans
insert into public.subscription_plans (id, nome, descricao, ativo, created_at, updated_at)
select gen_random_uuid(), sp.nome, sp.descricao, true, now(), now()
from (values
  ('Plano Bronze','Base de entrada'),
  ('Plano Prata','Intermediário'),
  ('Plano Ouro','Plano avançado com benefícios')
) as sp(nome,descricao)
where not exists (
  select 1 from public.subscription_plans existing where existing.nome = sp.nome
);

commit;
