import { Subscription } from '@/types/subscription';

export interface DbSubscriptionRow {
  id: string;
  plan_id: string;
  unit_id: string;
  customer_id: string;
  asaas_subscription_id?: string | null;
  status: string;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export function mapDbSubscriptionToDomain(db: DbSubscriptionRow): Subscription {
  return {
    id: db.id,
    planId: db.plan_id,
    unitId: db.unit_id,
    customerId: db.customer_id,
    asaasSubscriptionId: db.asaas_subscription_id || '',
    status: (db.status as Subscription['status']) || 'active',
    startDate: db.start_date,
    endDate: db.end_date || undefined,
    nextBillingDate: db.end_date || db.start_date,
    billingCycle: 'monthly',
    paymentMethod: 'pix',
    autoRenew: false,
    currentPeriodStart: db.start_date,
    currentPeriodEnd: db.end_date || db.start_date,
    notes: db.notes || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}
