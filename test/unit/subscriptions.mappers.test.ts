import { describe, it, expect } from '@jest/globals';
import {
  mapDbSubscriptionToDomain,
  DbSubscriptionRow,
} from '../../src/services/assinaturas/mappers';

describe('mapDbSubscriptionToDomain', () => {
  it('maps minimal row', () => {
    const row: DbSubscriptionRow = {
      id: '1',
      plan_id: 'p',
      unit_id: 'u',
      customer_id: 'c',
      status: 'active',
      start_date: '2025-01-01',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      end_date: undefined,
      notes: undefined,
      asaas_subscription_id: undefined,
    };
    const mapped = mapDbSubscriptionToDomain(row);
    expect(mapped.id).toBe('1');
    expect(mapped.planId).toBe('p');
    expect(mapped.status).toBe('active');
  });
});
