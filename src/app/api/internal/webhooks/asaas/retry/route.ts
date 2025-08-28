import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { retryAsaasWebhookEvents } from '@/services/assinaturas/retryWebhookEvents';
import type { ProcessWebhookDeps } from '@/services/assinaturas/webhook';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-internal-cron-token');
  if (!token || token !== process.env.INTERNAL_CRON_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const supabase = createServerSupabase();
  const result = await retryAsaasWebhookEvents(
    supabase as unknown as NonNullable<ProcessWebhookDeps['supabase']>,
    {},
  );
  return NextResponse.json(result);
}
