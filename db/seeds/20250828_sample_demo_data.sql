-- Seed opcional de dados complementares (leve / exemplo)
-- Idempotente

-- Tags de clientes adicionais
insert into public.customer_tags (unit_id, name, color)
select '550e8400-e29b-41d4-a716-446655440000', t.name, t.color
from (values
	('VIP','#ffd700'),
	('Recorrente','#4caf50'),
	('Promo','#2196f3')
) as t(name,color)
where not exists (
	select 1 from public.customer_tags ct
	where ct.unit_id='550e8400-e29b-41d4-a716-446655440000' and ct.name=t.name
);

-- Benefícios para planos (exemplo)
insert into public.plan_benefits (plan_id, benefit_type, value, metadata)
select sp.id, b.bt, b.val, jsonb_build_object('sample', true)
from public.subscription_plans sp
join (
	values ('minutes_bonus', 30), ('discount_percent', 10)
) as b(bt,val) on sp.name = 'Plano Ouro'
where not exists (
	select 1 from public.plan_benefits pb
	where pb.plan_id = sp.id and pb.benefit_type = b.bt
);

-- KPI snapshot inicial se não existir
insert into public.kpi_snapshots (unit_id, snapshot_date, metric, value)
select '550e8400-e29b-41d4-a716-446655440000', current_date, 'initial_demo', 1
where not exists (
	select 1 from public.kpi_snapshots ks
	where ks.unit_id='550e8400-e29b-41d4-a716-446655440000' and ks.metric='initial_demo'
);

-- FIM
