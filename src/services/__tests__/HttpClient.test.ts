/**
 * HttpClient Tests
 * @file Unit tests for HTTP client with various scenarios
 */

import { HttpClient, IHttpClient } from '../api/HttpClient';
import { AuthErrorType } from '../../types/auth.types';

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    httpClient = new HttpClient('http://localhost:3000', 10000);
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('post', () => {
    it('should make successful POST request', async () => {
      const mockResponse = { success: true, data: 'test' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await httpClient.post('/auth/login', { email: 'test@test.com' });

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        expect.any(Object),
      );
    });

    it('should throw error on 401 response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(
        httpClient.post('/auth/login', { email: 'test@test.com' }),
      ).rejects.toMatchObject({
        type: AuthErrorType.INVALID_CREDENTIALS,
      });
    });

    it('should throw error on network failure', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(
        httpClient.post('/auth/login', { email: 'test@test.com' }),
      ).rejects.toMatchObject({
        type: AuthErrorType.NETWORK_ERROR,
      });
    });

    it('should throw error on timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      fetchMock.mockRejectedValueOnce(abortError);

      await expect(
        httpClient.post('/auth/login', { email: 'test@test.com' }),
      ).rejects.toMatchObject({
        type: AuthErrorType.NETWORK_ERROR,
      });
    });
  });

  describe('get', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await httpClient.get('/user/profile');

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/user/profile',
        expect.any(Object),
      );
    });
  });

  describe('put', () => {
    it('should make successful PUT request', async () => {
      const mockResponse = { success: true };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await httpClient.put('/user/profile', { name: 'New Name' });

      expect(result).toEqual(mockResponse);
    });
  });
});
