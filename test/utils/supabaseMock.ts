/* Reusable Supabase mock chain for unit tests */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SupabaseMockConfig {
  insertResult?: any;
  selectResult?: any;
  errorOnInsert?: boolean;
  errorOnSelect?: boolean;
  limitValue?: number;
}

export function createSupabaseMock(config: SupabaseMockConfig = {}) {
  const insertCalls: any[] = [];
  const selectCalls: any[] = [];
  const eqCalls: any[] = [];
  const orderCalls: any[] = [];
  const limitCalls: any[] = [];

  const chain: any = {
    insert: (data: any) => {
      insertCalls.push(data);
      if (config.errorOnInsert) {
        return {
          select: () => ({
            single: () => Promise.resolve({ error: { message: 'insert error' } }),
          }),
        };
      }
      return {
        select: () => ({
          single: () =>
            Promise.resolve({ data: config.insertResult ?? { id: 'new_id' }, error: null }),
        }),
      };
    },
    select: (_cols?: string) => {
      selectCalls.push(_cols);
      if (config.errorOnSelect) {
        return {
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ error: { message: 'select error' } }),
            }),
          }),
        };
      }
      return {
        eq: (col: string, val: any) => {
          eqCalls.push([col, val]);
          return {
            order: (colOrder: string) => {
              orderCalls.push(colOrder);
              return {
                limit: (n: number) => {
                  limitCalls.push(n);
                  return Promise.resolve({ data: config.selectResult ?? [], error: null });
                },
              };
            },
            limit: (n: number) => {
              limitCalls.push(n);
              return Promise.resolve({ data: config.selectResult ?? [], error: null });
            },
            single: () => Promise.resolve({ data: config.selectResult ?? null, error: null }),
          };
        },
        limit: (n: number) => {
          limitCalls.push(n);
          return Promise.resolve({ data: config.selectResult ?? [], error: null });
        },
      };
    },
    update: (data: any) => ({ eq: () => Promise.resolve({ data, error: null }) }),
    upsert: (data: any) => ({
      select: () => ({ single: () => Promise.resolve({ data, error: null }) }),
    }),
    order: (col: string) => {
      orderCalls.push(col);
      return chain;
    },
    limit: (n: number) => {
      limitCalls.push(n);
      return Promise.resolve({ data: config.selectResult ?? [], error: null });
    },
  };

  const supabase = {
    from: () => chain,
  } as any;

  return { supabase, insertCalls, selectCalls, eqCalls, orderCalls, limitCalls };
}
