'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { withValidationSchema, createActionResult } from '@/lib/server-actions';
import { ActionResult } from '@/types';
import {
  createSubscriptionExternal,
  cancelSubscription,
  updateSubscription,
} from '@/services/assinaturas/subscriptions';

const ListSchema = z.object({ unitId: z.string().uuid() });

export async function createSubscriptionAction(formData: FormData): Promise<ActionResult> {
  return createSubscriptionExternal(formData) as unknown as ActionResult;
}

export async function updateSubscriptionAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  return updateSubscription(id, formData) as unknown as ActionResult;
}

export async function cancelSubscriptionAction(id: string): Promise<ActionResult> {
  return cancelSubscription(id) as unknown as ActionResult;
}

export const listSubscriptionsAction = withValidationSchema(ListSchema, async ({ unitId }) => {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('unit_id', unitId)
    .limit(100);
  if (error) return createActionResult(false, undefined, error.message);
  return data;
});
