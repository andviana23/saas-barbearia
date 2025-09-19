import { NextRequest, NextResponse } from 'next/server';
import { asaasClient } from '@/lib/asaas/client';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  processAsaasWebhook,
  AsaasWebhookEvent,
  ProcessWebhookDeps,
} from '@/services/assinaturas/webhook';

// Rota legacy agora delega ao processador central idempotente

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const bodyText = await request.text();
    const asaasToken = request.headers.get('asaas-access-token') || '';

    // Validar token do webhook conforme Guia de Integração
    if (!asaasToken || !asaasClient.validateWebhookToken(asaasToken)) {
      console.error('Token de webhook inválido:', {
        asaasToken: asaasToken ? '[OCULTO]' : 'AUSENTE',
      });
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Parse dos dados do webhook
    let webhookData;
    try {
      webhookData = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Erro ao parsear webhook data:', parseError);
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    // Implementar idempotência (evitar duplicação de eventos)
    // Enfileira processamento central reutilizando lógica idempotente
    queueMicrotask(async () => {
      try {
        const evt: AsaasWebhookEvent = {
          id:
            webhookData.id || webhookData.payment?.id || webhookData.subscription?.id || 'unknown',
          event: webhookData.event,
          dateCreated: webhookData.dateCreated || new Date().toISOString(),
          subscription: webhookData.subscription,
        };
        // Supabase server client já possui métodos esperados por ProcessWebhookDeps.supabase
        const deps: ProcessWebhookDeps = {
          supabase: supabase as unknown as ProcessWebhookDeps['supabase'],
        };
        await processAsaasWebhook(evt, deps);
      } catch (err) {
        console.error('Falha processamento webhook (rota legacy)', err);
      }
    });

    return NextResponse.json({ message: 'Webhook recebido' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar webhook ASAAS:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET para teste/verificação do webhook
export async function GET() {
  return NextResponse.json({ message: 'Webhook ASAAS ativo' }, { status: 200 });
}

// Forçar uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';
