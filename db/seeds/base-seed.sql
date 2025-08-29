-- Base seed atualizado para schema atual: public.roles(code,name,description), public.units, public.feature_flags.
-- Seguro para re-execução.

-- Catálogo de roles mínimos (se já existem, ignora)
insert into public.roles (code, name, description) values
	('admin','Administrator','Full access'),
	('manager','Manager','Manage schedules & team'),
	('staff','Staff','Operational basic role')
on conflict (code) do nothing;

-- Unidade demo adicional (diferente da utilizada em seed principal)
insert into public.units (id, name, timezone, status)
values ('00000000-0000-0000-0000-000000000001', 'Demo Unit', 'America/Sao_Paulo', 'active')
on conflict (id) do nothing;

-- Feature flags (usa JSON array simples de UUIDs no campo enabled_for_units se quiser granular)
insert into public.feature_flags (code, description, enabled_globally, enabled_for_units)
values
	('lgpd_module', 'Módulo LGPD', true, null),
	('multi_units', 'Multi unidades', false, '["00000000-0000-0000-0000-000000000001"]'::jsonb),
	('queue_system', 'Sistema de fila', true, null)
on conflict (code) do nothing;
