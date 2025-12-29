/**
 * AuthService Tests
 * @file Unit tests for authentication service logic
 * Follows AAA pattern: Arrange, Act, Assert
 */

import { AuthService, AuthValidator, ITokenStorage } from '../AuthService';
import { IHttpClient } from '../api/HttpClient';
import { LoginRequest, LoginResponse, AuthErrorType, User } from '../../types/auth.types';

/**
 * Mock implementations for testing
 */
class MockHttpClient implements IHttpClient {
  async post<T>(url: string, data: unknown): Promise<T> {
    return {} as T;
  }

  async get<T>(url: string): Promise<T> {
    return {} as T;
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    return {} as T;
  }
}

class MockTokenStorage implements ITokenStorage {
  private token: string | null = null;

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async getToken(): Promise<string | null> {
    return this.token;
  }

  async removeToken(): Promise<void> {
    this.token = null;
  }
}

describe('AuthValidator', () => {
  let validator: AuthValidator;

  beforeEach(() => {
    validator = new AuthValidator();
  });

  describe('validateLoginRequest', () => {
    it('should return error when email is empty', () => {
      const request: LoginRequest = {
        email: '',
        password: 'password123',
      };

      const error = validator.validateLoginRequest(request);

      expect(error).not.toBeNull();
      expect(error?.type).toBe(AuthErrorType.VALIDATION_ERROR);
      expect(error?.message).toContain('Email and password are required');
    });

    it('should return error when password is empty', () => {
      const request: LoginRequest = {
        email: 'test@example.com',
        password: '',
      };

      const error = validator.validateLoginRequest(request);

      expect(error).not.toBeNull();
      expect(error?.type).toBe(AuthErrorType.VALIDATION_ERROR);
    });

    it('should return error for invalid email format', () => {
      const request: LoginRequest = {
        email: 'invalidemail',
        password: 'password123',
      };

      const error = validator.validateLoginRequest(request);

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Invalid email format');
    });

    it('should return error when password is too short', () => {
      const request: LoginRequest = {
        email: 'test@example.com',
        password: '123',
      };

      const error = validator.validateLoginRequest(request);

      expect(error).not.toBeNull();
      expect(error?.message).toContain('at least 6 characters');
    });

    it('should return null for valid credentials', () => {
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = validator.validateLoginRequest(request);

      expect(error).toBeNull();
    });
  });
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockHttpClient: MockHttpClient;
  let mockTokenStorage: MockTokenStorage;
  let validator: AuthValidator;

  beforeEach(() => {
    mockHttpClient = new MockHttpClient();
    mockTokenStorage = new MockTokenStorage();
    validator = new AuthValidator();
    authService = new AuthService(
      mockHttpClient,
      mockTokenStorage,
      validator,
    );
  });

  describe('login', () => {
    it('should throw validation error for invalid credentials', async () => {
      const credentials: LoginRequest = {
        email: '',
        password: '',
      };

      await expect(authService.login(credentials)).rejects.toMatchObject({
        type: AuthErrorType.VALIDATION_ERROR,
      });
    });

    it('should call httpClient and store token on successful login', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        roles: ['ROLE_ACCOUNTANT'],
        lang: 'fr-FR',
        enabled: true,
      };

      const mockApiResponse = {
        data: {
          loginV2: {
            token: 'mock-token',
            user: {
              uuid: '1',
              email: 'test@example.com',
              roles: ['ROLE_ACCOUNTANT'],
              lang: 'fr-FR',
              enabled: true,
            },
          },
        },
      };

      // Mock the post method
      jest.spyOn(mockHttpClient, 'post').mockResolvedValueOnce(mockApiResponse as any);

      const result = await authService.login(credentials);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      const expectedResponse: LoginResponse = {
        user: mockUser,
        token: 'mock-token',
      };
      expect(result).toEqual(expectedResponse);
    });

    it('should persist token in storage after login', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockApiResponse = {
        data: {
          loginV2: {
            token: 'mock-token',
            user: {
              uuid: '1',
              email: 'test@example.com',
              roles: ['ROLE_ACCOUNTANT'],
              lang: 'fr-FR',
              enabled: true,
            },
          },
        },
      };

      jest.spyOn(mockHttpClient, 'post').mockResolvedValueOnce(mockApiResponse as any);
      jest.spyOn(mockTokenStorage, 'setToken');

      await authService.login(credentials);

      expect(mockTokenStorage.setToken).toHaveBeenCalledWith('mock-token');
    });
  });

  describe('logout', () => {
    it('should remove token from storage', async () => {
      jest.spyOn(mockTokenStorage, 'removeToken');

      await authService.logout();

      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      await mockTokenStorage.setToken('mock-token');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when token does not exist', async () => {
      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return stored token', async () => {
      const token = 'test-token-123';
      await mockTokenStorage.setToken(token);

      const result = await authService.getToken();

      expect(result).toBe(token);
    });

    it('should return null when no token is stored', async () => {
      const result = await authService.getToken();

      expect(result).toBeNull();
    });
  });
});
