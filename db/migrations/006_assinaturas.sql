CREATE TABLE IF NOT EXISTS public.planos (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        unidade_id uuid NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
        nome text NOT NULL,
        descricao text NULL,
        preco numeric(10,2) NOT NULL,
        duracao_meses int NOT NULL, -- 1, 3, 6, 12...
        ativo boolean DEFAULT true NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT planos_nome_length CHECK (length(nome) >= 2),
        CONSTRAINT planos_preco_positive CHECK (preco >= 0),
        CONSTRAINT planos_duracao_positive CHECK (duracao_meses > 0)
);

CREATE INDEX IF NOT EXISTS idx_planos_unidade_id ON public.planos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_planos_ativo ON public.planos(ativo);
CREATE INDEX IF NOT EXISTS idx_planos_nome ON public.planos(nome);

DROP TRIGGER IF EXISTS update_planos_updated_at ON public.planos;
CREATE TRIGGER update_planos_updated_at
    BEFORE UPDATE ON public.planos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.planos IS 'Planos de assinatura disponíveis por unidade';
COMMENT ON COLUMN public.planos.duracao_meses IS 'Duração do plano em meses';
CREATE TABLE IF NOT EXISTS public.assinaturas (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        plano_id uuid NOT NULL REFERENCES public.planos(id) ON DELETE RESTRICT,
        cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
        unidade_id uuid NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
        inicio date NOT NULL DEFAULT CURRENT_DATE,
        fim date NOT NULL,
        status text NOT NULL DEFAULT 'ativa', -- ativa, cancelada, expirada
        external_ref text NULL, -- referência a provedor externo (ASAAS, etc.)
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT assinaturas_periodo_valido CHECK (fim > inicio)
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_unidade_id ON public.assinaturas(unidade_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_plano_id ON public.assinaturas(plano_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_cliente_id ON public.assinaturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON public.assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_external_ref ON public.assinaturas(external_ref) WHERE external_ref IS NOT NULL;

DROP TRIGGER IF EXISTS update_assinaturas_updated_at ON public.assinaturas;
CREATE TRIGGER update_assinaturas_updated_at
    BEFORE UPDATE ON public.assinaturas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.assinaturas IS 'Assinaturas de clientes para planos';
COMMENT ON COLUMN public.assinaturas.external_ref IS 'Identificador externo (gateway de pagamento)';
CREATE TABLE IF NOT EXISTS public.pagamentos_assinaturas (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    assinatura_id uuid NOT NULL REFERENCES public.assinaturas(id) ON DELETE CASCADE,
    valor numeric(10,2) NOT NULL,
    metodo text NOT NULL, -- cartao, pix, boleto
    status text NOT NULL DEFAULT 'pendente', -- pendente, pago, falhou
    data_pagamento timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    external_payment_ref text NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pagamentos_assinaturas_valor_positive CHECK (valor >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_assinaturas_assinatura_id ON public.pagamentos_assinaturas(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_assinaturas_status ON public.pagamentos_assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_assinaturas_metodo ON public.pagamentos_assinaturas(metodo);
CREATE INDEX IF NOT EXISTS idx_pagamentos_assinaturas_external_ref ON public.pagamentos_assinaturas(external_payment_ref) WHERE external_payment_ref IS NOT NULL;

COMMENT ON TABLE public.pagamentos_assinaturas IS 'Pagamentos efetuados para assinaturas';
COMMENT ON COLUMN public.pagamentos_assinaturas.external_payment_ref IS 'Referência externa do pagamento';

-- Trigger opcional futura para atualizar status de assinatura baseado em pagamentos