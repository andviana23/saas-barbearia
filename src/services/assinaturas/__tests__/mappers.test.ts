import { mapDbSubscriptionToDomain, DbSubscriptionRow } from '../mappers';

describe('subscription mappers', () => {
  function base(): DbSubscriptionRow {
    return {
      id: 'sub1',
      plan_id: 'planA',
      unit_id: 'uni1',
      customer_id: 'cust1',
      asaas_subscription_id: null,
      status: 'inactive',
      start_date: '2025-01-01',
      end_date: null,
      notes: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };
  }

  test('mapeia campos básicos e defaults', () => {
    const domain = mapDbSubscriptionToDomain(base());
    expect(domain.id).toBe('sub1');
    expect(domain.planId).toBe('planA');
    expect(domain.asaasSubscriptionId).toBe(''); // fallback string
    expect(domain.status).toBe('inactive');
    expect(domain.endDate).toBeUndefined();
    expect(domain.nextBillingDate).toBe('2025-01-01'); // usa end_date||start_date
    expect(domain.billingCycle).toBe('monthly');
    expect(domain.autoRenew).toBe(false);
  });

  test('usa end_date presente e notes', () => {
    const row = { ...base(), end_date: '2025-02-01', notes: 'obs' };
    const d = mapDbSubscriptionToDomain(row);
    expect(d.endDate).toBe('2025-02-01');
    expect(d.currentPeriodEnd).toBe('2025-02-01');
    expect(d.nextBillingDate).toBe('2025-02-01');
    expect(d.notes).toBe('obs');
  });

  test('mantém status válido ou default active quando vazio', () => {
    const row = { ...base(), status: '' } as DbSubscriptionRow;
    const d = mapDbSubscriptionToDomain(row);
    expect(d.status).toBe('active');
  });

  test('id de asaas mantém quando fornecido', () => {
    const row = { ...base(), asaas_subscription_id: 'asaas123' };
    const d = mapDbSubscriptionToDomain(row);
    expect(d.asaasSubscriptionId).toBe('asaas123');
  });
});
