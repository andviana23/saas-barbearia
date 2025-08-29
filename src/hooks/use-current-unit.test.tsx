import { renderHook, act, waitFor } from '@testing-library/react';
import { useCurrentUnit } from './use-current-unit';

// Estado mutável controlado por cada teste
let authUser: { id: string; unidade_default_id?: string } | null = {
  id: 'u1',
  unidade_default_id: 'unit-1',
};

jest.mock('./use-auth', () => ({
  useAuth: () => ({ user: authUser }),
}));

interface GenericError {
  code?: string;
  message?: string;
}
interface Response<T> {
  data: T | null;
  error: GenericError | null;
}

// Respostas configuráveis
type UnidadeShape = { id: string; nome: string; ativa: boolean };
let currentUnitResponses: Array<Response<UnidadeShape>> = [];
type AccessData = { unidade_default_id: string };
let accessResponse: Response<AccessData> | Response<null> = {
  data: null,
  error: null,
} as Response<null>;
let updateError: GenericError | null = null;
let userUnitsList: UnidadeShape[] = [];
let userUnitsError: GenericError | null = null;

// Query mocks reutilizados
const unidadesQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ data: userUnitsList, error: userUnitsError })),
  single: jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve(currentUnitResponses.shift() || { data: null, error: { code: 'PGRST116' } }),
    ),
};

interface ProfilesQuery {
  select: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  update: jest.Mock;
}
const profilesQuery: ProfilesQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockImplementation(() => Promise.resolve(accessResponse)),
  update: jest.fn().mockReturnValue({ eq: () => ({ error: updateError }) }),
};

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'unidades') return unidadesQuery;
      if (table === 'profiles') return profilesQuery;
      throw new Error('Tabela inesperada ' + table);
    },
  },
}));

describe('useCurrentUnit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authUser = { id: 'u1', unidade_default_id: 'unit-1' };
    currentUnitResponses = [];
    accessResponse = { data: null, error: null };
    updateError = null;
    userUnitsList = [];
    userUnitsError = null;
  });

  test('carrega unidade existente', async () => {
    currentUnitResponses = [{ data: { id: 'unit-1', nome: 'Main', ativa: true }, error: null }];
    const { result } = renderHook(() => useCurrentUnit());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.currentUnit?.id).toBe('unit-1');
    expect(result.current.error).toBeNull();
  });

  test('unidade não encontrada (PGRST116) não gera erro', async () => {
    currentUnitResponses = [{ data: null, error: { code: 'PGRST116' } }];
    const { result } = renderHook(() => useCurrentUnit());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.currentUnit).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('erro inesperado define error', async () => {
    currentUnitResponses = [{ data: null, error: { code: 'OTHER', message: 'boom' } }];
    const { result } = renderHook(() => useCurrentUnit());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });

  test('cenário usuário sem unidade_default_id inicial', async () => {
    authUser = { id: 'u1' }; // sem unidade_default_id
    const { result } = renderHook(() => useCurrentUnit());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.currentUnit).toBeNull();
    expect(result.current.error).toBeNull();
    expect(unidadesQuery.single).not.toHaveBeenCalled();
  });

  test('switchUnit sucesso', async () => {
    currentUnitResponses = [
      { data: { id: 'unit-1', nome: 'Main', ativa: true }, error: null },
      { data: { id: 'unit-2', nome: 'Branch', ativa: true }, error: null },
    ];
    accessResponse = { data: { unidade_default_id: 'unit-2' }, error: null };
    const { result } = renderHook(() => useCurrentUnit());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      const r = await result.current.switchUnit('unit-2');
      expect(r.success).toBe(true);
    });
    expect(result.current.currentUnit?.id).toBe('unit-2');
    expect(profilesQuery.update).toHaveBeenCalled();
  });

  test('switchUnit sem acesso retorna erro', async () => {
    currentUnitResponses = [{ data: { id: 'unit-1', nome: 'Main', ativa: true }, error: null }];
    accessResponse = { data: null, error: { message: 'no access' } };
    const { result } = renderHook(() => useCurrentUnit());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      const r = await result.current.switchUnit('unit-2');
      expect(r.success).toBe(false);
    });
    expect(result.current.error).toContain('Usuário não tem acesso');
  });

  test('getUserUnits retorna lista', async () => {
    currentUnitResponses = [{ data: { id: 'unit-1', nome: 'Main', ativa: true }, error: null }];
    userUnitsList = [
      { id: 'unit-1', nome: 'Main', ativa: true },
      { id: 'unit-2', nome: 'Branch', ativa: true },
    ];
    const { result } = renderHook(() => useCurrentUnit());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const units = await result.current.getUserUnits();
    expect(units.map((u) => u.id)).toEqual(['unit-1', 'unit-2']);
  });
});
