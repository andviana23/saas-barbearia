-- =====================================
-- View: Faturamento Diário
-- =====================================
create or replace view public.relatorio_faturamento_diario as
select unidade_id,
    date(created_at) as dia,
    sum(valor_total) as faturamento
from public.vendas
where status = 'paga'
group by unidade_id,
    date(created_at);
-- =====================================
-- View: Top Profissionais (por período)
-- =====================================
create or replace view public.relatorio_top_profissionais as
select v.unidade_id,
    v.profissional_id,
    sum(v.valor_total) as total_faturado,
    count(v.id) as qtd_vendas
from public.vendas v
where v.status = 'paga'
group by v.unidade_id,
    v.profissional_id;
-- =====================================
-- View: Assinaturas Ativas
-- =====================================
create or replace view public.relatorio_assinaturas_ativas as
select unidade_id,
    count(id) as total_ativas
from public.assinaturas
where status = 'ativa'
group by unidade_id;