CREATE OR REPLACE VIEW public.relatorio_faturamento_diario AS
SELECT unidade_id,
       (created_at::date) AS dia,
       SUM(valor_total) AS faturamento
FROM public.vendas
WHERE status = 'paga'
GROUP BY unidade_id, (created_at::date);

COMMENT ON VIEW public.relatorio_faturamento_diario IS 'Faturamento diário de vendas pagas por unidade';
CREATE OR REPLACE VIEW public.relatorio_top_profissionais AS
SELECT v.unidade_id,
       v.profissional_id,
       SUM(v.valor_total) AS total_faturado,
       COUNT(v.id) AS qtd_vendas
FROM public.vendas v
WHERE v.status = 'paga'
GROUP BY v.unidade_id, v.profissional_id;

COMMENT ON VIEW public.relatorio_top_profissionais IS 'Ranking de profissionais por faturamento de vendas pagas';
CREATE OR REPLACE VIEW public.relatorio_assinaturas_ativas AS
SELECT unidade_id,
       COUNT(id) AS total_ativas
FROM public.assinaturas
WHERE status = 'ativa'
GROUP BY unidade_id;

COMMENT ON VIEW public.relatorio_assinaturas_ativas IS 'Total de assinaturas ativas por unidade';