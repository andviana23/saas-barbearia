CREATE TABLE IF NOT EXISTS public.notificacoes (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE,
        usuario_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
        titulo text NOT NULL,
        mensagem text NOT NULL,
        lida boolean DEFAULT false NOT NULL,
        tipo text NULL, -- sistema, financeiro, agendamento
        meta jsonb NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT notificacoes_titulo_length CHECK (length(titulo) >= 2),
        CONSTRAINT notificacoes_meta_object CHECK (meta IS NULL OR jsonb_typeof(meta) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_unidade_id ON public.notificacoes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes(created_at);

DROP TRIGGER IF EXISTS update_notificacoes_updated_at ON public.notificacoes;
CREATE TRIGGER update_notificacoes_updated_at
    BEFORE UPDATE ON public.notificacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.notificacoes IS 'Notificações enviadas a usuários';
COMMENT ON COLUMN public.notificacoes.meta IS 'Metadados adicionais em JSON';
CREATE TABLE IF NOT EXISTS public.logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    acao text NOT NULL,
    detalhes jsonb NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT logs_acao_length CHECK (length(acao) >= 2),
    CONSTRAINT logs_detalhes_object CHECK (detalhes IS NULL OR jsonb_typeof(detalhes) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_logs_unidade_id ON public.logs(unidade_id);
CREATE INDEX IF NOT EXISTS idx_logs_usuario_id ON public.logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_acao ON public.logs(acao);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at);

COMMENT ON TABLE public.logs IS 'Logs de ações do sistema';
COMMENT ON COLUMN public.logs.detalhes IS 'Detalhes da ação em JSON';