import { NextRequest, NextResponse } from 'next/server';
import { processAsaasWebhook } from '@/services/assinaturas/webhook';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-asaas-token');
  if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Responder 200 imediato (processamento assíncrono simplificado aqui)
  queueMicrotask(async () => {
    try {
      await processAsaasWebhook(payload as any);
    } catch (e) {
      console.error('Erro processamento webhook ASAAS', e);
    }
  });

  return NextResponse.json({ ok: true });
}
