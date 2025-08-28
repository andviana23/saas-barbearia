import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useConsentimentos,
  useCriarConsentimento,
  useRevogarConsentimento,
  useSolicitacoes,
  useCriarSolicitacao,
  useExportarDados,
  useSolicitarExclusao,
} from './useLGPD';
import * as lgpdActions from '@/app/actions/lgpd';

// Mock the actions
jest.mock('@/app/actions/lgpd', () => ({
  listarConsentimentos: jest.fn(),
  criarConsentimento: jest.fn(),
  revogarConsentimento: jest.fn(),
  listarSolicitacoes: jest.fn(),
  criarSolicitacao: jest.fn(),
  exportarDados: jest.fn(),
  solicitarExclusao: jest.fn(),
}));

// Mock toast
jest.mock('sonner');
const mockToast = toast as jest.Mocked<typeof toast>;

describe('LGPD Hooks', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    jest.clearAllMocks();
  });

  describe('useConsentimentos', () => {
    it('fetches consents successfully', async () => {
      const mockConsents = {
        success: true,
        data: [
          {
            id: 'consent-1',
            tipo_consentimento: 'marketing',
            consentimento_dado: true,
          },
        ],
      };

      (lgpdActions.listarConsentimentos as jest.Mock).mockResolvedValue(mockConsents);

      const { result } = renderHook(() => useConsentimentos(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(lgpdActions.listarConsentimentos).toHaveBeenCalledWith(undefined, undefined);
      expect(result.current.data).toEqual(mockConsents);
    });

    it('passes filters and pagination correctly', async () => {
      const filters = { profile_id: 'user-1' };
      const pagination = {
        page: 1,
        limit: 10,
        sort_by: 'created_at' as const,
        sort_order: 'desc' as const,
      };

      (lgpdActions.listarConsentimentos as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      renderHook(() => useConsentimentos(filters, pagination), { wrapper });

      await waitFor(() => {
        expect(lgpdActions.listarConsentimentos).toHaveBeenCalledWith(filters, pagination);
      });
    });
  });

  describe('useCriarConsentimento', () => {
    it('creates consent successfully and shows success toast', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'new-consent-id' },
      };

      (lgpdActions.criarConsentimento as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriarConsentimento(), { wrapper });

      const consentData = {
        profile_id: 'user-1',
        unidade_id: 'unit-1',
        tipo_consentimento: 'marketing' as const,
        finalidade: 'Marketing emails',
        consentimento_dado: true,
      };

      result.current.mutate(consentData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(lgpdActions.criarConsentimento).toHaveBeenCalledWith(consentData);
      expect(mockToast.success).toHaveBeenCalledWith('Consentimento registrado com sucesso');
    });

    it('handles error and shows error toast', async () => {
      const mockResponse = {
        success: false,
        error: 'Validation error',
      };

      (lgpdActions.criarConsentimento as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriarConsentimento(), { wrapper });

      const consentData = {
        profile_id: 'user-1',
        unidade_id: 'unit-1',
        tipo_consentimento: 'marketing' as const,
        finalidade: 'Marketing emails',
        consentimento_dado: true,
      };

      result.current.mutate(consentData);

      await waitFor(() => {
        expect(result.current.isError).toBe(false); // Action didn't throw, just returned error
      });

      expect(mockToast.error).toHaveBeenCalledWith('Validation error');
    });
  });

  describe('useRevogarConsentimento', () => {
    it('revokes consent successfully', async () => {
      const mockResponse = { success: true };

      (lgpdActions.revogarConsentimento as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRevogarConsentimento(), {
        wrapper,
      });

      result.current.mutate({
        consentimentoId: 'consent-1',
        motivo: 'No longer interested',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(lgpdActions.revogarConsentimento).toHaveBeenCalledWith(
        'consent-1',
        'No longer interested',
      );
      expect(mockToast.success).toHaveBeenCalledWith('Consentimento revogado com sucesso');
    });
  });

  describe('useSolicitacoes', () => {
    it('fetches requests successfully', async () => {
      const mockRequests = {
        success: true,
        data: [
          {
            id: 'request-1',
            tipo_solicitacao: 'portabilidade',
            status: 'pendente',
          },
        ],
      };

      (lgpdActions.listarSolicitacoes as jest.Mock).mockResolvedValue(mockRequests);

      const { result } = renderHook(() => useSolicitacoes(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockRequests);
    });
  });

  describe('useCriarSolicitacao', () => {
    it('creates request successfully with protocol in toast', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'new-request-id',
          protocolo: 'LGPD-2024-001',
        },
      };

      (lgpdActions.criarSolicitacao as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriarSolicitacao(), { wrapper });

      const requestData = {
        profile_id: 'user-1',
        unidade_id: 'unit-1',
        tipo_solicitacao: 'portabilidade' as const,
        prazo_limite: '2024-12-31',
      };

      result.current.mutate(requestData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(lgpdActions.criarSolicitacao).toHaveBeenCalledWith(requestData);
      expect(mockToast.success).toHaveBeenCalledWith(
        'Solicitação criada com sucesso. Protocolo: LGPD-2024-001',
      );
    });
  });

  describe('useExportarDados', () => {
    it('exports data successfully', async () => {
      const mockResponse = { success: true };

      (lgpdActions.exportarDados as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportarDados(), { wrapper });

      const exportRequest = {
        formato: 'json' as const,
        dados_solicitados: ['dados_pessoais' as const],
        motivo: 'Need data for another system',
        email_entrega: 'user@example.com',
      };

      result.current.mutate(exportRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(lgpdActions.exportarDados).toHaveBeenCalledWith(exportRequest);
      expect(mockToast.success).toHaveBeenCalledWith(
        'Dados exportados com sucesso. Verifique seu email.',
      );
    });

    it('handles export error', async () => {
      const mockResponse = {
        success: false,
        error: 'Export failed',
      };

      (lgpdActions.exportarDados as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportarDados(), { wrapper });

      const exportRequest = {
        formato: 'json' as const,
        dados_solicitados: ['dados_pessoais' as const],
        motivo: 'Need data for another system',
        email_entrega: 'user@example.com',
      };

      result.current.mutate(exportRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalledWith('Export failed');
    });
  });

  describe('useSolicitarExclusao', () => {
    it('requests deletion successfully', async () => {
      const mockResponse = { success: true };

      (lgpdActions.solicitarExclusao as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSolicitarExclusao(), { wrapper });

      const deletionRequest = {
        tipo_exclusao: 'parcial' as const,
        motivo: 'No longer want marketing communications from the company',
        confirmo_exclusao: true,
        ciente_irreversibilidade: true,
      };

      result.current.mutate(deletionRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(lgpdActions.solicitarExclusao).toHaveBeenCalledWith(deletionRequest);
      expect(mockToast.success).toHaveBeenCalledWith('Solicitação de exclusão enviada com sucesso');
    });

    it('handles deletion request error', async () => {
      const mockResponse = {
        success: false,
        error: 'Cannot delete required data',
      };

      (lgpdActions.solicitarExclusao as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSolicitarExclusao(), { wrapper });

      const deletionRequest = {
        tipo_exclusao: 'completa' as const,
        motivo: 'Want to delete all data completely from the system permanently',
        confirmo_exclusao: true,
        ciente_irreversibilidade: true,
      };

      result.current.mutate(deletionRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalledWith('Cannot delete required data');
    });
  });

  describe('Query invalidation', () => {
    it('invalidates consent queries after creating consent', async () => {
      const mockResponse = { success: true };
      (lgpdActions.criarConsentimento as jest.Mock).mockResolvedValue(mockResponse);

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCriarConsentimento(), { wrapper });

      const consentData = {
        profile_id: 'user-1',
        unidade_id: 'unit-1',
        tipo_consentimento: 'marketing' as const,
        finalidade: 'Marketing emails',
        consentimento_dado: true,
      };

      result.current.mutate(consentData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['lgpd', 'consentimentos'],
      });
    });

    it('invalidates request queries after creating request', async () => {
      const mockResponse = { success: true };
      (lgpdActions.criarSolicitacao as jest.Mock).mockResolvedValue(mockResponse);

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCriarSolicitacao(), { wrapper });

      const requestData = {
        profile_id: 'user-1',
        unidade_id: 'unit-1',
        tipo_solicitacao: 'portabilidade' as const,
        prazo_limite: '2024-12-31',
      };

      result.current.mutate(requestData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['lgpd', 'solicitacoes'],
      });
    });
  });
});
