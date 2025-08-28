-- ==============================================
-- 015_unify_asaas_webhook_events.sql
-- Objetivo: Unificar divergências de schema entre migrations duplicadas
--            e alinhar colunas/valores (lowercase statuses, retry infra)
-- Data: 2025-08-27
-- ==============================================

-- Normalizar nomes de status para lowercase antes de constraint
UPDATE public.asaas_webhook_events SET status = lower(status);

-- Renomear coluna de erro se existir
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='asaas_webhook_events' AND column_name='error_message'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='asaas_webhook_events' AND column_name='last_error'
  ) THEN
    ALTER TABLE public.asaas_webhook_events RENAME COLUMN error_message TO last_error;
  END IF;
END $$;

-- Adicionar colunas adicionais se faltando
ALTER TABLE public.asaas_webhook_events ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.asaas_webhook_events ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.asaas_webhook_events ADD COLUMN IF NOT EXISTS processing_time_ms integer;
ALTER TABLE public.asaas_webhook_events ADD COLUMN IF NOT EXISTS signature text;
ALTER TABLE public.asaas_webhook_events ADD COLUMN IF NOT EXISTS received_at timestamptz DEFAULT now();

-- Garantir payload como jsonb (caso alguma migration antiga tenha text)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='asaas_webhook_events' AND column_name='payload' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.asaas_webhook_events ALTER COLUMN payload TYPE jsonb USING payload::jsonb;
  END IF;
END $$;

-- Constraint de status (adiciona se não existir)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_asaas_webhook_events_status'
  ) THEN
    ALTER TABLE public.asaas_webhook_events
      ADD CONSTRAINT chk_asaas_webhook_events_status CHECK (status IN ('pending','processed','failed'));
  END IF;
END $$;

-- Índice para retries (pending / failed)
CREATE INDEX IF NOT EXISTS idx_asaas_webhook_events_retry
  ON public.asaas_webhook_events (status, retry_count, received_at)
  WHERE status IN ('pending','failed');

-- Comentários atualizados
COMMENT ON COLUMN public.asaas_webhook_events.external_id IS 'ID externo principal (ex: payment.id ou subscription.id)';
COMMENT ON COLUMN public.asaas_webhook_events.retry_count IS 'Número de tentativas de processamento';
COMMENT ON COLUMN public.asaas_webhook_events.last_error IS 'Último erro registrado para o evento';
COMMENT ON COLUMN public.asaas_webhook_events.processing_time_ms IS 'Duração do processamento em ms';
COMMENT ON COLUMN public.asaas_webhook_events.signature IS 'Assinatura de verificação do provedor (se houver)';
COMMENT ON COLUMN public.asaas_webhook_events.received_at IS 'Timestamp de recebimento (separado de created_at)';

-- View (re)criada padronizada para pendentes
CREATE OR REPLACE VIEW public.view_asaas_webhook_events_pending AS
SELECT id, event_id, event_type, external_id, received_at, retry_count
FROM public.asaas_webhook_events
WHERE status = 'pending';
COMMENT ON VIEW public.view_asaas_webhook_events_pending IS 'Eventos ASAAS pendentes de processamento';
