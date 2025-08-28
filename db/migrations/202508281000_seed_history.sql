-- =================================================================
-- MIGRAÇÃO 202508281000: seed_history (Controle de Seeds Idempotentes)
-- Data: 2025-08-28
-- Descrição: Tabela para registrar execução de arquivos de seed e evitar reaplicação
-- =================================================================

CREATE TABLE IF NOT EXISTS public.seed_history (
  id bigserial PRIMARY KEY,
  filename text NOT NULL UNIQUE,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  execution_time_ms integer NULL,
  success boolean NOT NULL DEFAULT false,
  error_message text NULL
);

CREATE INDEX IF NOT EXISTS idx_seed_history_applied_at ON public.seed_history(applied_at);
CREATE INDEX IF NOT EXISTS idx_seed_history_success ON public.seed_history(success);
CREATE INDEX IF NOT EXISTS idx_seed_history_filename_pattern ON public.seed_history USING gin (filename gin_trgm_ops) WHERE filename IS NOT NULL;

COMMENT ON TABLE public.seed_history IS 'Histórico de execução de arquivos de seed (.sql)';
COMMENT ON COLUMN public.seed_history.filename IS 'Nome do arquivo de seed (único)';
COMMENT ON COLUMN public.seed_history.checksum IS 'Hash MD5 do conteúdo do seed no momento da aplicação';
COMMENT ON COLUMN public.seed_history.success IS 'Indica se a execução do seed concluiu com sucesso';
COMMENT ON COLUMN public.seed_history.error_message IS 'Mensagem de erro caso a aplicação do seed tenha falhado';

-- View simples para seeds pendentes (presentes no diretório mas não aplicados) poderá ser criada futuramente via função
