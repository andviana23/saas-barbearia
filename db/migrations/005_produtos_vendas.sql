-- 005_produtos_vendas.sql
-- Criação de tabelas para Produtos, Vendas e Itens de Venda
-- Padronizado com created_at/updated_at, triggers e constraints

-- =====================================
-- Tabela de Produtos
-- =====================================
CREATE TABLE IF NOT EXISTS public.produtos (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        unidade_id uuid NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
        nome text NOT NULL,
        descricao text NULL,
        preco numeric(10,2) NOT NULL,
        estoque integer DEFAULT 0 NOT NULL,
        ativo boolean DEFAULT true NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT produtos_nome_length CHECK (length(nome) >= 2),
        CONSTRAINT produtos_preco_positive CHECK (preco >= 0),
        CONSTRAINT produtos_estoque_nonnegative CHECK (estoque >= 0)
);

CREATE INDEX IF NOT EXISTS idx_produtos_unidade_id ON public.produtos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON public.produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON public.produtos(nome);

DROP TRIGGER IF EXISTS update_produtos_updated_at ON public.produtos;
CREATE TRIGGER update_produtos_updated_at
    BEFORE UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.produtos IS 'Catálogo de produtos para venda';
COMMENT ON COLUMN public.produtos.preco IS 'Preço unitário em BRL';
COMMENT ON COLUMN public.produtos.estoque IS 'Quantidade em estoque';

-- =====================================
-- Tabela de Vendas
-- =====================================
CREATE TABLE IF NOT EXISTS public.vendas (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        unidade_id uuid NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
        cliente_id uuid NULL REFERENCES public.clientes(id) ON DELETE SET NULL,
        profissional_id uuid NULL REFERENCES public.profissionais(id) ON DELETE SET NULL,
        valor_total numeric(10,2) NOT NULL DEFAULT 0,
        status text DEFAULT 'aberta' NOT NULL, -- aberta, paga, cancelada
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT vendas_valor_total_positive CHECK (valor_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_vendas_unidade_id ON public.vendas(unidade_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON public.vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_profissional_id ON public.vendas(profissional_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON public.vendas(status);
CREATE INDEX IF NOT EXISTS idx_vendas_created_at ON public.vendas(created_at);

DROP TRIGGER IF EXISTS update_vendas_updated_at ON public.vendas;
CREATE TRIGGER update_vendas_updated_at
    BEFORE UPDATE ON public.vendas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.vendas IS 'Registro de vendas de produtos';
COMMENT ON COLUMN public.vendas.valor_total IS 'Valor total calculado a partir dos itens';

-- =====================================
-- Itens da Venda
-- =====================================
CREATE TABLE IF NOT EXISTS public.vendas_itens (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        venda_id uuid NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
        produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
        quantidade integer NOT NULL DEFAULT 1,
        preco_unitario numeric(10,2) NOT NULL,
        subtotal numeric(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT vendas_itens_quantidade_positive CHECK (quantidade > 0),
        CONSTRAINT vendas_itens_preco_unitario_positive CHECK (preco_unitario >= 0)
);

CREATE INDEX IF NOT EXISTS idx_vendas_itens_venda_id ON public.vendas_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_vendas_itens_produto_id ON public.vendas_itens(produto_id);

COMMENT ON TABLE public.vendas_itens IS 'Itens vinculados a cada venda';
COMMENT ON COLUMN public.vendas_itens.subtotal IS 'Subtotal calculado (quantidade * preco_unitario)';

-- Trigger opcional para recalcular valor_total em vendas (pode ser ajustado depois)
CREATE OR REPLACE FUNCTION public.update_venda_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.vendas v
    SET valor_total = COALESCE((
        SELECT SUM(subtotal) FROM public.vendas_itens WHERE venda_id = v.id
    ), 0)
    WHERE v.id = COALESCE(NEW.venda_id, OLD.venda_id);
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS update_venda_total_on_items ON public.vendas_itens;
CREATE TRIGGER update_venda_total_on_items
    AFTER INSERT OR UPDATE OR DELETE ON public.vendas_itens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_venda_total();

COMMENT ON FUNCTION public.update_venda_total() IS 'Atualiza valor_total de uma venda após mudanças em itens';

-- Removido insert manual em migrations (controle centralizado)