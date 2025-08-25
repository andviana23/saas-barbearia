-- =====================================
-- 005_produtos_vendas.sql
-- Criação de tabelas para Produtos e Vendas
-- =====================================
-- =====================================
-- Tabela de Produtos
-- =====================================
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    estoque INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================
-- Tabela de Vendas
-- =====================================
CREATE TABLE IF NOT EXISTS public.vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE
    SET NULL,
        profissional_id UUID REFERENCES public.profissionais(id) ON DELETE
    SET NULL,
        valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'aberta',
        -- aberta, paga, cancelada
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================
-- Itens da Venda
-- =====================================
CREATE TABLE IF NOT EXISTS public.vendas_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED
);
-- =====================================
-- Atualiza controle de migrações
-- =====================================
INSERT INTO public.migrations (version, name, executed_at)
VALUES ('005', 'produtos_vendas', NOW()) ON CONFLICT (version) DO NOTHING;