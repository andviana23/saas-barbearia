import { NextResponse } from 'next/server';
import { getAsaasWebhookMetrics } from '@/app/actions/asaas-webhook-metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  const res = await getAsaasWebhookMetrics();
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 500 });
  }
  return NextResponse.json(
    { success: true, metrics: res.data },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
