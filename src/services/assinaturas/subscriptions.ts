'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { mapDbSubscriptionToDomain } from './mappers';

const BaseSubscriptionSchema = z.object({
  plan_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
});

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: unknown;
  message?: string;
}

export async function createSubscriptionExternal(formData: FormData): Promise<ActionResult> {
  const supabase = createServerSupabase();
  const data = {
    plan_id: formData.get('plan_id'),
    customer_id: formData.get('customer_id'),
    unit_id: formData.get('unit_id'),
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
  };
  const parsed = BaseSubscriptionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos', issues: parsed.error.issues };
  }

  const { data: inserted, error } = await supabase
    .from('subscriptions')
    .insert({ ...parsed.data, status: 'active' })
    .select('*')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: mapDbSubscriptionToDomain(inserted) };
}

export async function createSubscriptionASAAS(payload: {
  id: string;
  subscriptionId?: string;
}): Promise<ActionResult> {
  // TODO: mapear payload real do webhook ASAAS -> subscription
  return { success: true, message: `ASAAS subscription placeholder ${payload.id}` };
}

export async function updateSubscription(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = createServerSupabase();
  const partial = BaseSubscriptionSchema.partial();
  const data = {
    plan_id: formData.get('plan_id') || undefined,
    start_date: formData.get('start_date') || undefined,
    end_date: formData.get('end_date') || undefined,
  };
  const parsed = partial.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos', issues: parsed.error.issues };
  }
  const { data: updated, error } = await supabase
    .from('subscriptions')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: mapDbSubscriptionToDomain(updated) };
}

export async function cancelSubscription(id: string): Promise<ActionResult> {
  const supabase = createServerSupabase();
  const { data: updated, error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', end_date: new Date().toISOString().split('T')[0] })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: mapDbSubscriptionToDomain(updated) };
}
