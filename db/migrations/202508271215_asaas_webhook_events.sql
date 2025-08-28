-- =================================================================
-- MIGRAÇÃO 202508271215: Tabela de Eventos Webhook ASAAS (Idempotência)
-- Data: 2025-08-27
-- Descrição: Persistência de eventos recebidos para garantir idempotência e auditoria
-- =================================================================

CREATE TABLE IF NOT EXISTS public.asaas_webhook_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id text NOT NULL,                       -- ID único enviado pelo ASAAS (ou hash calculado)
  event_type text NOT NULL,                     -- Tipo de evento (payment_created, subscription_...)
  received_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at timestamptz NULL,                -- Quando o processamento interno concluiu
  status text NOT NULL DEFAULT 'pending',       -- pending | processed | failed
  retry_count integer NOT NULL DEFAULT 0,
  last_error text NULL,
  payload jsonb NOT NULL,                       -- Payload bruto para reprocessamento/auditoria
  signature text NULL,                          -- Assinatura/validação (se aplicável)
  processing_time_ms integer NULL               -- Métrica opcional
);

-- Índices e constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_asaas_webhook_events_event_id ON public.asaas_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_asaas_webhook_events_status ON public.asaas_webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_asaas_webhook_events_event_type ON public.asaas_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_asaas_webhook_events_received_at ON public.asaas_webhook_events(received_at);

COMMENT ON TABLE public.asaas_webhook_events IS 'Eventos recebidos do ASAAS para processamento idempotente';
COMMENT ON COLUMN public.asaas_webhook_events.event_id IS 'Identificador único do evento (ou hash determinístico)';
COMMENT ON COLUMN public.asaas_webhook_events.status IS 'Estado de processamento interno';
COMMENT ON COLUMN public.asaas_webhook_events.payload IS 'Payload completo do webhook para auditoria e reprocessamento';

-- View simplificada para filas de reprocessamento
CREATE OR REPLACE VIEW public.view_asaas_webhook_events_pending AS
SELECT id, event_id, event_type, received_at, retry_count
FROM public.asaas_webhook_events
WHERE status = 'pending';

COMMENT ON VIEW public.view_asaas_webhook_events_pending IS 'Eventos ASAAS pendentes de processamento';
