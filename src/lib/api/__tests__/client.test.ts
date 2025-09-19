import { z } from 'zod';
import { ApiError, fetchJson, configureAuthRedirect } from '../client';

// Mock fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth handler
    configureAuthRedirect(() => {});
  });

  describe('ApiError', () => {
    it('should create error with basic properties', () => {
      const error = new ApiError({
        status: 404,
        message: 'Not found',
        details: { code: 'NOT_FOUND' },
      });

      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.details).toEqual({ code: 'NOT_FOUND' });
      expect(error.name).toBe('ApiError');
    });

    it('should identify auth errors correctly', () => {
      const authError = new ApiError({ status: 401, message: 'Unauthorized' });
      const forbiddenError = new ApiError({ status: 403, message: 'Forbidden' });
      const notFoundError = new ApiError({ status: 404, message: 'Not found' });

      expect(authError.isAuthError).toBe(true);
      expect(forbiddenError.isAuthError).toBe(true);
      expect(notFoundError.isAuthError).toBe(false);
    });

    it('should identify client errors correctly', () => {
      const clientError = new ApiError({ status: 400, message: 'Bad Request' });
      const serverError = new ApiError({ status: 500, message: 'Internal Error' });

      expect(clientError.isClientError).toBe(true);
      expect(clientError.isServerError).toBe(false);
      expect(serverError.isClientError).toBe(false);
      expect(serverError.isServerError).toBe(true);
    });
  });

  describe('fetchJson', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchJson('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
          credentials: 'include',
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should make POST request with JSON body', async () => {
      const requestBody = { name: 'New Item' };
      const responseBody = { id: 1, ...requestBody };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(responseBody),
      });

      const result = await fetchJson('/api/items', {
        jsonBody: requestBody,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        }),
      );
      expect(result).toEqual(responseBody);
    });

    it('should validate response with Zod schema', async () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchJson('/api/test', { schema });

      expect(result).toEqual(mockData);
    });

    it('should throw validation error for invalid schema', async () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const invalidData = { id: 'not-a-number', name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(invalidData),
      });

      await expect(fetchJson('/api/test', { schema })).rejects.toThrow();
    });

    it('should handle 404 with accept404 option', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      const result = await fetchJson('/api/missing', { accept404: true });

      expect(result).toBeNull();
    });

    it('should throw ApiError for HTTP errors', async () => {
      const errorDetails = { error: 'Bad Request', code: 'INVALID_INPUT' };
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorDetails),
      });

      await expect(fetchJson('/api/test')).rejects.toThrow(ApiError);

      try {
        await fetchJson('/api/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).details).toEqual(errorDetails);
      }
    });

    it('should retry on server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server Error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        });

      const result = await fetchJson('/api/test', { retry: 1 });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it('should not retry client errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad Request' }),
      });

      await expect(fetchJson('/api/test', { retry: 2 })).rejects.toThrow(ApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle 204 No Content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await fetchJson('/api/test');

      expect(result).toBeUndefined();
    });

    it('should call auth redirect on 401/403 errors', async () => {
      const mockAuthHandler = jest.fn();
      configureAuthRedirect(mockAuthHandler);

      const authError = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      };
      mockFetch.mockResolvedValue(authError);

      await expect(fetchJson('/api/test')).rejects.toThrow(ApiError);
      expect(mockAuthHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          isAuthError: true,
        }),
      );
    });

    it('should skip auth redirect when noAuthIntercept is true', async () => {
      const mockAuthHandler = jest.fn();
      configureAuthRedirect(mockAuthHandler);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      await expect(fetchJson('/api/test', { noAuthIntercept: true })).rejects.toThrow(ApiError);
      expect(mockAuthHandler).not.toHaveBeenCalled();
    });

    it('should skip auth redirect when no handler configured', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      // Should not throw due to missing auth handler
      await expect(fetchJson('/api/test')).rejects.toThrow(ApiError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchJson('/api/test')).rejects.toThrow('Network error');
    });

    it('should use base URL from environment', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE;
      process.env.NEXT_PUBLIC_API_BASE = 'https://api.example.com';

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await fetchJson('/test');

      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/test', expect.any(Object));

      process.env.NEXT_PUBLIC_API_BASE = originalEnv;
    });

    it('should use absolute URLs as-is', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await fetchJson('https://external-api.com/data');

      expect(mockFetch).toHaveBeenCalledWith('https://external-api.com/data', expect.any(Object));
    });

    it('should disable auth when auth: false', async () => {
      // Definir base URL para evitar "undefined"
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE;
      process.env.NEXT_PUBLIC_API_BASE = '';

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await fetchJson('/api/public', { auth: false });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/public',
        expect.objectContaining({
          credentials: undefined,
        }),
      );

      process.env.NEXT_PUBLIC_API_BASE = originalEnv;
    });
  });

  describe('configureAuthRedirect', () => {
    it('should set auth handler correctly', () => {
      const handler = jest.fn();

      expect(() => configureAuthRedirect(handler)).not.toThrow();
    });
  });
});
