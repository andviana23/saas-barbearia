-- =====================================
-- ASAAS Webhook Events - Idempotency Control
-- =====================================
-- Tabela para controlar eventos de webhook do ASAAS
-- Implementa idempotência conforme Guia de Integração ASAAS

CREATE TABLE IF NOT EXISTS public.asaas_webhook_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id text NOT NULL, -- Identificador único do evento (payment.id_event)
    event_type text NOT NULL, -- PAYMENT_CREATED, PAYMENT_RECEIVED, etc
    external_id text NOT NULL, -- payment.id ou subscription.id
    payload jsonb NOT NULL, -- Payload completo do webhook
    status text NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED
    error_message text, -- Mensagem de erro se status = FAILED
    created_at timestamptz DEFAULT now(),
    processed_at timestamptz, -- Quando foi processado
    
    -- Garantir idempotência por event_id único
    CONSTRAINT unique_event_id UNIQUE (event_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_asaas_webhook_events_status 
ON public.asaas_webhook_events(status, created_at);

CREATE INDEX IF NOT EXISTS idx_asaas_webhook_events_external 
ON public.asaas_webhook_events(external_id);

CREATE INDEX IF NOT EXISTS idx_asaas_webhook_events_event_type 
ON public.asaas_webhook_events(event_type);

-- Índice para buscar eventos não processados (para retry)
CREATE INDEX IF NOT EXISTS idx_asaas_webhook_events_failed 
ON public.asaas_webhook_events(status, created_at) 
WHERE status IN ('PENDING', 'FAILED');

-- RLS Policy - por segurança, apenas system pode acessar
ALTER TABLE public.asaas_webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy para permitir apenas operações de sistema (service role)
CREATE POLICY "System only access" ON public.asaas_webhook_events
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Trigger para updated_at automatico
CREATE OR REPLACE FUNCTION update_asaas_webhook_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.processed_at = COALESCE(NEW.processed_at, 
        CASE WHEN NEW.status IN ('PROCESSED', 'FAILED') 
             THEN now() 
             ELSE OLD.processed_at 
        END);
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS asaas_webhook_events_updated_at ON public.asaas_webhook_events;
CREATE TRIGGER asaas_webhook_events_updated_at
    BEFORE UPDATE ON public.asaas_webhook_events
    FOR EACH ROW
    EXECUTE PROCEDURE update_asaas_webhook_events_updated_at();

-- Comment na tabela
COMMENT ON TABLE public.asaas_webhook_events IS 'Controle de eventos de webhook do ASAAS para garantir idempotência';
COMMENT ON COLUMN public.asaas_webhook_events.event_id IS 'ID único do evento (payment.id + event_type)';
COMMENT ON COLUMN public.asaas_webhook_events.status IS 'PENDING: aguardando processamento, PROCESSED: processado com sucesso, FAILED: falha no processamento';